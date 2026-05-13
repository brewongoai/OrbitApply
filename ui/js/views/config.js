async function renderConfig() {
  const main = el('main-content');
  main.innerHTML = `
    <div class="page-header">
      <div class="page-header-row">
        <div>
          <h1 class="page-title">Config</h1>
          <p class="page-sub">orbitapply.json — budget, guardian rules, model assignments, output folder</p>
        </div>
      </div>
    </div>
    <div id="config-alert"></div>

    <div class="card" style="margin-bottom:var(--gap)">
      <div class="section-label">Output Folder</div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">
        All generated files (tailored resumes, cover letters, CSV exports) will be saved here.
        Leave blank to use the default <code>workspace-*</code> folders inside the project.
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:1;min-width:260px">
          <input
            id="cfg-output-folder"
            class="form-input"
            placeholder="e.g. C:\\Users\\You\\Documents\\OrbitApply"
            style="font-family:monospace;font-size:13px"
          />
        </div>
        <button class="btn btn-secondary btn-sm" onclick="verifyFolder()" style="white-space:nowrap">Verify Path</button>
        <button class="btn btn-secondary btn-sm" onclick="createFolder()" style="white-space:nowrap">Create Folder</button>
        <button class="btn btn-secondary btn-sm" onclick="openFolder()" style="white-space:nowrap" id="cfg-open-btn">Open in Explorer</button>
      </div>
      <div id="cfg-folder-status" style="margin-top:10px;font-size:13px"></div>
      <div style="margin-top:12px;padding:12px;background:var(--bg-accent);border-radius:8px;font-size:12px;color:var(--text-muted)">
        <strong style="color:var(--text-primary)">Subfolders created automatically:</strong>
        <span style="margin-left:8px"><code>scout/</code> — job results &amp; CSVs</span>
        <span style="margin-left:12px"><code>tailor/</code> — resumes &amp; cover letters</span>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:var(--gap)">
      <div class="card">
        <div class="section-label">Budget Settings</div>
        <div class="form-group"><label class="form-label">Daily Limit (USD)</label><input id="cfg-budget" class="form-input" type="number" step="0.50" /></div>
        <div class="form-group"><label class="form-label">Alert At (USD)</label><input id="cfg-alert" class="form-input" type="number" step="0.50" /></div>
      </div>
      <div class="card">
        <div class="section-label">Guardian Settings</div>
        <div class="form-group"><label class="form-label">Max Applies Per Day</label><input id="cfg-maxapply" class="form-input" type="number" /></div>
        <div class="form-group"><label class="form-label">Rate Limit (ms between submits)</label><input id="cfg-ratelimit" class="form-input" type="number" /></div>
      </div>
    </div>

    <div class="card" style="margin-bottom:var(--gap)">
      <div class="section-label">Human Pause Fields</div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px">GUARDIAN pauses the pipeline when these field types are detected in application forms.</p>
      <div id="cfg-pause-fields" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px"></div>
      <div style="display:flex;gap:8px">
        <input id="cfg-new-field" class="form-input" placeholder="Add field type..." style="max-width:240px" />
        <button class="btn btn-secondary btn-sm" onclick="addPauseField()">Add</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:var(--gap)">
      <div class="section-label">Agent Model Assignments</div>
      <table>
        <thead><tr><th>Agent</th><th>Role</th><th>Model</th></tr></thead>
        <tbody>
          <tr><td><b>ORBI</b></td><td>Master Orchestrator</td><td>${badge('claude-sonnet-4', 'blue')}</td></tr>
          <tr><td><b>TAILOR</b></td><td>Document Generator</td><td>${badge('claude-sonnet-4', 'blue')}</td></tr>
          <tr><td><b>COACH</b></td><td>Interview Prep</td><td>${badge('claude-sonnet-4', 'blue')}</td></tr>
          <tr><td><b>SCOUT</b></td><td>Job Discovery</td><td>${badge('claude-haiku-4.5', 'gray')}</td></tr>
          <tr><td><b>RECON</b></td><td>Company Intel</td><td>${badge('claude-haiku-4.5', 'gray')}</td></tr>
          <tr><td><b>SUBMIT</b></td><td>Application Engine</td><td>${badge('claude-haiku-4.5', 'gray')}</td></tr>
          <tr><td><b>LEDGER</b></td><td>Pipeline Tracker</td><td>${badge('claude-haiku-4.5', 'gray')}</td></tr>
          <tr><td><b>GUARDIAN</b></td><td>Safety Layer</td><td>${badge('claude-haiku-4.5', 'gray')}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card" style="margin-bottom:var(--gap)">
      <div class="section-label">API Key Status</div>
      <div id="cfg-key-status"></div>
    </div>

    <div style="display:flex;gap:10px">
      <button class="btn btn-primary" onclick="saveConfig()">Save Config</button>
      <button class="btn btn-secondary" onclick="renderConfig()">Discard Changes</button>
    </div>
  `;

  await loadConfig_();
}

