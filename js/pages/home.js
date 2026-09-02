// Home Page
function renderHomePage() {
    const data = mockData;
    const needsAttention = data.needsAttention;
    const announcements = data.announcements;
    const events = data.upcomingEvents;

    let needsAttentionHTML = '';
    if (needsAttention.length === 0) {
        needsAttentionHTML = `
            <div class="needs-attention-empty">
                <div class="needs-attention-empty-icon">✓</div>
                <p>No items requiring your attention</p>
            </div>
        `;
    } else {
        needsAttentionHTML = needsAttention.map(item => `
            <div class="attention-item">
                <div class="attention-item-title">${escapeHtml(item.title)}</div>
                <div class="attention-item-description">${escapeHtml(item.description)}</div>
            </div>
        `).join('');
    }

    const announcementsHTML = announcements.map(item => `
        <div class="announcement-item">
            <div class="announcement-title">${escapeHtml(item.title)}</div>
            <div class="announcement-content">${escapeHtml(item.content)}</div>
            <div class="announcement-meta">${escapeHtml(item.date)}</div>
        </div>
    `).join('');

    const eventsHTML = events.map(item => `
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
                <h1 class="welcome-heading">Welcome, ${escapeHtml(data.organization.name)}</h1>
            </div>

            <div class="action-buttons">
                <button class="btn btn-primary" id="addActivityBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Add Activity</span>
                </button>
                <button class="btn btn-secondary" id="viewDashboardBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M13 17V9"></path><path d="M18 17V5"></path><path d="M8 17v-3"></path></svg>
                    <span>View Dashboard</span>
                </button>
            </div>

            <div class="home-row">
                <div class="section-card">
                    <div class="section-header">
                        <h3>Needs Attention</h3>
                    </div>
                    <div class="section-content">
                        ${needsAttentionHTML}
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

            <div class="home-row">
                <div class="section-card">
                    <div class="section-header">
                        <h3>Recent Announcements</h3>
                    </div>
                    <div class="section-content">
                        ${announcementsHTML}
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h3>Overview</h3>
                    </div>
                    <div class="section-content">
                        <div class="home-stat-grid">
                            <div class="home-stat-tile">
                                <div class="home-stat-value">${data.organization.activities}</div>
                                <div class="home-stat-label">Activities</div>
                            </div>
                            <div class="home-stat-tile">
                                <div class="home-stat-value">${data.organization.facilities}</div>
                                <div class="home-stat-label">Facilities</div>
                            </div>
                            <div class="home-stat-tile">
                                <div class="home-stat-value">${data.organization.providers}</div>
                                <div class="home-stat-label">Providers</div>
                            </div>
                            <div class="home-stat-tile">
                                <div class="home-stat-value">${mockData.surveys.length}</div>
                                <div class="home-stat-label">Surveys</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function attachHomePageListeners() {
    document.getElementById('addActivityBtn')?.addEventListener('click', () => {
        activitiesView.mode = 'discovery';
        activitiesView.discoveryQuery = '';
        navigateTo('activities');
    });
    document.getElementById('viewDashboardBtn')?.addEventListener('click', () => {
        document.querySelector('[data-page="my-dashboard"]').click();
    });
    document.getElementById('upcomingEventsCard')?.addEventListener('click', () => {
        navigateTo('events-calendar');
    });
}

