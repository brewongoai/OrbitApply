const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { logger } = require('../utils/logger');
const { readJSON, writeJSON } = require('../utils/fileStore');
const CONFIG_PATH = path.join(__dirname, '..', '..', 'orbitapply.json');
const SESSIONS_PATH = path.join(__dirname, '..', '..', 'sessions', 'sessions.json');

const AGENT_TIMEOUTS_MS = {
  tailor: 120000,
  orbi: 120000,
  coach: 120000,
  default: 60000,
};

function loadConfig() {
  return readJSON(CONFIG_PATH, {});
}

function getSoulMd(agentId) {
  const soulPath = path.join(__dirname, '..', '..', 'agents', agentId, 'SOUL.md');
  if (!fs.existsSync(soulPath)) throw new Error(`SOUL.md not found for agent: ${agentId}`);
  return fs.readFileSync(soulPath, 'utf8');
}

function getModel(agentId) {
  const config = loadConfig();
  const overrides = config?.agents?.overrides || {};
  if (overrides[agentId]?.model) return overrides[agentId].model;
  return config?.agents?.defaults?.model || 'claude-haiku-4-5-20251001';
}

function saveSession(agentId, messages, sessionId) {
  const sessions = readJSON(SESSIONS_PATH, { sessions: [], lastSessionId: null });
  const existingIdx = sessions.sessions.findIndex(s => s.sessionId === sessionId);
  const entry = {
    sessionId,
    agentId,
    startedAt: existingIdx >= 0 ? sessions.sessions[existingIdx].startedAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages,
  };
  if (existingIdx >= 0) {
    sessions.sessions[existingIdx] = entry;
  } else {
    sessions.sessions.unshift(entry);
    if (sessions.sessions.length > 200) sessions.sessions = sessions.sessions.slice(0, 200);
  }
  sessions.lastSessionId = sessionId;
  writeJSON(SESSIONS_PATH, sessions);
}

async function runAgent(agentId, userPrompt, sessionId = null, extraContext = '') {
  const soul = getSoulMd(agentId);
  const model = getModel(agentId);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const sid = sessionId || `${agentId}-${Date.now()}`;
  const systemPrompt = extraContext ? `${soul}\n\n## Current Context\n${extraContext}` : soul;

  const messages = [{ role: 'user', content: userPrompt }];
  const timeoutMs = AGENT_TIMEOUTS_MS[agentId] || AGENT_TIMEOUTS_MS.default;
  const timeoutSecs = timeoutMs / 1000;

  logger.info(`[${agentId.toUpperCase()}] Running with model ${model} | session ${sid}`);

  try {
    const response = await Promise.race([
      client.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Agent request timed out after ${timeoutSecs}s`)), timeoutMs)
      ),
    ]);

    const assistantContent = response.content[0]?.text || '';
    messages.push({ role: 'assistant', content: assistantContent });
    saveSession(agentId, messages, sid);

    logger.info(`[${agentId.toUpperCase()}] Complete | tokens: ${response.usage?.input_tokens || 0}in + ${response.usage?.output_tokens || 0}out`);

    return {
      sessionId: sid,
      agentId,
      content: assistantContent,
      usage: response.usage,
      model,
    };
  } catch (err) {
    logger.error(`[${agentId.toUpperCase()}] Failed: ${err.message}`, err);
    const msg = err.message || '';
    if (msg.includes('usage limits') || msg.includes('API usage limits')) {
      const match = msg.match(/regain access on ([^"]+)/);
      const until = match ? ` Access restores on ${match[1].trim()}.` : '';
      throw new Error(`Anthropic API usage limit reached.${until} Please add credits or wait for reset.`);
    }
    if (msg.includes('401') || msg.includes('authentication')) {
      throw new Error(`Anthropic API key is invalid or missing. Check your .env file.`);
    }
    if (msg.includes('timed out')) {
      throw new Error(`Generation timed out — Anthropic API took too long. Wait a moment and try again.`);
    }
    throw new Error(`Agent ${agentId} failed. Check server logs.`);
  }
}

function parseJSONFromContent(content) {
  try {
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                      content.match(/```\n([\s\S]*?)\n```/) ||
                      content.match(/(\{[\s\S]*\})/);
    if (jsonMatch) return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return JSON.parse(content);
  } catch {
    return null;
  }
}

module.exports = { runAgent, parseJSONFromContent, getSoulMd, getModel };
