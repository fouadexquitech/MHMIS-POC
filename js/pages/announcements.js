// ===== Administrator: Announcements (Audience Groups + Announcement History) =====
// An Audience Group's criteria is evaluated live against current activities,
// not stored as a static membership list — this is what lets "send to this
// group" keep working correctly as organizations' activities change over
// time, instead of the admin having to redefine the audience every time.
let announcementsView = {
    groupSearch: '',
    historySearch: '',
    historyGroupFilter: ''
};

// The 4 criteria dimensions a group can be built from, and where each one's
// value options come from — used by the row-based criteria builder below.
const ANNOUNCEMENT_CRITERIA_FIELDS = [
    { key: 'activityTypes', label: 'Activity Type' },
    { key: 'locations', label: 'Location' },
    { key: 'fundingSources', label: 'Funding Source' },
    { key: 'organizations', label: 'Organizations' }
];

function getAnnouncementCriteriaFieldOptions(key) {
    if (key === 'activityTypes') {
        return mockData.activityConfigs.map(c => ({ value: c.id, label: c.subActivity }));
    }
    if (key === 'locations') {
        return mockData.governorates;
    }
    if (key === 'fundingSources') {
        return getFundingSourceOptions();
    }
    return getAnnouncementOrganizationDirectory();
}

function getAnnouncementGroupById(id) {
    return mockData.announcementGroups.find(g => g.id === id);
}

function getActivityTypeLabel(configId) {
    const cfg = mockData.activityConfigs.find(c => c.id === configId);
    return cfg ? cfg.subActivity : configId;
}

function getFundingSourceOptions() {
    return [...new Set(mockData.activities.map(a => a.data.donor).filter(Boolean))];
}

function activityMatchesGroupCriteria(activity, criteria) {
    const typeOk = !criteria.activityTypes.length || criteria.activityTypes.includes(activity.configId);
    const locationOk = !criteria.locations.length || criteria.locations.includes(activity.data.governorate);
    const fundingOk = !criteria.fundingSources.length || criteria.fundingSources.includes(activity.data.donor);
    return typeOk && locationOk && fundingOk;
}

function getGroupMemberOrganizations(group) {
    const { activityTypes, locations, fundingSources, organizations } = group.criteria;
    const hasActivityFilters = activityTypes.length || locations.length || fundingSources.length;
    const viaActivities = hasActivityFilters
        ? mockData.activities.filter(a => activityMatchesGroupCriteria(a, group.criteria)).map(a => a.organization)
        : [];
    return [...new Set([...viaActivities, ...organizations])];
}

function renderGroupCriteriaSummary(group) {
    const { activityTypes, locations, fundingSources, organizations } = group.criteria;
    const parts = [];
    if (activityTypes.length) {
        parts.push(activityTypes.map(getActivityTypeLabel).join(', '));
    }
    if (locations.length) {
        parts.push(locations.join(', '));
    }
    if (fundingSources.length) {
        parts.push(`Funded by ${fundingSources.join(', ')}`);
    }
    if (organizations.length) {
        parts.push(`${organizations.length} selected organization${organizations.length === 1 ? '' : 's'}`);
    }
    return parts.length ? parts.join(' · ') : 'No criteria set';
}

function getFilteredAnnouncementGroups() {
    const query = announcementsView.groupSearch.trim().toLowerCase();
    return mockData.announcementGroups.filter(g => !query || g.name.toLowerCase().includes(query));
}

