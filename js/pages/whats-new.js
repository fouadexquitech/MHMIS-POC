// ===== Administrator: What's New Management =====
// Manages the same release-notes content the NGO-facing Resources & Help >
// What's New page reads (mockData.resources.whatsNew) — this chunk only
// demonstrates the admin-side add/edit/delete flow, per instruction; the
// NGO-facing page's display is out of scope here.
let whatsNewView = {
    search: ''
};

function getFilteredWhatsNewEntries() {
    const query = whatsNewView.search.trim().toLowerCase();
    return mockData.resources.whatsNew.filter(w => !query || w.title.toLowerCase().includes(query));
}

function getWhatsNewEntryById(id) {
    return mockData.resources.whatsNew.find(w => w.id === id);
}

function renderWhatsNewManagementPage() {
    const entries = getFilteredWhatsNewEntries();
    const rowsHTML = entries.length
        ? entries.map(w => `
            <tr>
                <td class="cell-primary">${escapeHtml(w.title)}</td>
                <td class="cell-secondary">${escapeHtml(w.description)}</td>
                <td>${escapeHtml(w.date)}</td>
                <td class="actions-col">
                    <button class="icon-action" title="Edit" aria-label="Edit" data-action="edit" data-id="${w.id}"><i data-lucide="pencil"></i></button>
                    <button class="icon-action danger" title="Delete" aria-label="Delete" data-action="delete" data-id="${w.id}"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>`).join('')
        : '<tr><td colspan="4" class="empty-cell">No What\'s New entries match the current search.</td></tr>';

    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">What's New Management</h1>
                <button class="btn btn-primary" id="addWhatsNewBtn">
                    <i data-lucide="plus"></i><span>Add What's New</span>
                </button>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="whatsNewSearch" placeholder="Search What's New entries..." aria-label="Search What's New entries" value="${escapeHtml(whatsNewView.search)}" />
                </div>
            </div>
            <div class="result-count">${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}</div>
            <table class="data-table">
                <thead>
                    <tr><th>Title</th><th>Description</th><th>Date</th><th class="actions-col">Actions</th></tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </div>`;
}

function attachWhatsNewManagementListeners() {
    document.getElementById('whatsNewSearch').addEventListener('input', (e) => {
        whatsNewView.search = e.target.value;
        renderPage('whats-new-management');
        document.getElementById('whatsNewSearch').focus();
    });

    document.getElementById('addWhatsNewBtn').addEventListener('click', () => openWhatsNewForm());

    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-id'));
            const action = btn.getAttribute('data-action');
            if (action === 'edit') {
                openWhatsNewForm(id);
            } else if (action === 'delete') {
                confirmDeleteWhatsNewEntry(id);
            }
        });
    });
}

function openWhatsNewForm(id) {
    const editing = typeof id === 'number';
    const w = editing ? getWhatsNewEntryById(id) : { title: '', date: '', description: '' };

    openFormModal(editing ? 'Edit What\'s New Entry' : 'Add What\'s New Entry', `
        <form id="whatsNewForm" class="modal-form" novalidate>
            <div class="form-field">
                <label for="wn-title">Title <span class="required">*</span></label>
                <input type="text" id="wn-title" value="${escapeHtml(w.title)}" data-required="true" />
                <div class="field-error" id="wn-title-error"></div>
            </div>
            <div class="form-field">
                <label for="wn-date">Date <span class="required">*</span></label>
                <input type="text" id="wn-date" value="${escapeHtml(w.date)}" placeholder="e.g. August 2026" data-required="true" />
                <div class="field-error" id="wn-date-error"></div>
            </div>
            <div class="form-field">
                <label for="wn-description">Description <span class="required">*</span></label>
                <textarea id="wn-description" rows="3" data-required="true">${escapeHtml(w.description)}</textarea>
                <div class="field-error" id="wn-description-error"></div>
            </div>
        </form>`,
        `<button type="button" class="btn btn-secondary" id="cancelWhatsNewBtn">Cancel</button>
         <button type="button" class="btn btn-primary" id="saveWhatsNewBtn">${editing ? 'Save Changes' : 'Add Entry'}</button>`);

    document.getElementById('cancelWhatsNewBtn').addEventListener('click', closeFormModal);
    document.getElementById('saveWhatsNewBtn').addEventListener('click', () => {
        const form = document.getElementById('whatsNewForm');
        if (!validateModalForm(form)) {
            return;
        }

        const title = document.getElementById('wn-title').value.trim();
        const date = document.getElementById('wn-date').value.trim();
        const description = document.getElementById('wn-description').value.trim();

        if (editing) {
            w.title = title;
            w.date = date;
            w.description = description;
            showToast('What\'s New entry updated.', 'success');
        } else {
            mockData.resources.whatsNew.unshift({
                id: Math.max(0, ...mockData.resources.whatsNew.map(x => x.id)) + 1,
                title, date, description
            });
            // What's New has no block on the NGO home page: each new entry is
            // announced once through the notification bell instead.
            mockData.notifications.unshift({
                id: Math.max(0, ...mockData.notifications.map(n => n.id)) + 1,
                audience: 'ngo',
                type: 'system',
                title: `What\u2019s New: ${title}`,
                preview: description,
                fullContent: description,
                timestamp: 'Just now',
                unread: true,
                action: 'View What\u2019s New',
                resourceTopic: 'whats-new'
            });
            showToast('What\'s New entry added. Organizations are notified through the notification bell.', 'success');
        }
        closeFormModal();
        renderPage('whats-new-management');
    });
}

function confirmDeleteWhatsNewEntry(id) {
    const w = getWhatsNewEntryById(id);
    if (!w) {
        return;
    }
    showConfirmDialog({
        title: 'Delete What\'s New Entry',
        message: `Delete "${w.title}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        tone: 'danger',
        onConfirm: () => {
            mockData.resources.whatsNew = mockData.resources.whatsNew.filter(x => x.id !== id);
            showToast('What\'s New entry deleted.', 'success');
            renderPage('whats-new-management');
        }
    });
}
