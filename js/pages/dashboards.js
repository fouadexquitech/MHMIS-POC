// ===== Dashboards =====
// Each platform's Advanced Dashboard is an external Power BI report. NMHP has
// not shared the Substance Use report link yet, so the POC cannot open it.
const ADVANCED_DASHBOARD_URLS = {
    '4ws': 'https://mhmiswebsite-dev.azurewebsites.net/#/extrapages/advanced-dashboard',
    'su': ''
};

// Sample 4Ws dashboard content, represented as tabs like the existing dashboard.
// Reports are shown as-is (not redesigned) — this is a representative POC snapshot.
const dashboardTabs = [
    {
        id: 'activities',
        label: 'Activities',
        icon: 'activity',
        kpis: [
            { label: 'Total Activities', value: '128' },
            { label: 'Published', value: '96' },
            { label: 'Ongoing', value: '24' },
            { label: 'Beneficiaries Reached', value: '18,540' }
        ],
        table: {
            title: 'Activities by Sub-Activity',
            columns: ['Sub-Activity', 'Records', 'Beneficiaries'],
            rows: [
                ['Individual counselling sessions', '42', '6,120'],
                ['Community awareness sessions', '31', '8,340'],
                ['Psychological first aid', '28', '2,760'],
                ['Training of health workers', '17', '540'],
                ['MHPSS coordination meetings', '10', '780']
            ]
        }
    },
    {
        id: 'beneficiaries',
        label: 'Beneficiaries',
        icon: 'users',
        kpis: [
            { label: 'Total Beneficiaries', value: '18,540' },
            { label: 'Female', value: '10,210' },
            { label: 'Male', value: '8,330' },
            { label: 'Children (<18)', value: '5,640' }
        ],
        table: {
            title: 'Beneficiaries by Governorate',
            columns: ['Governorate', 'Beneficiaries', 'Activities'],
            rows: [
                ['Beirut', '5,320', '38'],
                ['Mount Lebanon', '4,880', '31'],
                ['North', '3,410', '24'],
                ['Bekaa', '2,760', '19'],
                ['South', '2,170', '16']
            ]
        }
    },
    {
        id: 'facilities',
        label: 'Facilities',
        icon: 'building-2',
        kpis: [
            { label: 'Facilities Supported', value: '34' },
            { label: 'Primary Health Centres', value: '19' },
            { label: 'Community Centres', value: '11' },
            { label: 'Mobile Units', value: '4' }
        ],
        table: {
            title: 'Activities by Facility Type',
            columns: ['Facility Type', 'Facilities', 'Activities'],
            rows: [
                ['Primary Health Centre', '19', '64'],
                ['Community Centre', '11', '38'],
                ['Mobile Unit', '4', '26']
            ]
        }
    },
    {
        id: 'funding',
        label: 'Funding',
        icon: 'wallet',
        kpis: [
            { label: 'Total Budget', value: '$1.42M' },
            { label: 'Donors', value: '7' },
            { label: 'Activities Funded', value: '96' },
            { label: 'Avg. per Activity', value: '$14.8K' }
        ],
        table: {
            title: 'Funding by Donor',
            columns: ['Donor', 'Budget', 'Activities'],
            rows: [
                ['WHO', '$420,000', '28'],
                ['UNICEF', '$360,000', '22'],
                ['EU', '$280,000', '18'],
                ['GIZ', '$190,000', '14'],
                ['Others', '$170,000', '14']
            ]
        }
    }
];

// Placeholder Substance Use dashboard built from the survey list. It only
// demonstrates where the dashboard lives; its real content is not designed yet.
const substanceUseDashboardTabs = [
    {
        id: 'su-surveys',
        label: 'Surveys',
        icon: 'file-text',
        kpis: [
            { label: 'Total Surveys', value: '7' },
            { label: 'Submitted', value: '5' },
            { label: 'Drafts', value: '2' },
            { label: 'Reporting Years', value: '3' }
        ],
        table: {
            title: 'Surveys by Type',
            columns: ['Survey Type', 'Surveys', 'Submitted', 'Drafts'],
            rows: [
                ['Prevention', '3', '2', '1'],
                ['Treatment', '2', '1', '1'],
                ['Harm Reduction', '2', '2', '0']
            ]
        }
    },
    {
        id: 'su-years',
        label: 'Reporting Years',
        icon: 'calendar-days',
        kpis: [
            { label: 'Current Reporting Year', value: '2025' },
            { label: 'Surveys in 2025', value: '3' },
            { label: 'Submitted in 2025', value: '1' },
            { label: 'Last Submission', value: '28 Jan 2025' }
        ],
        table: {
            title: 'Surveys by Reporting Year',
            columns: ['Reporting Year', 'Surveys', 'Submitted', 'Drafts'],
            rows: [
                ['2025', '3', '1', '2'],
                ['2024', '3', '3', '0'],
                ['2023', '1', '1', '0']
            ]
        }
    }
];

