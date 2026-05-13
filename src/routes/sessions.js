const express = require('express');
const router = express.Router();
const path = require('path');
const { logger } = require('../utils/logger');
const { readJSON } = require('../utils/fileStore');

const SESSIONS_PATH = path.join(__dirname, '..', '..', 'sessions', 'sessions.json');

router.get('/', (req, res) => {
  try {
    const { agentId, limit = 50 } = req.query;
    const data = readJSON(SESSIONS_PATH, { sessions: [] });
    let sessions = data.sessions || [];
    if (agentId) sessions = sessions.filter(s => s.agentId === agentId);
    sessions = sessions.slice(0, parseInt(limit, 10));
    res.json({ sessions, total: data.sessions?.length || 0 });
  } catch (err) {
    logger.error(`GET /sessions failed: ${err.message}`, err);
    res.status(500).json({ error: 'Failed to load sessions.' });
  }
});

router.get('/:sessionId', (req, res) => {
  try {
    const data = readJSON(SESSIONS_PATH, { sessions: [] });
    const session = data.sessions?.find(s => s.sessionId === req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json(session);
  } catch (err) {
    logger.error(`GET /sessions/:id failed: ${err.message}`, err);
    res.status(500).json({ error: 'Failed to load session.' });
  }
});

module.exports = router;
