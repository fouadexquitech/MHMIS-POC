// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadDemoState();
    initializeEventListeners();
    updateNotificationBadge();
    startApp();
});

// Event Listeners
function initializeEventListeners() {
    // Login screen (login form, demo scenario switcher, registration wizard)
    initializeLoginScreen();

    // Account menu
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        handleSignOut();
    });
    document.getElementById('changePasswordBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Changing the password is simulated in this POC.', 'info');
    });

    // Calendar shortcut (shown only to approved NGOs, see startApp)
    document.getElementById('calendarShortcutBtn').addEventListener('click', () => {
        navigateTo('events-calendar');
    });

    // Notification Bell
    document.getElementById('notificationBell').addEventListener('click', toggleNotificationModal);

    // Account Menu
    document.getElementById('accountBtn').addEventListener('click', toggleAccountDropdown);
    document.addEventListener('click', handleOutsideClick);

    // Esc closes the topmost dialog, panel or menu (shared-ui.js)
    document.addEventListener('keydown', handleEscapeKey);

    // Notification Modal
    document.getElementById('closeNotifications').addEventListener('click', closeNotificationModal);
    document.getElementById('markAllRead').addEventListener('click', markAllNotificationsAsRead);

    // Modal
    document.getElementById('closeModal').addEventListener('click', closeDetailModal);
    document.getElementById('notificationDetailOverlay').addEventListener('click', handleModalBackdropClick);

    // Reusable Form Modal
    document.getElementById('closeFormModal').addEventListener('click', closeFormModal);
    document.getElementById('formModalOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget && e.currentTarget.dataset.dismissOnBackdrop !== 'false') {
            closeFormModal();
        }
    });

    // Reusable Confirmation Dialog
    document.getElementById('confirmDialogCancelBtn').addEventListener('click', closeConfirmDialog);
    document.getElementById('confirmDialogConfirmBtn').addEventListener('click', () => {
        const handler = confirmDialogHandler;
        closeConfirmDialog();
        if (handler) {
            handler();
        }
    });
    document.getElementById('confirmDialogOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeConfirmDialog();
        }
    });
}

// An activity being added or edited with changes that are not saved yet.
function hasUnsavedActivityChanges() {
    return appState.currentPage === 'activities'
        && activitiesView.mode === 'editor'
        && !!activityEditor && activityEditor.dirty && !activityEditor.viewOnly;
}

// Same question the editor's Cancel button asks, for any other way out of
// the editor (sidebar, breadcrumb, top-bar calendar, notification action).
function confirmDiscardActivityChanges(page) {
    showConfirmDialog({
        title: 'Discard Unsaved Changes?',
        message: 'You have unsaved changes to this activity. Leave and discard them?',
        confirmLabel: 'Discard Changes',
        tone: 'danger',
        onConfirm: () => {
            activityEditor = null;
            activitiesView.mode = 'list';
            if (page === 'resources-help') {
                resourcesHelpView.mode = 'landing';
            }
            setActivePage(page);
            renderPage(page);
            closeNotificationModal();
        }
    });
}

// Navigation Handler
function handleNavigation(e) {
    e.preventDefault();
    const page = e.currentTarget.getAttribute('data-page');

    if (hasUnsavedActivityChanges()) {
        // The Activities link itself also leaves the editor, so it asks too.
        confirmDiscardActivityChanges(page);
        return;
    }

    const proceedToPage = () => {
        if (page === 'activities') {
            // A direct sidebar click always returns to the Activities list.
            activitiesView.mode = 'list';
            activityEditor = null;
        }
        if (page === 'resources-help') {
            // A direct sidebar (or breadcrumb) click always returns to the landing.
            resourcesHelpView.mode = 'landing';
        }

        setActivePage(page);
        renderPage(page);
        closeNotificationModal();
    };

    if (appState.profileDirty && page !== appState.currentPage) {
        showConfirmDialog({
            title: 'Discard Unsaved Changes?',
            message: 'You have unsaved changes. Leave this page and discard them?',
            confirmLabel: 'Discard Changes',
            tone: 'danger',
            onConfirm: () => {
                appState.profileDirty = false;
                proceedToPage();
            }
        });
        return;
    }

    proceedToPage();
}

// Activate a sidebar item and update state (also used for internal links).
// Opening a page of another area (a platform, or MHIS) switches the sidebar
// and the top bar to that area. A page opened from a list page keeps that
// list's sidebar item highlighted.
function setActivePage(page) {
    appState.currentPage = page;
    if (page !== 'organization-profile') {
        // Leaving the profile ends an Update and Resubmit that was not resubmitted.
        registrationEditView.updating = false;
    }
    const area = getAreaForPage(page);
    if (area !== appState.currentArea) {
        appState.currentArea = area;
        renderSidebarNav();
        updateTopBarArea();
    }
    const navPage = BREADCRUMB_PARENTS[page] || page;
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === navPage);
    });
}

