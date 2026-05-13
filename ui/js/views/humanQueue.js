async function renderHumanQueue() {
  const main = el('main-content');
  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Human Queue</h1>
      <p class="page-sub">Applications paused by GUARDIAN — fill required fields and submit</p>
    </div>
    <div id="hq-alert"></div>
    <div id="hq-content"></div>
  `;
  await loadHumanQueue();
}

async function loadHumanQueue() {
  try {
    const data = await API.get('/api/v1/human-queue');
    const pending = (data.queue || []).filter(q => !q.reviewed);
    const approved = (data.queue || []).filter(q => q.reviewed);
    const container = el('hq-content');

    if (!pending.length && !approved.length) {
      container.innerHTML = `
        <div class="card">
          <div class="empty-state">
            <div class="empty-state-title">No items in queue.</div>
            <div class="empty-state-sub">GUARDIAN will pause applications here when salary, diversity, or essay fields are detected on the real ATS form.</div>
          </div>
        </div>`;
      return;
    }

    let html = '';

    if (pending.length) {
      html += `<h3 style="font-size:14px;font-weight:600;color:var(--text-2);margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em">Awaiting Review (${pending.length})</h3>`;
      html += pending.map((item, i) => renderQueueCard(item, i, false)).join('');
    }

    if (approved.length) {
      html += `<h3 style="font-size:14px;font-weight:600;color:var(--text-2);margin:20px 0 12px;text-transform:uppercase;letter-spacing:.05em">Approved — Ready to Submit (${approved.length})</h3>`;
      html += approved.map((item, i) => renderQueueCard(item, pending.length + i, true)).join('');
    }

    container.innerHTML = html;
  } catch (err) {
    showAlert('hq-alert', err.message, 'error');
  }
}

const FIELD_DEFINITIONS = {
  salary: {
    label: 'Desired Salary',
    type: 'text',
    placeholder: 'e.g. $220,000',
    hint: 'Enter your desired annual salary. This will be submitted as-is.',
  },
  'desired salary': {
    label: 'Desired Salary',
    type: 'text',
    placeholder: 'e.g. $220,000',
    hint: 'Enter your desired annual salary.',
  },
  compensation: {
    label: 'Compensation / Salary',
    type: 'text',
    placeholder: 'e.g. $220,000',
    hint: 'Your expected compensation.',
  },
  disability: {
    label: 'Self-Identification of Disability',
    type: 'select',
    hint: 'Required by federal law for some employers. Your answer does not affect hiring decisions.',
    options: [
      'YES, I HAVE A DISABILITY (or previously had a disability)',
      'NO, I DON\'T HAVE A DISABILITY',
      'I DON\'T WISH TO ANSWER',
    ],
  },
  gender: {
    label: 'Gender',
    type: 'select',
    hint: 'Used for voluntary EEO reporting only.',
    options: [
      'Male',
      'Female',
      'Non-binary / Third gender',
      'Prefer to self-describe',
      'Prefer not to say',
    ],
  },
  race: {
    label: 'Race / Ethnicity',
    type: 'select',
    hint: 'Voluntary EEO self-identification. Does not affect hiring decisions.',
    options: [
      'Hispanic or Latino',
      'White (Not Hispanic or Latino)',
      'Black or African American (Not Hispanic or Latino)',
      'Native Hawaiian or Other Pacific Islander (Not Hispanic or Latino)',
      'Asian (Not Hispanic or Latino)',
      'American Indian or Alaska Native (Not Hispanic or Latino)',
      'Two or More Races (Not Hispanic or Latino)',
      'Prefer not to say',
    ],
  },
  ethnicity: {
    label: 'Ethnicity',
    type: 'select',
    hint: 'Voluntary EEO self-identification.',
    options: [
      'Hispanic or Latino',
      'Not Hispanic or Latino',
      'Prefer not to say',
    ],
  },
  veteran: {
    label: 'Veteran Status',
    type: 'select',
    hint: 'Voluntary self-identification for VEVRAA compliance.',
    options: [
      'I am not a protected veteran',
      'I identify as one or more classifications of a protected veteran',
      'I don\'t wish to answer',
    ],
  },
  signature: {
    label: 'Electronic Signature (Full Legal Name)',
    type: 'text',
    placeholder: 'Type your full legal name',
    hint: 'Your typed name serves as your electronic signature certifying the application is accurate.',
  },
  'sign here': {
    label: 'Electronic Signature',
    type: 'text',
    placeholder: 'Type your full legal name',
    hint: 'Your typed name serves as your electronic signature.',
  },
  certify: {
    label: 'Certification / Attestation',
    type: 'select',
    hint: 'Confirming that the information you provided is accurate and complete.',
    options: [
      'I certify that the information provided is true and accurate to the best of my knowledge',
      'I agree',
    ],
  },
  date: {
    label: 'Signature Date',
    type: 'date',
    hint: 'Date of your electronic signature / application submission.',
  },
};

function getFieldDef(fieldName) {
  const key = fieldName.toLowerCase().trim();
  for (const [pattern, def] of Object.entries(FIELD_DEFINITIONS)) {
    if (key.includes(pattern)) return { ...def, rawKey: fieldName };
  }
  return { label: fieldName, type: 'text', placeholder: `Enter value for: ${fieldName}`, rawKey: fieldName };
}

function renderFieldInput(fieldName, idx) {
  const def = getFieldDef(fieldName);
  const inputId = `hq-field-${idx}-${fieldName}`;

  const hintHtml = def.hint
    ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">${def.hint}</div>`
    : '';

  if (def.type === 'select') {
    const options = (def.options || []).map(opt =>
      `<option value="${opt}">${opt}</option>`
    ).join('');
    return `
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label" style="font-weight:600">${def.label}</label>
        ${hintHtml}
        <select class="form-input" id="${inputId}" style="margin-top:6px">
          <option value="">— Select —</option>
          ${options}
        </select>
      </div>`;
  }

  if (def.type === 'date') {
    const today = new Date().toISOString().split('T')[0];
    return `
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label" style="font-weight:600">${def.label}</label>
        ${hintHtml}
        <input class="form-input" type="date" id="${inputId}" value="${today}" style="margin-top:6px" />
      </div>`;
  }

  return `
    <div class="form-group" style="margin-bottom:14px">
      <label class="form-label" style="font-weight:600">${def.label}</label>
      ${hintHtml}
      <input class="form-input" type="text" id="${inputId}" placeholder="${def.placeholder || ''}" style="margin-top:6px" />
    </div>`;
}

