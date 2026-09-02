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

    // Calendar shortcut
    document.getElementById('calendarShortcutBtn').addEventListener('click', () => {
        navigateTo(isAdminUser() ? 'event-reviews' : 'events-calendar');
    });

    // Notification Bell
    document.getElementById('notificationBell').addEventListener('click', toggleNotificationModal);

    // Account Menu
    document.getElementById('accountBtn').addEventListener('click', toggleAccountDropdown);
    document.addEventListener('click', handleOutsideClick);

    // Notification Modal
    document.getElementById('closeNotifications').addEventListener('click', closeNotificationModal);
    document.getElementById('markAllRead').addEventListener('click', markAllNotificationsAsRead);

    // Modal
    document.getElementById('closeModal').addEventListener('click', closeDetailModal);
    document.getElementById('notificationDetailOverlay').addEventListener('click', handleModalBackdropClick);

    // Reusable Form Modal
    document.getElementById('closeFormModal').addEventListener('click', closeFormModal);
    document.getElementById('formModalOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
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

// Navigation Handler
function handleNavigation(e) {
    e.preventDefault();
    const page = e.currentTarget.getAttribute('data-page');

    const proceedToPage = () => {
        if (page === 'activities') {
            // A direct sidebar click always returns to the My Activities list.
            activitiesView.mode = 'list';
            activityEditor = null;
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

// Activate a sidebar item and update state (also used for internal links)
function setActivePage(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === page);
    });
    appState.currentPage = page;
}

// Navigate programmatically (used by in-page links)
function navigateTo(page) {
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
        case 'facilities':
            container.innerHTML = renderFacilitiesPage();
            attachFacilitiesListeners();
            break;
        case 'providers':
            container.innerHTML = renderProvidersPage();
            attachProvidersListeners();
            break;
        case 'activities':
            container.innerHTML = renderActivitiesPage();
            attachActivitiesListeners();
            break;
        case 'my-dashboard':
            container.innerHTML = renderMyDashboardPage();
            attachMyDashboardListeners();
            break;
        case 'advanced-dashboard':
            container.innerHTML = renderAdvancedDashboardPage();
            attachAdvancedDashboardListeners();
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
    updateTopBarIdentity();
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
    startApp();
}

function handleSignOut() {
    const proceedToSignOut = () => {
        demoSignOut();
        closeNotificationModal();
        document.getElementById('accountDropdown').style.display = 'none';
        startApp();
    };

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
    const label = account.id === 'ngo-existing' ? mockData.organization.name : account.organization;
    document.getElementById('topBarOrgName').textContent = label;
}