function renderMyDashboardPage() {
    return renderDashboardTabsPage({
        title: '4Ws Dashboard',
        tabs: dashboardTabs,
        lead: 'A snapshot of your logged 4Ws data across activities, beneficiaries, facilities, and funding.',
        note: 'These reports summarise the data your organization has published. Move between tabs to explore each area.'
    });
}

function renderSubstanceUseDashboardPage() {
    return renderDashboardTabsPage({
        title: 'Substance Use Dashboard',
        tabs: substanceUseDashboardTabs,
        lead: 'A snapshot of your Substance Use surveys by type and reporting year.',
        note: 'Sample content only. The Substance Use dashboard reports are not final in this prototype.'
    });
}

function renderDashboardTabsPage({ title, tabs, lead, note }) {
    const tabsHTML = tabs.map((tab, index) => `
        <button class="tab ${index === 0 ? 'active' : ''}" data-dashboard-tab="${tab.id}">
            <i data-lucide="${tab.icon}"></i>
            <span>${tab.label}</span>
        </button>
    `).join('');

    const panelsHTML = tabs.map((tab, index) => `
        <div class="tab-panel ${index === 0 ? 'active' : ''}" data-dashboard-panel="${tab.id}">
            <div class="dashboard-kpis">
                ${tab.kpis.map(kpi => `
                    <div class="dashboard-kpi">
                        <div class="dashboard-kpi-value">${kpi.value}</div>
                        <div class="dashboard-kpi-label">${escapeHtml(kpi.label)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="dashboard-report">
                <h3 class="dashboard-report-title">${escapeHtml(tab.table.title)}</h3>
                <table class="data-table">
                    <thead>
                        <tr>${tab.table.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${tab.table.rows.map(row => `
                            <tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `).join('');

    return `
        <div class="page">
            <div class="page-header">
                <div>
                    <h1 class="page-title">${escapeHtml(title)}</h1>
                    <p class="page-lead">${escapeHtml(lead)}</p>
                </div>
            </div>
            <div class="dashboard-note">
                <i data-lucide="info"></i>
                <span>${escapeHtml(note)}</span>
            </div>
            <div class="tabs">${tabsHTML}</div>
            ${panelsHTML}
        </div>
    `;
}

function attachMyDashboardListeners() {
    document.querySelectorAll('[data-dashboard-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-dashboard-tab');
            document.querySelectorAll('[data-dashboard-tab]').forEach(t => t.classList.toggle('active', t === btn));
            document.querySelectorAll('[data-dashboard-panel]').forEach(p => {
                p.classList.toggle('active', p.getAttribute('data-dashboard-panel') === id);
            });
        });
    });
}

// ===== Advanced Dashboard =====
// The Advanced Dashboard item of each platform opens this page first. It says
// that the Power BI report opens in a new browser tab, so the user does not
// leave MHIS without notice, and offers the button that opens it.
function renderAdvancedDashboardPage(platformKey) {
    const url = ADVANCED_DASHBOARD_URLS[platformKey];
    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Advanced Dashboard</h1>
            </div>
            <div class="external-dashboard-card">
                <div class="external-dashboard-icon">
                    <i data-lucide="external-link"></i>
                </div>
                <h2 class="external-dashboard-title">Opens in a new browser tab</h2>
                <p class="external-dashboard-text">
                    The Advanced Dashboard is powered by an external Power BI report. Selecting the button below
                    opens it in a separate browser tab so you keep this workspace open.
                </p>
                ${url ? `<p class="external-dashboard-url">${escapeHtml(url)}</p>` : ''}
                <button type="button" class="btn btn-primary" id="launchAdvancedDashboardBtn">
                    <i data-lucide="external-link"></i><span>Open Advanced Dashboard</span>
                </button>
            </div>
        </div>`;
}

function attachAdvancedDashboardListeners(platformKey) {
    document.getElementById('launchAdvancedDashboardBtn')?.addEventListener('click', () => {
        const url = ADVANCED_DASHBOARD_URLS[platformKey];
        if (!url) {
            showToast('The Substance Use Power BI report is not linked in this prototype yet.', 'info');
            return;
        }
        window.open(url, '_blank', 'noopener');
    });
}

