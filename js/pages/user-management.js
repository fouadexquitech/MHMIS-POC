// ===== Administrator: User Management (account access for approved organizations' users) =====
// Every approved organization's account is a "user" of the system here — the
// term intentionally covers more than organizations, so this page is ready to
// later list other user types (e.g. NMHP staff with different roles) without
// a rename. Deactivating a user here is separate from Registration Review.
let userManagementView = {
    search: '',
    accessFilter: ''
};

function getFilteredUsers() {
    const query = userManagementView.search.trim().toLowerCase();
    return getRegistrations().filter(r => {
        if (r.status !== REGISTRATION_STATUS.approved) {
            return false;
        }
        const matchesAccess = !userManagementView.accessFilter || r.accountAccess === userManagementView.accessFilter;
        const matchesQuery = !query
            || r.organization.toLowerCase().includes(query)
            || (r.acronym || '').toLowerCase().includes(query)
            || (r.email || '').toLowerCase().includes(query);
        return matchesAccess && matchesQuery;
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

function renderUserManagementPage() {
    const records = getFilteredUsers();
    const rowsHTML = records.length
        ? records.map(r => `
            <tr>
                <td>
                    <div class="cell-primary">${escapeHtml(r.organization)}</div>
                    <div class="cell-secondary">${escapeHtml(r.acronym || '')}</div>
                </td>
                <td>${escapeHtml(r.email)}</td>
                <td>${escapeHtml(r.role)}</td>
                <td>${renderAccountAccessPill(r.accountAccess)}</td>
                <td class="actions-cell">
                    ${r.accountAccess === ACCOUNT_ACCESS.active
                        ? `<button type="button" class="icon-action danger" title="Deactivate" aria-label="Deactivate ${escapeHtml(r.organization)}" data-deactivate="${r.id}"><i data-lucide="user-x"></i></button>`
                        : `<button type="button" class="icon-action" title="Activate" aria-label="Activate ${escapeHtml(r.organization)}" data-activate="${r.id}"><i data-lucide="user-check"></i></button>`}
                    <button type="button" class="icon-action" title="Reset Password" aria-label="Reset Password for ${escapeHtml(r.organization)}" data-reset-password="${r.id}"><i data-lucide="key-round"></i></button>
                </td>
            </tr>`).join('')
        : '<tr><td colspan="5" class="empty-cell">No users match the current filters.</td></tr>';

    const accessOptions = [ACCOUNT_ACCESS.active, ACCOUNT_ACCESS.inactive];

    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">User Management</h1>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="userManagementSearch" placeholder="Search users by name or email..." aria-label="Search users" value="${escapeHtml(userManagementView.search)}" />
                </div>
                ${renderSelect('userManagementAccessFilter', 'Account Access', accessOptions, userManagementView.accessFilter)}
            </div>
            <div class="result-count">${records.length} user${records.length === 1 ? '' : 's'}</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
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
        document.getElementById('userManagementSearch').focus();
    });

    document.getElementById('userManagementAccessFilter').addEventListener('change', (e) => {
        userManagementView.accessFilter = e.target.value;
        renderPage('user-management');
    });

    document.querySelectorAll('[data-activate]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-activate'));
            const r = getRegistrationById(id);
            showConfirmDialog({
                title: 'Activate User',
                message: `Activate ${r.organization}? They will regain access to the system.`,
                confirmLabel: 'Activate',
                tone: 'primary',
                onConfirm: () => {
                    activateAccountAccess(id);
                    showToast(`${r.organization} has been activated.`, 'success');
                    renderPage('user-management');
                }
            });
        });
    });

    document.querySelectorAll('[data-deactivate]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-deactivate'));
            const r = getRegistrationById(id);
            showConfirmDialog({
                title: 'Deactivate User',
                message: `Deactivate ${r.organization}? They will lose access to the system until reactivated.`,
                confirmLabel: 'Deactivate',
                tone: 'danger',
                onConfirm: () => {
                    deactivateAccountAccess(id);
                    showToast(`${r.organization} has been deactivated.`, 'success');
                    renderPage('user-management');
                }
            });
        });
    });

    document.querySelectorAll('[data-reset-password]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-reset-password'));
            const r = getRegistrationById(id);
            showConfirmDialog({
                title: 'Reset Password',
                message: `Send a password reset link to ${r.email}?`,
                confirmLabel: 'Send Reset Link',
                tone: 'primary',
                onConfirm: () => {
                    showToast(`Password reset link sent to ${r.email}. Resetting a password is simulated in this POC.`, 'success');
                }
            });
        });
    });
}
