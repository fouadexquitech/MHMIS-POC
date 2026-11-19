// ===== Organization profile: shared parts =====
// One organization profile, shown in four places with the same four tabs
// (Organization Details, Focal Persons, Facilities, Providers):
//   - the approved NGO's Organization Profile (editable);
//   - the NGO's registration (editable until it is submitted, then locked);
//   - the administrator's Registration Review (read-only);
//   - the administrator's Organization Management (read-only, plus Users).

// ---------- Organization Details ----------
// Grouped as in the current MHIS profile. The labels are short because the
// section title already says whose phone or email it is.
const ORG_DETAIL_SECTIONS = [
    {
        title: 'Identity',
        logo: true,
        fields: [
            { key: 'name', id: 'profile-name', label: 'Organization Name', required: true, errorLabel: 'organization name' },
            { key: 'acronym', id: 'profile-acronym', label: 'Acronym' }
        ]
    },
    {
        title: 'Contact Details',
        fields: [
            { key: 'phone', id: 'profile-phone', label: 'Phone Number', required: true, errorLabel: 'phone number' },
            { key: 'mobile', id: 'profile-mobile', label: 'Mobile Number' },
            { key: 'email', id: 'profile-email', label: 'Email', required: true, type: 'email', errorLabel: 'organization email' }
        ]
    },
    {
        title: 'Director',
        fields: [
            { key: 'directorName', id: 'profile-director-name', label: 'Name', required: true, errorLabel: 'director name' },
            { key: 'directorEmail', id: 'profile-director-email', label: 'Email', required: true, type: 'email', errorLabel: 'director email' },
            { key: 'directorMobile', id: 'profile-director-mobile', label: 'Mobile Number', required: true, errorLabel: 'director mobile number' }
        ]
    },
    { title: 'Areas of Responsibility (AORs)', aors: true, fields: [] },
    {
        title: 'Links',
        fields: [
            { key: 'website', id: 'profile-website', label: 'Website', type: 'url' },
            { key: 'linkedin', id: 'profile-linkedin', label: 'LinkedIn Profile', type: 'url' },
            { key: 'daleelMadani', id: 'profile-daleel', label: 'Daleel Madani', type: 'url' }
        ]
    }
];

const AOR_QUESTION = 'Does your organization participate in any sector or area of responsibility?';

function getOrgDetailFields() {
    return ORG_DETAIL_SECTIONS.flatMap(section => section.fields);
}

// Required Organization Details fields that are still empty.
function countMissingOrgDetails(values) {
    return getOrgDetailFields().filter(f => f.required && !String(values[f.key] || '').trim()).length;
}

function renderOrgDetailsForm(values) {
    const field = f => `
        <div class="form-field">
            <label for="${f.id}">${escapeHtml(f.label)}${f.required ? ' <span class="required">*</span>' : ''}</label>
            <input type="${f.type || 'text'}" id="${f.id}" value="${escapeHtml(values[f.key] || '')}"${f.required ? ' data-required="true"' : ''}${f.errorLabel ? ` data-error-label="${escapeHtml(f.errorLabel)}"` : ''} />
            <div class="field-error" id="${f.id}-error"></div>
        </div>`;

    return ORG_DETAIL_SECTIONS.map(section => `
        <section class="profile-section">
            <h2 class="profile-section-title">${escapeHtml(section.title)}</h2>
            ${section.logo ? `
            <div class="logo-row">
                <div class="logo-placeholder" aria-hidden="true"><i data-lucide="image"></i><span>Logo</span></div>
                <button type="button" class="btn btn-secondary" id="uploadLogoBtn">Upload Logo</button>
            </div>` : ''}
            ${section.aors ? renderAorEditor(values) : `<div class="form-grid">${section.fields.map(field).join('')}</div>`}
        </section>`).join('');
}

