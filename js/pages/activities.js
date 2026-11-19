// ===== Activities =====
// The Activities destination has three in-page views: 'list' (Activities),
// 'discovery' (catalog smart search) and 'editor' (full-page guided stepper).
// No add/edit modal is used anywhere in this module.
let activitiesView = { mode: 'list', discoveryQuery: '' };
let activityEditor = null;

// ===== Surveys (Substance Use) =====
// The former standalone Substance Use portal is presented as a normal MHIS page:
// no secondary header, no breadcrumb, no Back to Portal, and no intermediate
// "View Surveys" step. The introduction becomes a compact collapsible panel and
// the surveys are listed immediately underneath.
function renderSurveysPage() {
    const intro = mockData.surveysIntro;
    const expanded = surveysView.introExpanded;

    return `
        <div class="page">
            <div class="page-header">
                <div>
                    <h1 class="page-title">Surveys</h1>
                    <p class="page-lead">Substance use prevention and treatment data collection.</p>
                </div>
                <button class="btn btn-primary" id="addSurveyBtn">
                    <i data-lucide="plus"></i><span>Add Survey</span>
                </button>
            </div>

            <div class="intro-panel${expanded ? ' expanded' : ''}" id="surveysIntroPanel">
                <div class="intro-panel-icon"><i data-lucide="info"></i></div>
                <div class="intro-panel-body">
                    <h2 class="intro-panel-title">About Substance Use Data Collection</h2>
                    <p class="intro-panel-text" id="surveysIntroText">${escapeHtml(expanded ? intro.full : intro.short)}</p>
                    <button type="button" class="intro-panel-toggle" id="surveysIntroToggle">${expanded ? 'Show less' : 'Show more'}</button>
                </div>
            </div>

            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="surveySearch" placeholder="Search surveys..." aria-label="Search surveys" />
                </div>
                ${renderSelect('surveyYearFilter', 'Reporting Year', mockData.surveyYears, '')}
                ${renderSelect('surveyTypeFilter', 'Survey Type', mockData.surveyTypes, '')}
                ${renderSelect('surveyStatusFilter', 'Status', mockData.surveyStatuses, '')}
            </div>
            <div class="result-count" id="surveyCount"></div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Survey</th><th>Reporting Year</th><th>Status</th>
                        <th>Last Updated</th><th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody id="surveyTableBody"></tbody>
            </table>
        </div>`;
}

function attachSurveysListeners() {
    document.getElementById('addSurveyBtn').addEventListener('click', () => {
        showToast('Adding a survey is not simulated in this prototype.', 'info');
    });
    document.getElementById('surveysIntroToggle').addEventListener('click', toggleSurveysIntro);
    document.getElementById('surveySearch').addEventListener('input', renderSurveyRows);
    document.getElementById('surveyYearFilter').addEventListener('change', renderSurveyRows);
    document.getElementById('surveyTypeFilter').addEventListener('change', renderSurveyRows);
    document.getElementById('surveyStatusFilter').addEventListener('change', renderSurveyRows);
    renderSurveyRows();
}

function toggleSurveysIntro() {
    surveysView.introExpanded = !surveysView.introExpanded;
    const intro = mockData.surveysIntro;
    document.getElementById('surveysIntroPanel').classList.toggle('expanded', surveysView.introExpanded);
    document.getElementById('surveysIntroText').textContent = surveysView.introExpanded ? intro.full : intro.short;
    document.getElementById('surveysIntroToggle').textContent = surveysView.introExpanded ? 'Show less' : 'Show more';
}

function getFilteredSurveys() {
    const q = (document.getElementById('surveySearch')?.value || '').toLowerCase();
    const year = document.getElementById('surveyYearFilter')?.value || '';
    const type = document.getElementById('surveyTypeFilter')?.value || '';
    const status = document.getElementById('surveyStatusFilter')?.value || '';
    return mockData.surveys.filter(s =>
        (!q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) &&
        (!year || s.year === year) &&
        (!type || s.type === type) &&
        (!status || s.status === status));
}

