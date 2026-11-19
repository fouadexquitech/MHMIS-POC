// ===== Navigation policy =====
// MHIS is the umbrella application. An approved NGO works in one of three
// areas, each with its own sidebar inside the same shell:
//   - MHIS: Home, Events Calendar, Organization Profile, the Reporting
//     Platforms entries, Resources & Help and Contact Us;
//   - one area per reporting platform (4Ws, Substance Use): Overview, the
//     platform's work pages, its Dashboard, Resources & Help and Contact Us,
//     with a Back to MHIS button at the bottom.
// A platform is entered from its MHIS Home card or from the Reporting
// Platforms group, always in the same browser tab. The administrator and an
// NGO that is not approved yet have a single sidebar.

const REPORTING_PLATFORMS = {
    '4ws': {
        key: '4ws',
        name: '4Ws Platform',
        shortLabel: '4Ws',
        tagline: 'Who does What, Where and When',
        icon: 'clipboard-list',
        overviewPage: '4ws-overview',
        pages: ['4ws-overview', 'activities', 'my-dashboard'],
        aboutTopic: 'about-4ws'
    },
    'su': {
        key: 'su',
        name: 'Substance Use Platform',
        shortLabel: 'Substance Use',
        tagline: 'Yearly prevention and treatment surveys',
        icon: 'file-text',
        overviewPage: 'su-overview',
        pages: ['su-overview', 'surveys', 'su-dashboard'],
        aboutTopic: 'about-su'
    }
};

const NAV_DEFINITIONS = {
    'home': { label: 'Home', icon: 'house' },
    'events-calendar': { label: 'Events Calendar', icon: 'calendar-days' },
    'organization-profile': { label: 'Organization Profile', icon: 'building-2' },
    '4ws-overview': { label: 'Overview', icon: 'layout-grid' },
    'activities': { label: 'Activities', icon: 'list-checks' },
    'my-dashboard': { label: 'Dashboard', icon: 'layout-dashboard' },
    'su-overview': { label: 'Overview', icon: 'layout-grid' },
    'surveys': { label: 'Surveys', icon: 'files' },
    'su-dashboard': { label: 'Dashboard', icon: 'layout-dashboard' },
    'resources-help': { label: 'Resources & Help', icon: 'circle-help' },
    'contact-us': { label: 'Contact Us', icon: 'mail' },
    'organization-registrations': { label: 'Submitted Profiles', icon: 'file-check' },
    'event-reviews': { label: 'Submitted Events', icon: 'calendar-check' },
    'facility-duplicates': { label: 'Possible Duplicate Facilities', icon: 'git-merge' },
    'pending-custom-values': { label: 'Submitted Custom Values', icon: 'list-plus' },
    'organization-management': { label: 'Organization Management', icon: 'building-2' },
    'user-management': { label: 'User Management', icon: 'users-round' },
    'audience-groups': { label: 'Audience Groups', icon: 'megaphone' },
    'announcement-history': { label: 'Announcement History', icon: 'history' },
    'whats-new-management': { label: "What's New Management", icon: 'newspaper' }
};

// Pages that exist in every area. They stay in the area the user is in.
const SHARED_AREA_PAGES = ['resources-help', 'contact-us'];

// Platform areas exist only for an approved NGO.
function usesPlatformAreas() {
    return isSignedIn() && !isAdminUser() && isCurrentNgoApproved();
}

// The platforms this organization reports to (Substance Use only if eligible).
function getAvailablePlatforms() {
    return Object.keys(REPORTING_PLATFORMS).filter(key => key !== 'su' || isSubstanceUseEligible());
}

function getCurrentPlatform() {
    return usesPlatformAreas() ? REPORTING_PLATFORMS[appState.currentArea] || null : null;
}

// The area ('mhis', '4ws' or 'su') a page opens in.
function getAreaForPage(page) {
    if (!usesPlatformAreas()) {
        return 'mhis';
    }
    const platformKey = getAvailablePlatforms().find(key => REPORTING_PLATFORMS[key].pages.includes(page));
    if (platformKey) {
        return platformKey;
    }
    if (SHARED_AREA_PAGES.includes(page)) {
        // A resource topic opened from elsewhere (a notification, for example)
        // opens in the area it belongs to.
        if (page === 'resources-help' && resourcesHelpView.mode !== 'landing') {
            const topic = getResourceTopic(resourcesHelpView.mode);
            if (topic) {
                return topic.group === 'general' ? 'mhis' : topic.group;
            }
        }
        return appState.currentArea;
    }
    return 'mhis';
}