let _configData = {};

async function loadConfig_() {
  try {
    const data = await API.get('/api/v1/config');
    _configData = data;

    if (el('cfg-budget')) el('cfg-budget').value = _configData.budget?.dailyLimitUSD ?? 5;
    if (el('cfg-alert')) el('cfg-alert').value = _configData.budget?.alertAtUSD ?? 3;
    if (el('cfg-maxapply')) el('cfg-maxapply').value = _configData.guardian?.maxAppliesPerDay ?? 15;
    if (el('cfg-ratelimit')) el('cfg-ratelimit').value = _configData.guardian?.rateLimitMs ?? 45000;
    if (el('cfg-output-folder')) el('cfg-output-folder').value = _configData.outputFolder || '';

    renderPauseFields(_configData.guardian?.humanPauseFields || []);
    updateFolderStatus(_configData.outputFolder || '');

    const keyStatus = el('cfg-key-status');
    if (keyStatus) {
      keyStatus.innerHTML = `<p style="font-size:13px;color:var(--text-muted);padding:8px 0">API keys are set in <code>.env</code> — never displayed here for security.<br>Edit <code>.env</code> in the project root to update keys.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="badge badge-gray">ANTHROPIC_API_KEY</span>
        <span class="badge badge-gray">TAVILY_API_KEY</span>
      </div>`;
    }
  } catch (err) {
    showAlert('config-alert', 'Could not load config: ' + err.message, 'warn');
  }
}

function updateFolderStatus(folderPath) {
  const statusEl = el('cfg-folder-status');
  const openBtn = el('cfg-open-btn');
  if (!statusEl) return;
  if (!folderPath) {
    statusEl.innerHTML = `<span style="color:var(--text-muted)">Using default project workspaces.</span>`;
    if (openBtn) openBtn.disabled = true;
    return;
  }
  if (openBtn) openBtn.disabled = false;
  statusEl.innerHTML = `<span style="color:var(--text-muted)">Path set — click <strong>Verify Path</strong> to confirm it exists on disk.</span>`;
}

async function verifyFolder() {
  const folderPath = el('cfg-output-folder')?.value?.trim();
  const statusEl = el('cfg-folder-status');
  if (!folderPath) {
    if (statusEl) statusEl.innerHTML = `<span style="color:var(--text-muted)">No path entered.</span>`;
    return;
  }
  try {
    const r = await API.post('/api/v1/config/folder/verify', { folderPath });
    if (r.error) {
      if (statusEl) statusEl.innerHTML = `<span style="color:#EF4444">✗ ${r.error}</span>`;
      return;
    }
    if (r.exists && r.isDir) {
      if (statusEl) statusEl.innerHTML = `<span style="color:#10B981">✓ Folder exists and is accessible.</span>`;
    } else if (r.exists && !r.isDir) {
      if (statusEl) statusEl.innerHTML = `<span style="color:#F59E0B">⚠ Path exists but is a file, not a folder.</span>`;
    } else {
      if (statusEl) statusEl.innerHTML = `<span style="color:#F59E0B">⚠ Folder does not exist yet — click <strong>Create Folder</strong> to create it.</span>`;
    }
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `<span style="color:#EF4444">✗ Verify failed: ${err.message}</span>`;
  }
}

