// ===== Administrator: organization registrations =====
let adminView = {
    selectedRegistrationId: null,
    // The list opens on the registrations waiting for a decision.
    statusFilter: REGISTRATION_STATUS.pendingReview,
    search: '',
    reviewTab: 'details'
};

function renderAdminHomePage() {
    const pending = countRegistrationsByStatus(REGISTRATION_STATUS.pendingReview);
    const eventsPending = countEventReviewsByStatus(EVENT_REVIEW_STATUS.pendingReview);
    const duplicatesPending = countFacilityDuplicatesByStatus(FACILITY_DUPLICATE_STATUS.pendingReview);
    const customValuesPending = countPendingCustomValuesByStatus(CUSTOM_VALUE_STATUS.pendingReview);
    return `
        <div class="home-page">
            <div class="welcome-section">
                <h1 class="welcome-heading">Welcome, NMHP Administrator</h1>
            </div>

            <div class="section-card">
                <div class="section-header">
                    <h3>Needs Your Attention</h3>
                </div>
                <div class="section-content">
                    <div class="summary-tiles">
                        <div class="tile tile-action" data-admin-tile="registrations">
                            <div class="tile-icon"><i data-lucide="file-check"></i></div>
                            <div class="tile-value">${pending}</div>
                            <div class="tile-label">Submitted Profiles</div>
                        </div>
                        <div class="tile tile-action" data-admin-tile="event-reviews">
                            <div class="tile-icon"><i data-lucide="calendar-check"></i></div>
                            <div class="tile-value">${eventsPending}</div>
                            <div class="tile-label">Submitted Events</div>
                        </div>
                        <div class="tile tile-action" data-admin-tile="facility-duplicates">
                            <div class="tile-icon"><i data-lucide="git-merge"></i></div>
                            <div class="tile-value">${duplicatesPending}</div>
                            <div class="tile-label">Possible Duplicate Facilities</div>
                        </div>
                        <div class="tile tile-action" data-admin-tile="pending-custom-values">
                            <div class="tile-icon"><i data-lucide="list-plus"></i></div>
                            <div class="tile-value">${customValuesPending}</div>
                            <div class="tile-label">Submitted Custom Values</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section-card">
                <div class="section-header">
                    <h3>Quick Actions</h3>
                </div>
                <div class="section-content">
                    <div class="resource-card-grid">
                        <button type="button" class="resource-card" id="adminRegistrationsBtn">
                            <div class="resource-card-icon"><i data-lucide="file-check"></i></div>
                            <div class="resource-card-label">Review Submitted Profiles</div>
                            <div class="resource-card-description">Approve new organizations or ask them for changes.</div>
                        </button>
                        <button type="button" class="resource-card" id="adminOrganizationManagementBtn">
                            <div class="resource-card-icon"><i data-lucide="building-2"></i></div>
                            <div class="resource-card-label">Organization Management</div>
                            <div class="resource-card-description">Check an approved organization's profile, facilities, and providers.</div>
                        </button>
                        <button type="button" class="resource-card" id="adminUserManagementBtn">
                            <div class="resource-card-icon"><i data-lucide="users-round"></i></div>
                            <div class="resource-card-label">User Management</div>
                            <div class="resource-card-description">Manage organization accounts and access.</div>
                        </button>
                        <button type="button" class="resource-card" id="adminCreateAnnouncementBtn">
                            <div class="resource-card-icon"><i data-lucide="megaphone"></i></div>
                            <div class="resource-card-label">Create Announcement</div>
                            <div class="resource-card-description">Compose and send a message to organizations.</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
}

function attachAdminHomeListeners() {
    const goToRegistrations = () => {
        adminView.statusFilter = REGISTRATION_STATUS.pendingReview;
        navigateTo('organization-registrations');
    };
    document.getElementById('adminRegistrationsBtn')?.addEventListener('click', goToRegistrations);
    document.querySelector('[data-admin-tile="registrations"]')?.addEventListener('click', goToRegistrations);
    makeKeyboardActivatable(document.querySelectorAll('.tile-action[data-admin-tile]'));
    document.getElementById('adminOrganizationManagementBtn')?.addEventListener('click', () => navigateTo('organization-management'));
    document.getElementById('adminUserManagementBtn')?.addEventListener('click', () => navigateTo('user-management'));
    document.getElementById('adminCreateAnnouncementBtn')?.addEventListener('click', () => openComposeAnnouncementForm());

    document.querySelector('[data-admin-tile="event-reviews"]')?.addEventListener('click', () => {
        reviewsView.eventStatusFilter = EVENT_REVIEW_STATUS.pendingReview;
        navigateTo('event-reviews');
    });
    document.querySelector('[data-admin-tile="facility-duplicates"]')?.addEventListener('click', () => {
        reviewsView.duplicateStatusFilter = FACILITY_DUPLICATE_STATUS.pendingReview;
        navigateTo('facility-duplicates');
    });
    document.querySelector('[data-admin-tile="pending-custom-values"]')?.addEventListener('click', () => {
        reviewsView.customValueStatusFilter = CUSTOM_VALUE_STATUS.pendingReview;
        navigateTo('pending-custom-values');
    });
}

function getFilteredRegistrations() {
    const query = adminView.search.trim().toLowerCase();
    return getRegistrations().filter(r => {
        const matchesStatus = !adminView.statusFilter || r.status === adminView.statusFilter;
        const matchesQuery = !query || r.organization.toLowerCase().includes(query) || (r.acronym || '').toLowerCase().includes(query);
        return matchesStatus && matchesQuery;
    });
}

function renderOrganizationRegistrationsPage() {
    const records = getFilteredRegistrations();
    const rowsHTML = records.length
        ? records.map(r => `
            <tr>
                <td>
                    <div class="cell-primary">${escapeHtml(r.organization)}</div>
                    <div class="cell-secondary">${escapeHtml(r.acronym || '')}</div>
                </td>
                <td>
                    ${escapeHtml(r.email || '—')}
                    ${r.status === REGISTRATION_STATUS.pendingReview && findPersonalEmailMatch(r)
                        ? '<div class="cell-flag"><i data-lucide="triangle-alert"></i><span>Possible personal email</span></div>'
                        : ''}
                </td>
                <td>${escapeHtml(r.submittedDate || 'Not submitted')}</td>
                <td><span class="reg-status reg-status-${registrationStatusClass(r.status)}"><i data-lucide="${registrationStatusIcon(r.status)}"></i><span>${escapeHtml(r.status)}</span></span></td>
                <td class="actions-cell">
                    ${r.status === REGISTRATION_STATUS.incomplete
                        ? ''
                        : r.status === REGISTRATION_STATUS.pendingReview
                            ? `<button type="button" class="icon-action" title="Review" aria-label="Review ${escapeHtml(r.organization)}" data-review="${r.id}"><i data-lucide="file-check"></i></button>`
                            : `<button type="button" class="icon-action" title="View" aria-label="View ${escapeHtml(r.organization)}" data-review="${r.id}"><i data-lucide="eye"></i></button>`}
                </td>
            </tr>`).join('')
        : '<tr><td colspan="5" class="empty-cell">No registrations match the current filters.</td></tr>';

    const statusOptions = [
        REGISTRATION_STATUS.pendingReview,
        REGISTRATION_STATUS.changesRequested,
        REGISTRATION_STATUS.approved,
        REGISTRATION_STATUS.declined,
        REGISTRATION_STATUS.incomplete
    ];

    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Submitted Profiles</h1>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="registrationSearch" placeholder="Search organizations..." aria-label="Search organizations" value="${escapeHtml(adminView.search)}" />
                </div>
                ${renderSelect('registrationStatusFilter', 'Registration Status', statusOptions, adminView.statusFilter)}
            </div>
            <div class="result-count">${records.length} registration${records.length === 1 ? '' : 's'}</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Organization</th>
                        <th>Email</th>
                        <th>Submitted</th>
                        <th>Registration Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </div>`;
}