function getNavigationForArea(area) {
    if (isAdminUser()) {
        return [
            { type: 'item', page: 'home' },
            { type: 'item', page: 'events-calendar' },
            // Everything that waits for an NMHP decision.
            { type: 'section', label: 'To Review' },
            { type: 'item', page: 'organization-registrations', subsection: true },
            { type: 'item', page: 'event-reviews', subsection: true },
            { type: 'item', page: 'facility-duplicates', subsection: true },
            { type: 'item', page: 'pending-custom-values', subsection: true },
            { type: 'section', label: 'Organizations & Users' },
            { type: 'item', page: 'organization-management', subsection: true },
            { type: 'item', page: 'user-management', subsection: true },
            { type: 'section', label: 'Announcements' },
            { type: 'item', page: 'audience-groups', subsection: true },
            { type: 'item', page: 'announcement-history', subsection: true }
        ];
    }

    if (!isCurrentNgoApproved()) {
        // An organization without an approved registration cannot reach the
        // reporting platforms yet.
        return [
            { type: 'item', page: 'home' },
            { type: 'item', page: 'organization-profile' },
            { type: 'item', page: 'resources-help' },
            { type: 'item', page: 'contact-us' }
        ];
    }

    const support = [
        { type: 'section', label: 'Resources & Support' },
        { type: 'item', page: 'resources-help', subsection: true },
        { type: 'item', page: 'contact-us', subsection: true }
    ];

    if (area !== 'mhis' && getAvailablePlatforms().includes(area)) {
        const platform = REPORTING_PLATFORMS[area];
        return [
            { type: 'platform-header', platform: area },
            ...platform.pages.map(page => ({ type: 'item', page })),
            ...support,
            // Rendered at the bottom of the sidebar, shaped like the platform name.
            { type: 'back' }
        ];
    }

    return [
        { type: 'item', page: 'home' },
        { type: 'item', page: 'events-calendar' },
        { type: 'item', page: 'organization-profile' },
        { type: 'section', label: 'Reporting Platforms' },
        ...getAvailablePlatforms().map(key => ({ type: 'platform', platform: key })),
        ...support
    ];
}

function getNavigationForCurrentUser() {
    return getNavigationForArea(appState.currentArea);
}

// Every page the signed-in user may open, in any of their areas.
function getAllowedPages() {
    const areas = usesPlatformAreas() ? ['mhis', ...getAvailablePlatforms()] : ['mhis'];
    const pages = new Set();
    areas.forEach(area => {
        getNavigationForArea(area)
            .filter(entry => entry.type === 'item')
            .forEach(entry => pages.add(entry.page));
    });

    if (isAdminUser()) {
        // Reached from a list page, not from the sidebar.
        ['registration-review', 'event-review', 'facility-duplicate-review', 'organization-detail']
            .forEach(page => pages.add(page));
    }
    return Array.from(pages);
}

function renderNavEntry(entry) {
    if (entry.type === 'section') {
        return `<div class="nav-section-title">${escapeHtml(entry.label)}</div>`;
    }
    if (entry.type === 'back') {
        return `
            <div class="nav-back-holder">
                <a href="#" class="nav-item nav-back" data-page="home">
                    <span class="nav-back-icon"><i data-lucide="arrow-left"></i></span>
                    <span class="nav-label">Back to MHIS</span>
                </a>
            </div>`;
    }
    if (entry.type === 'platform-header') {
        const platform = REPORTING_PLATFORMS[entry.platform];
        return `
            <div class="nav-platform-header">
                <span class="nav-platform-icon"><i data-lucide="${platform.icon}"></i></span>
                <span class="nav-platform-text">
                    <span class="nav-platform-name">${escapeHtml(platform.name)}</span>
                    <span class="nav-platform-tagline">${escapeHtml(platform.tagline)}</span>
                </span>
            </div>`;
    }
    if (entry.type === 'platform') {
        // Opens the platform (its Overview) in the same tab.
        const platform = REPORTING_PLATFORMS[entry.platform];
        return `
            <a href="#" class="nav-item nav-subsection nav-platform-link" data-page="${platform.overviewPage}" title="Open the ${escapeHtml(platform.name)}">
                <i class="nav-icon" data-lucide="${platform.icon}"></i>
                <span class="nav-label">${escapeHtml(platform.shortLabel)}</span>
                <i class="nav-icon nav-enter-icon" data-lucide="arrow-right"></i>
            </a>`;
    }
    const def = NAV_DEFINITIONS[entry.page];
    const activePage = BREADCRUMB_PARENTS[appState.currentPage] || appState.currentPage;
    const classes = `nav-item${entry.subsection ? ' nav-subsection' : ''}${entry.page === activePage ? ' active' : ''}`;
    return `
        <a href="#" class="${classes}" data-page="${escapeHtml(entry.page)}">
            <i class="nav-icon" data-lucide="${escapeHtml(def.icon)}"></i>
            <span class="nav-label">${escapeHtml(entry.label || def.label)}</span>
        </a>`;
}

