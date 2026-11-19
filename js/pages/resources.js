// ===== Resources & Help =====
// One Resources & Help page in every area. It shows the topics of the area
// the user is in: General in MHIS, the platform's own topics inside the 4Ws
// or the Substance Use Platform.
const NMHP_RESOURCES_URL = 'https://resources.nmhp-lb.com/';

const RESOURCE_GROUPS = [
    { key: 'general', label: 'General' },
    { key: '4ws', label: '4Ws Platform' },
    { key: 'su', label: 'Substance Use Platform' }
];

const RESOURCE_TOPICS = [
    { key: 'about-mhis', group: 'general', label: 'About MHIS', icon: 'info', description: 'Learn about the Mental Health Information System.' },
    { key: 'whats-new', group: 'general', label: 'What\u2019s New', icon: 'sparkles', description: 'Recent updates and improvements to MHIS.' },
    { key: 'nmhp-resources', group: 'general', label: 'NMHP Resources Page', icon: 'external-link', description: 'Opens the NMHP resources website in a new browser tab.', href: NMHP_RESOURCES_URL },
    { key: 'activity-catalog', group: '4ws', label: 'List of 4Ws Sub-Activities', icon: 'book-open', description: 'Browse sub-activity codes, names, and definitions.' },
    { key: 'about-4ws', group: '4ws', label: 'About the 4Ws Platform', icon: 'info', description: 'Learn about the Who, What, Where, When framework.' },
    { key: 'annual-reports-4ws', group: '4ws', label: 'Annual Reports', icon: 'file-text', description: 'Published 4Ws annual reports.' },
    { key: 'su-sub-activities', group: 'su', label: 'List of Substance Use Sub-Activities', icon: 'book-open', description: 'Browse the substance use sub-activities and their definitions.' },
    { key: 'about-su', group: 'su', label: 'About the Substance Use Platform', icon: 'info', description: 'Learn about substance use data collection.' },
    { key: 'annual-reports-su', group: 'su', label: 'Annual Reports', icon: 'file-text', description: 'Published Substance Use annual reports.' }
];

// The About texts, also shown by Read More on the MHIS Home platform cards.
const RESOURCE_ABOUT_TEXT = {
    'about-mhis': 'The Mental Health Information System (MHIS) is the platform NGOs and administrators use to register activities, facilities, providers, and surveys in support of the national mental health response. It centralizes reporting to support coordination and evidence-based planning.',
    'about-4ws': 'The 4Ws (Who, What, Where, When) framework is used to map mental health and psychosocial support activities across Lebanon. It helps NGOs and the National Mental Health Programme understand who is doing what, where, and when, avoiding duplication and identifying gaps in coverage.'
};

function getAboutText(topicKey) {
    return topicKey === 'about-su' ? mockData.surveysIntro.full : RESOURCE_ABOUT_TEXT[topicKey] || '';
}

function getResourceTopic(key) {
    return RESOURCE_TOPICS.find(t => t.key === key);
}

// MHIS shows the general material; inside a platform, only that platform's
// topics. An organization that is not approved yet only sees the general
// material.
function getVisibleResourceGroups() {
    if (isAdminUser()) {
        return RESOURCE_GROUPS;
    }
    const platform = getCurrentPlatform();
    return RESOURCE_GROUPS.filter(g => g.key === (platform ? platform.key : 'general'));
}

function renderResourcesHelpPage() {
    if (resourcesHelpView.mode === 'landing') {
        return renderResourcesLandingPage();
    }
    return renderResourceTopicPage(resourcesHelpView.mode);
}

