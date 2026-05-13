const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const router = express.Router();
const { readJSON, writeJSON } = require('../utils/fileStore');
const { logger } = require('../utils/logger');

const CONFIG_PATH = path.join(__dirname, '..', '..', 'orbitapply.json');

const SAFE_PATH_RE = /^[a-zA-Z]:[\\\/][\w\s\-.()\\/]+$/;

function loadConfig() {
  return readJSON(CONFIG_PATH, {});
}

function isPathSafe(folderPath) {
  return typeof folderPath === 'string'
    && folderPath.length > 2
    && folderPath.length < 512
    && SAFE_PATH_RE.test(folderPath);
}

router.get('/', (req, res) => {
  try {
    res.json(loadConfig());
  } catch (err) {
    logger.error(`GET /config failed: ${err.message}`, err);
    res.status(500).json({ error: 'Failed to load config.' });
  }
});

router.post('/', (req, res) => {
  try {
    const current = loadConfig();
    const { budget, guardian, outputFolder } = req.body;

    if (budget) {
      const dailyLimit = parseFloat(budget.dailyLimitUSD);
      const alertAt = parseFloat(budget.alertAtUSD);
      if (isNaN(dailyLimit) || dailyLimit < 0.5 || dailyLimit > 100) {
        return res.status(400).json({ error: 'Daily limit must be between $0.50 and $100.' });
      }
      if (isNaN(alertAt) || alertAt < 0 || alertAt > dailyLimit) {
        return res.status(400).json({ error: 'Alert threshold must be between $0 and the daily limit.' });
      }
      current.budget = { ...current.budget, dailyLimitUSD: dailyLimit, alertAtUSD: alertAt, hardStop: true };
    }

    if (guardian) {
      const maxApply = parseInt(guardian.maxAppliesPerDay, 10);
      const rateLimit = parseInt(guardian.rateLimitMs, 10);
      if (isNaN(maxApply) || maxApply < 1 || maxApply > 100) {
        return res.status(400).json({ error: 'Max applies must be between 1 and 100.' });
      }
      if (isNaN(rateLimit) || rateLimit < 5000 || rateLimit > 300000) {
        return res.status(400).json({ error: 'Rate limit must be between 5000ms and 300000ms.' });
      }
      current.guardian = {
        ...current.guardian,
        maxAppliesPerDay: maxApply,
        rateLimitMs: rateLimit,
        humanPauseFields: Array.isArray(guardian.humanPauseFields)
          ? guardian.humanPauseFields.filter(f => typeof f === 'string' && f.length < 64)
          : current.guardian?.humanPauseFields || [],
      };
    }

    if (outputFolder !== undefined) {
      if (outputFolder === '') {
        current.outputFolder = '';
      } else if (!isPathSafe(outputFolder)) {
        return res.status(400).json({ error: 'Invalid folder path. Use an absolute Windows path (e.g. C:\\Users\\you\\Documents\\OrbitApply).' });
      } else {
        current.outputFolder = outputFolder;
      }
    }

    writeJSON(CONFIG_PATH, current);
    logger.info(`[CONFIG] Config saved`);
    res.json({ saved: true, config: current });
  } catch (err) {
    logger.error(`POST /config failed: ${err.message}`, err);
    res.status(500).json({ error: 'Failed to save config.' });
  }
});

router.post('/folder/verify', (req, res) => {
  try {
    const { folderPath } = req.body;
    if (!isPathSafe(folderPath)) {
      return res.status(400).json({ error: 'Invalid path format.' });
    }
    const exists = fs.existsSync(folderPath);
    const isDir = exists && fs.statSync(folderPath).isDirectory();
    res.json({ exists, isDir, path: folderPath });
  } catch (err) {
    logger.error(`POST /config/folder/verify failed: ${err.message}`, err);
    res.status(500).json({ error: 'Failed to verify folder.' });
  }
});

router.post('/folder/create', (req, res) => {
  try {
    const { folderPath } = req.body;
    if (!isPathSafe(folderPath)) {
      return res.status(400).json({ error: 'Invalid path format.' });
    }
    if (fs.existsSync(folderPath)) {
      return res.json({ created: false, alreadyExists: true, path: folderPath });
    }
    fs.mkdirSync(folderPath, { recursive: true });
    logger.info(`[CONFIG] Created output folder: ${folderPath}`);
    res.json({ created: true, path: folderPath });
  } catch (err) {
    logger.error(`POST /config/folder/create failed: ${err.message}`, err);
    res.status(500).json({ error: 'Could not create folder. Check permissions.' });
  }
});

router.post('/folder/open', (req, res) => {
  try {
    const { folderPath } = req.body;
    if (!isPathSafe(folderPath)) {
      return res.status(400).json({ error: 'Invalid path format.' });
    }
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: 'Folder does not exist.' });
    }
    const safePath = folderPath.replace(/["%&|^<>]/g, '');
    exec(`explorer "${safePath}"`, err => {
      if (err) logger.error(`[CONFIG] Failed to open folder: ${err.message}`);
    });
    res.json({ opened: true });
  } catch (err) {
    logger.error(`POST /config/folder/open failed: ${err.message}`, err);
    res.status(500).json({ error: 'Failed to open folder.' });
  }
});

module.exports = router;
