// ===== MHIS Home (approved NGO) =====
// The same page every time an NGO signs in: a welcome line, one card per
// reporting platform saying what the platform is for, then the shared
// announcements and events. The platform work itself (figures, Add Activity,
// Add Survey) is inside each platform, on its Overview page (platforms.js).

const PLATFORM_CARD_POINTS = {
    '4ws': [
        'Report the activities your organization implements',
        'Link them to your facilities and locations',
        'Follow your figures in the 4Ws Dashboard'
    ],
    'su': [
        'Fill your yearly substance use surveys',
        'Save drafts and submit them when complete',
        'See what is submitted and what is still due'
    ]
};

function renderPlatformCard(key) {
    const platform = REPORTING_PLATFORMS[key];
    return `
        <section class="platform-card" aria-labelledby="platform-title-${key}">
            <div class="platform-card-head">
                <div class="platform-card-icon"><i data-lucide="${platform.icon}"></i></div>
                <div class="platform-card-heading">
                    <h2 class="platform-card-title" id="platform-title-${key}">${escapeHtml(platform.name)}</h2>
                    <p class="platform-card-tagline">${escapeHtml(platform.tagline)}</p>
                </div>
            </div>
            <ul class="platform-card-points">
                ${PLATFORM_CARD_POINTS[key].map(point => `<li>${escapeHtml(point)}</li>`).join('')}
            </ul>
            <div class="platform-card-footer">
                <button type="button" class="btn-link" data-platform-about="${key}">Read More</button>
                <button type="button" class="btn btn-primary" data-platform-open="${key}">
                    <span>Open ${escapeHtml(platform.name)}</span><i data-lucide="arrow-right"></i>
                </button>
            </div>
        </section>`;
}

function renderHomePage() {
    const platforms = getAvailablePlatforms();

    const announcementsHTML = mockData.announcements.map(item => `
        <div class="announcement-item">
            <div class="announcement-title">${escapeHtml(item.title)}</div>
            <div class="announcement-content">${escapeHtml(item.content)}</div>
            <div class="announcement-meta">${escapeHtml(item.date)}</div>
        </div>
    `).join('');

    const eventsHTML = mockData.upcomingEvents.map(item => `
        <div class="event-item">
            <div class="event-date">
                <div class="event-date-day">${item.day}</div>
                <div class="event-date-month">${item.month}</div>
            </div>
            <div class="event-details">
                <div class="event-title">${escapeHtml(item.title)}</div>
                <div class="event-time">${escapeHtml(item.time)}</div>
            </div>
        </div>
    `).join('');

    return `
        <div class="home-page">
            <div class="welcome-section">
                <h1 class="welcome-heading">Welcome, ${escapeHtml(getCurrentOrganizationName())}</h1>
            </div>

            <h2 class="home-section-title">Reporting Platforms</h2>
            <div class="home-platforms${platforms.length === 1 ? ' single' : ''}">
                ${platforms.map(renderPlatformCard).join('')}
            </div>

            <div class="home-row">
                <div class="section-card">
                    <div class="section-header">
                        <h3>Recent Announcements</h3>
                    </div>
                    <div class="section-content">
                        ${announcementsHTML}
                    </div>
                </div>

                <button type="button" class="section-card home-clickable-card" id="upcomingEventsCard">
                    <div class="section-header">
                        <h3>Upcoming Events</h3>
                        <span class="section-header-link">View calendar <i data-lucide="chevron-right"></i></span>
                    </div>
                    <div class="section-content">
                        ${eventsHTML}
                    </div>
                </button>
            </div>
        </div>
    `;
}

function attachHomePageListeners() {
    document.querySelectorAll('[data-platform-open]').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo(REPORTING_PLATFORMS[btn.getAttribute('data-platform-open')].overviewPage);
        });
    });
    document.querySelectorAll('[data-platform-about]').forEach(btn => {
        btn.addEventListener('click', () => openPlatformAboutDialog(btn.getAttribute('data-platform-about')));
    });
    document.getElementById('upcomingEventsCard')?.addEventListener('click', () => {
        navigateTo('events-calendar');
    });
}

// Read More: the platform's About text (the same text as its Resources & Help
// topic), shown over Home so the user can decide before opening the platform.
function openPlatformAboutDialog(key) {
    const platform = REPORTING_PLATFORMS[key];
    openFormModal(`About the ${platform.name}`,
        `<p class="about-dialog-text">${escapeHtml(getAboutText(platform.aboutTopic))}</p>`,
        `<button type="button" class="modal-btn" id="platformAboutCloseBtn">Close</button>
         <button type="button" class="modal-btn primary" id="platformAboutOpenBtn">Open ${escapeHtml(platform.name)}</button>`);
    document.getElementById('platformAboutCloseBtn').addEventListener('click', closeFormModal);
    document.getElementById('platformAboutOpenBtn').addEventListener('click', () => {
        closeFormModal();
        navigateTo(platform.overviewPage);
    });
}
