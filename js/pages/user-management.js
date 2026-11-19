// ===== Administrator: User Management (sign-in accounts and their access) =====
// A user is a sign-in account that belongs to one organization. Today every
// organization has a single shared account, but the page is built around
// users, not organizations: a second user for the same organization is simply
// another row linked to the same organization. Deactivating a user here is
// separate from Registration Review.
let userManagementView = {
    search: '',
    organizationFilter: '',
    accessFilter: '',
    // The "Existing NGO" demo account is not tracked in demoState.registrations.
    existingNgoAccess: ACCOUNT_ACCESS.active
};

function getSystemUsers() {
    const p = mockData.organizationProfile;
    const users = [{
        id: 'existing',
        email: p.email,
        role: 'Organization Admin',
        organizationId: 'existing',
        organization: p.name,
        acronym: p.acronym,
        accountAccess: userManagementView.existingNgoAccess,
        registrationId: null
    }];

    getRegistrations()
        .filter(r => r.status === REGISTRATION_STATUS.approved)
        .forEach(r => users.push({
            id: `reg-${r.id}`,
            email: r.email,
            role: r.role,
            organizationId: `reg-${r.id}`,
            organization: r.organization,
            acronym: r.acronym,
            accountAccess: r.accountAccess,
            registrationId: r.id
        }));

    return users;
}

function getSystemUserById(id) {
    return getSystemUsers().find(u => u.id === id) || null;
}

function getUsersOfOrganization(organizationId) {
    return getSystemUsers().filter(u => u.organizationId === organizationId);
}

function setUserAccess(user, access) {
    if (user.registrationId) {
        if (access === ACCOUNT_ACCESS.active) {
            activateAccountAccess(user.registrationId);
        } else {
            deactivateAccountAccess(user.registrationId);
        }
    } else {
        userManagementView.existingNgoAccess = access;
    }
}

function getFilteredUsers() {
    const query = userManagementView.search.trim().toLowerCase();
    return getSystemUsers().filter(u => {
        const matchesOrganization = !userManagementView.organizationFilter || u.organization === userManagementView.organizationFilter;
        const matchesAccess = !userManagementView.accessFilter || u.accountAccess === userManagementView.accessFilter;
        const matchesQuery = !query
            || (u.email || '').toLowerCase().includes(query)
            || u.organization.toLowerCase().includes(query)
            || (u.acronym || '').toLowerCase().includes(query);
        return matchesOrganization && matchesAccess && matchesQuery;
    });
}

function accountAccessClass(access) {
    return access === ACCOUNT_ACCESS.active ? 'approved' : 'incomplete';
}

function accountAccessIcon(access) {
    return access === ACCOUNT_ACCESS.active ? 'circle-check' : 'circle-alert';
}

function renderAccountAccessPill(access) {
    return `<span class="reg-status reg-status-${accountAccessClass(access)}"><i data-lucide="${accountAccessIcon(access)}"></i><span>${escapeHtml(access)}</span></span>`;
}

// Opens the organization's details in Organization Management.
function openOrganizationDetails(organizationId, tab) {
    organizationManagementView.selectedId = organizationId;
    organizationManagementView.tab = tab || 'details';
    navigateTo('organization-detail');
}