function renderResourcesLandingPage() {
    const cardBody = t => `
            <div class="resource-card-icon"><i data-lucide="${t.icon}"></i></div>
            <div class="resource-card-label">${escapeHtml(t.label)}</div>
            <div class="resource-card-description">${escapeHtml(t.description)}</div>`;

    const groupsHTML = getVisibleResourceGroups().map(group => `
        <div class="section-card">
            <div class="section-header">
                <h3>${escapeHtml(group.label)}</h3>
            </div>
            <div class="section-content">
                <div class="resource-card-grid">
                    ${RESOURCE_TOPICS.filter(t => t.group === group.key).map(t => t.href
                        ? `<a class="resource-card" href="${escapeHtml(t.href)}" target="_blank" rel="noopener">${cardBody(t)}</a>`
                        : `<button type="button" class="resource-card" data-topic="${t.key}">${cardBody(t)}</button>`).join('')}
                </div>
            </div>
        </div>`).join('');

    return `
        <div class="page">
            <div class="page-header">
                <div>
                    <h1 class="page-title">Resources & Help</h1>
                    <p class="page-lead">Reference material, definitions, and support information.</p>
                </div>
            </div>
            ${groupsHTML}
        </div>`;
}

function renderResourceTopicPage(topicKey) {
    const topic = getResourceTopic(topicKey);

    let bodyHTML = '';
    switch (topicKey) {
        case 'activity-catalog':
            bodyHTML = renderActivityCatalogResource();
            break;
        case 'glossary':
            bodyHTML = renderGlossaryResource();
            break;
        case 'about-4ws':
            bodyHTML = renderStaticResource('About the 4Ws Platform', getAboutText('about-4ws'));
            break;
        case 'about-mhis':
            bodyHTML = renderStaticResource('About MHIS', getAboutText('about-mhis'));
            break;
        case 'whats-new':
            bodyHTML = renderWhatsNewResource();
            break;
        case 'annual-reports-4ws':
            bodyHTML = renderAnnualReportsResource('4Ws Annual Reports', mockData.resources.annualReports4ws);
            break;
        case 'su-sub-activities':
            bodyHTML = renderSubstanceUseSubActivitiesResource();
            break;
        case 'about-su':
            bodyHTML = renderStaticResource('About the Substance Use Platform', getAboutText('about-su'));
            break;
        case 'annual-reports-su':
            bodyHTML = renderAnnualReportsResource('Substance Use Annual Reports', mockData.resources.annualReportsSu);
            break;
        default:
            bodyHTML = renderStaticResource(topic ? topic.label : 'Resource', 'Content coming soon.');
    }

    return `
        <div class="page">
            ${bodyHTML}
        </div>`;
}

function renderStaticResource(title, paragraph) {
    return `
        <div class="page-header">
            <div>
                <h1 class="page-title">${escapeHtml(title)}</h1>
            </div>
        </div>
        <div class="section-card">
            <div class="section-content">
                <p>${escapeHtml(paragraph)}</p>
            </div>
        </div>`;
}

function renderGlossaryResource() {
    const itemsHTML = mockData.resources.glossary.map(entry => `
        <div class="announcement-item">
            <div class="announcement-title">${escapeHtml(entry.term)}</div>
            <div class="announcement-content">${escapeHtml(entry.definition)}</div>
        </div>`).join('');

    return `
        <div class="page-header">
            <div>
                <h1 class="page-title">Glossary of Terms</h1>
            </div>
        </div>
        <div class="section-card">
            <div class="section-content">
                ${itemsHTML}
            </div>
        </div>`;
}

function renderWhatsNewResource() {
    const itemsHTML = mockData.resources.whatsNew.map(entry => `
        <div class="announcement-item">
            <div class="announcement-title">${escapeHtml(entry.title)}</div>
            <div class="announcement-content">${escapeHtml(entry.description)}</div>
            <div class="announcement-meta">${escapeHtml(entry.date)}</div>
        </div>`).join('');

    return `
        <div class="page-header">
            <div>
                <h1 class="page-title">What\u2019s New</h1>
            </div>
        </div>
        <div class="section-card">
            <div class="section-content">
                ${itemsHTML}
            </div>
        </div>`;
}