async function createFolder() {
  const folderPath = el('cfg-output-folder')?.value?.trim();
  const statusEl = el('cfg-folder-status');
  if (!folderPath) {
    if (statusEl) statusEl.innerHTML = `<span style="color:var(--text-muted)">No path entered.</span>`;
    return;
  }
  try {
    const r = await API.post('/api/v1/config/folder/create', { folderPath });
    if (r.error) {
      if (statusEl) statusEl.innerHTML = `<span style="color:#EF4444">✗ ${r.error}</span>`;
      return;
    }
    if (r.alreadyExists) {
      if (statusEl) statusEl.innerHTML = `<span style="color:#10B981">✓ Folder already exists.</span>`;
    } else {
      if (statusEl) statusEl.innerHTML = `<span style="color:#10B981">✓ Folder created at <code>${folderPath}</code></span>`;
    }
    if (el('cfg-open-btn')) el('cfg-open-btn').disabled = false;
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `<span style="color:#EF4444">✗ Create failed: ${err.message}</span>`;
  }
}

async function openFolder() {
  const folderPath = el('cfg-output-folder')?.value?.trim();
  if (!folderPath) return;
  try {
    const r = await API.post('/api/v1/config/folder/open', { folderPath });
    if (r.error) showAlert('config-alert', r.error, 'warn');
  } catch (err) {
    showAlert('config-alert', 'Could not open folder: ' + err.message, 'warn');
  }
}

function renderPauseFields(fields) {
  const container = el('cfg-pause-fields');
  if (!container) return;
  container.innerHTML = fields.map(f => `
    <span class="badge badge-orange" style="cursor:pointer" onclick="removePauseField('${f}')">
      ${f} <span style="margin-left:4px;opacity:.7">✕</span>
    </span>`).join('');
}

function addPauseField() {
  const input = el('cfg-new-field');
  const val = input?.value.trim().toLowerCase();
  if (!val) return;
  const fields = _configData.guardian?.humanPauseFields || [];
  if (!fields.includes(val)) {
    fields.push(val);
    _configData.guardian = { ..._configData.guardian, humanPauseFields: fields };
    renderPauseFields(fields);
  }
  if (input) input.value = '';
}

function removePauseField(field) {
  if (!_configData.guardian?.humanPauseFields) return;
  _configData.guardian.humanPauseFields = _configData.guardian.humanPauseFields.filter(f => f !== field);
  renderPauseFields(_configData.guardian.humanPauseFields);
}

async function saveConfig() {
  clearAlert('config-alert');
  const outputFolder = el('cfg-output-folder')?.value?.trim() || '';

  const body = {
    budget: {
      dailyLimitUSD: parseFloat(el('cfg-budget')?.value || 5),
      alertAtUSD: parseFloat(el('cfg-alert')?.value || 3),
    },
    guardian: {
      maxAppliesPerDay: parseInt(el('cfg-maxapply')?.value || 15, 10),
      rateLimitMs: parseInt(el('cfg-ratelimit')?.value || 45000, 10),
      humanPauseFields: _configData.guardian?.humanPauseFields || [],
    },
    outputFolder,
  };

  try {
    const r = await API.post('/api/v1/config', body);
    if (r.error) {
      showAlert('config-alert', r.error, 'error');
      return;
    }
    _configData = r.config || _configData;
    showAlert('config-alert', 'Config saved successfully.', 'success');
    updateFolderStatus(outputFolder);
  } catch (err) {
    showAlert('config-alert', 'Save failed: ' + err.message, 'error');
  }
}