function renderQueueCard(item, i, isApproved) {
  const statusBadge = isApproved
    ? `<span class="badge badge-green">APPROVED</span>`
    : `<span class="badge badge-yellow">GUARDIAN PAUSE</span>`;

  const submitResultId = `hq-submit-result-${i}`;

  const approvedSection = isApproved ? `
    <div style="display:flex;align-items:center;gap:10px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
      <button class="btn btn-primary" onclick="submitQueueItem('${item.jobId}', ${i})">
        Submit Application
      </button>
      <span style="font-size:12px;color:var(--text-muted)">Approved ${timeAgo(item.approvedAt)}</span>
    </div>
    <div id="${submitResultId}" style="margin-top:12px"></div>` : '';

  const approveSection = !isApproved ? `
    <div style="background:#FEF9EC;border:1px solid #FDE68A;border-radius:8px;padding:12px 14px;margin-bottom:16px">
      <div style="font-size:12px;font-weight:600;color:#92400E;margin-bottom:2px">Your input required — no application will be submitted without these fields</div>
      <div style="font-size:11px;color:#78350F">Fill all fields below, then click Approve. You will be shown a final confirm before ORBIT submits.</div>
    </div>
    <div id="hq-fields-${i}">
      ${(item.pausedFields || []).map(field => renderFieldInput(field, i)).join('')}
    </div>
    <div id="hq-item-alert-${i}"></div>
    <button class="btn btn-primary" onclick="approveQueueItem('${item.jobId}', ${i}, ${JSON.stringify(item.pausedFields || []).replace(/"/g, "'")})">
      Approve Fields
    </button>` : `
    <div style="margin-bottom:12px">
      ${Object.entries(item.fieldValues || {}).map(([k, v]) => `
        <div style="font-size:13px;margin-bottom:6px">
          <span style="color:var(--text-2);font-weight:500">${getFieldDef(k).label}:</span>
          <span style="color:var(--text-1);margin-left:6px">${v || '—'}</span>
        </div>`).join('')}
    </div>`;

  return `
    <div class="card" style="margin-bottom:var(--gap)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        ${statusBadge}
        <h3 style="font-size:16px;font-weight:600">${item.company || 'Unknown Company'}</h3>
        <span style="font-size:12px;color:var(--text-muted);margin-left:auto">${timeAgo(item.addedAt)}</span>
      </div>
      ${(item.pausedFields || []).length > 0 ? `
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
          ${(item.pausedFields || []).map(f => `<span class="badge" style="background:#FEF9EC;color:#92400E;border:1px solid #FDE68A">${f}</span>`).join('')}
        </div>` : ''}
      ${approveSection}
      ${approvedSection}
    </div>`;
}

