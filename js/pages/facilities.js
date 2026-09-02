// ===== Facilities =====
function renderFacilitiesPage() {
    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Facilities</h1>
                <button class="btn btn-primary" id="addFacilityBtn">
                    <i data-lucide="plus"></i><span>Add Facility</span>
                </button>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="facilitySearch" placeholder="Search facilities..." aria-label="Search facilities" />
                </div>
                ${renderSelect('facilityTypeFilter', 'Facility Type', mockData.facilityTypes, '')}
                ${renderSelect('facilityGovFilter', 'Governorate', mockData.governorates, '')}
            </div>
            <div class="result-count" id="facilityCount"></div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Facility Name</th><th>Facility Type</th><th>Governorate</th>
                        <th>Caza</th><th>Locality</th><th>Contact Number</th><th class="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody id="facilityTableBody"></tbody>
            </table>
        </div>`;
}

function attachFacilitiesListeners() {
    document.getElementById('addFacilityBtn').addEventListener('click', () => openFacilityForm());
    document.getElementById('facilitySearch').addEventListener('input', renderFacilityRows);
    document.getElementById('facilityTypeFilter').addEventListener('change', renderFacilityRows);
    document.getElementById('facilityGovFilter').addEventListener('change', renderFacilityRows);
    renderFacilityRows();
}

function getFilteredFacilities() {
    const q = (document.getElementById('facilitySearch')?.value || '').toLowerCase();
    const type = document.getElementById('facilityTypeFilter')?.value || '';
    const gov = document.getElementById('facilityGovFilter')?.value || '';
    return mockData.facilities.filter(f =>
        (!q || f.name.toLowerCase().includes(q) || f.locality.toLowerCase().includes(q)) &&
        (!type || f.type === type) &&
        (!gov || f.governorate === gov));
}

function renderFacilityRows() {
    const rows = getFilteredFacilities();
    const body = document.getElementById('facilityTableBody');
    document.getElementById('facilityCount').textContent = `${rows.length} facilit${rows.length === 1 ? 'y' : 'ies'} found`;
    if (rows.length === 0) {
        body.innerHTML = `<tr><td colspan="7" class="empty-row">No facilities match your filters.</td></tr>`;
        return;
    }
    body.innerHTML = rows.map(f => `
        <tr>
            <td>${escapeHtml(f.name)}</td>
            <td>${escapeHtml(f.type)}</td>
            <td>${escapeHtml(f.governorate)}</td>
            <td>${escapeHtml(f.caza)}</td>
            <td>${escapeHtml(f.locality)}</td>
            <td>${escapeHtml(f.contact)}</td>
            <td class="actions-col">
                <button class="icon-action" title="View" aria-label="View" data-action="view" data-id="${f.id}"><i data-lucide="eye"></i></button>
                <button class="icon-action" title="Edit" aria-label="Edit" data-action="edit" data-id="${f.id}"><i data-lucide="pencil"></i></button>
                <button class="icon-action danger" title="Delete" aria-label="Delete" data-action="delete" data-id="${f.id}"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>`).join('');
    body.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const action = btn.getAttribute('data-action');
            if (action === 'view') viewFacility(id);
            else if (action === 'edit') openFacilityForm(id);
            else if (action === 'delete') deleteFacility(id);
        });
    });
    if (window.lucide) window.lucide.createIcons();
}

function viewFacility(id) {
    const f = mockData.facilities.find(x => x.id === id);
    if (!f) return;
    const rows = [
        ['Facility Name', f.name], ['Facility Type', f.type], ['Governorate', f.governorate],
        ['Caza', f.caza], ['Locality', f.locality], ['Contact Number', f.contact]
    ];
    openFormModal('Facility Details',
        `<dl class="detail-list">${rows.map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('')}</dl>`,
        `<button class="modal-btn" id="detailCloseBtn">Close</button>`);
    document.getElementById('detailCloseBtn').addEventListener('click', closeFormModal);
}

function openFacilityForm(id) {
    const editing = typeof id === 'number';
    const f = editing ? mockData.facilities.find(x => x.id === id) : { name: '', type: '', governorate: '', caza: '', locality: '', contact: '' };
    const typeOpts = mockData.facilityTypes.map(t => `<option value="${escapeHtml(t)}"${t === f.type ? ' selected' : ''}>${escapeHtml(t)}</option>`).join('');
    const govOpts = mockData.governorates.map(g => `<option value="${escapeHtml(g)}"${g === f.governorate ? ' selected' : ''}>${escapeHtml(g)}</option>`).join('');
    openFormModal(editing ? 'Edit Facility' : 'Add Facility', `
        <form id="facilityForm" class="modal-form" novalidate>
            <div class="form-field">
                <label for="fac-name">Facility Name <span class="required">*</span></label>
                <input type="text" id="fac-name" value="${escapeHtml(f.name)}" data-required="true" />
                <div class="field-error" id="fac-name-error"></div>
            </div>
            <div class="form-field">
                <label for="fac-type">Facility Type <span class="required">*</span></label>
                <select id="fac-type" data-required="true"><option value="">Select type</option>${typeOpts}</select>
                <div class="field-error" id="fac-type-error"></div>
            </div>
            <div class="form-field">
                <label for="fac-gov">Governorate <span class="required">*</span></label>
                <select id="fac-gov" data-required="true"><option value="">Select governorate</option>${govOpts}</select>
                <div class="field-error" id="fac-gov-error"></div>
            </div>
            <div class="form-field">
                <label for="fac-caza">Caza</label>
                <input type="text" id="fac-caza" value="${escapeHtml(f.caza)}" />
            </div>
            <div class="form-field">
                <label for="fac-locality">Locality</label>
                <input type="text" id="fac-locality" value="${escapeHtml(f.locality)}" />
            </div>
            <div class="form-field">
                <label for="fac-contact">Contact Number</label>
                <input type="text" id="fac-contact" value="${escapeHtml(f.contact)}" />
            </div>
        </form>`,
        `<button class="modal-btn" id="facCancelBtn">Cancel</button>
         <button class="modal-btn primary" id="facSaveBtn">${editing ? 'Save Changes' : 'Add Facility'}</button>`);

    document.getElementById('facCancelBtn').addEventListener('click', closeFormModal);
    document.getElementById('facSaveBtn').addEventListener('click', () => {
        const form = document.getElementById('facilityForm');
        if (!validateModalForm(form)) return;
        const data = {
            name: form.querySelector('#fac-name').value.trim(),
            type: form.querySelector('#fac-type').value,
            governorate: form.querySelector('#fac-gov').value,
            caza: form.querySelector('#fac-caza').value.trim(),
            locality: form.querySelector('#fac-locality').value.trim(),
            contact: form.querySelector('#fac-contact').value.trim()
        };
        if (editing) {
            Object.assign(f, data);
            showToast('Facility updated successfully.', 'success');
        } else {
            data.id = Math.max(0, ...mockData.facilities.map(x => x.id)) + 1;
            mockData.facilities.push(data);
            showToast('Facility added successfully.', 'success');
        }
        closeFormModal();
        renderFacilityRows();
    });
}

function deleteFacility(id) {
    const f = mockData.facilities.find(x => x.id === id);
    if (!f) return;
    showConfirmDialog({
        title: 'Delete Facility',
        message: `Delete facility "${f.name}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        tone: 'danger',
        onConfirm: () => {
            mockData.facilities = mockData.facilities.filter(x => x.id !== id);
            showToast('Facility deleted.', 'success');
            renderFacilityRows();
        }
    });
}

