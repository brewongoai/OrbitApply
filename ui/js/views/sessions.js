async function renderSessions() {
  const main = el('main-content');
  main.innerHTML = `
    <div class="page-header">
      <div class="page-header-row">
        <div>
          <h1 class="page-title">Session Logs</h1>
          <p class="page-sub">Full Claude conversation history — every agent call logged</p>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:var(--gap)">
      <select id="session-filter" class="form-input" style="max-width:180px" onchange="loadSessions()">
        <option value="">All Agents</option>
        <option value="orbi">ORBI</option>
        <option value="scout">SCOUT</option>
        <option value="recon">RECON</option>
        <option value="tailor">TAILOR</option>
        <option value="guardian">GUARDIAN</option>
        <option value="ledger">LEDGER</option>
        <option value="coach">COACH</option>
        <option value="submit">SUBMIT</option>
      </select>
    </div>
    <div id="sessions-alert"></div>
    <div id="sessions-list"></div>
  `;
  await loadSessions();
}

async function loadSessions() {
  try {
    const agentId = el('session-filter')?.value || '';
    const url = `/api/v1/sessions?limit=50${agentId ? `&agentId=${agentId}` : ''}`;
    const data = await API.get(url);
    const sessions = data.sessions || [];
    const container = el('sessions-list');

    if (!sessions.length) {
      container.innerHTML = `<div class="card"><div class="empty-state"><div class="empty-state-title">No sessions yet.</div><div class="empty-state-sub">Sessions are logged here every time an agent runs.</div></div></div>`;
      return;
    }

    container.innerHTML = sessions.map((s, i) => `
      <div class="card" style="margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;cursor:pointer" onclick="toggleSession('sess-${i}')">
          <span class="badge badge-blue">${(s.agentId || '?').toUpperCase()}</span>
          <span style="font-size:13px;font-weight:600;flex:1">${s.sessionId}</span>
          <span style="font-size:12px;color:var(--text-muted)">${timeAgo(s.updatedAt)}</span>
          <span style="font-size:13px;color:var(--text-muted)">${(s.messages || []).length} msgs ▶</span>
        </div>
        <div id="sess-${i}" style="display:none;margin-top:14px;border-top:1px solid var(--border);padding-top:14px">
          ${(s.messages || []).map(m => `
            <div style="margin-bottom:12px">
              <div style="font-size:11px;font-weight:600;color:${m.role === 'user' ? 'var(--accent-dark)' : 'var(--text-2)'};text-transform:uppercase;margin-bottom:4px">${m.role}</div>
              <pre style="font-size:12px;color:var(--text);background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px;white-space:pre-wrap;word-break:break-word;max-height:300px;overflow-y:auto">${String(m.content || '').slice(0, 2000)}${String(m.content || '').length > 2000 ? '\n[truncated]' : ''}</pre>
            </div>`).join('')}
        </div>
      </div>`).join('');
  } catch (err) {
    showAlert('sessions-alert', err.message, 'error');
  }
}

function toggleSession(id) {
  const el_ = el(id);
  if (el_) el_.style.display = el_.style.display === 'none' ? 'block' : 'none';
}