function renderSurveyRows() {
    const rows = getFilteredSurveys();
    const body = document.getElementById('surveyTableBody');
    document.getElementById('surveyCount').textContent = `${rows.length} survey${rows.length === 1 ? '' : 's'} found`;
    if (rows.length === 0) {
        body.innerHTML = `<tr><td colspan="5" class="empty-row">No surveys match your filters.</td></tr>`;
        return;
    }
    body.innerHTML = rows.map(s => {
        const isDraft = s.status === 'Draft';
        return `
        <tr>
            <td>
                <div class="cell-primary">${escapeHtml(s.name)}</div>
                <div class="cell-secondary">${escapeHtml(s.type)} &middot; ${escapeHtml(s.description)}</div>
            </td>
            <td>${escapeHtml(s.year)}</td>
            <td><span class="state-chip ${isDraft ? 'draft' : 'published'}">${escapeHtml(s.status)}</span></td>
            <td>${escapeHtml(s.updated)}</td>
            <td class="actions-col">
                <button class="icon-action" title="${isDraft ? 'Edit' : 'View'}" aria-label="${isDraft ? 'Edit' : 'View'}" data-action="${isDraft ? 'edit' : 'view'}" data-id="${s.id}"><i data-lucide="${isDraft ? 'pencil' : 'eye'}"></i></button>
            </td>
        </tr>`;
    }).join('');
    body.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            showToast(action === 'edit'
                ? 'Opening a survey for editing is not simulated in this prototype.'
                : 'Viewing a submitted survey is not simulated in this prototype.', 'info');
        });
    });
    if (window.lucide) window.lucide.createIcons();
}

// ===== Resources & Help =====
// mode is 'landing' or one of the resource topic keys.
let resourcesHelpView = { mode: 'landing', catalogQuery: '' };

// ===== Surveys =====
// Substance use data collection presented inside the MHIS shell (no separate portal).
let surveysView = { introExpanded: false };

function getActivityConfig(configId) {
    return mockData.activityConfigs.find(c => c.id === configId);
}

function isActivityCompleted(activity) {
    // Completed = end date in the past (view-only), regardless of stored state.
    const end = activity.data && activity.data.endDate ? new Date(activity.data.endDate) : null;
    if (activity.state === 'completed') return true;
    if (!end) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end < today;
}

function activityStateLabel(activity) {
    if (isActivityCompleted(activity)) return 'Completed';
    return activity.state === 'draft' ? 'Draft' : 'Published';
}

function renderActivitiesPage() {
    if (activitiesView.mode === 'discovery') return renderActivityDiscovery();
    if (activitiesView.mode === 'editor') return renderActivityEditorPage();
    return renderMyActivitiesList();
}

function attachActivitiesListeners() {
    if (activitiesView.mode === 'discovery') return attachActivityDiscoveryListeners();
    if (activitiesView.mode === 'editor') return attachActivityEditorListeners();
    return attachMyActivitiesListeners();
}

function showActivitiesView(mode) {
    activitiesView.mode = mode;
    renderPage('activities');
}

// ---------- Activities list ----------
function renderMyActivitiesList() {
    const configOptions = mockData.activityConfigs
        .map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.code)} — ${escapeHtml(c.subActivity)}</option>`)
        .join('');
    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Activities</h1>
                <button class="btn btn-primary" id="logActivityBtn">
                    <i data-lucide="plus"></i><span>Add Activity</span>
                </button>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="activitySearch" placeholder="Search my activities..." aria-label="Search my activities" />
                </div>
                <div class="filter-group">
                    <label for="activityTypeFilter">Activity</label>
                    <select id="activityTypeFilter">
                        <option value="">All</option>
                        ${configOptions}
                    </select>
                </div>
                <div class="filter-group">
                    <label for="activityStateFilter">Record</label>
                    <select id="activityStateFilter">
                        <option value="">All</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>
            <div class="result-count" id="activityCount"></div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Code</th><th>Activity</th><th>Location</th><th>Facility</th>
                        <th>Implementation Dates</th><th>Last Updated</th><th>Status</th><th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody id="activityTableBody"></tbody>
            </table>
        </div>`;
}

function attachMyActivitiesListeners() {
    document.getElementById('logActivityBtn').addEventListener('click', () => startActivityDiscovery());
    document.getElementById('activitySearch').addEventListener('input', renderActivityRows);
    document.getElementById('activityTypeFilter').addEventListener('change', renderActivityRows);
    document.getElementById('activityStateFilter').addEventListener('change', renderActivityRows);
    renderActivityRows();
}