async function approveQueueItem(jobId, idx, fields) {
  try {
    const fieldValues = {};
    (fields || []).forEach(f => {
      const input = el(`hq-field-${idx}-${f}`);
      if (input) fieldValues[f] = input.value.trim();
    });

    await API.post(`/api/v1/human-queue/${jobId}/approve`, { fieldValues });
    showAlert('hq-alert', 'Fields approved. Use "Submit Application" to send the application.', 'success');
    await loadHumanQueue();
  } catch (err) {
    showAlert(`hq-item-alert-${idx}`, err.message, 'error');
  }
}

async function submitQueueItem(jobId, idx) {
  const resultEl = el(`hq-submit-result-${idx}`);
  if (resultEl) {
    resultEl.innerHTML = `<div style="font-size:13px;color:var(--text-2);padding:10px 0">Launching browser — navigating to job form... this may take 30–90 seconds.</div>`;
  }

  try {
    const data = await API.post(`/api/v1/human-queue/${jobId}/submit`, {});
    const result = data.result || {};

    if (data.requeued) {
      showAlert('hq-alert', 'Additional sensitive fields were found on the actual form. Please fill them in below and approve again before submitting.', 'warn');
      await loadHumanQueue();
      return;
    }

    let statusColor = '#065F46';
    let statusBg = '#D1FAE5';
    let statusText = 'Application submitted successfully';

    if (result.status === 'form_filled') {
      statusColor = '#1E40AF';
      statusBg = '#DBEAFE';
      statusText = 'Form filled — review screenshots in workspace-submit/';
    } else if (result.status === 'paused') {
      statusColor = '#92400E';
      statusBg = '#FEF9EC';
      statusText = 'Paused — additional fields found, queue updated';
      setTimeout(() => loadHumanQueue(), 1500);
    } else if (result.status === 'failed') {
      statusColor = '#991B1B';
      statusBg = '#FEE2E2';
      statusText = `Failed — ${result.error || 'check server logs'}`;
    }

    if (resultEl) {
      resultEl.innerHTML = `
        <div style="background:${statusBg};border-radius:8px;padding:12px 16px">
          <div style="font-weight:600;color:${statusColor};margin-bottom:4px">${statusText}</div>
          ${result.screenshots && result.screenshots.length ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px">${result.screenshots.length} screenshot(s) saved</div>` : ''}
          ${result.submittedAt ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px">At: ${new Date(result.submittedAt).toLocaleString()}</div>` : ''}
        </div>`;
    }
  } catch (err) {
    if (resultEl) {
      resultEl.innerHTML = `<div style="background:#FEE2E2;border-radius:8px;padding:12px 16px;color:#991B1B;font-size:13px">${err.message}</div>`;
    }
  }
}
