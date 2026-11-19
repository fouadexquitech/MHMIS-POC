// ===== Administrator: Organization Management =====
// A read-only, per-organization view of everything an approved organization
// has entered: its profile, its facilities and its providers. This is where
// NMHP checks an organization's data; registration review and account access
// stay on their own pages.
let organizationManagementView = {
    search: '',
    selectedId: null,
    tab: 'details'
};

function getManagedOrganizations() {
    // The "Existing NGO" demo account uses the standard mock organization and
    // is not tracked in demoState.registrations (same as User Management).
    const p = mockData.organizationProfile;
    const organizations = [{
        id: 'existing',
        name: p.name,
        acronym: p.acronym,
        email: p.email,
        accountAccess: userManagementView.existingNgoAccess,
        profile: p,
        focalPersons: mockData.focalPersons,
        facilities: mockData.facilities,
        providers: mockData.providers
    }];

    getRegistrations()
        .filter(r => r.status === REGISTRATION_STATUS.approved)
        .forEach(r => {
            organizations.push({
                id: `reg-${r.id}`,
                name: r.organization,
                acronym: r.acronym,
                email: r.email,
                accountAccess: r.accountAccess,
                profile: getRegistrationProfileValues(r),
                focalPersons: r.focalPersons || [],
                facilities: r.facilities || [],
                providers: r.providers || []
            });
        });

    return organizations;
}

function getManagedOrganizationById(id) {
    return getManagedOrganizations().find(o => o.id === id) || null;
}

function getFilteredManagedOrganizations() {
    const query = organizationManagementView.search.trim().toLowerCase();
    return getManagedOrganizations().filter(o => !query
        || o.name.toLowerCase().includes(query)
        || (o.acronym || '').toLowerCase().includes(query)
        || (o.email || '').toLowerCase().includes(query));
}

// ---------- Organization list ----------
function renderOrganizationManagementPage() {
    const records = getFilteredManagedOrganizations();
    const rowsHTML = records.length
        ? records.map(o => `
            <tr>
                <td>
                    <div class="cell-primary">${escapeHtml(o.name)}</div>
                    <div class="cell-secondary">${escapeHtml(o.acronym || '')}</div>
                </td>
                <td>${escapeHtml(o.email || '-')}</td>
                <td>${o.facilities.length}</td>
                <td>${o.providers.length}</td>
                <td>${renderAccountAccessPill(o.accountAccess)}</td>
                <td class="actions-cell">
                    <button type="button" class="icon-action" title="View Organization" aria-label="View ${escapeHtml(o.name)}" data-view-organization="${o.id}"><i data-lucide="eye"></i></button>
                </td>
            </tr>`).join('')
        : '<tr><td colspan="6" class="empty-cell">No organizations match the current search.</td></tr>';

    return `
        <div class="page">
            <div class="page-header">
                <div>
                    <h1 class="page-title">Organization Management</h1>
                    <p class="page-lead">Open an approved organization to check its details, focal persons, facilities, and providers.</p>
                </div>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="organizationManagementSearch" placeholder="Search organizations by name or email..." aria-label="Search organizations" value="${escapeHtml(organizationManagementView.search)}" />
                </div>
            </div>
            <div class="result-count">${records.length} organization${records.length === 1 ? '' : 's'}</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Organization</th>
                        <th>Email</th>
                        <th>Facilities</th>
                        <th>Providers</th>
                        <th>Account Access</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </div>`;
}

function attachOrganizationManagementListeners() {
    document.getElementById('organizationManagementSearch').addEventListener('input', (e) => {
        organizationManagementView.search = e.target.value;
        renderPage('organization-management');
        document.getElementById('organizationManagementSearch').focus();
    });

    document.querySelectorAll('[data-view-organization]').forEach(btn => {
        btn.addEventListener('click', () => {
            organizationManagementView.selectedId = btn.getAttribute('data-view-organization');
            organizationManagementView.tab = 'details';
            navigateTo('organization-detail');
        });
    });
}

// ---------- Organization detail (read-only) ----------
// The same tabs as the organization's own profile and as Registration
// Review (org-profile.js), plus the organization's users.
// The organization's sign-in accounts. Access is managed in User Management.
function renderOrganizationUsersTable(org) {
    const users = getUsersOfOrganization(org.id);
    const rowsHTML = users.length
        ? users.map(u => `
            <tr>
                <td class="cell-primary">${escapeHtml(u.email)}</td>
                <td>${escapeHtml(u.role)}</td>
                <td>${renderAccountAccessPill(u.accountAccess)}</td>
            </tr>`).join('')
        : '<tr><td colspan="3" class="empty-cell">This organization has no users.</td></tr>';

    return `
        <div class="list-toolbar organization-records-toolbar">
            <div class="result-count">${users.length} user${users.length === 1 ? '' : 's'}</div>
            <button type="button" class="btn btn-secondary" id="manageOrganizationUsersBtn">
                <i data-lucide="users-round"></i><span>Manage in User Management</span>
            </button>
        </div>
        <table class="data-table">
            <thead>
                <tr><th>User (Sign-in Email)</th><th>Role</th><th>Account Access</th></tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
        </table>`;
}

function renderOrganizationDetailPage() {
    const org = getManagedOrganizationById(organizationManagementView.selectedId);
    if (!org) {
        return renderOrganizationManagementPage();
    }

    const tab = organizationManagementView.tab;
    const tabs = getOrgProfileTabs({
        focalPersons: org.focalPersons.length,
        facilities: org.facilities.length,
        providers: org.providers.length
    }).concat([{ id: 'users', label: `Users (${getUsersOfOrganization(org.id).length})`, icon: 'users-round' }]);

    return `
        <div class="page">
            <div class="page-header page-header-start">
                <h1 class="page-title">${escapeHtml(org.name)}</h1>
                ${renderAccountAccessPill(org.accountAccess)}
            </div>

            ${renderProfileTabs(tabs, tab)}
            ${renderProfilePanel('details', tab, renderOrgDetailsReadOnly(org.profile))}
            ${renderProfilePanel('focal-persons', tab, renderFocalPersonsTab(org.focalPersons, { readOnly: true }))}
            ${renderProfilePanel('facilities', tab, renderOrganizationRecordsTable('facility', org.facilities))}
            ${renderProfilePanel('providers', tab, renderOrganizationRecordsTable('provider', org.providers))}
            ${renderProfilePanel('users', tab, renderOrganizationUsersTable(org))}
        </div>`;
}

function attachOrganizationDetailListeners() {
    const org = getManagedOrganizationById(organizationManagementView.selectedId);
    if (!org) {
        attachOrganizationManagementListeners();
        return;
    }

    attachProfileTabs(id => { organizationManagementView.tab = id; });
    attachOrganizationRecordsTables(org.facilities, org.providers, org.name);

    document.getElementById('manageOrganizationUsersBtn')?.addEventListener('click', () => {
        userManagementView.search = '';
        userManagementView.accessFilter = '';
        userManagementView.organizationFilter = org.name;
        navigateTo('user-management');
    });
}
