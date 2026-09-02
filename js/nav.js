// ===== Navigation policy =====
const NAV_DEFINITIONS = {
    'home': { label: 'Home', icon: 'house' },
    'organization-profile': { label: 'Organization Profile', icon: 'building-2' },
    'facilities': { label: 'Facilities', icon: 'building' },
    'providers': { label: 'Providers', icon: 'users' },
    'activities': { label: 'Activities', icon: 'clipboard-list' },
    'surveys': { label: 'Surveys', icon: 'file-text' },
    'my-dashboard': { label: 'My Dashboard', icon: 'layout-dashboard' },
    'advanced-dashboard': { label: 'Advanced Dashboard', icon: 'bar-chart-3' },
    'events-calendar': { label: 'Events Calendar', icon: 'calendar-days' },
    'resources-help': { label: 'Resources & Help', icon: 'circle-help' },
    'organization-registrations': { label: 'Organization Registrations', icon: 'file-check' },
    'event-reviews': { label: 'Event Reviews', icon: 'calendar-check' },
    'facility-duplicates': { label: 'Potential Duplicate Facilities', icon: 'git-merge' },
    'pending-custom-values': { label: 'Pending Custom Values', icon: 'list-plus' },
    'user-management': { label: 'User Management', icon: 'users-round' },
    'audience-groups': { label: 'Audience Groups', icon: 'megaphone' },
    'announcement-history': { label: 'Announcement History', icon: 'history' },
    'whats-new-management': { label: "What's New Management", icon: 'newspaper' },
    'contact-us': { label: 'Contact Us', icon: 'mail' }
};

function getNavigationForCurrentUser() {
    if (isAdminUser()) {
        return [
            { type: 'item', page: 'home' },
            { type: 'section', label: 'Organization & Users' },
            { type: 'item', page: 'organization-registrations', subsection: true },
            { type: 'item', page: 'user-management', subsection: true },
            { type: 'section', label: 'Reviews' },
            { type: 'item', page: 'event-reviews', subsection: true },
            { type: 'item', page: 'facility-duplicates', subsection: true },
            { type: 'item', page: 'pending-custom-values', subsection: true },
            { type: 'section', label: 'Announcements' },
            { type: 'item', page: 'audience-groups', subsection: true },
            { type: 'item', page: 'announcement-history', subsection: true },
            { type: 'section', label: 'Content & Resources' },
            { type: 'item', page: 'whats-new-management', subsection: true },
            { type: 'item', page: 'resources-help', subsection: true }
        ];
    }

    if (!isCurrentNgoApproved()) {
        // An organization without an approved registration cannot reach the
        // operational modules yet.
        return [
            { type: 'item', page: 'home' },
            { type: 'item', page: 'organization-profile' },
            { type: 'item', page: 'resources-help' },
            { type: 'item', page: 'contact-us' }
        ];
    }

    return [
        { type: 'item', page: 'home' },
        { type: 'item', page: 'organization-profile' },
        { type: 'section', label: 'Data Entry' },
        { type: 'item', page: 'facilities', subsection: true },
        { type: 'item', page: 'providers', subsection: true },
        { type: 'item', page: 'activities', subsection: true },
        { type: 'section', label: 'Reporting' },
        { type: 'item', page: 'surveys', subsection: true },
        { type: 'item', page: 'my-dashboard', subsection: true },
        { type: 'item', page: 'advanced-dashboard', subsection: true },
        { type: 'section', label: 'Resources & Support' },
        { type: 'item', page: 'events-calendar', subsection: true },
        { type: 'item', page: 'resources-help', subsection: true },
        { type: 'item', page: 'contact-us', subsection: true }
    ];
}

function getAllowedPages() {
    const pages = getNavigationForCurrentUser()
        .filter(entry => entry.type === 'item')
        .map(entry => entry.page);

    if (isAdminUser()) {
        // Reached from a list page, not from the sidebar.
        pages.push('registration-review', 'event-review', 'facility-duplicate-review');
    }
    return pages;
}

function renderSidebarNav() {
    const nav = document.getElementById('sidebarNav');
    nav.innerHTML = getNavigationForCurrentUser().map(entry => {
        if (entry.type === 'section') {
            return `<div class="nav-section-title">${escapeHtml(entry.label)}</div>`;
        }
        const def = NAV_DEFINITIONS[entry.page];
        const classes = `nav-item${entry.subsection ? ' nav-subsection' : ''}${entry.page === appState.currentPage ? ' active' : ''}`;
        return `
            <a href="#" class="${classes}" data-page="${escapeHtml(entry.page)}">
                <i class="nav-icon" data-lucide="${escapeHtml(def.icon)}"></i>
                <span class="nav-label">${escapeHtml(def.label)}</span>
            </a>`;
    }).join('');

    nav.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
    refreshLucideIcons();
}