// ===== Audience Groups (list page) =====
function renderAudienceGroupsPage() {
    const groups = getFilteredAnnouncementGroups();
    const rowsHTML = groups.length
        ? groups.map(g => {
            const recipients = getGroupMemberOrganizations(g);
            const lastSent = getLastSentDateForGroup(g.id);
            return `
                <tr>
                    <td>
                        <div class="cell-primary">${escapeHtml(g.name)}</div>
                        ${g.description ? `<div class="cell-secondary">${escapeHtml(g.description)}</div>` : ''}
                    </td>
                    <td>${escapeHtml(renderGroupCriteriaSummary(g))}</td>
                    <td>${recipients.length} organization${recipients.length === 1 ? '' : 's'}</td>
                    <td>${lastSent ? escapeHtml(lastSent) : 'Never'}</td>
                    <td class="actions-col">
                        <button class="icon-action" title="Send Announcement" aria-label="Send Announcement" data-action="send" data-id="${g.id}"><i data-lucide="send"></i></button>
                        <button class="icon-action" title="Edit" aria-label="Edit" data-action="edit" data-id="${g.id}"><i data-lucide="pencil"></i></button>
                        <button class="icon-action" title="Duplicate" aria-label="Duplicate" data-action="duplicate" data-id="${g.id}"><i data-lucide="copy"></i></button>
                        <button class="icon-action" title="View Log" aria-label="View Log" data-action="log" data-id="${g.id}"><i data-lucide="history"></i></button>
                        <button class="icon-action danger" title="Delete" aria-label="Delete" data-action="delete" data-id="${g.id}"><i data-lucide="trash-2"></i></button>
                    </td>
                </tr>`;
        }).join('')
        : '<tr><td colspan="5" class="empty-cell">No audience groups match the current search.</td></tr>';

    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Audience Groups</h1>
                <button class="btn btn-primary" id="addAudienceGroupBtn">
                    <i data-lucide="plus"></i><span>New Group</span>
                </button>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="audienceGroupSearch" placeholder="Search groups..." aria-label="Search groups" value="${escapeHtml(announcementsView.groupSearch)}" />
                </div>
            </div>
            <div class="result-count">${groups.length} group${groups.length === 1 ? '' : 's'}</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Group Name</th><th>Criteria</th><th>Recipients</th><th>Last Sent</th><th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </div>`;
}

function attachAudienceGroupsListeners() {
    document.getElementById('audienceGroupSearch').addEventListener('input', (e) => {
        announcementsView.groupSearch = e.target.value;
        renderPage('audience-groups');
        document.getElementById('audienceGroupSearch').focus();
    });

    document.getElementById('addAudienceGroupBtn').addEventListener('click', () => openAudienceGroupForm());

    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-id'));
            const action = btn.getAttribute('data-action');
            if (action === 'edit') {
                openAudienceGroupForm(id);
            } else if (action === 'duplicate') {
                duplicateAnnouncementGroup(id);
            } else if (action === 'delete') {
                confirmDeleteAnnouncementGroup(id);
            } else if (action === 'send') {
                openComposeAnnouncementForm(id);
            } else if (action === 'log') {
                announcementsView.historyGroupFilter = getAnnouncementGroupById(id).name;
                navigateTo('announcement-history');
            }
        });
    });
}

// ===== Audience Group mutations =====
// The criteria builder is a small table of rows (Field + "is any of" values),
// echoing the row-based Field/Operator/Value pattern from the legacy
// Announcement Criteria screen — admins add only the criteria dimensions
// they actually want, instead of seeing all 4 dimensions at once. Each row's
// value cell is the shared searchable multi-select dropdown
// (renderMultiSelectDropdown/attachMultiSelectDropdown in shared-ui.js).
// "Operator" is always "is any of" (an organization matches a field if it
// has an activity in ANY of that row's selected values) — there is only one
// operator today, so it is shown as a fixed label rather than a dropdown.
function openAudienceGroupForm(id) {
    const editing = typeof id === 'number';
    const g = editing
        ? getAnnouncementGroupById(id)
        : { name: '', description: '', criteria: { activityTypes: [], locations: [], fundingSources: [], organizations: [] } };

    let rowSeq = 0;

    const renderCriteriaRow = (key, values) => {
        const rowId = rowSeq++;
        const fieldOptionsHTML = ANNOUNCEMENT_CRITERIA_FIELDS
            .map(f => `<option value="${f.key}"${f.key === key ? ' selected' : ''}>${escapeHtml(f.label)}</option>`)
            .join('');
        return `
            <tr class="criteria-row" data-row-id="${rowId}">
                <td>
                    <select class="criteria-field-select" id="grp-row-field-${rowId}">${fieldOptionsHTML}</select>
                </td>
                <td>is any of</td>
                <td id="grp-row-value-cell-${rowId}">
                    ${renderMultiSelectDropdown(`grp-row-value-${rowId}`, getAnnouncementCriteriaFieldOptions(key), values, 'Select values...')}
                </td>
                <td class="actions-col">
                    <button type="button" class="icon-action danger" title="Remove Criteria" aria-label="Remove Criteria" data-remove-row="${rowId}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>`;
    };

    const attachCriteriaRow = (rowId) => {
        attachMultiSelectDropdown(`grp-row-value-${rowId}`);
        document.getElementById(`grp-row-field-${rowId}`).addEventListener('change', (e) => {
            const cell = document.getElementById(`grp-row-value-cell-${rowId}`);
            cell.innerHTML = renderMultiSelectDropdown(`grp-row-value-${rowId}`, getAnnouncementCriteriaFieldOptions(e.target.value), [], 'Select values...');
            attachMultiSelectDropdown(`grp-row-value-${rowId}`);
            refreshLucideIcons();
        });
        document.querySelector(`[data-remove-row="${rowId}"]`).addEventListener('click', (e) => {
            e.target.closest('tr').remove();
        });
    };

    // Seed one row per criteria dimension that already has values; an empty,
    // brand-new group starts with a single blank row rather than four.
    const initialRows = ANNOUNCEMENT_CRITERIA_FIELDS
        .map(f => ({ key: f.key, values: g.criteria[f.key] }))
        .filter(r => r.values.length);
    if (!initialRows.length) {
        initialRows.push({ key: ANNOUNCEMENT_CRITERIA_FIELDS[0].key, values: [] });
    }
    const rowsHTML = initialRows.map(r => renderCriteriaRow(r.key, r.values)).join('');

    openFormModal(editing ? 'Edit Audience Group' : 'New Audience Group', `
        <form id="audienceGroupForm" class="modal-form" novalidate>
            <div class="form-field">
                <label for="grp-name">Group Name <span class="required">*</span></label>
                <input type="text" id="grp-name" value="${escapeHtml(g.name)}" data-required="true" />
                <div class="field-error" id="grp-name-error"></div>
            </div>
            <div class="form-field">
                <label for="grp-description">Description</label>
                <textarea id="grp-description" rows="2">${escapeHtml(g.description || '')}</textarea>
            </div>
            <p class="status-text">An organization matches this group if it has an activity satisfying every criterion below, or if it is explicitly picked under Organizations.</p>
            <table class="criteria-table">
                <thead><tr><th>Field</th><th>Operator</th><th>Value</th><th></th></tr></thead>
                <tbody id="grpCriteriaRows">${rowsHTML}</tbody>
            </table>
            <button type="button" class="btn btn-secondary" id="addCriteriaRowBtn"><i data-lucide="plus"></i><span>Add Criteria</span></button>
        </form>`,
        `<button type="button" class="btn btn-secondary" id="cancelAudienceGroupBtn">Cancel</button>
         <button type="button" class="btn btn-primary" id="saveAudienceGroupBtn">${editing ? 'Save Changes' : 'Create Group'}</button>`,
        true);

    initialRows.forEach((row, idx) => attachCriteriaRow(idx));

    document.getElementById('addCriteriaRowBtn').addEventListener('click', () => {
        document.getElementById('grpCriteriaRows').insertAdjacentHTML('beforeend', renderCriteriaRow(ANNOUNCEMENT_CRITERIA_FIELDS[0].key, []));
        attachCriteriaRow(rowSeq - 1);
        refreshLucideIcons();
    });

    document.getElementById('cancelAudienceGroupBtn').addEventListener('click', closeFormModal);
    document.getElementById('saveAudienceGroupBtn').addEventListener('click', () => {
        const form = document.getElementById('audienceGroupForm');
        if (!validateModalForm(form)) {
            return;
        }

        const criteria = { activityTypes: [], locations: [], fundingSources: [], organizations: [] };
        document.querySelectorAll('#grpCriteriaRows .criteria-row').forEach(tr => {
            const rowId = tr.getAttribute('data-row-id');
            const key = document.getElementById(`grp-row-field-${rowId}`).value;
            const values = document.getElementById(`grp-row-value-${rowId}`).value.split(',').filter(Boolean);
            criteria[key] = [...new Set([...criteria[key], ...values])];
        });

        const name = document.getElementById('grp-name').value.trim();
        const description = document.getElementById('grp-description').value.trim();

        if (editing) {
            g.name = name;
            g.description = description;
            g.criteria = criteria;
            showToast('Audience group updated.', 'success');
        } else {
            mockData.announcementGroups.push({
                id: Math.max(0, ...mockData.announcementGroups.map(x => x.id)) + 1,
                name, description, criteria
            });
            showToast('Audience group created.', 'success');
        }
        closeFormModal();
        renderPage('audience-groups');
    });
}

