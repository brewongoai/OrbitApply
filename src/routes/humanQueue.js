const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { getHumanQueue, approveHumanQueueItem, enforceRateLimit, recordSubmit, runPreflightCheck, requeueWithNewFields } = require('../services/guardian');
const { runSubmit, detectPlatform } = require('../services/submit');

router.get('/', (req, res) => {
  try {
    res.json({ queue: getHumanQueue() });
  } catch (err) {
    logger.error(`GET /human-queue failed: ${err.message}`, err);
    res.status(500).json({ error: 'Failed to load human queue.' });
  }
});

router.post('/:jobId/approve', (req, res) => {
  try {
    const { fieldValues } = req.body;
    const item = approveHumanQueueItem(req.params.jobId, fieldValues || {});
    if (!item) return res.status(404).json({ error: 'Queue item not found.' });
    res.json({ approved: true, item });
  } catch (err) {
    logger.error(`POST /human-queue/:jobId/approve failed: ${err.message}`, err);
    res.status(500).json({ error: 'Failed to approve queue item.' });
  }
});

const FIELD_VALUE_MAX_LEN = 500;
const FIELD_VALUE_MAX_ENTRIES = 20;

function sanitiseFieldValues(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out = {};
  let count = 0;
  for (const [key, val] of Object.entries(raw)) {
    if (count >= FIELD_VALUE_MAX_ENTRIES) break;
    if (typeof key !== 'string' || key.length > 100) continue;
    if (typeof val !== 'string' && typeof val !== 'number' && typeof val !== 'boolean') continue;
    out[key.slice(0, 100)] = String(val).slice(0, FIELD_VALUE_MAX_LEN);
    count++;
  }
  return out;
}

router.post('/:jobId/submit', async (req, res) => {
  try {
    const { jobId } = req.params;
    const queue = getHumanQueue();
    const item = queue.find(q => q.jobId === jobId);

    if (!item) return res.status(404).json({ error: 'Queue item not found.' });
    if (!item.reviewed) return res.status(400).json({ error: 'Item has not been approved yet. Approve the field values first.' });

    const guardianCheck = runPreflightCheck({
      jobId,
      company: item.company,
      formFields: [],
    });

    if (guardianCheck.verdict === 'HARD_STOP') {
      return res.status(429).json({ error: guardianCheck.reason });
    }
    if (guardianCheck.verdict === 'BLOCK') {
      return res.status(403).json({ error: guardianCheck.reason });
    }

    const rateLimitCheck = enforceRateLimit();
    if (rateLimitCheck.blocked) {
      return res.status(429).json({ error: rateLimitCheck.reason });
    }

    logger.info(`[HUMAN QUEUE] Triggering submission for approved item: ${item.company} (jobId: ${jobId})`);

    // Resolve resume/cover paths: prefer queue item, fall back to ledger entry
    let resumePath = item.resumePath || null;
    let coverPath = item.coverPath || null;
    let pipelineId = null;

    if (!resumePath || !coverPath) {
      try {
        const ledger = require('../services/ledger');
        const pipeline = ledger.getAll();
        const ledgerEntry = (pipeline.applications || []).find(
          a => a.company === item.company || a.url === item.url
        );
        if (ledgerEntry) {
          resumePath = resumePath || ledgerEntry.resumePath || null;
          coverPath = coverPath || ledgerEntry.coverPath || null;
          pipelineId = ledgerEntry.id;
        }
      } catch (ledgerErr) {
        logger.warn(`[HUMAN QUEUE] Could not look up ledger entry: ${ledgerErr.message}`);
      }
    }

    const result = await runSubmit({
      jobId,
      pipelineId,
      url: item.url || null,
      platform: detectPlatform(item.url || ''),
      resumePath,
      coverPath,
      fieldValues: sanitiseFieldValues(item.fieldValues),
    });

    if (result.status === 'submitted' || result.status === 'form_filled') {
      recordSubmit();
    }

    if (result.status === 'paused' && result.pausedFields && result.pausedFields.length > 0) {
      const requeued = requeueWithNewFields(jobId, result.pausedFields);
      logger.info(`[HUMAN QUEUE] Re-queued ${jobId} — needs ${result.pausedFields.length} more field(s)`);
      return res.json({ result, requeued: true, message: 'Additional fields found on form — queue updated. Fill the new fields and re-approve.' });
    }

    res.json({ result });
  } catch (err) {
    logger.error(`POST /human-queue/:jobId/submit failed: ${err.message}`, err);
    res.status(500).json({ error: 'Submission failed. Check server logs.' });
  }
});

module.exports = router;
