const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

function readJSON(filePath, defaultValue = null) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    logger.error(`readJSON failed for ${filePath}: ${err.message}`);
    return defaultValue;
  }
}

function writeJSON(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    logger.error(`writeJSON failed for ${filePath}: ${err.message}`);
    throw new Error(`Failed to write data to disk: ${filePath}`);
  }
}

function appendLog(filePath, entry) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const line = `[${new Date().toISOString()}] ${JSON.stringify(entry)}\n`;
    fs.appendFileSync(filePath, line, 'utf8');
  } catch (err) {
    logger.error(`appendLog failed for ${filePath}: ${err.message}`);
  }
}

function ensureFile(filePath, defaultContent) {
  if (!fs.existsSync(filePath)) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2), 'utf8');
  }
}

module.exports = { readJSON, writeJSON, appendLog, ensureFile };