function renderSubstanceUseSubActivitiesResource() {
    const cardsHTML = mockData.resources.suSubActivities.map(item => `
        <div class="catalog-card">
            <div>
                <div class="catalog-code">${escapeHtml(item.code)} &middot; ${escapeHtml(item.category)}</div>
                <div class="catalog-name">${escapeHtml(item.name)}</div>
                <div class="catalog-def">${escapeHtml(item.definition)}</div>
            </div>
        </div>`).join('');

    return `
        <div class="page-header">
            <div>
                <h1 class="page-title">List of Substance Use Sub-Activities</h1>
                <p class="page-lead">The substance use sub-activities covered by the surveys, with their definitions.</p>
            </div>
        </div>
        <div class="discovery-results">
            ${cardsHTML}
        </div>`;
}

function renderAnnualReportsResource(title, reports) {
    const rowsHTML = reports.map(report => `
        <div class="event-item">
            <div class="event-details">
                <div class="event-title">${escapeHtml(report.title)}</div>
                <div class="event-time">${report.year}</div>
            </div>
            <a class="btn btn-secondary" href="${report.href}" target="_blank" rel="noopener">
                <i data-lucide="download"></i>
                <span>View Report</span>
            </a>
        </div>`).join('');

    return `
        <div class="page-header">
            <div>
                <h1 class="page-title">${escapeHtml(title)}</h1>
            </div>
        </div>
        <div class="section-card">
            <div class="section-content">
                ${rowsHTML}
            </div>
        </div>`;
}

// ===== Contact Us (top-level page) =====
function renderContactUsPage() {
    const c = mockData.resources.contact;
    const rows = [
        ['Organization', c.organization],
        ['Email', c.email],
        ['Phone', c.phone],
        ['Address', c.address],
        ['Office Hours', c.hours]
    ];

    return `
        <div class="page">
            <div class="page-header">
                <div>
                    <h1 class="page-title">Contact Us</h1>
                    <p class="page-lead">Send a message to the NMHP support team.</p>
                </div>
            </div>
            <div class="contact-layout">
                <div class="section-card">
                    <div class="section-content">
                        <form id="contactUsForm" class="modal-form" novalidate>
                            <div class="form-field">
                                <label for="contact-name">Name <span class="required">*</span></label>
                                <input type="text" id="contact-name" data-required="true" />
                                <div class="field-error" id="contact-name-error"></div>
                            </div>
                            <div class="form-field">
                                <label for="contact-email">Email <span class="required">*</span></label>
                                <input type="email" id="contact-email" data-required="true" />
                                <div class="field-error" id="contact-email-error"></div>
                            </div>
                            <div class="form-field">
                                <label for="contact-subject">Subject <span class="required">*</span></label>
                                <input type="text" id="contact-subject" data-required="true" />
                                <div class="field-error" id="contact-subject-error"></div>
                            </div>
                            <div class="form-field">
                                <label for="contact-message">Message <span class="required">*</span></label>
                                <textarea id="contact-message" rows="6" data-required="true"></textarea>
                                <div class="field-error" id="contact-message-error"></div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-primary" id="contactUsSubmitBtn">
                                    <i data-lucide="send"></i>
                                    <span>Send Message</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="section-card">
                    <div class="section-content">
                        <dl class="detail-list">${rows.map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('')}</dl>
                    </div>
                </div>
            </div>
        </div>`;
}

function attachContactUsListeners() {
    document.getElementById('contactUsSubmitBtn').addEventListener('click', () => {
        const form = document.getElementById('contactUsForm');
        if (!validateModalForm(form)) {
            return;
        }
        form.reset();
        showToast('Your message has been sent to the NMHP support team.', 'success');
    });
}