// The AORs question, and the sector list shown only when the answer is Yes.
function renderAorEditor(values) {
    const selected = new Set(values.aors || []);
    const participates = !!values.participatesInAors;
    return `
        <label class="switch-field" for="profile-aors-toggle">
            <input type="checkbox" id="profile-aors-toggle" role="switch"${participates ? ' checked' : ''} />
            <span>${escapeHtml(AOR_QUESTION)}</span>
        </label>
        <div class="aor-grid" id="profileAorGrid" role="group" aria-label="Sectors / Areas of Work (AORs)"${participates ? '' : ' hidden'}>
            ${mockData.aorSectors.map(sector => `
            <label class="aor-option">
                <input type="checkbox" name="profile-aor" value="${escapeHtml(sector)}"${selected.has(sector) ? ' checked' : ''} />
                <span>${escapeHtml(sector)}</span>
            </label>`).join('')}
        </div>`;
}

function collectOrgDetails(form) {
    const values = {};
    getOrgDetailFields().forEach(f => {
        values[f.key] = form.querySelector(`#${f.id}`).value.trim();
    });
    values.participatesInAors = form.querySelector('#profile-aors-toggle').checked;
    values.aors = values.participatesInAors
        ? Array.from(form.querySelectorAll('input[name="profile-aor"]:checked')).map(cb => cb.value)
        : [];
    return values;
}

// The AORs question shows or hides the sector list, the logo upload is
// simulated, and any change calls onEdit (to mark the form as edited).
function attachOrgDetailsForm(form, onEdit) {
    const toggle = form.querySelector('#profile-aors-toggle');
    toggle.addEventListener('change', () => {
        form.querySelector('#profileAorGrid').hidden = !toggle.checked;
    });
    form.querySelector('#uploadLogoBtn')?.addEventListener('click', () => {
        showToast('Logo upload is simulated in this POC.', 'info');
    });
    ['input', 'change'].forEach(type => form.addEventListener(type, () => {
        if (onEdit) onEdit();
    }));
}

function renderOrgDetailsReadOnly(values) {
    const value = v => (String(v || '').trim() ? escapeHtml(v) : '<span class="detail-empty">Not provided</span>');
    return `
        <div class="profile-stack">
            ${ORG_DETAIL_SECTIONS.map(section => {
                let body;
                if (section.aors) {
                    body = values.participatesInAors && (values.aors || []).length
                        ? `<div class="chip-list">${values.aors.map(a => `<span class="chip">${escapeHtml(a)}</span>`).join('')}</div>`
                        : '<p class="detail-empty">Does not participate in any sector or area of responsibility.</p>';
                } else {
                    body = `<dl class="detail-grid">${section.fields.map(f => `<div><dt>${escapeHtml(f.label)}</dt><dd>${value(values[f.key])}</dd></div>`).join('')}</dl>`;
                }
                return `
                <section class="profile-section">
                    <h2 class="profile-section-title">${escapeHtml(section.title)}</h2>
                    ${body}
                </section>`;
            }).join('')}
        </div>`;
}

// A registration record stores the organization name as `organization`; the
// profile forms work with the same keys as an approved NGO's profile.
function getRegistrationProfileValues(r) {
    return {
        name: r.organization, acronym: r.acronym, phone: r.phone, mobile: r.mobile, email: r.email,
        directorName: r.directorName, directorEmail: r.directorEmail, directorMobile: r.directorMobile,
        participatesInAors: !!r.participatesInAors, aors: r.aors || [],
        website: r.website, linkedin: r.linkedin, daleelMadani: r.daleelMadani
    };
}

function applyProfileValuesToRegistration(r, values) {
    r.organization = values.name;
    r.acronym = values.acronym;
    r.phone = values.phone;
    r.mobile = values.mobile;
    r.email = values.email;
    r.directorName = values.directorName;
    r.directorEmail = values.directorEmail;
    r.directorMobile = values.directorMobile;
    r.participatesInAors = values.participatesInAors;
    r.aors = values.aors;
    r.website = values.website;
    r.linkedin = values.linkedin;
    r.daleelMadani = values.daleelMadani;
}

