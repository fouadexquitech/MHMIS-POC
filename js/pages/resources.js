// ===== Resources & Help =====
const RESOURCE_TOPICS = [
    { key: 'activity-catalog', label: 'Activity Catalog', icon: 'book-open', description: 'Browse activity codes, names, and definitions.' },
    { key: 'glossary', label: 'Glossary of Terms', icon: 'book-text', description: 'Definitions of common MHIS terms and acronyms.' },
    { key: 'about-4ws', label: 'About 4Ws', icon: 'info', description: 'Learn about the Who, What, Where, When framework.' },
    { key: 'about-mhis', label: 'About MHIS', icon: 'info', description: 'Learn about the Mental Health Information System.' },
    { key: 'about-nmhp', label: 'About NMHP', icon: 'info', description: 'Learn about the National Mental Health Programme.' },
    { key: 'whats-new', label: 'What\u2019s New', icon: 'sparkles', description: 'Recent updates and improvements to MHIS.' },
    { key: 'annual-reports', label: 'Annual Reports', icon: 'file-text', description: 'Published annual reports.' }
];

function getResourceTopic(key) {
    return RESOURCE_TOPICS.find(t => t.key === key);
}

function renderResourcesHelpPage() {
    if (resourcesHelpView.mode === 'landing') {
        return renderResourcesLandingPage();
    }
    return renderResourceTopicPage(resourcesHelpView.mode);
}

function renderResourcesLandingPage() {
    const cardsHTML = RESOURCE_TOPICS.map(t => `
        <button type="button" class="resource-card" data-topic="${t.key}">
            <div class="resource-card-icon"><i data-lucide="${t.icon}"></i></div>
            <div class="resource-card-label">${escapeHtml(t.label)}</div>
            <div class="resource-card-description">${escapeHtml(t.description)}</div>
        </button>`).join('');

    return `
        <div class="page">
            <div class="page-header">
                <div>
                    <h1 class="page-title">Resources & Help</h1>
                    <p class="page-lead">Reference material, definitions, and support information.</p>
                </div>
            </div>
            <div class="resource-card-grid">
                ${cardsHTML}
            </div>
        </div>`;
}

function renderResourceTopicPage(topicKey) {
    const topic = getResourceTopic(topicKey);
    const backLinkHTML = `<button type="button" class="link-back" id="resourcesBackBtn"><i data-lucide="arrow-left"></i> Back to Resources & Help</button>`;

    let bodyHTML = '';
    switch (topicKey) {
        case 'activity-catalog':
            bodyHTML = renderActivityCatalogResource();
            break;
        case 'glossary':
            bodyHTML = renderGlossaryResource();
            break;
        case 'about-4ws':
            bodyHTML = renderStaticResource('About 4Ws', 'The 4Ws (Who, What, Where, When) framework is used to map mental health and psychosocial support activities across Lebanon. It helps NGOs and the National Mental Health Programme understand who is doing what, where, and when, avoiding duplication and identifying gaps in coverage.');
            break;
        case 'about-mhis':
            bodyHTML = renderStaticResource('About MHIS', 'The Mental Health Information System (MHIS) is the platform NGOs and administrators use to register activities, facilities, providers, and surveys in support of the national mental health response. It centralizes reporting to support coordination and evidence-based planning.');
            break;
        case 'about-nmhp':
            bodyHTML = renderStaticResource('About NMHP', 'The National Mental Health Programme (NMHP) is the government body within the Ministry of Public Health responsible for overseeing mental health policy, coordination, and services in Lebanon.');
            break;
        case 'whats-new':
            bodyHTML = renderWhatsNewResource();
            break;
        case 'annual-reports':
            bodyHTML = renderAnnualReportsResource();
            break;
        default:
            bodyHTML = renderStaticResource(topic ? topic.label : 'Resource', 'Content coming soon.');
    }

    return `
        <div class="page">
            ${backLinkHTML}
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

function renderAnnualReportsResource() {
    const rowsHTML = mockData.resources.annualReports.map(report => `
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
                <h1 class="page-title">Annual Reports</h1>
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
                <h1 class="page-title">Activity Catalog</h1>
                <p class="page-lead">Browse the full list of reportable activities and their definitions.</p>
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
        document.querySelectorAll('.resource-card').forEach(card => {
            card.addEventListener('click', () => {
                resourcesHelpView.mode = card.getAttribute('data-topic');
                renderPage('resources-help');
            });
        });
        return;
    }

    document.getElementById('resourcesBackBtn')?.addEventListener('click', () => {
        resourcesHelpView.mode = 'landing';
        renderPage('resources-help');
    });

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