function filterResourceCatalog(query) {
    const q = query.trim().toLowerCase();
    if (!q) return mockData.activityConfigs;
    return mockData.activityConfigs.filter(cfg => {
        const haystack = `${cfg.code} ${cfg.subCode} ${cfg.activity} ${cfg.subActivity} ${cfg.definition} ${cfg.keywords.join(' ')}`.toLowerCase();
        return haystack.includes(q);
    });
}

function renderActivityCatalogResource() {
    const results = filterResourceCatalog(resourcesHelpView.catalogQuery);
    const cardsHTML = results.length === 0
        ? `<div class="empty-state">No catalog entries match your search.</div>`
        : results.map(cfg => `
            <div class="catalog-card">
                <div>
                    <div class="catalog-code">${escapeHtml(cfg.subCode)} &middot; ${escapeHtml(cfg.activity)}</div>
                    <div class="catalog-name">${escapeHtml(cfg.subActivity)}</div>
                    <div class="catalog-def">${escapeHtml(cfg.definition)}</div>
                </div>
            </div>`).join('');

    return `
        <div class="page-header">
            <div>
                <h1 class="page-title">List of 4Ws Sub-Activities</h1>
                <p class="page-lead">Browse the full list of reportable sub-activities and their definitions.</p>
            </div>
        </div>
        <div class="discovery-search">
            <div class="search-group large">
                <i data-lucide="search"></i>
                <input type="search" id="resourceCatalogSearch" value="${escapeHtml(resourcesHelpView.catalogQuery)}"
                    placeholder="Search by code, activity name, or keyword..." aria-label="Search the activity catalog" autocomplete="off" />
            </div>
        </div>
        <div id="resourceCatalogResults" class="discovery-results">
            ${cardsHTML}
        </div>`;
}

function attachResourcesHelpListeners() {
    if (resourcesHelpView.mode === 'landing') {
        document.querySelectorAll('.resource-card[data-topic]').forEach(card => {
            card.addEventListener('click', () => {
                resourcesHelpView.mode = card.getAttribute('data-topic');
                renderPage('resources-help');
            });
        });
        return;
    }

    if (resourcesHelpView.mode === 'activity-catalog') {
        const input = document.getElementById('resourceCatalogSearch');
        input?.addEventListener('input', () => {
            resourcesHelpView.catalogQuery = input.value;
            const results = filterResourceCatalog(resourcesHelpView.catalogQuery);
            const container = document.getElementById('resourceCatalogResults');
            container.innerHTML = results.length === 0
                ? `<div class="empty-state">No catalog entries match your search.</div>`
                : results.map(cfg => `
                    <div class="catalog-card">
                        <div>
                            <div class="catalog-code">${escapeHtml(cfg.subCode)} &middot; ${escapeHtml(cfg.activity)}</div>
                            <div class="catalog-name">${escapeHtml(cfg.subActivity)}</div>
                            <div class="catalog-def">${escapeHtml(cfg.definition)}</div>
                        </div>
                    </div>`).join('');
            if (window.lucide) window.lucide.createIcons();
        });
    }
}

// Placeholder Page
function renderPlaceholderPage(page) {
    const pageInfo = {
        'organization-profile': { title: 'Organization Profile' },
        'facilities': { title: 'Facilities' },
        'providers': { title: 'Providers' },
        'activities': { title: 'Activities' },
        'surveys': { title: 'Surveys' },
        'my-dashboard': { title: 'My Dashboard' },
        'advanced-dashboard': { title: 'Advanced Dashboard' },
        'events-calendar': { title: 'Events Calendar' },
        'resources-help': { title: 'Resources & Help' }
    };

    const info = pageInfo[page] || { title: 'Page' };

    return `
        <div class="placeholder-page">
            <div class="placeholder-icon">📋</div>
            <h2 class="placeholder-title">${info.title}</h2>
            <p class="placeholder-description">This page will be implemented in future iterations</p>
            <p class="placeholder-description">Current focus: Establishing the shell with home page and notification system</p>
        </div>
    `;
}