// Navigate programmatically (used by in-page links)
function navigateTo(page) {
    if (hasUnsavedActivityChanges()) {
        confirmDiscardActivityChanges(page);
        return;
    }

    const proceedToPage = () => {
        setActivePage(page);
        renderPage(page);
        closeNotificationModal();
    };

    if (appState.profileDirty && page !== appState.currentPage) {
        showConfirmDialog({
            title: 'Discard Unsaved Changes?',
            message: 'You have unsaved changes. Leave this page and discard them?',
            confirmLabel: 'Discard Changes',
            tone: 'danger',
            onConfirm: () => {
                appState.profileDirty = false;
                proceedToPage();
            }
        });
        return;
    }

    proceedToPage();
}

// Page Rendering
function renderPage(page) {
    if (!getAllowedPages().includes(page)) {
        page = 'home';
        setActivePage(page);
    }
    renderPageBody(page);
    insertBreadcrumb(page);
}

// Every page except Home starts with a breadcrumb that names its sidebar
// group (for an NGO, the platform it belongs to).
function insertBreadcrumb(page) {
    const html = renderBreadcrumb(page);
    if (!html) {
        return;
    }
    const container = document.getElementById('page-container');
    container.insertAdjacentHTML('afterbegin', html);
    container.querySelectorAll('.breadcrumb-link').forEach(link => {
        // Same behaviour as a sidebar click, including the unsaved-changes check.
        link.setAttribute('data-page', link.getAttribute('data-crumb-page'));
        link.addEventListener('click', handleNavigation);
    });
    refreshLucideIcons();
}

function renderPageBody(page) {
    const container = document.getElementById('page-container');

    if (!getAllowedPages().includes(page)) {
        page = 'home';
        setActivePage(page);
    }

    if (page === 'home') {
        if (isAdminUser()) {
            container.innerHTML = renderAdminHomePage();
            attachAdminHomeListeners();
            refreshLucideIcons();
            return;
        }
        if (!isCurrentNgoApproved()) {
            container.innerHTML = renderRegistrationStatusHomePage();
            attachRegistrationStatusHomeListeners();
            refreshLucideIcons();
            return;
        }
    }

    if (page === 'organization-profile' && getCurrentRegistration()) {
        container.innerHTML = renderRegistrationProfilePage();
        attachRegistrationProfileListeners();
        refreshLucideIcons();
        return;
    }

    switch(page) {
        case 'home':
            container.innerHTML = renderHomePage();
            attachHomePageListeners();
            break;
        case 'organization-profile':
            container.innerHTML = renderOrganizationProfilePage();
            attachOrganizationProfileListeners();
            break;
        case '4ws-overview':
            container.innerHTML = renderFourWsOverviewPage();
            attachPlatformOverviewListeners();
            break;
        case 'su-overview':
            container.innerHTML = renderSubstanceUseOverviewPage();
            attachPlatformOverviewListeners();
            break;
        case 'activities':
            container.innerHTML = renderActivitiesPage();
            attachActivitiesListeners();
            break;
        case 'my-dashboard':
            container.innerHTML = renderMyDashboardPage();
            attachMyDashboardListeners();
            break;
        case 'su-dashboard':
            container.innerHTML = renderSubstanceUseDashboardPage();
            attachMyDashboardListeners();
            break;
        case 'events-calendar':
            container.innerHTML = renderEventsCalendarPage();
            attachEventsCalendarListeners();
            break;
        case 'resources-help':
            container.innerHTML = renderResourcesHelpPage();
            attachResourcesHelpListeners();
            break;
        case 'contact-us':
            container.innerHTML = renderContactUsPage();
            attachContactUsListeners();
            break;
        case 'surveys':
            container.innerHTML = renderSurveysPage();
            attachSurveysListeners();
            break;
        case 'organization-registrations':
            container.innerHTML = renderOrganizationRegistrationsPage();
            attachOrganizationRegistrationsListeners();
            break;
        case 'registration-review':
            container.innerHTML = renderRegistrationReviewPage();
            attachRegistrationReviewListeners();
            break;
        case 'event-reviews':
            container.innerHTML = renderEventReviewsPage();
            attachEventReviewsListeners();
            break;
        case 'event-review':
            container.innerHTML = renderEventReviewDetailPage();
            attachEventReviewDetailListeners();
            break;
        case 'facility-duplicates':
            container.innerHTML = renderFacilityDuplicatesPage();
            attachFacilityDuplicatesListeners();
            break;
        case 'facility-duplicate-review':
            container.innerHTML = renderFacilityDuplicateReviewPage();
            attachFacilityDuplicateReviewListeners();
            break;
        case 'pending-custom-values':
            container.innerHTML = renderPendingCustomValuesPage();
            attachPendingCustomValuesListeners();
            break;
        case 'organization-management':
            container.innerHTML = renderOrganizationManagementPage();
            attachOrganizationManagementListeners();
            break;
        case 'organization-detail':
            container.innerHTML = renderOrganizationDetailPage();
            attachOrganizationDetailListeners();
            break;
        case 'user-management':
            container.innerHTML = renderUserManagementPage();
            attachUserManagementListeners();
            break;
        case 'audience-groups':
            container.innerHTML = renderAudienceGroupsPage();
            attachAudienceGroupsListeners();
            break;
        case 'announcement-history':
            container.innerHTML = renderAnnouncementHistoryPage();
            attachAnnouncementHistoryListeners();
            break;
        case 'whats-new-management':
            container.innerHTML = renderWhatsNewManagementPage();
            attachWhatsNewManagementListeners();
            break;
        default:
            container.innerHTML = renderHomePage();
    }

    refreshLucideIcons();
}

function refreshLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Demo login screen =====
function startApp() {
    const loginScreen = document.getElementById('loginScreen');
    const topBar = document.getElementById('topBar');
    const appShell = document.getElementById('appShell');

    if (!isSignedIn()) {
        loginScreen.hidden = false;
        topBar.hidden = true;
        appShell.hidden = true;
        document.getElementById('loginForm').reset();
        clearLoginErrors();
        refreshLucideIcons();
        return;
    }

    loginScreen.hidden = true;
    topBar.hidden = false;
    appShell.hidden = false;
    // Every sign-in opens on MHIS Home, the same page each time.
    appState.currentArea = 'mhis';
    appState.currentPage = 'home';
    updateTopBarIdentity();
    updateTopBarArea();
    // The calendar icon opens the Events Calendar, so it shows only to users
    // who have one (not the administrator, not an NGO awaiting approval).
    document.getElementById('calendarShortcutBtn').hidden = !getAllowedPages().includes('events-calendar');
    updateNotificationBadge();
    renderSidebarNav();
    navigateTo('home');
}

// ===== Public Explore screen (guest access, no sign-in) =====
function showPublicExploreScreen() {
    document.getElementById('loginScreen').hidden = true;
    document.getElementById('publicScreen').hidden = false;
    renderPublicActivitiesPage();
}

function showLoginScreenFromPublic() {
    document.getElementById('publicScreen').hidden = true;
    startApp();
}

function signInAs(accountId) {
    if (!demoSignIn(accountId)) {
        return;
    }
    appState.profileDirty = false;
    activitiesView.mode = 'list';
    activityEditor = null;
    adminView.selectedRegistrationId = null;
    organizationProfileView.tab = 'details';
    startApp();
}

function handleSignOut() {
    const proceedToSignOut = () => {
        demoSignOut();
        closeNotificationModal();
        document.getElementById('accountDropdown').style.display = 'none';
        startApp();
    };

    // Same rule as every other way out of the activity editor (UX-BRIEF).
    if (hasUnsavedActivityChanges()) {
        document.getElementById('accountDropdown').style.display = 'none';
        showConfirmDialog({
            title: 'Discard Unsaved Changes?',
            message: 'You have unsaved changes to this activity. Log out and discard them?',
            confirmLabel: 'Log Out',
            tone: 'danger',
            onConfirm: () => {
                activityEditor = null;
                activitiesView.mode = 'list';
                proceedToSignOut();
            }
        });
        return;
    }

    if (appState.profileDirty) {
        showConfirmDialog({
            title: 'Discard Unsaved Changes?',
            message: 'You have unsaved changes. Log out and discard them?',
            confirmLabel: 'Log Out',
            tone: 'danger',
            onConfirm: () => {
                appState.profileDirty = false;
                proceedToSignOut();
            }
        });
        return;
    }

    proceedToSignOut();
}

function updateTopBarIdentity() {
    const account = getCurrentAccount();
    if (!account) {
        return;
    }
    const label = account.role === 'ngo' ? getCurrentOrganizationName() : account.organization;
    document.getElementById('topBarOrgName').textContent = label;
}