function renderUserManagementPage() {
    const records = getFilteredUsers();
    const rowsHTML = records.length
        ? records.map(u => `
            <tr>
                <td class="cell-primary">${escapeHtml(u.email)}</td>
                <td>
                    <button type="button" class="table-link" data-open-organization="${u.organizationId}" title="Open organization details">${escapeHtml(u.organization)}</button>
                    <div class="cell-secondary">${escapeHtml(u.acronym || '')}</div>
                </td>
                <td>${escapeHtml(u.role)}</td>
                <td>${renderAccountAccessPill(u.accountAccess)}</td>
                <td class="actions-cell">
                    ${u.accountAccess === ACCOUNT_ACCESS.active
                        ? `<button type="button" class="icon-action danger" title="Deactivate" aria-label="Deactivate ${escapeHtml(u.email)}" data-deactivate="${u.id}"><i data-lucide="user-x"></i></button>`
                        : `<button type="button" class="icon-action" title="Activate" aria-label="Activate ${escapeHtml(u.email)}" data-activate="${u.id}"><i data-lucide="user-check"></i></button>`}
                    <button type="button" class="icon-action" title="Reset Password" aria-label="Reset Password for ${escapeHtml(u.email)}" data-reset-password="${u.id}"><i data-lucide="key-round"></i></button>
                </td>
            </tr>`).join('')
        : '<tr><td colspan="5" class="empty-cell">No users match the current filters.</td></tr>';

    const organizationOptions = Array.from(new Set(getSystemUsers().map(u => u.organization)));
    const accessOptions = [ACCOUNT_ACCESS.active, ACCOUNT_ACCESS.inactive];

    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">User Management</h1>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="userManagementSearch" placeholder="Search by email or organization..." aria-label="Search users" value="${escapeHtml(userManagementView.search)}" />
                </div>
                ${renderSelect('userManagementOrganizationFilter', 'Organization', organizationOptions, userManagementView.organizationFilter)}
                ${renderSelect('userManagementAccessFilter', 'Account Access', accessOptions, userManagementView.accessFilter)}
            </div>
            <div class="result-count">${records.length} user${records.length === 1 ? '' : 's'}</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>User (Sign-in Email)</th>
                        <th>Organization</th>
                        <th>Role</th>
                        <th>Account Access</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </div>`;
}

function attachUserManagementListeners() {
    document.getElementById('userManagementSearch').addEventListener('input', (e) => {
        userManagementView.search = e.target.value;
        renderPage('user-management');
        const input = document.getElementById('userManagementSearch');
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    });

    document.getElementById('userManagementOrganizationFilter').addEventListener('change', (e) => {
        userManagementView.organizationFilter = e.target.value;
        renderPage('user-management');
    });

    document.getElementById('userManagementAccessFilter').addEventListener('change', (e) => {
        userManagementView.accessFilter = e.target.value;
        renderPage('user-management');
    });

    document.querySelectorAll('[data-open-organization]').forEach(btn => {
        btn.addEventListener('click', () => openOrganizationDetails(btn.getAttribute('data-open-organization')));
    });

    document.querySelectorAll('[data-activate]').forEach(btn => {
        btn.addEventListener('click', () => {
            const u = getSystemUserById(btn.getAttribute('data-activate'));
            showConfirmDialog({
                title: 'Activate User',
                message: `Activate ${u.email} (${u.organization})? This user will be able to sign in again.`,
                confirmLabel: 'Activate',
                tone: 'primary',
                onConfirm: () => {
                    setUserAccess(u, ACCOUNT_ACCESS.active);
                    showToast(`${u.email} has been activated.`, 'success');
                    renderPage('user-management');
                }
            });
        });
    });

    document.querySelectorAll('[data-deactivate]').forEach(btn => {
        btn.addEventListener('click', () => {
            const u = getSystemUserById(btn.getAttribute('data-deactivate'));
            showConfirmDialog({
                title: 'Deactivate User',
                message: `Deactivate ${u.email} (${u.organization})? This user will not be able to sign in until reactivated.`,
                confirmLabel: 'Deactivate',
                tone: 'danger',
                onConfirm: () => {
                    setUserAccess(u, ACCOUNT_ACCESS.inactive);
                    showToast(`${u.email} has been deactivated.`, 'success');
                    renderPage('user-management');
                }
            });
        });
    });

    document.querySelectorAll('[data-reset-password]').forEach(btn => {
        btn.addEventListener('click', () => {
            const u = getSystemUserById(btn.getAttribute('data-reset-password'));
            showConfirmDialog({
                title: 'Reset Password',
                message: `Send a password reset link to ${u.email}?`,
                confirmLabel: 'Send Reset Link',
                tone: 'primary',
                onConfirm: () => {
                    showToast(`Password reset link sent to ${u.email}. Resetting a password is simulated in this POC.`, 'success');
                }
            });
        });
    });
}
