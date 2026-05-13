const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');

const DISABLED_MSG = 'Agent auto-submit is disabled. Please apply to jobs manually using the View ↗ link.';

router.post('/job/:pipelineId', (req, res) => {
  logger.warn(`[SUBMIT] Blocked attempt to submit job ${req.params.pipelineId} — agent submit is disabled.`);
  res.status(503).json({ error: DISABLED_MSG });
});

router.get('/status/:jobId', (req, res) => {
  res.status(503).json({ error: DISABLED_MSG });
});

module.exports = router;
