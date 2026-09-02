// ===== Providers =====
function renderProvidersPage() {
    const facilityNames = mockData.facilities.map(f => f.name);
    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Providers</h1>
                <button class="btn btn-primary" id="addProviderBtn">
                    <i data-lucide="plus"></i><span>Add Provider</span>
                </button>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="providerSearch" placeholder="Search providers..." aria-label="Search providers" />
                </div>
                ${renderSelect('providerFacilityFilter', 'Facility', facilityNames, '')}
                ${renderSelect('providerTypeFilter', 'Provider Type', mockData.providerTypes, '')}
            </div>
            <div class="result-count" id="providerCount"></div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Provider Name</th><th>Provider Type / Profession</th><th>Facility</th>
                        <th>Phone</th><th>Email</th><th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody id="providerTableBody"></tbody>
            </table>
        </div>`;
}

function attachProvidersListeners() {
    document.getElementById('addProviderBtn').addEventListener('click', () => openProviderForm());
    document.getElementById('providerSearch').addEventListener('input', renderProviderRows);
    document.getElementById('providerFacilityFilter').addEventListener('change', renderProviderRows);
    document.getElementById('providerTypeFilter').addEventListener('change', renderProviderRows);
    renderProviderRows();
}

function getFilteredProviders() {
    const q = (document.getElementById('providerSearch')?.value || '').toLowerCase();
    const facility = document.getElementById('providerFacilityFilter')?.value || '';
    const type = document.getElementById('providerTypeFilter')?.value || '';
    return mockData.providers.filter(p =>
        (!q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)) &&
        (!facility || p.facility === facility) &&
        (!type || p.type === type));
}

function renderProviderRows() {
    const rows = getFilteredProviders();
    const body = document.getElementById('providerTableBody');
    document.getElementById('providerCount').textContent = `${rows.length} provider${rows.length === 1 ? '' : 's'} found`;
    if (rows.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="empty-row">No providers match your filters.</td></tr>`;
        return;
    }
    body.innerHTML = rows.map(p => `
        <tr>
            <td>${escapeHtml(p.name)}</td>
            <td>${escapeHtml(p.type)}</td>
            <td>${escapeHtml(p.facility)}</td>
            <td>${escapeHtml(p.phone)}</td>
            <td>${escapeHtml(p.email)}</td>
            <td class="actions-col">
                <button class="icon-action" title="View" aria-label="View" data-action="view" data-id="${p.id}"><i data-lucide="eye"></i></button>
                <button class="icon-action" title="Edit" aria-label="Edit" data-action="edit" data-id="${p.id}"><i data-lucide="pencil"></i></button>
                <button class="icon-action danger" title="Delete" aria-label="Delete" data-action="delete" data-id="${p.id}"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>`).join('');
    body.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const action = btn.getAttribute('data-action');
            if (action === 'view') viewProvider(id);
            else if (action === 'edit') openProviderForm(id);
            else if (action === 'delete') deleteProvider(id);
        });
    });
    if (window.lucide) window.lucide.createIcons();
}

function viewProvider(id) {
    const p = mockData.providers.find(x => x.id === id);
    if (!p) return;
    const rows = [
        ['Provider Name', p.name], ['Provider Type / Profession', p.type],
        ['Facility', p.facility], ['Phone', p.phone], ['Email', p.email]
    ];
    openFormModal('Provider Details',
        `<dl class="detail-list">${rows.map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('')}</dl>`,
        `<button class="modal-btn" id="detailCloseBtn">Close</button>`);
    document.getElementById('detailCloseBtn').addEventListener('click', closeFormModal);
}

