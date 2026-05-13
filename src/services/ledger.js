const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileStore');

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
const { logger } = require('../utils/logger');
const { PIPELINE_STAGES } = require('../utils/constants');

const PIPELINE_PATH = path.join(__dirname, '..', '..', 'workspace-ledger', 'pipeline.json');

function getPipeline() {
  return readJSON(PIPELINE_PATH, {
    applications: [],
    stats: { total_applied: 0, response_rate: 0, today_count: 0, budget_used_usd: 0, last_reset_date: '' },
  });
}

function savePipeline(data) {
  writeJSON(PIPELINE_PATH, data);
}

function recalcStats(pipeline) {
  const apps = pipeline.applications;
  const total = apps.length;
  const responded = apps.filter(a => ['phone_screen', 'interview_1', 'interview_2', 'offer'].includes(a.status)).length;
  pipeline.stats.total_applied = total;
  pipeline.stats.response_rate = total > 0 ? Math.round((responded / total) * 100) : 0;
  pipeline.stats.budget_used_usd = apps.reduce((sum, a) => sum + (a.budgetUSD || 0), 0);
}

function resetTodayCountIfNeeded(pipeline) {
  const today = new Date().toISOString().split('T')[0];
  if (pipeline.stats.last_reset_date !== today) {
    pipeline.stats.today_count = 0;
    pipeline.stats.last_reset_date = today;
  }
}

function createApplication({ title, company, url, platform, fitScore, resumePath, coverPath, reconPath, budgetUSD = 0 }) {
  const pipeline = getPipeline();
  resetTodayCountIfNeeded(pipeline);

  const app = {
    id: uuidv4(),
    title,
    company,
    url,
    platform: platform || 'direct',
    status: 'applied',
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fitScore: fitScore || 0,
    resumePath: resumePath || '',
    coverPath: coverPath || '',
    reconPath: reconPath || '',
    notes: '',
    followUpDue: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    budgetUSD,
    humanPaused: false,
    humanPauseFields: [],
  };

  pipeline.applications.unshift(app);
  pipeline.stats.today_count += 1;
  recalcStats(pipeline);
  savePipeline(pipeline);

  logger.info(`[LEDGER] Created application: ${company} - ${title} (id: ${app.id})`);
  return app;
}

function updateStatus(applicationId, newStatus) {
  if (!PIPELINE_STAGES.includes(newStatus)) {
    throw new Error(`Invalid pipeline stage: ${newStatus}`);
  }

  const pipeline = getPipeline();
  const app = pipeline.applications.find(a => a.id === applicationId);
  if (!app) throw new Error(`Application not found: ${applicationId}`);

  const previousStatus = app.status;
  app.status = newStatus;
  app.updatedAt = new Date().toISOString();

  recalcStats(pipeline);
  savePipeline(pipeline);

  const coachTrigger = ['phone_screen', 'interview_1', 'interview_2'].includes(newStatus);
  logger.info(`[LEDGER] Status update: ${app.company} ${previousStatus} → ${newStatus}${coachTrigger ? ' (COACH triggered)' : ''}`);

  return { applicationId, previousStatus, newStatus, coachTrigger, followUpDue: app.followUpDue };
}

function addNote(applicationId, note) {
  const pipeline = getPipeline();
  const app = pipeline.applications.find(a => a.id === applicationId);
  if (!app) throw new Error(`Application not found: ${applicationId}`);
  app.notes = note;
  app.updatedAt = new Date().toISOString();
  savePipeline(pipeline);
  return app;
}

function getAll() {
  return getPipeline();
}

function getStats() {
  return getPipeline().stats;
}

function getByStatus(status) {
  const pipeline = getPipeline();
  return pipeline.applications.filter(a => a.status === status);
}

function getById(id) {
  const pipeline = getPipeline();
  return pipeline.applications.find(a => a.id === id) || null;
}

function getFollowUpsDue() {
  const pipeline = getPipeline();
  const now = new Date();
  return pipeline.applications.filter(a =>
    a.status === 'applied' && a.followUpDue && new Date(a.followUpDue) <= now
  );
}

module.exports = { createApplication, updateStatus, addNote, getAll, getStats, getByStatus, getById, getFollowUpsDue };