function activitySectionKeys(cfg) {
    return cfg ? cfg.sections.map(s => s.key) : [];
}

function renderActivityRows() {
    const rows = getFilteredActivities();
    const body = document.getElementById('activityTableBody');
    document.getElementById('activityCount').textContent = `${rows.length} activit${rows.length === 1 ? 'y' : 'ies'} found`;
    if (rows.length === 0) {
        body.innerHTML = `<tr><td colspan="8" class="empty-row">No activities match your filters.</td></tr>`;
        return;
    }
    body.innerHTML = rows.map(a => {
        const cfg = getActivityConfig(a.configId);
        const completed = isActivityCompleted(a);
        const keys = activitySectionKeys(cfg);
        const hasLocation = keys.includes('location');
        const hasFacility = keys.includes('location'); // facility lives in the Location section
        const location = hasLocation
            ? escapeHtml([a.data.governorate, a.data.locality].filter(Boolean).join(', ') || '—')
            : '<span class="muted">Not required</span>';
        const facility = hasFacility
            ? escapeHtml(a.data.facility || '—')
            : '<span class="muted">Not required</span>';
        const period = `${escapeHtml(a.data.startDate || '—')} → ${escapeHtml(a.data.endDate || '—')}`;
        const label = activityStateLabel(a);
        const labelClass = completed ? 'completed' : (a.state === 'draft' ? 'draft' : 'published');
        let actions = '';
        if (completed) {
            actions = `<button class="icon-action" title="View" aria-label="View" data-action="view" data-id="${a.id}"><i data-lucide="eye"></i></button>`;
        } else {
            actions = `
                <button class="icon-action" title="Edit" aria-label="Edit" data-action="edit" data-id="${a.id}"><i data-lucide="pencil"></i></button>
                <button class="icon-action" title="Duplicate" aria-label="Duplicate" data-action="duplicate" data-id="${a.id}"><i data-lucide="copy"></i></button>`;
            if (a.state === 'draft') {
                actions += `<button class="icon-action danger" title="Delete" aria-label="Delete" data-action="delete" data-id="${a.id}"><i data-lucide="trash-2"></i></button>`;
            }
        }
        return `
            <tr>
                <td>${escapeHtml(cfg ? cfg.code : '—')}</td>
                <td>
                    <div class="cell-primary">${escapeHtml(a.data.title || 'Untitled activity')}</div>
                    <div class="cell-secondary">${escapeHtml(cfg ? cfg.subActivity : '')}</div>
                </td>
                <td>${location}</td>
                <td>${facility}</td>
                <td>${period}</td>
                <td>${escapeHtml(a.updated || '—')}</td>
                <td><span class="state-chip ${labelClass}">${escapeHtml(label)}</span></td>
                <td class="actions-col">${actions}</td>
            </tr>`;
    }).join('');

    body.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const action = btn.getAttribute('data-action');
            if (action === 'view') openActivityEditor(id, true);
            else if (action === 'edit') openActivityEditor(id, false);
            else if (action === 'duplicate') duplicateActivity(id);
            else if (action === 'delete') deleteActivity(id);
        });
    });
    if (window.lucide) window.lucide.createIcons();
}

function getFilteredActivities() {
    const q = (document.getElementById('activitySearch')?.value || '').toLowerCase();
    const type = document.getElementById('activityTypeFilter')?.value || '';
    const state = document.getElementById('activityStateFilter')?.value || '';
    return mockData.activities.filter(a => {
        const cfg = getActivityConfig(a.configId);
        const title = (a.data.title || '').toLowerCase();
        const matchesQ = !q || title.includes(q) ||
            (cfg && (`${cfg.code} ${cfg.activity} ${cfg.subActivity}`.toLowerCase().includes(q)));
        const matchesType = !type || a.configId === type;
        const category = isActivityCompleted(a) ? 'completed' : a.state;
        const matchesState = !state || category === state;
        return matchesQ && matchesType && matchesState;
    });
}

function duplicateActivity(id) {
    const src = mockData.activities.find(a => a.id === id);
    if (!src) return;
    const copy = {
        id: Math.max(0, ...mockData.activities.map(a => a.id)) + 1,
        configId: src.configId,
        state: 'draft',
        data: Object.assign({}, src.data, { title: `${src.data.title} (Copy)` }),
        updated: new Date().toISOString().slice(0, 10)
    };
    mockData.activities.push(copy);
    showToast('Activity duplicated as a draft.', 'success');
    renderActivityRows();
}