function openProviderForm(id) {
    const editing = typeof id === 'number';
    const p = editing ? mockData.providers.find(x => x.id === id) : { name: '', type: '', facility: '', phone: '', email: '' };
    const typeOpts = mockData.providerTypes.map(t => `<option value="${escapeHtml(t)}"${t === p.type ? ' selected' : ''}>${escapeHtml(t)}</option>`).join('');
    const facOpts = mockData.facilities.map(fac => `<option value="${escapeHtml(fac.name)}"${fac.name === p.facility ? ' selected' : ''}>${escapeHtml(fac.name)}</option>`).join('');
    openFormModal(editing ? 'Edit Provider' : 'Add Provider', `
        <form id="providerForm" class="modal-form" novalidate>
            <div class="form-field">
                <label for="prov-name">Provider Name <span class="required">*</span></label>
                <input type="text" id="prov-name" value="${escapeHtml(p.name)}" data-required="true" />
                <div class="field-error" id="prov-name-error"></div>
            </div>
            <div class="form-field">
                <label for="prov-type">Provider Type / Profession <span class="required">*</span></label>
                <select id="prov-type" data-required="true"><option value="">Select type</option>${typeOpts}</select>
                <div class="field-error" id="prov-type-error"></div>
            </div>
            <div class="form-field">
                <label for="prov-facility">Facility <span class="required">*</span></label>
                <select id="prov-facility" data-required="true"><option value="">Select facility</option>${facOpts}</select>
                <div class="field-error" id="prov-facility-error"></div>
            </div>
            <div class="form-field">
                <label for="prov-phone">Phone</label>
                <input type="text" id="prov-phone" value="${escapeHtml(p.phone)}" />
            </div>
            <div class="form-field">
                <label for="prov-email">Email</label>
                <input type="email" id="prov-email" value="${escapeHtml(p.email)}" />
                <div class="field-error" id="prov-email-error"></div>
            </div>
        </form>`,
        `<button class="modal-btn" id="provCancelBtn">Cancel</button>
         <button class="modal-btn primary" id="provSaveBtn">${editing ? 'Save Changes' : 'Add Provider'}</button>`);

    document.getElementById('provCancelBtn').addEventListener('click', closeFormModal);
    document.getElementById('provSaveBtn').addEventListener('click', () => {
        const form = document.getElementById('providerForm');
        if (!validateModalForm(form)) return;
        const data = {
            name: form.querySelector('#prov-name').value.trim(),
            type: form.querySelector('#prov-type').value,
            facility: form.querySelector('#prov-facility').value,
            phone: form.querySelector('#prov-phone').value.trim(),
            email: form.querySelector('#prov-email').value.trim()
        };
        if (editing) {
            Object.assign(p, data);
            showToast('Provider updated successfully.', 'success');
        } else {
            data.id = Math.max(0, ...mockData.providers.map(x => x.id)) + 1;
            mockData.providers.push(data);
            showToast('Provider added successfully.', 'success');
        }
        closeFormModal();
        renderProviderRows();
    });
}

function deleteProvider(id) {
    const p = mockData.providers.find(x => x.id === id);
    if (!p) return;
    showConfirmDialog({
        title: 'Delete Provider',
        message: `Delete provider "${p.name}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        tone: 'danger',
        onConfirm: () => {
            mockData.providers = mockData.providers.filter(x => x.id !== id);
            showToast('Provider deleted.', 'success');
            renderProviderRows();
        }
    });
}

// Shared validation for modal forms (required inputs/selects + email format)
function validateModalForm(form) {
    let valid = true;
    form.querySelectorAll('.field-error').forEach(el => (el.textContent = ''));
    form.querySelectorAll('input, select').forEach(el => el.classList.remove('invalid'));

    form.querySelectorAll('[data-required="true"]').forEach(input => {
        const errorEl = document.getElementById(`${input.id}-error`);
        if (!input.value.trim()) {
            input.classList.add('invalid');
            if (errorEl) errorEl.textContent = 'This field is required.';
            valid = false;
        }
    });
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        emailInput.classList.add('invalid');
        const errorEl = document.getElementById(`${emailInput.id}-error`);
        if (errorEl) errorEl.textContent = 'Enter a valid email address.';
        valid = false;
    }
    return valid;
}

