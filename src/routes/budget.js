const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { checkBudget, checkDailyLimit } = require('../services/guardian');
const ledger = require('../services/ledger');

router.get('/', (req, res) => {
  try {
    const budget = checkBudget();
    const daily = checkDailyLimit();
    const stats = ledger.getStats();
    res.json({ budget, daily, stats });
  } catch (err) {
    logger.error(`GET /budget failed: ${err.message}`, err);
    res.status(500).json({ error: 'Failed to load budget.' });
  }
});

module.exports = router;
