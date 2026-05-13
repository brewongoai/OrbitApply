const path = require('path');
const fs = require('fs');
const { runAgent } = require('./agentBase');
const { readJSON } = require('../utils/fileStore');
const { logger } = require('../utils/logger');

const WORKSPACE = path.join(__dirname, '..', '..', 'workspace-coach');

async function runCoach(application, sessionId = null) {
  const reconPath = application.reconPath;
  const intel = reconPath && fs.existsSync(reconPath) ? readJSON(reconPath, {}) : {};
  const profilePath = path.join(__dirname, '..', '..', 'memory', 'profile.json');
  const profile = readJSON(profilePath, {});

  const prompt = `
INTERVIEW PREP REQUEST
Stage: ${application.status}
Job: ${application.title} at ${application.company}
Applied: ${application.appliedAt}

COMPANY INTEL:
${JSON.stringify(intel, null, 2).slice(0, 2000)}

CANDIDATE:
- Name: ${profile.name}
- Title: ${profile.title}
- Skills: ${(profile.skills || []).join(', ')}
- ORBIT Statement: ${profile.orbitPositioningStatement || ''}
- Salary Target: $${profile.salaryMin || 0}k - $${profile.salaryMax || 0}k

Generate a comprehensive interview prep pack in Markdown format with these sections:
1. ## Company Overview (from intel data)
2. ## What They're Really Looking For (role analysis)
3. ## Top 10 Behavioral Questions (with STAR answer templates)
4. ## Technical / Domain Questions (5-10 questions)
5. ## Salary Negotiation Script (anchored to salary benchmark)
6. ## Questions to Ask the Interviewer (5 strategic questions)
7. ## Recent News to Reference (from company intel)
`;

  const result = await runAgent('coach', prompt, sessionId);

  if (!fs.existsSync(WORKSPACE)) fs.mkdirSync(WORKSPACE, { recursive: true });
  const outPath = path.join(WORKSPACE, `${application.id}-prep.md`);
  fs.writeFileSync(outPath, result.content, 'utf8');

  logger.info(`[COACH] Prep pack saved for ${application.company} - ${application.title}`);

  return { prepPath: outPath, content: result.content };
}

function getPrepPack(applicationId) {
  const prepPath = path.join(WORKSPACE, `${applicationId}-prep.md`);
  return fs.existsSync(prepPath) ? fs.readFileSync(prepPath, 'utf8') : null;
}

module.exports = { runCoach, getPrepPack };