// ---------- Focal Persons ----------
// Two sections: the people who report in the 4Ws Platform, and the people
// who fill the Substance Use surveys.
const FOCAL_PERSON_AREAS = [
    { value: '4Ws', title: '4Ws Focal Persons', hint: 'The people who report your organization’s activities in the 4Ws Platform.' },
    { value: 'Substance Use', title: 'Substance Use Focal Persons', hint: 'The people who fill your substance use surveys. Only for organizations that provide substance use services.' }
];

function renderFocalPersonsTab(focalPersons, { readOnly = false, areas = ['4Ws', 'Substance Use'] } = {}) {
    const sections = FOCAL_PERSON_AREAS.filter(area => areas.includes(area.value)).map(area => {
        const rows = focalPersons
            .map((person, index) => ({ person, index }))
            .filter(row => row.person.area === area.value);
        const rowsHTML = rows.length
            ? rows.map(({ person, index }) => `
                <tr>
                    <td class="cell-primary">${escapeHtml(person.name || '-')}</td>
                    <td>${escapeHtml(person.email || '-')}</td>
                    <td>${escapeHtml(person.mobile || '-')}</td>
                    ${readOnly ? '' : `<td class="actions-col">
                        <button type="button" class="icon-action" title="Edit" aria-label="Edit ${escapeHtml(person.name || 'focal person')}" data-focal-action="edit" data-focal-index="${index}"><i data-lucide="pencil"></i></button>
                        <button type="button" class="icon-action danger" title="Remove" aria-label="Remove ${escapeHtml(person.name || 'focal person')}" data-focal-action="remove" data-focal-index="${index}"><i data-lucide="trash-2"></i></button>
                    </td>`}
                </tr>`).join('')
            : `<tr><td colspan="${readOnly ? 3 : 4}" class="empty-cell">No ${escapeHtml(area.value)} focal person added yet.</td></tr>`;

        return `
            <section class="profile-section">
                <div class="profile-section-header">
                    <h2 class="profile-section-title">${escapeHtml(area.title)}</h2>
                    ${readOnly ? '' : `<button type="button" class="btn btn-secondary" data-focal-add="${escapeHtml(area.value)}"><i data-lucide="plus"></i><span>Add Focal Person</span></button>`}
                </div>
                ${readOnly ? '' : `<p class="status-text">${escapeHtml(area.hint)}</p>`}
                <table class="data-table">
                    <thead>
                        <tr><th>Name</th><th>Email</th><th>Mobile</th>${readOnly ? '' : '<th class="actions-col">Actions</th>'}</tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
            </section>`;
    }).join('');
    return `<div class="profile-stack" id="focalPersonsTab">${sections}</div>`;
}

// `focalPersons` is the live array of the profile on screen, changed in
// place. Each change is kept at once (no Save button); onChange lets the
// page persist it.
function attachFocalPersonsTab(focalPersons, { areas, onChange } = {}) {
    const rerender = () => {
        document.getElementById('focalPersonsTab').outerHTML = renderFocalPersonsTab(focalPersons, { areas });
        attachFocalPersonsTab(focalPersons, { areas, onChange });
        refreshLucideIcons();
        if (onChange) onChange();
    };

    document.querySelectorAll('#focalPersonsTab [data-focal-add]').forEach(btn => {
        btn.addEventListener('click', () => {
            openFocalPersonModal(null, btn.getAttribute('data-focal-add'), entry => {
                focalPersons.push(entry);
                rerender();
            });
        });
    });

    document.querySelectorAll('#focalPersonsTab [data-focal-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = Number(btn.getAttribute('data-focal-index'));
            const person = focalPersons[index];
            if (btn.getAttribute('data-focal-action') === 'edit') {
                openFocalPersonModal(person, person.area, entry => {
                    focalPersons[index] = entry;
                    rerender();
                });
                return;
            }
            showConfirmDialog({
                title: 'Remove Focal Person',
                message: `Remove the ${person.area} focal person${person.name ? ` "${person.name}"` : ''}?`,
                confirmLabel: 'Remove',
                tone: 'danger',
                onConfirm: () => {
                    focalPersons.splice(index, 1);
                    rerender();
                    showToast('Focal person removed.', 'success');
                }
            });
        });
    });
}