function duplicateAnnouncementGroup(id) {
    const g = getAnnouncementGroupById(id);
    if (!g) {
        return;
    }
    mockData.announcementGroups.push({
        id: Math.max(0, ...mockData.announcementGroups.map(x => x.id)) + 1,
        name: `${g.name} (Copy)`,
        description: g.description,
        criteria: {
            activityTypes: [...g.criteria.activityTypes],
            locations: [...g.criteria.locations],
            fundingSources: [...g.criteria.fundingSources],
            organizations: [...g.criteria.organizations]
        }
    });
    showToast('Audience group duplicated.', 'success');
    renderPage('audience-groups');
}

function confirmDeleteAnnouncementGroup(id) {
    const g = getAnnouncementGroupById(id);
    if (!g) {
        return;
    }
    showConfirmDialog({
        title: 'Delete Audience Group',
        message: `Delete "${g.name}"? Its past announcement logs will still be visible in Announcement History. This cannot be undone.`,
        confirmLabel: 'Delete',
        tone: 'danger',
        onConfirm: () => {
            mockData.announcementGroups = mockData.announcementGroups.filter(x => x.id !== id);
            showToast('Audience group deleted.', 'success');
            renderPage('audience-groups');
        }
    });
}

// Composes and sends an announcement. Called with a group id from the
// per-row "Send" action on Audience Groups (group is fixed, no picker
// shown); called with no id from the admin home "Create Announcement" quick
// action, which instead lets the admin pick the audience group as the first
// step of the same form, so that shortcut goes straight to publishing an
// announcement rather than to the group-management list.
function openComposeAnnouncementForm(id) {
    const preset = typeof id === 'number';
    const groups = mockData.announcementGroups;
    let selectedGroup = preset ? getAnnouncementGroupById(id) : groups[0];

    const recipientsText = (group) => {
        const recipients = group ? getGroupMemberOrganizations(group) : [];
        return recipients.length
            ? `Will be sent to ${recipients.length} organization${recipients.length === 1 ? '' : 's'}: ${escapeHtml(recipients.join(', '))}`
            : 'No organizations currently match this group’s criteria — sending now will reach no one.';
    };

    const groupFieldHTML = preset ? '' : `
        <div class="form-field">
            <label for="ann-group">Audience Group <span class="required">*</span></label>
            <select id="ann-group" data-required="true">
                ${groups.map(g => `<option value="${g.id}">${escapeHtml(g.name)}</option>`).join('')}
            </select>
        </div>`;

    openFormModal(preset ? `Send Announcement — ${selectedGroup.name}` : 'Send Announcement', `
        <form id="sendAnnouncementForm" class="modal-form" novalidate>
            ${groupFieldHTML}
            <div class="form-field">
                <label for="ann-title">Title <span class="required">*</span></label>
                <input type="text" id="ann-title" data-required="true" />
                <div class="field-error" id="ann-title-error"></div>
            </div>
            <div class="form-field">
                <label for="ann-message">Message <span class="required">*</span></label>
                <textarea id="ann-message" rows="5" data-required="true"></textarea>
                <div class="field-error" id="ann-message-error"></div>
            </div>
            <p class="status-text" id="ann-recipients-preview">${recipientsText(selectedGroup)}</p>
        </form>`,
        `<button type="button" class="btn btn-secondary" id="cancelSendAnnouncementBtn">Cancel</button>
         <button type="button" class="btn btn-primary" id="confirmSendAnnouncementBtn">Send</button>`);

    if (!preset) {
        document.getElementById('ann-group').addEventListener('change', (e) => {
            selectedGroup = getAnnouncementGroupById(Number(e.target.value));
            document.getElementById('ann-recipients-preview').textContent = recipientsText(selectedGroup);
        });
    }

    document.getElementById('cancelSendAnnouncementBtn').addEventListener('click', closeFormModal);
    document.getElementById('confirmSendAnnouncementBtn').addEventListener('click', () => {
        const form = document.getElementById('sendAnnouncementForm');
        if (!validateModalForm(form)) {
            return;
        }
        const targetGroupId = preset ? id : Number(document.getElementById('ann-group').value);
        const title = document.getElementById('ann-title').value.trim();
        const message = document.getElementById('ann-message').value.trim();
        const sentCount = sendAnnouncement(targetGroupId, title, message);
        closeFormModal();
        showToast(`Announcement sent to ${sentCount} organization${sentCount === 1 ? '' : 's'}.`, 'success');
        if (appState.currentPage === 'audience-groups') {
            renderPage('audience-groups');
        }
    });
}

