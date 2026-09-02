// Notifications
function toggleNotificationModal(e) {
    e.stopPropagation();
    const modal = document.getElementById('notificationModal');
    
    if (modal.style.display === 'none' || !modal.style.display) {
        renderNotificationList();
        modal.style.display = 'block';
    } else {
        modal.style.display = 'none';
    }
}

function closeNotificationModal() {
    document.getElementById('notificationModal').style.display = 'none';
}

const NOTIFICATION_TYPE_META = {
    announcement: { icon: 'megaphone', label: 'Announcement', color: 'var(--color-primary-green)' },
    action: { icon: 'circle-alert', label: 'Action Required', color: 'var(--color-warning)' },
    event: { icon: 'calendar-days', label: 'Event', color: 'var(--color-info)' },
    system: { icon: 'settings', label: 'System', color: '#3730a3' }
};

// Admin notifications are generated from live admin-review counts rather than
// stored as static mock data. Read/unread state for them is tracked here
// (keyed by id) since a fresh set of objects is built on every call.
const adminNotificationState = {
    1001: { unread: true },
    1002: { unread: true },
    1003: { unread: true }
};

function getAdminNotifications() {
    const pendingRegs = countRegistrationsByStatus(REGISTRATION_STATUS.pendingReview);
    const pendingEvents = countEventReviewsByStatus(EVENT_REVIEW_STATUS.pendingReview);
    const latestAnnouncement = mockData.announcements[0];
    return [
        {
            id: 1001,
            type: 'action',
            title: 'Organization Registrations Pending Review',
            preview: `${pendingRegs} organization registration${pendingRegs === 1 ? '' : 's'} awaiting your review.`,
            fullContent: `${pendingRegs} organization registration${pendingRegs === 1 ? '' : 's'} currently awaiting your review. Open Organization Registrations to approve or reject them.`,
            timestamp: 'Updated just now',
            unread: adminNotificationState[1001].unread,
            action: 'Review Registrations'
        },
        {
            id: 1002,
            type: 'action',
            title: 'Events Pending Review',
            preview: `${pendingEvents} submitted event${pendingEvents === 1 ? '' : 's'} awaiting review.`,
            fullContent: `${pendingEvents} submitted event${pendingEvents === 1 ? '' : 's'} currently awaiting your review.`,
            timestamp: 'Updated just now',
            unread: adminNotificationState[1002].unread,
            action: 'Review Events'
        },
        {
            id: 1003,
            type: 'announcement',
            title: 'Announcement Published',
            preview: `"${latestAnnouncement.title}" was sent to all organizations.`,
            fullContent: `Your announcement "${latestAnnouncement.title}" was published and sent to all organizations on ${latestAnnouncement.date}.`,
            timestamp: latestAnnouncement.date,
            unread: adminNotificationState[1003].unread
        }
    ];
}

function getVisibleNotifications() {
    return isAdminUser() ? getAdminNotifications() : appState.notifications;
}

function renderNotificationList() {
    const list = document.getElementById('notificationList');
    const subtitle = document.getElementById('notificationSubtitle');
    const notifications = getVisibleNotifications();
    const unreadCount = notifications.filter(n => n.unread).length;
    if (subtitle) subtitle.textContent = unreadCount > 0 ? `${unreadCount} unread` : 'You\'re all caught up';

    const markAllBtn = document.getElementById('markAllRead');
    if (markAllBtn) markAllBtn.disabled = unreadCount === 0;

    if (notifications.length === 0) {
        list.innerHTML = '<div class="notification-empty">No notifications yet.</div>';
        return;
    }

    list.innerHTML = notifications.map(notification => {
        const meta = NOTIFICATION_TYPE_META[notification.type] || { icon: 'bell', label: notification.type, color: 'var(--color-text-secondary)' };
        return `
        <div class="notification-item ${notification.unread ? 'unread' : ''}" data-notification-id="${notification.id}">
            <div class="notification-icon"><i data-lucide="${meta.icon}"></i></div>
            <div class="notification-body">
                <div class="notification-item-header">
                    <span class="notification-type" style="--notif-type-color: ${meta.color}">${escapeHtml(meta.label)}</span>
                    ${notification.unread ? '<div class="notification-unread-indicator"></div>' : ''}
                </div>
                <div class="notification-title">${escapeHtml(notification.title)}</div>
                <div class="notification-preview">${escapeHtml(notification.preview)}</div>
                <div class="notification-time">${notification.timestamp}</div>
            </div>
        </div>`;
    }).join('');

    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', handleNotificationClick);
    });
    if (window.lucide) window.lucide.createIcons();
}

function handleNotificationClick(e) {
    const notificationId = parseInt(e.currentTarget.getAttribute('data-notification-id'));
    const notification = getVisibleNotifications().find(n => n.id === notificationId);

    if (notification) {
        showNotificationDetail(notification);
        notification.unread = false;
        if (adminNotificationState[notificationId]) adminNotificationState[notificationId].unread = false;
        updateNotificationBadge();
        renderNotificationList();
    }
}

function showNotificationDetail(notification) {
    const overlay = document.getElementById('notificationDetailOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');

    modalTitle.textContent = notification.title;
    modalBody.innerHTML = `<p>${escapeHtml(notification.fullContent)}</p>`;
    
    if (notification.action) {
        modalFooter.innerHTML = `<button class="modal-btn primary">${escapeHtml(notification.action)}</button>`;
    } else {
        modalFooter.innerHTML = '';
    }

    overlay.style.display = 'flex';
    overlay.classList.add('show');
}

function closeDetailModal() {
    const overlay = document.getElementById('notificationDetailOverlay');
    overlay.style.display = 'none';
    overlay.classList.remove('show');
}

function handleModalBackdropClick(e) {
    if (e.target === e.currentTarget) {
        closeDetailModal();
    }
}

function markAllNotificationsAsRead() {
    getVisibleNotifications().forEach(n => n.unread = false);
    if (isAdminUser()) {
        Object.keys(adminNotificationState).forEach(id => { adminNotificationState[id].unread = false; });
    }
    updateNotificationBadge();
    renderNotificationList();
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    const unreadCount = getVisibleNotifications().filter(n => n.unread).length;
    appState.unreadCount = unreadCount;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Account Menu
function toggleAccountDropdown(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('accountDropdown');
    dropdown.classList.toggle('show');
    
    if (dropdown.classList.contains('show')) {
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

function handleOutsideClick(e) {
    const dropdown = document.getElementById('accountDropdown');
    const accountBtn = document.getElementById('accountBtn');
    
    if (!dropdown.contains(e.target) && !accountBtn.contains(e.target)) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
    }
    
    const notificationModal = document.getElementById('notificationModal');
    const notificationBtn = document.getElementById('notificationBell');
    
    if (!notificationModal.contains(e.target) && !notificationBtn.contains(e.target)) {
        notificationModal.style.display = 'none';
    }
}