function openFocalPersonModal(existing, area, onSave) {
    const editing = !!existing;
    const person = existing || { name: '', email: '', mobile: '' };

    openFormModal(`${editing ? 'Edit' : 'Add'} ${area} Focal Person`, `
        <form id="focalPersonForm" class="modal-form" novalidate>
            <div class="form-field">
                <label for="focal-name">Name <span class="required">*</span></label>
                <input type="text" id="focal-name" value="${escapeHtml(person.name || '')}" data-required="true" data-error-label="the focal person's name" />
                <div class="field-error" id="focal-name-error"></div>
            </div>
            <div class="form-field">
                <label for="focal-email">Email</label>
                <input type="email" id="focal-email" value="${escapeHtml(person.email || '')}" />
                <div class="field-error" id="focal-email-error"></div>
            </div>
            <div class="form-field">
                <label for="focal-mobile">Mobile</label>
                <input type="text" id="focal-mobile" value="${escapeHtml(person.mobile || '')}" />
            </div>
        </form>`,
        `<button type="button" class="modal-btn" id="focalCancelBtn">Cancel</button>
         <button type="button" class="modal-btn primary" id="focalSaveBtn">${editing ? 'Save Changes' : 'Add Focal Person'}</button>`);

    document.getElementById('focalCancelBtn').addEventListener('click', closeFormModal);
    document.getElementById('focalSaveBtn').addEventListener('click', () => {
        const form = document.getElementById('focalPersonForm');
        if (!validateModalForm(form)) {
            return;
        }
        const entry = {
            ...(existing && existing.id ? { id: existing.id } : {}),
            area,
            name: form.querySelector('#focal-name').value.trim(),
            email: form.querySelector('#focal-email').value.trim(),
            mobile: form.querySelector('#focal-mobile').value.trim()
        };
        closeFormModal();
        onSave(entry);
        if (editing) {
            showToast('Focal person updated.', 'success');
        } else {
            showToast('Focal person added.', 'success');
        }
    });
}

// ---------- Tabs ----------
// The four tabs every organization profile shows. The read-only views add
// the number of records to the labels.
function getOrgProfileTabs(counts) {
    const label = (text, key) => (counts ? `${text} (${counts[key]})` : text);
    return [
        { id: 'details', label: 'Organization Details', icon: 'building-2' },
        { id: 'focal-persons', label: label('Focal Persons', 'focalPersons'), icon: 'contact' },
        { id: 'facilities', label: label('Facilities', 'facilities'), icon: 'building' },
        { id: 'providers', label: label('Providers', 'providers'), icon: 'users' }
    ];
}

function renderProfileTabs(tabs, activeId) {
    return `
        <div class="tabs" role="tablist">
            ${tabs.map(tab => `
            <button type="button" class="tab${tab.id === activeId ? ' active' : ''}" role="tab" aria-selected="${tab.id === activeId}" data-profile-tab="${tab.id}">
                <i data-lucide="${tab.icon}"></i><span>${escapeHtml(tab.label)}</span>
            </button>`).join('')}
        </div>`;
}

function renderProfilePanel(id, activeId, html) {
    return `<div class="tab-panel${id === activeId ? ' active' : ''}" role="tabpanel" data-profile-panel="${id}">${html}</div>`;
}