function attachOrganizationRegistrationsListeners() {
    document.getElementById('registrationSearch').addEventListener('input', (e) => {
        adminView.search = e.target.value;
        renderPage('organization-registrations');
        document.getElementById('registrationSearch').focus();
    });

    document.getElementById('registrationStatusFilter').addEventListener('change', (e) => {
        adminView.statusFilter = e.target.value;
        renderPage('organization-registrations');
    });

    document.querySelectorAll('[data-review]').forEach(btn => {
        btn.addEventListener('click', () => {
            adminView.selectedRegistrationId = Number(btn.getAttribute('data-review'));
            adminView.reviewTab = 'details';
            navigateTo('registration-review');
        });
    });
}

// ===== Possible personal email =====
// A pattern cannot tell a shared mailbox (info@ngo.org) from a person's
// address on the same domain (yourname@ngo.org). Instead, the sign-in email
// is compared with the people named in the same profile: if it contains the
// director's or a focal person's name, NMHP is warned before approving.
const PERSON_NAME_TITLES = ['dr', 'mr', 'mrs', 'ms', 'prof', 'eng'];

function getPersonNameParts(name) {
    return (name || '')
        .toLowerCase()
        .split(/[\s.\-']+/)
        .map(part => part.replace(/[^a-z]/g, ''))
        .filter(part => part.length >= 3 && !PERSON_NAME_TITLES.includes(part));
}

function findPersonalEmailMatch(registration) {
    const email = registration.email || '';
    const localPart = email.split('@')[0].toLowerCase().replace(/[^a-z]/g, '');
    if (!localPart) {
        return null;
    }
    const people = [{ name: registration.directorName, role: 'Director' }]
        .concat((registration.focalPersons || []).map(f => ({ name: f.name, role: `${f.area} Focal Person` })));
    return people.find(person => getPersonNameParts(person.name).some(part => localPart.includes(part))) || null;
}

function renderPersonalEmailWarning(registration) {
    const match = findPersonalEmailMatch(registration);
    if (!match) {
        return '';
    }
    return `
        <div class="warning-banner" role="status">
            <i data-lucide="triangle-alert"></i>
            <span><strong>Possible personal email.</strong> The sign-in email ${escapeHtml(registration.email)} matches the name of ${escapeHtml(match.name)} (${escapeHtml(match.role)}). Organizations must sign in with a shared organization address, so check it before approving.</span>
        </div>`;
}

// ---------- Registration Review ----------
// The submitted profile, read-only, in the same tabs the organization filled
// (and that Organization Management shows after approval). The decision
// buttons sit in the page header: Approve, Request Changes, Decline.
function renderRegistrationReviewPage() {
    const r = getRegistrationById(adminView.selectedRegistrationId);
    if (!r) {
        return renderOrganizationRegistrationsPage();
    }
    const pending = r.status === REGISTRATION_STATUS.pendingReview;
    const tab = adminView.reviewTab;
    const facilities = r.facilities || [];
    const providers = r.providers || [];

    let statusHTML = '';
    if (r.status === REGISTRATION_STATUS.changesRequested) {
        statusHTML = `
            <div class="reason-box reason-box-warning">
                <div class="reason-box-label">Changes requested${r.reviewedDate ? ` on ${escapeHtml(r.reviewedDate)}` : ''}</div>
                <p>${escapeHtml(r.reviewMessage)}</p>
            </div>`;
    } else if (r.status === REGISTRATION_STATUS.declined) {
        statusHTML = `
            <div class="reason-box">
                <div class="reason-box-label">Declined${r.reviewedDate ? ` on ${escapeHtml(r.reviewedDate)}` : ''}</div>
                <p>${escapeHtml(r.reviewMessage)}</p>
            </div>`;
    } else if (r.status === REGISTRATION_STATUS.incomplete) {
        statusHTML = '<div class="info-banner">This organization has not submitted its profile yet.</div>';
    } else if (r.status === REGISTRATION_STATUS.approved) {
        statusHTML = `<div class="info-banner">Approved${r.reviewedDate ? ` on ${escapeHtml(r.reviewedDate)}` : ''}. The organization now appears in Organization Management.</div>`;
    }

    const previousHTML = pending && r.previousRequest ? `
        <div class="previous-request">
            <span class="previous-request-label">Your previous request &middot; ${escapeHtml(r.previousRequest.date || '')}</span>
            ${escapeHtml(r.previousRequest.message)}
        </div>` : '';

    const counts = {
        focalPersons: (r.focalPersons || []).length,
        facilities: facilities.length,
        providers: providers.length
    };

    return `
        <div class="page">
            <div class="page-header page-header-start">
                <h1 class="page-title">${escapeHtml(r.organization)}</h1>
                ${renderRegStatusPill(r.status)}
                ${pending ? `
                <div class="page-header-actions">
                    <button type="button" class="btn btn-secondary" id="requestChangesBtn">Request Changes</button>
                    <button type="button" class="btn btn-primary" id="approveRegistrationBtn">Approve</button>
                    <span class="page-header-actions-divider" aria-hidden="true"></span>
                    <button type="button" class="btn btn-danger-outline" id="declineRegistrationBtn">Decline</button>
                </div>` : ''}
            </div>
            <p class="status-text">${r.submittedDate ? `Submitted on ${escapeHtml(r.submittedDate)} &middot; ` : ''}Sign-in email ${escapeHtml(r.email || '-')}. The submitted details are read-only.</p>
            ${pending ? renderPersonalEmailWarning(r) : ''}
            ${statusHTML}
            ${previousHTML}

            ${renderProfileTabs(getOrgProfileTabs(counts), tab)}
            ${renderProfilePanel('details', tab, renderOrgDetailsReadOnly(getRegistrationProfileValues(r)))}
            ${renderProfilePanel('focal-persons', tab, renderFocalPersonsTab(r.focalPersons || [], { readOnly: true }))}
            ${renderProfilePanel('facilities', tab, renderOrganizationRecordsTable('facility', facilities))}
            ${renderProfilePanel('providers', tab, renderOrganizationRecordsTable('provider', providers))}
        </div>`;
}

function attachRegistrationReviewListeners() {
    const r = getRegistrationById(adminView.selectedRegistrationId);
    if (!r) {
        attachOrganizationRegistrationsListeners();
        return;
    }
    attachProfileTabs(id => { adminView.reviewTab = id; });
    attachOrganizationRecordsTables(r.facilities || [], r.providers || [], r.organization);

    document.getElementById('approveRegistrationBtn')?.addEventListener('click', () => {
        showConfirmDialog({
            title: 'Approve Registration?',
            message: `${r.organization} will get full access to MHIS. NMHP emails the decision to ${r.email} and the organization's focal persons.`,
            confirmLabel: 'Approve',
            onConfirm: () => {
                approveRegistration(r.id);
                showToast(`${r.organization} is approved.`, 'success');
                renderPage('registration-review');
            }
        });
    });
    document.getElementById('requestChangesBtn')?.addEventListener('click', () => openRegistrationDecisionDialog(r, 'changes'));
    document.getElementById('declineRegistrationBtn')?.addEventListener('click', () => openRegistrationDecisionDialog(r, 'decline'));
}

// Request Changes (the organization updates and resubmits) or Decline.
// Both need a message, which NMHP emails to the organization.
function openRegistrationDecisionDialog(r, kind) {
    const changes = kind === 'changes';
    openFormModal(changes ? 'Request Changes' : 'Decline Registration', `
        <form id="registrationDecisionForm" class="modal-form" novalidate>
            <p class="status-text">${changes
                ? `${escapeHtml(r.organization)} can update its profile and resubmit it for review.`
                : 'Use Decline for registrations that are not genuine organizations, duplicates or tests.'}</p>
            <div class="form-field">
                <label for="decisionMessage">${changes ? 'What should the organization update?' : 'Reason'} <span class="required">*</span></label>
                <textarea id="decisionMessage" rows="4" data-required="true" data-error-label="${changes ? 'the changes to request' : 'the reason'}"></textarea>
                <div class="field-error" id="decisionMessage-error"></div>
            </div>
            <p class="decision-email-note"><i data-lucide="mail"></i><span>NMHP emails this to ${escapeHtml(r.email)} and the organization's focal persons, and sends an MHIS notification.</span></p>
        </form>`,
        `<button type="button" class="modal-btn" id="cancelDecisionBtn">Cancel</button>
         <button type="button" class="modal-btn ${changes ? 'primary' : 'danger'}" id="confirmDecisionBtn">${changes ? 'Send Request' : 'Decline Registration'}</button>`);

    document.getElementById('cancelDecisionBtn').addEventListener('click', closeFormModal);
    document.getElementById('confirmDecisionBtn').addEventListener('click', () => {
        const form = document.getElementById('registrationDecisionForm');
        if (!validateModalForm(form)) {
            return;
        }
        const message = document.getElementById('decisionMessage').value.trim();
        if (changes) {
            requestRegistrationChanges(r.id, message);
            showToast(`Change request sent to ${r.organization}.`, 'success');
        } else {
            declineRegistration(r.id, message);
            showToast(`${r.organization} is declined.`, 'success');
        }
        closeFormModal();
        renderPage('registration-review');
    });
}