function renderSidebarNav() {
    const nav = document.getElementById('sidebarNav');
    const platform = getCurrentPlatform();
    nav.setAttribute('aria-label', platform ? platform.name : 'MHIS');
    nav.innerHTML = getNavigationForCurrentUser().map(renderNavEntry).join('');
    nav.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
    refreshLucideIcons();
}

// The top bar names the platform the user is working in: "MHIS / 4Ws Platform".
function updateTopBarArea() {
    const holder = document.getElementById('topBarArea');
    if (!holder) {
        return;
    }
    const platform = getCurrentPlatform();
    holder.hidden = !platform;
    document.getElementById('topBarAreaName').textContent = platform ? platform.name : '';
}

// ===== Breadcrumb =====
// Pages reached from a list page (not from the sidebar) sit under that list
// page in the breadcrumb, and keep its sidebar item highlighted.
const BREADCRUMB_PARENTS = {
    'registration-review': 'organization-registrations',
    'event-review': 'event-reviews',
    'facility-duplicate-review': 'facility-duplicates',
    'organization-detail': 'organization-management'
};

function getNavEntryContext(page) {
    let section = null;
    for (const entry of getNavigationForCurrentUser()) {
        if (entry.type === 'section') {
            section = entry.label;
            continue;
        }
        if (entry.type === 'item' && entry.page === page) {
            return {
                // An item outside a group (Home, Events Calendar, Activities)
                // has no group in its breadcrumb.
                section: entry.subsection ? section : null,
                label: entry.label || NAV_DEFINITIONS[page].label
            };
        }
    }
    return null;
}

// Where the breadcrumb starts: Home, or the platform's Overview inside a platform.
function getBreadcrumbRoot() {
    const platform = getCurrentPlatform();
    return platform
        ? { label: platform.name, page: platform.overviewPage }
        : { label: 'Home', page: 'home' };
}

// The label of the view opened inside a sidebar page (a form, a detail
// view, a resource topic), or '' when the page shows its own list/landing.
function getBreadcrumbDetailLabel(page) {
    if (page === 'activities') {
        if (activitiesView.mode === 'discovery') return 'Add Activity';
        if (activitiesView.mode === 'editor' && activityEditor) {
            if (activityEditor.viewOnly) return 'View Activity';
            return activityEditor.id ? 'Edit Activity' : 'Add Activity';
        }
        return '';
    }
    if (page === 'resources-help') {
        const topic = getResourceTopic(resourcesHelpView.mode);
        return topic ? topic.label : '';
    }
    if (page === 'registration-review') {
        const r = getRegistrationById(adminView.selectedRegistrationId);
        return r ? r.organization : 'Registration Review';
    }
    if (page === 'organization-detail') {
        const org = getManagedOrganizationById(organizationManagementView.selectedId);
        return org ? org.name : 'Organization';
    }
    if (page === 'event-review') {
        const review = mockData.eventReviews.find(r => r.id === reviewsView.selectedEventReviewId);
        return review ? review.eventTitle : 'Event';
    }
    if (page === 'facility-duplicate-review') {
        const duplicate = mockData.facilityDuplicates.find(d => d.id === reviewsView.selectedDuplicateId);
        return duplicate ? duplicate.newFacility.name : 'Facility';
    }
    return '';
}

function getBreadcrumbTrail(page) {
    const root = getBreadcrumbRoot();
    if (page === 'home' || page === root.page) {
        return [];
    }
    const navPage = BREADCRUMB_PARENTS[page] || page;
    const context = getNavEntryContext(navPage);
    if (!context) {
        return [];
    }
    const trail = [root];
    if (context.section) {
        trail.push({ label: context.section });
    }
    trail.push({ label: context.label, page: navPage });
    const detail = getBreadcrumbDetailLabel(page);
    if (detail) {
        trail.push({ label: detail });
    }
    return trail;
}

function renderBreadcrumb(page) {
    const trail = getBreadcrumbTrail(page);
    if (!trail.length) {
        return '';
    }
    const parts = trail.map((crumb, index) => {
        if (index === trail.length - 1) {
            return `<span class="breadcrumb-current" aria-current="page">${escapeHtml(crumb.label)}</span>`;
        }
        if (crumb.page) {
            return `<a href="#" class="breadcrumb-link" data-crumb-page="${escapeHtml(crumb.page)}">${escapeHtml(crumb.label)}</a>`;
        }
        return `<span class="breadcrumb-text">${escapeHtml(crumb.label)}</span>`;
    });
    return `<nav class="breadcrumb" aria-label="Breadcrumb">${parts.join('<i data-lucide="chevron-right"></i>')}</nav>`;
}
