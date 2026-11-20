// ===== Reporting platform Overview pages =====
// Each reporting platform opens on its Overview: what the platform is for,
// its main actions, and a glance at the organization's figures. The page is
// the same on every visit. With no data yet, the figures are zero and Add
// Activity / Add Survey is still the first action.

// 4Ws: the same headline figures the 4Ws Dashboard opens with.
function getFourWsHomeFigures() {
    const kpis = dashboardTabs[0].kpis;
    const valueOf = label => (kpis.find(k => k.label === label) || { value: '-' }).value;
    return [
        { value: valueOf('Total Activities'), label: 'Activities' },
        { value: valueOf('Ongoing'), label: 'Ongoing' },
        { value: valueOf('Beneficiaries Reached'), label: 'Beneficiaries' }
    ];
}

// Substance Use: surveys run on a yearly cycle, so progress is shown for the
// current reporting year (one survey per survey type).
function getSubstanceUseCycle() {
    const year = mockData.surveyYears[0];
    const surveys = mockData.surveys.filter(s => s.year === year);
    return {
        year,
        expected: mockData.surveyTypes.length,
        submitted: surveys.filter(s => s.status === 'Submitted').length,
        drafts: surveys.filter(s => s.status === 'Draft').length
    };
}

function renderFourWsProgress() {
    return `
        <div class="platform-stats">
            ${getFourWsHomeFigures().map(f => `
                <div class="platform-stat">
                    <div class="platform-stat-value">${escapeHtml(f.value)}</div>
                    <div class="platform-stat-label">${escapeHtml(f.label)}</div>
                </div>`).join('')}
        </div>`;
}

function renderSubstanceUseProgress() {
    const c = getSubstanceUseCycle();
    const percent = c.expected ? Math.round((c.submitted / c.expected) * 100) : 0;
    return `
        <div class="platform-cycle">
            <div class="platform-cycle-head">
                <span class="platform-cycle-year">${escapeHtml(c.year)} reporting year</span>
                <span class="platform-cycle-count"><strong>${c.submitted}</strong> of ${c.expected} surveys submitted</span>
            </div>
            <div class="platform-cycle-track" role="progressbar" aria-label="Surveys submitted for ${escapeHtml(c.year)}"
                aria-valuemin="0" aria-valuemax="${c.expected}" aria-valuenow="${c.submitted}">
                <div class="platform-cycle-fill" style="width: ${percent}%"></div>
            </div>
            <div class="platform-cycle-note">
                <i data-lucide="file-pen-line"></i>
                <span>${c.drafts ? `${c.drafts} draft${c.drafts === 1 ? '' : 's'} to complete` : 'No drafts in progress'}</span>
            </div>
        </div>`;
}

function renderPlatformOverviewPage(key, { lead, actions, glanceHTML }) {
    const platform = REPORTING_PLATFORMS[key];
    return `
        <div class="page platform-overview">
            <div class="page-header">
                <div>
                    <h1 class="page-title">${escapeHtml(platform.name)}</h1>
                    <p class="page-lead">${escapeHtml(lead)}</p>
                </div>
            </div>
            <div class="overview-actions">
                ${actions.map(action => `
                <button type="button" class="btn ${action.primary ? 'btn-primary' : 'btn-secondary'}" data-overview-action="${action.id}">
                    <i data-lucide="${action.icon}"></i><span>${escapeHtml(action.label)}</span>
                </button>`).join('')}
            </div>
            <div class="section-card">
                <div class="section-header"><h3>At a Glance</h3></div>
                <div class="section-content">${glanceHTML}</div>
            </div>
        </div>`;
}

function renderFourWsOverviewPage() {
    return renderPlatformOverviewPage('4ws', {
        lead: 'Report the activities your organization implements and follow them in your dashboard.',
        actions: [
            { id: 'add-activity', icon: 'plus', label: 'Add Activity', primary: true },
            { id: 'activities', icon: 'list-checks', label: 'My Activities' },
            { id: 'my-dashboard', icon: 'layout-dashboard', label: 'Go to My Dashboard' }
        ],
        glanceHTML: renderFourWsProgress()
    });
}

function renderSubstanceUseOverviewPage() {
    return renderPlatformOverviewPage('su', {
        lead: 'Fill and submit your organization’s yearly substance use surveys.',
        actions: [
            { id: 'add-survey', icon: 'plus', label: 'Add Survey', primary: true },
            { id: 'surveys', icon: 'files', label: 'My Surveys' },
            { id: 'su-dashboard', icon: 'layout-dashboard', label: 'Go to My Dashboard' }
        ],
        glanceHTML: renderSubstanceUseProgress()
    });
}

function attachPlatformOverviewListeners() {
    document.querySelectorAll('[data-overview-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-overview-action');
            if (action === 'add-activity') {
                activitiesView.mode = 'discovery';
                activitiesView.discoveryQuery = '';
                activityEditor = null;
                navigateTo('activities');
                return;
            }
            if (action === 'add-survey') {
                navigateTo('surveys');
                showToast('Adding a survey is not simulated in this prototype.', 'info');
                return;
            }
            if (action === 'activities') {
                activitiesView.mode = 'list';
                activityEditor = null;
            }
            navigateTo(action);
        });
    });
}