// Panels stay in the page, so switching tabs never loses what was typed.
function showProfileTab(id) {
    document.querySelectorAll('[data-profile-tab]').forEach(tab => {
        const active = tab.getAttribute('data-profile-tab') === id;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('[data-profile-panel]').forEach(panel => {
        panel.classList.toggle('active', panel.getAttribute('data-profile-panel') === id);
    });
}

function attachProfileTabs(onSwitch) {
    document.querySelectorAll('[data-profile-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-profile-tab');
            showProfileTab(id);
            if (onSwitch) onSwitch(id);
        });
    });
}

// ---------- Facilities and Providers (read-only) ----------
const ORGANIZATION_FACILITY_FIELDS = [
    ['Facility Name', 'name'], ['Facility Type', 'type'], ['Governorate', 'governorate'],
    ['Caza', 'caza'], ['Locality', 'locality'], ['Contact Number', 'contact']
];

const ORGANIZATION_PROVIDER_FIELDS = [
    ['Provider Name', 'name'], ['Provider Type / Profession', 'type'],
    ['Facility', 'facility'], ['Phone', 'phone'], ['Email', 'email']
];

function renderOrganizationRecordsTable(kind, records, { exportable = true } = {}) {
    const isFacility = kind === 'facility';
    const fields = isFacility ? ORGANIZATION_FACILITY_FIELDS : ORGANIZATION_PROVIDER_FIELDS;
    const rowsHTML = records.length
        ? records.map((record, index) => `
            <tr>
                ${fields.map(([, key]) => `<td>${escapeHtml(record[key] || '-')}</td>`).join('')}
                <td class="actions-col">
                    <button type="button" class="icon-action" title="View Details" aria-label="View details of ${escapeHtml(record.name || '')}" data-org-record="${kind}" data-org-record-index="${index}"><i data-lucide="eye"></i></button>
                </td>
            </tr>`).join('')
        : `<tr><td colspan="${fields.length + 1}" class="empty-cell">${isFacility ? 'No facilities added.' : 'No providers added.'}</td></tr>`;

    return `
        <div class="list-toolbar organization-records-toolbar">
            <div class="result-count">${records.length} ${isFacility ? `facilit${records.length === 1 ? 'y' : 'ies'}` : `provider${records.length === 1 ? '' : 's'}`}</div>
            ${exportable ? `<button type="button" class="btn btn-secondary" data-org-export="${kind}">
                <i data-lucide="download"></i><span>Export</span>
            </button>` : ''}
        </div>
        <table class="data-table">
            <thead>
                <tr>${fields.map(([label]) => `<th>${escapeHtml(label)}</th>`).join('')}<th class="actions-col">Actions</th></tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
        </table>`;
}

function attachOrganizationRecordsTables(facilities, providers, organizationName) {
    document.querySelectorAll('[data-org-record]').forEach(btn => {
        btn.addEventListener('click', () => {
            const isFacility = btn.getAttribute('data-org-record') === 'facility';
            const record = (isFacility ? facilities : providers)[Number(btn.getAttribute('data-org-record-index'))];
            const fields = isFacility ? ORGANIZATION_FACILITY_FIELDS : ORGANIZATION_PROVIDER_FIELDS;
            openFormModal(isFacility ? 'Facility Details' : 'Provider Details',
                `<dl class="detail-list">${fields.map(([label, key]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(record[key] || '-')}</dd></div>`).join('')}</dl>`,
                `<button class="modal-btn" id="detailCloseBtn">Close</button>`);
            document.getElementById('detailCloseBtn').addEventListener('click', closeFormModal);
        });
    });

    document.querySelectorAll('[data-org-export]').forEach(btn => {
        btn.addEventListener('click', () => {
            const kind = btn.getAttribute('data-org-export') === 'facility' ? 'facilities' : 'providers';
            showToast(`Exporting ${organizationName}'s ${kind} is simulated in this POC.`, 'info');
        });
    });
}