function deleteActivity(id) {
    const a = mockData.activities.find(x => x.id === id);
    if (!a) return;
    showConfirmDialog({
        title: 'Delete Draft Activity',
        message: `Delete draft activity "${a.data.title}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        tone: 'danger',
        onConfirm: () => {
            mockData.activities = mockData.activities.filter(x => x.id !== id);
            showToast('Activity deleted.', 'success');
            renderActivityRows();
        }
    });
}

// ---------- Activity discovery (smart catalog search) ----------
function startActivityDiscovery() {
    activitiesView.discoveryQuery = '';
    showActivitiesView('discovery');
}

function scoreCatalogMatch(cfg, query) {
    const q = query.trim().toLowerCase();
    if (!q) return { score: 0, reason: '' };
    let score = 0;
    let reason = '';
    const words = q.split(/\s+/).filter(w => w.length > 2);

    if (cfg.code.toLowerCase() === q || cfg.subCode.toLowerCase() === q) { score += 100; reason = `Matched code ${cfg.code}`; }
    else if (cfg.code.toLowerCase().startsWith(q) || cfg.subCode.toLowerCase().startsWith(q)) { score += 80; reason = `Matched code ${cfg.subCode}`; }

    const name = `${cfg.activity} ${cfg.subActivity}`.toLowerCase();
    if (name.includes(q)) { score += 60; reason = reason || 'Matches the activity name'; }

    cfg.keywords.forEach(k => {
        const kl = k.toLowerCase();
        if (kl === q || q.includes(kl) || kl.includes(q)) {
            score += 40;
            reason = reason || `Matches "${k}"`;
        }
    });

    // Plain-language: count overlapping meaningful words against keywords + definition
    const haystack = `${name} ${cfg.definition} ${cfg.keywords.join(' ')}`.toLowerCase();
    let hits = 0;
    let hitWord = '';
    words.forEach(w => {
        if (haystack.includes(w)) { hits++; hitWord = hitWord || w; }
    });
    if (hits > 0) {
        score += hits * 12;
        reason = reason || `Relevant to "${hitWord}"`;
    }
    return { score, reason };
}

function renderActivityDiscovery() {
    const q = activitiesView.discoveryQuery;
    return `
        <div class="page">
            <div class="page-header">
                <div>
                    <h1 class="page-title">Add Activity</h1>
                    <p class="page-lead">What activity are you reporting?</p>
                </div>
            </div>
            <div class="discovery-search">
                <div class="search-group large">
                    <i data-lucide="search"></i>
                    <input type="search" id="discoverySearch" value="${escapeHtml(q)}"
                        placeholder="Search by code (e.g. 6.1), activity name, or describe the work performed..."
                        aria-label="Search the activity catalog" autocomplete="off" />
                </div>
                <p class="helper-text">Try a code like <strong>6.1</strong>, a term like <strong>community awareness</strong>, or plain language like <strong>we trained health workers</strong>.</p>
            </div>
            <div id="discoveryResults" class="discovery-results"></div>
        </div>`;
}

function attachActivityDiscoveryListeners() {
    const input = document.getElementById('discoverySearch');
    input.addEventListener('input', () => {
        activitiesView.discoveryQuery = input.value;
        renderDiscoveryResults();
    });
    renderDiscoveryResults();
    input.focus();
}

function renderDiscoveryResults() {
    const container = document.getElementById('discoveryResults');
    const q = activitiesView.discoveryQuery.trim();
    const isPlainLanguage = q.split(/\s+/).length >= 3;

    let items;
    if (!q) {
        items = mockData.activityConfigs.map(cfg => ({ cfg, score: 1, reason: '' }));
    } else {
        items = mockData.activityConfigs
            .map(cfg => ({ cfg, ...scoreCatalogMatch(cfg, q) }))
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score);
    }

    if (items.length === 0) {
        container.innerHTML = `<div class="empty-state">No catalog matches for "<strong>${escapeHtml(q)}</strong>". Try a different term or a code.</div>`;
        return;
    }

    container.innerHTML = items.map(({ cfg, reason }) => `
        <div class="catalog-card">
            <div class="catalog-card-main">
                <div class="catalog-code">${escapeHtml(cfg.code)} · ${escapeHtml(cfg.subCode)}</div>
                <div class="catalog-name">${escapeHtml(cfg.activity)}</div>
                <div class="catalog-sub">${escapeHtml(cfg.subActivity)}</div>
                <p class="catalog-def">${escapeHtml(cfg.definition)}</p>
                ${(q && isPlainLanguage && reason) ? `<div class="catalog-why"><i data-lucide="sparkles"></i> Why this matches: ${escapeHtml(reason)}</div>` : ''}
            </div>
            <div class="catalog-card-action">
                <button class="btn btn-primary" data-select="${escapeHtml(cfg.id)}">Select activity</button>
            </div>
        </div>`).join('');

    container.querySelectorAll('button[data-select]').forEach(btn => {
        btn.addEventListener('click', () => openActivityEditor(null, false, btn.getAttribute('data-select')));
    });
    if (window.lucide) window.lucide.createIcons();
}

// ---------- Full-page guided editor ----------
function editorSteps(cfg) {
    // Steps come from activity metadata + a final Review step.
    const steps = cfg.sections.map(s => ({ key: s.key, title: s.title }));
    steps.push({ key: '__review', title: 'Review' });
    return steps;
}

function openActivityEditor(id, viewOnly, configId) {
    const editing = typeof id === 'number';
    const existing = editing ? mockData.activities.find(a => a.id === id) : null;
    const resolvedConfigId = editing ? existing.configId : (configId || '');
    // A completed record is opened straight into the read-only Review step —
    // there is nothing left to edit, so stepping through every section first
    // just adds friction. The stepper stays clickable if the user wants to
    // look at an individual section.
    const cfg = getActivityConfig(resolvedConfigId);
    const steps = cfg ? editorSteps(cfg) : [];
    const visited = {};
    if (viewOnly) steps.forEach(step => { visited[step.key] = true; });
    activityEditor = {
        id: editing ? existing.id : null,
        configId: resolvedConfigId,
        state: editing ? existing.state : 'draft',
        data: editing ? Object.assign({}, existing.data) : {},
        originalData: editing ? JSON.stringify(existing.data) : JSON.stringify({}),
        viewOnly: !!viewOnly,
        step: viewOnly ? Math.max(steps.length - 1, 0) : 0,
        visited: visited,
        dirty: false
    };
    showActivitiesView('editor');
}

function renderActivityEditorPage() {
    const s = activityEditor;
    const cfg = getActivityConfig(s.configId);
    if (!cfg) {
        // Should not happen; fall back to discovery.
        return renderActivityDiscovery();
    }
    const steps = editorSteps(cfg);
    const readonly = s.viewOnly;
    const title = readonly ? 'View Activity' : (s.id ? 'Edit Activity' : 'Add Activity');

    const stepperHTML = steps.map((step, i) => {
        const classes = ['stepper-item'];
        if (i === s.step) classes.push('current');
        if (s.visited[step.key] && i !== s.step) classes.push('done');
        if (s.stepIssues && s.stepIssues[step.key]) classes.push('attention');
        return `
            <button type="button" class="${classes.join(' ')}" data-step="${i}">
                <span class="stepper-index">${s.visited[step.key] && i !== s.step ? '<i data-lucide=\'check\'></i>' : (i + 1)}</span>
                <span class="stepper-label">${escapeHtml(step.title)}</span>
            </button>`;
    }).join('<span class="stepper-line"></span>');

    return `
        <div class="page activity-editor">
            <div class="editor-topbar">
                <h1 class="page-title">${title}</h1>
                ${readonly ? '<span class="readonly-tag">Read-only · completed record</span>' : ''}
            </div>

            <div class="selected-activity">
                <div class="selected-activity-info">
                    <div class="catalog-code">${escapeHtml(cfg.code)} · ${escapeHtml(cfg.subCode)}</div>
                    <div class="selected-activity-name">${escapeHtml(cfg.activity)} — ${escapeHtml(cfg.subActivity)}</div>
                    <div class="selected-activity-def">${escapeHtml(cfg.definition)}</div>
                </div>
                ${readonly ? '' : '<button class="btn btn-secondary" id="changeActivityBtn">Change activity</button>'}
            </div>

            <div class="stepper" id="activityStepper">${stepperHTML}</div>

            <div id="editorValidationSummary"></div>

            <form id="activityEditorForm" class="editor-form" novalidate>
                <div id="editorStepBody">${renderEditorStep()}</div>
            </form>

            <div class="editor-actions">
                <button type="button" class="btn btn-secondary" id="editorCancelBtn">Cancel</button>
                <div class="editor-actions-right">
                    ${readonly ? '' : '<button type="button" class="btn btn-secondary" id="editorSaveDraftBtn">Save Draft</button>'}
                    ${renderEditorPrimaryAction()}
                </div>
            </div>
        </div>`;
}

function renderEditorPrimaryAction() {
    const s = activityEditor;
    const cfg = getActivityConfig(s.configId);
    const steps = editorSteps(cfg);
    const isLast = s.step === steps.length - 1;
    if (s.viewOnly) {
        return isLast ? '' : '<button type="button" class="btn btn-primary" id="editorContinueBtn">Continue</button>';
    }
    if (isLast) {
        return '<button type="button" class="btn btn-primary" id="editorPublishBtn">Publish Activity</button>';
    }
    return '<button type="button" class="btn btn-primary" id="editorContinueBtn">Continue</button>';
}

function renderEditorStep() {
    const s = activityEditor;
    const cfg = getActivityConfig(s.configId);
    const steps = editorSteps(cfg);
    const step = steps[s.step];

    if (step.key === '__review') {
        return renderEditorReview();
    }
    const section = cfg.sections.find(sec => sec.key === step.key);
    const readonly = s.viewOnly;
    return `
        <section class="activity-section">
            <h3 class="activity-section-title">${escapeHtml(section.title)}</h3>
            <div class="form-grid">
                ${section.fields.map(f => renderActivityField(f, s.data[f.id], readonly)).join('')}
            </div>
        </section>`;
}

function renderEditorReview() {
    const s = activityEditor;
    const cfg = getActivityConfig(s.configId);
    const blocks = cfg.sections.map(section => {
        const rows = section.fields.map(f => {
            const v = s.data[f.id];
            return `<div class="review-row"><dt>${escapeHtml(f.label)}</dt><dd>${v == null || v === '' ? '<span class="muted">—</span>' : escapeHtml(String(v))}</dd></div>`;
        }).join('');
        return `<div class="review-block"><h4>${escapeHtml(section.title)}</h4><dl>${rows}</dl></div>`;
    }).join('');
    return `
        <section class="activity-section">
            <h3 class="activity-section-title">Review</h3>
            <p class="helper-text">Review the recorded details below, then ${s.viewOnly ? 'close this record.' : 'publish the activity.'}</p>
            ${blocks}
        </section>`;
}

function renderActivityField(f, value, readonly) {
    const v = value == null ? '' : value;
    const req = f.required ? ' <span class="required">*</span>' : '';
    const dis = readonly ? ' disabled' : '';
    const dataReq = f.required ? ' data-required="true"' : '';
    let control;
    if (f.type === 'textarea') {
        control = `<textarea id="af-${f.id}" data-field="${f.id}"${dataReq}${dis}>${escapeHtml(v)}</textarea>`;
    } else if (f.type === 'select') {
        let opts = f.options;
        if (!opts && f.optionsFrom === 'facilities') opts = mockData.facilities.map(x => x.name);
        if (!opts && f.optionsFrom === 'governorates') opts = mockData.governorates;
        opts = opts || [];
        const optHtml = opts.map(o => `<option value="${escapeHtml(o)}"${String(o) === String(v) ? ' selected' : ''}>${escapeHtml(o)}</option>`).join('');
        control = `<select id="af-${f.id}" data-field="${f.id}"${dataReq}${dis}><option value="">Select...</option>${optHtml}</select>`;
    } else {
        control = `<input type="${f.type}" id="af-${f.id}" data-field="${f.id}" value="${escapeHtml(v)}"${dataReq}${dis} />`;
    }
    return `
        <div class="form-field">
            <label for="af-${f.id}">${escapeHtml(f.label)}${req}</label>
            ${control}
            <div class="field-error" id="af-${f.id}-error"></div>
        </div>`;
}

function attachActivityEditorListeners() {
    const s = activityEditor;
    document.getElementById('editorCancelBtn').addEventListener('click', () => editorCancel());

    const changeBtn = document.getElementById('changeActivityBtn');
    if (changeBtn) changeBtn.addEventListener('click', editorChangeActivity);

    document.querySelectorAll('#activityStepper .stepper-item').forEach(btn => {
        btn.addEventListener('click', () => editorGoToStep(parseInt(btn.getAttribute('data-step'))));
    });

    const continueBtn = document.getElementById('editorContinueBtn');
    if (continueBtn) continueBtn.addEventListener('click', () => editorGoToStep(s.step + 1));

    const saveDraft = document.getElementById('editorSaveDraftBtn');
    if (saveDraft) saveDraft.addEventListener('click', editorSaveDraft);

    const publish = document.getElementById('editorPublishBtn');
    if (publish) publish.addEventListener('click', editorPublish);

    bindEditorFieldInputs();
    if (window.lucide) window.lucide.createIcons();
}

function bindEditorFieldInputs() {
    document.querySelectorAll('#editorStepBody [data-field]').forEach(el => {
        const handler = () => {
            activityEditor.data[el.getAttribute('data-field')] = el.value;
            activityEditor.dirty = JSON.stringify(activityEditor.data) !== activityEditor.originalData;
        };
        el.addEventListener('input', handler);
        el.addEventListener('change', handler);
    });
}

function currentStepKey() {
    const cfg = getActivityConfig(activityEditor.configId);
    return editorSteps(cfg)[activityEditor.step].key;
}

function stepMissingRequired(stepKey) {
    const cfg = getActivityConfig(activityEditor.configId);
    const section = cfg.sections.find(sec => sec.key === stepKey);
    if (!section) return [];
    return section.fields.filter(f => f.required && (activityEditor.data[f.id] == null || String(activityEditor.data[f.id]).trim() === ''));
}

function editorGoToStep(target) {
    const cfg = getActivityConfig(activityEditor.configId);
    const steps = editorSteps(cfg);
    if (target < 0 || target >= steps.length) return;

    // Mark the step we are leaving as visited and flag missing required data (amber, not red).
    const leavingKey = currentStepKey();
    activityEditor.visited[leavingKey] = true;
    activityEditor.stepIssues = activityEditor.stepIssues || {};
    if (!activityEditor.viewOnly && leavingKey !== '__review') {
        activityEditor.stepIssues[leavingKey] = stepMissingRequired(leavingKey).length > 0;
    }

    activityEditor.step = target;
    document.getElementById('editorStepBody').innerHTML = renderEditorStep();
    refreshStepper();
    rebuildEditorActions();
    bindEditorFieldInputs();
    document.getElementById('editorValidationSummary').innerHTML = '';
    if (window.lucide) window.lucide.createIcons();
    document.querySelector('.activity-editor').scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function refreshStepper() {
    const cfg = getActivityConfig(activityEditor.configId);
    const steps = editorSteps(cfg);
    const stepper = document.getElementById('activityStepper');
    stepper.querySelectorAll('.stepper-item').forEach((btn, i) => {
        const key = steps[i].key;
        btn.classList.toggle('current', i === activityEditor.step);
        btn.classList.toggle('done', !!activityEditor.visited[key] && i !== activityEditor.step);
        btn.classList.toggle('attention', !!(activityEditor.stepIssues && activityEditor.stepIssues[key]));
        const idx = btn.querySelector('.stepper-index');
        if (activityEditor.visited[key] && i !== activityEditor.step) idx.innerHTML = "<i data-lucide='check'></i>";
        else idx.textContent = (i + 1);
    });
}

function rebuildEditorActions() {
    const s = activityEditor;
    const cfg = getActivityConfig(s.configId);
    const steps = editorSteps(cfg);
    const right = document.querySelector('.editor-actions-right');
    let html = '';
    if (!s.viewOnly) html += '<button type="button" class="btn btn-secondary" id="editorSaveDraftBtn">Save Draft</button>';
    html += renderEditorPrimaryAction();
    right.innerHTML = html;

    const continueBtn = document.getElementById('editorContinueBtn');
    if (continueBtn) continueBtn.addEventListener('click', () => editorGoToStep(s.step + 1));
    const saveDraft = document.getElementById('editorSaveDraftBtn');
    if (saveDraft) saveDraft.addEventListener('click', editorSaveDraft);
    const publish = document.getElementById('editorPublishBtn');
    if (publish) publish.addEventListener('click', editorPublish);
}

function editorChangeActivity() {
    if (!activityEditor.dirty) {
        startActivityDiscovery();
        return;
    }
    showConfirmDialog({
        title: 'Change Activity?',
        message: 'Changing the activity will reset details that no longer apply. Continue?',
        confirmLabel: 'Continue',
        tone: 'danger',
        onConfirm: startActivityDiscovery
    });
}

function editorCancel() {
    const proceedToCancel = () => {
        activityEditor = null;
        showActivitiesView('list');
    };

    if (activityEditor && activityEditor.dirty && !activityEditor.viewOnly) {
        showConfirmDialog({
            title: 'Discard Unsaved Changes?',
            message: 'Discard your changes and return to Activities?',
            confirmLabel: 'Discard Changes',
            tone: 'danger',
            onConfirm: proceedToCancel
        });
        return;
    }

    proceedToCancel();
}

function editorSaveDraft() {
    persistActivity('draft');
    showToast('Draft saved successfully.', 'success');
    activityEditor = null;
    showActivitiesView('list');
}

function editorPublish() {
    const cfg = getActivityConfig(activityEditor.configId);
    const issuesBySection = [];
    cfg.sections.forEach(section => {
        const missing = section.fields.filter(f => f.required && (activityEditor.data[f.id] == null || String(activityEditor.data[f.id]).trim() === ''));
        if (missing.length > 0) {
            issuesBySection.push({ key: section.key, title: section.title, fields: missing });
            activityEditor.stepIssues = activityEditor.stepIssues || {};
            activityEditor.stepIssues[section.key] = true;
        }
    });

    if (issuesBySection.length > 0) {
        renderValidationSummary(issuesBySection);
        refreshStepper();
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    persistActivity('published');
    showToast('Activity published successfully.', 'success');
    activityEditor = null;
    showActivitiesView('list');
}

function renderValidationSummary(issuesBySection) {
    const cfg = getActivityConfig(activityEditor.configId);
    const steps = editorSteps(cfg);
    const summary = document.getElementById('editorValidationSummary');
    summary.innerHTML = `
        <div class="validation-summary">
            <div class="validation-summary-title"><i data-lucide="alert-triangle"></i> Please complete the required fields before publishing</div>
            <ul>
                ${issuesBySection.map(sec => {
                    const stepIndex = steps.findIndex(st => st.key === sec.key);
                    return `<li><button type="button" class="validation-link" data-goto-step="${stepIndex}">${escapeHtml(sec.title)}</button>: ${sec.fields.map(f => escapeHtml(f.label)).join(', ')}</li>`;
                }).join('')}
            </ul>
        </div>`;
    summary.querySelectorAll('button[data-goto-step]').forEach(btn => {
        btn.addEventListener('click', () => {
            editorGoToStep(parseInt(btn.getAttribute('data-goto-step')));
            // Show inline errors on the target section fields.
            highlightMissingInStep();
        });
    });
    if (window.lucide) window.lucide.createIcons();
    summary.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    // Keyboard users land on the first section link, which opens that step.
    const firstLink = summary.querySelector('button[data-goto-step]');
    if (firstLink) firstLink.focus({ preventScroll: true });
}

function highlightMissingInStep() {
    const missing = stepMissingRequired(currentStepKey());
    const inputs = [];
    missing.forEach(f => {
        const input = document.getElementById(`af-${f.id}`);
        if (input) {
            setFieldError(input, requiredFieldMessage(input));
            inputs.push(input);
        }
    });
    focusFirstInvalid(inputs);
}

function persistActivity(state) {
    const s = activityEditor;
    const today = new Date().toISOString().slice(0, 10);
    if (s.id) {
        const existing = mockData.activities.find(a => a.id === s.id);
        existing.configId = s.configId;
        existing.data = Object.assign({}, s.data);
        existing.state = state;
        existing.updated = today;
    } else {
        mockData.activities.push({
            id: Math.max(0, ...mockData.activities.map(a => a.id)) + 1,
            configId: s.configId,
            state: state,
            data: Object.assign({}, s.data),
            updated: today
        });
    }
}