function sendAnnouncement(groupId, title, message) {
    const g = getAnnouncementGroupById(groupId);
    const recipients = getGroupMemberOrganizations(g);
    mockData.announcementLogs.push({
        id: Math.max(0, ...mockData.announcementLogs.map(x => x.id)) + 1,
        groupId: g.id,
        groupName: g.name,
        title,
        message,
        sentDate: new Date().toISOString().slice(0, 10),
        sentBy: 'NMHP Administrator',
        recipients
    });
    return recipients.length;
}

// ===== Announcement History (combined + per-group log) =====
function getFilteredAnnouncementLogs() {
    const query = announcementsView.historySearch.trim().toLowerCase();
    return mockData.announcementLogs
        .filter(l => !announcementsView.historyGroupFilter || l.groupName === announcementsView.historyGroupFilter)
        .filter(l => !query || l.title.toLowerCase().includes(query) || l.message.toLowerCase().includes(query))
        .slice()
        .sort((a, b) => b.sentDate.localeCompare(a.sentDate));
}

function renderAnnouncementHistoryPage() {
    const logs = getFilteredAnnouncementLogs();
    const groupNames = mockData.announcementGroups.map(g => g.name);

    const rowsHTML = logs.length
        ? logs.map(l => `
            <tr>
                <td>${escapeHtml(l.groupName)}</td>
                <td>
                    <div class="cell-primary">${escapeHtml(l.title)}</div>
                    <div class="cell-secondary">${escapeHtml(l.message)}</div>
                </td>
                <td>${escapeHtml(l.sentDate)}</td>
                <td>${l.recipients.length}</td>
                <td>${escapeHtml(l.sentBy)}</td>
            </tr>`).join('')
        : '<tr><td colspan="5" class="empty-cell">No announcements have been sent yet.</td></tr>';

    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Announcement History</h1>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="announcementHistorySearch" placeholder="Search announcements..." aria-label="Search announcements" value="${escapeHtml(announcementsView.historySearch)}" />
                </div>
                ${renderSelect('announcementHistoryGroupFilter', 'Group', groupNames, announcementsView.historyGroupFilter)}
            </div>
            <div class="result-count">${logs.length} announcement${logs.length === 1 ? '' : 's'}</div>
            <table class="data-table">
                <thead>
                    <tr><th>Group</th><th>Announcement</th><th>Sent Date</th><th>Recipients</th><th>Sent By</th></tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </div>`;
}

function attachAnnouncementHistoryListeners() {
    document.getElementById('announcementHistorySearch').addEventListener('input', (e) => {
        announcementsView.historySearch = e.target.value;
        renderPage('announcement-history');
        document.getElementById('announcementHistorySearch').focus();
    });

    document.getElementById('announcementHistoryGroupFilter').addEventListener('change', (e) => {
        announcementsView.historyGroupFilter = e.target.value;
        renderPage('announcement-history');
    });
}
