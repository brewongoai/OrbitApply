const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { getDocuments } = require('../services/tailor');
const { getPrepPack } = require('../services/coach');
const ledger = require('../services/ledger');

router.get('/:jobId', (req, res) => {
  try {
    const docs = getDocuments(req.params.jobId);
    res.json(docs);
  } catch (err) {
    logger.error(`GET /documents/:jobId failed: ${err.message}`, err);
    res.status(500).json({ error: 'Failed to load documents.' });
  }
});

router.get('/:applicationId/prep', (req, res) => {
  try {
    const content = getPrepPack(req.params.applicationId);
    res.json({ content: content || null });
  } catch (err) {
    logger.error(`GET /documents/:id/prep failed: ${err.message}`, err);
    res.status(500).json({ error: 'Failed to load prep pack.' });
  }
});

module.exports = router;
