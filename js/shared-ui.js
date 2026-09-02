// ===== Reusable Form Modal =====
function openFormModal(title, bodyHTML, footerHTML, wide) {
    document.getElementById('formModalTitle').textContent = title;
    document.getElementById('formModalBody').innerHTML = bodyHTML;
    document.getElementById('formModalFooter').innerHTML = footerHTML;
    const overlay = document.getElementById('formModalOverlay');
    overlay.classList.toggle('modal-wide', !!wide);
    overlay.style.display = 'flex';
    overlay.classList.add('show');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

function closeFormModal() {
    const overlay = document.getElementById('formModalOverlay');
    overlay.style.display = 'none';
    overlay.classList.remove('show');
    overlay.classList.remove('modal-wide');
}

// ===== Reusable Confirmation Dialog =====
// Single component for every "are you sure?" decision in the app (never use
// window.confirm). Pass tone: 'primary' for a neutral/positive action,
// 'danger' for one that revokes access or deletes data.
let confirmDialogHandler = null;

function showConfirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'primary', onConfirm }) {
    document.getElementById('confirmDialogTitle').textContent = title;
    document.getElementById('confirmDialogMessage').textContent = message;

    const confirmBtn = document.getElementById('confirmDialogConfirmBtn');
    confirmBtn.textContent = confirmLabel;
    confirmBtn.className = `btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`;
    document.getElementById('confirmDialogCancelBtn').textContent = cancelLabel;

    const icon = document.getElementById('confirmDialogIcon');
    icon.className = `confirm-dialog-icon confirm-dialog-icon-${tone}`;
    icon.innerHTML = `<i data-lucide="${tone === 'danger' ? 'triangle-alert' : 'circle-help'}"></i>`;

    const overlay = document.getElementById('confirmDialogOverlay');
    overlay.style.display = 'flex';
    overlay.classList.add('show');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }

    confirmDialogHandler = onConfirm;
}

function closeConfirmDialog() {
    const overlay = document.getElementById('confirmDialogOverlay');
    overlay.style.display = 'none';
    overlay.classList.remove('show');
    confirmDialogHandler = null;
}

// ===== Toast =====
function showToast(message, type = 'success') {
    // The login screen sits on the same dark-green brand background as a
    // success/info toast, so the toast is effectively invisible there — and
    // none of the login-flow confirmations need a toast to be understood.
    // Skip them entirely while the login screen is showing.
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen && !loginScreen.hidden) return;

    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const messageEl = document.createElement('span');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    toast.appendChild(messageEl);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Dismiss notification');
    closeBtn.innerHTML = '&times;';
    toast.appendChild(closeBtn);

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    let dismissTimer = setTimeout(dismiss, 5000);
    closeBtn.addEventListener('click', dismiss);

    function dismiss() {
        clearTimeout(dismissTimer);
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }
}

// ===== Shared list-page helpers =====
function renderSelect(id, label, options, selected) {
    const opts = options.map(o => `<option value="${escapeHtml(o)}"${o === selected ? ' selected' : ''}>${escapeHtml(o)}</option>`).join('');
    return `
        <div class="filter-group">
            <label for="${id}">${escapeHtml(label)}</label>
            <select id="${id}">
                <option value="">All</option>
                ${opts}
            </select>
        </div>`;
}

// ===== Reusable multi-select dropdown (search + checkbox list) =====
// A single global "click outside closes the open panel" listener, registered
// once here rather than per render, so opening/closing this component
// repeatedly (e.g. every time a modal is reopened) never piles up listeners.
document.addEventListener('click', (e) => {
    document.querySelectorAll('.multiselect').forEach(wrap => {
        if (!wrap.contains(e.target)) {
            const panel = wrap.querySelector('.multiselect-panel');
            if (panel) {
                panel.hidden = true;
            }
        }
    });
});

function renderMultiSelectDropdown(id, options, selectedValues, placeholder) {
    const normalized = options.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
    const selectedSet = new Set(selectedValues);
    const selectedLabels = normalized.filter(o => selectedSet.has(o.value)).map(o => o.label);
    const optionsHTML = normalized.map(o => `
        <label class="multiselect-option" data-label="${escapeHtml(o.label.toLowerCase())}">
            <input type="checkbox" value="${escapeHtml(o.value)}"${selectedSet.has(o.value) ? ' checked' : ''} />
            <span>${escapeHtml(o.label)}</span>
        </label>`).join('');

    return `
        <div class="multiselect">
            <button type="button" class="multiselect-control${selectedLabels.length ? ' has-value' : ''}" id="${id}-control">
                <span class="multiselect-value">${selectedLabels.length ? escapeHtml(selectedLabels.join(', ')) : escapeHtml(placeholder || 'Select...')}</span>
                <i data-lucide="chevron-down"></i>
            </button>
            <div class="multiselect-panel" id="${id}-panel" hidden>
                <div class="multiselect-search-wrap">
                    <i data-lucide="search"></i>
                    <input type="text" class="multiselect-search" id="${id}-search" placeholder="Search..." autocomplete="off" />
                </div>
                <div class="multiselect-options" id="${id}-options">${optionsHTML || '<div class="multiselect-empty">No options.</div>'}</div>
            </div>
            <input type="hidden" id="${id}" value="${selectedValues.join(',')}" />
        </div>`;
}

function attachMultiSelectDropdown(id, onChange) {
    const control = document.getElementById(`${id}-control`);
    const panel = document.getElementById(`${id}-panel`);
    const search = document.getElementById(`${id}-search`);
    const optionsContainer = document.getElementById(`${id}-options`);
    const hiddenInput = document.getElementById(id);
    const valueDisplay = control.querySelector('.multiselect-value');
    const placeholder = valueDisplay.textContent;

    const updateDisplay = () => {
        const checked = Array.from(optionsContainer.querySelectorAll('input[type="checkbox"]:checked'));
        const values = checked.map(cb => cb.value);
        const labels = checked.map(cb => cb.closest('label').querySelector('span').textContent);
        hiddenInput.value = values.join(',');
        control.classList.toggle('has-value', labels.length > 0);
        valueDisplay.textContent = labels.length ? labels.join(', ') : placeholder;
        if (onChange) {
            onChange(values);
        }
    };

    control.addEventListener('click', () => {
        const wasHidden = panel.hidden;
        document.querySelectorAll('.multiselect-panel').forEach(p => { p.hidden = true; });
        panel.hidden = !wasHidden;
        if (!panel.hidden && search) {
            search.value = '';
            optionsContainer.querySelectorAll('.multiselect-option').forEach(o => { o.style.display = ''; });
            search.focus();
        }
    });

    if (search) {
        search.addEventListener('input', () => {
            const query = search.value.trim().toLowerCase();
            optionsContainer.querySelectorAll('.multiselect-option').forEach(opt => {
                const label = opt.getAttribute('data-label') || '';
                opt.style.display = !query || label.includes(query) ? '' : 'none';
            });
        });
    }

    optionsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateDisplay);
    });
}

// ===== Organization profile: shared fields (used by the existing-NGO profile,
// the new-NGO registration profile, and the admin read-only review page, so
// all three always show the exact same organization fields) =====
function renderOrgProfileFields(values, readOnly) {
    const field = (id, label, value, required, type = 'text') => `
        <div class="form-field">
            <label for="${id}">${escapeHtml(label)}${required ? ' <span class="required">*</span>' : ''}</label>
            <input type="${type}" id="${id}" value="${escapeHtml(value || '')}"${required && !readOnly ? ' data-required="true"' : ''}${readOnly ? ' disabled' : ''} />
            <div class="field-error" id="${id}-error"></div>
        </div>`;

    return `
        <section class="profile-section">
            <h2 class="profile-section-title">General Information</h2>
            <div class="logo-row">
                <div class="logo-placeholder" aria-hidden="true">
                    <i data-lucide="image"></i>
                    <span>Logo</span>
                </div>
                ${readOnly ? '' : '<button type="button" class="btn btn-secondary" id="uploadLogoBtn">Upload Logo</button>'}
            </div>
            <div class="form-grid">
                ${field('profile-name', 'Organization Name', values.name, true)}
                ${field('profile-acronym', 'Acronym', values.acronym, false)}
            </div>
        </section>

        <section class="profile-section">
            <h2 class="profile-section-title">Contact Information</h2>
            <div class="form-grid">
                ${field('profile-phone', 'Institution Phone Number', values.phone, true)}
                ${field('profile-mobile', 'Institution Mobile Number', values.mobile, false)}
                ${field('profile-email', 'Institution Email', values.email, true, 'email')}
                ${field('profile-director-name', 'Director Name', values.directorName, true)}
                ${field('profile-director-email', 'Director Email', values.directorEmail, true, 'email')}
                ${field('profile-director-mobile', 'Director Mobile Number', values.directorMobile, false)}
            </div>
        </section>

        <section class="profile-section">
            <h2 class="profile-section-title">Areas of Work</h2>
            <div class="form-grid">
                ${field('profile-sectors', 'Sectors / Areas of Responsibility', values.sectors, false)}
            </div>
        </section>

        <section class="profile-section">
            <h2 class="profile-section-title">Online Presence</h2>
            <div class="form-grid">
                ${field('profile-website', 'Organization Website', values.website, false, 'url')}
                ${field('profile-linkedin', 'LinkedIn Profile', values.linkedin, false, 'url')}
                ${field('profile-daleel', 'Daleel Madani Link', values.daleelMadani, false, 'url')}
            </div>
        </section>`;
}

function collectOrgProfileFields(form) {
    return {
        name: form.querySelector('#profile-name').value.trim(),
        acronym: form.querySelector('#profile-acronym').value.trim(),
        phone: form.querySelector('#profile-phone').value.trim(),
        mobile: form.querySelector('#profile-mobile').value.trim(),
        email: form.querySelector('#profile-email').value.trim(),
        directorName: form.querySelector('#profile-director-name').value.trim(),
        directorEmail: form.querySelector('#profile-director-email').value.trim(),
        directorMobile: form.querySelector('#profile-director-mobile').value.trim(),
        sectors: form.querySelector('#profile-sectors').value.trim(),
        website: form.querySelector('#profile-website').value.trim(),
        linkedin: form.querySelector('#profile-linkedin').value.trim(),
        daleelMadani: form.querySelector('#profile-daleel').value.trim()
    };
}

// ===== Organization profile: focal persons grid (shared across every
// profile page) — an addable/editable list of contacts, each tagged with the
// reporting platform (4Ws, Substance Use) they're the focal point for. =====
const FOCAL_PLATFORMS = [
    { value: '4Ws', description: 'The 4Ws platform (Who, What, Where, When) tracks the mental health and psychosocial support activities your organization delivers, for national activity mapping.' },
    { value: 'Substance Use', description: 'The Substance Use platform collects data on your organization\'s substance use prevention, treatment, and harm-reduction activities for national reporting.' }
];

function focalPlatformDescription(platform) {
    const match = FOCAL_PLATFORMS.find(p => p.value === platform);
    return match ? match.description : '';
}

function renderFocalPersonsSection(focalPersons, readOnly) {
    const rowsHTML = focalPersons.length
        ? focalPersons.map((f, index) => `
            <tr>
                <td>${escapeHtml(f.area)}</td>
                <td>${escapeHtml(f.name || '-')}</td>
                <td>${escapeHtml(f.email || '-')}</td>
                <td>${escapeHtml(f.mobile || '-')}</td>
                ${readOnly ? '' : `<td class="actions-col">
                    <button type="button" class="icon-action" title="Edit" aria-label="Edit focal person" data-focal-action="edit" data-focal-index="${index}"><i data-lucide="pencil"></i></button>
                    <button type="button" class="icon-action danger" title="Remove" aria-label="Remove focal person" data-focal-action="remove" data-focal-index="${index}"><i data-lucide="trash-2"></i></button>
                </td>`}
            </tr>`).join('')
        : `<tr><td colspan="${readOnly ? 4 : 5}" class="empty-cell">No focal persons added yet.</td></tr>`;

    return `
        <section class="profile-section" id="focalPersonsSection">
            <div class="profile-section-header">
                <h2 class="profile-section-title">Organization Focal Persons</h2>
                ${readOnly ? '' : `<button type="button" class="btn btn-secondary" id="addFocalPersonBtn"><i data-lucide="plus"></i><span>Add Focal Person</span></button>`}
            </div>
            ${readOnly ? '' : '<p class="status-text">Add a contact for each reporting platform, such as 4Ws or Substance Use. Contact details aren\'t required right away — you can fill them in later.</p>'}
            <table class="data-table">
                <thead>
                    <tr><th>Platform</th><th>Name</th><th>Email</th><th>Mobile</th>${readOnly ? '' : '<th class="actions-col">Actions</th>'}</tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </section>`;
}

// `focalPersons` must be the live array (mutated in place) backing whichever
// profile is on screen; `onChange` fires after every add/edit/remove so the
// caller can persist the change and mark the page dirty.
function attachFocalPersonsSection(focalPersons, readOnly, onChange) {
    if (readOnly) {
        return;
    }

    const rerender = () => {
        document.getElementById('focalPersonsSection').outerHTML = renderFocalPersonsSection(focalPersons, false);
        attachFocalPersonsSection(focalPersons, false, onChange);
        refreshLucideIcons();
    };

    document.getElementById('addFocalPersonBtn').addEventListener('click', () => {
        openFocalPersonModal(null, (entry) => {
            focalPersons.push(entry);
            rerender();
            if (onChange) onChange();
        });
    });

    document.querySelectorAll('#focalPersonsSection [data-focal-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = Number(btn.getAttribute('data-focal-index'));
            const action = btn.getAttribute('data-focal-action');
            if (action === 'edit') {
                openFocalPersonModal(focalPersons[index], (entry) => {
                    focalPersons[index] = entry;
                    rerender();
                    if (onChange) onChange();
                });
            } else if (action === 'remove') {
                const f = focalPersons[index];
                showConfirmDialog({
                    title: 'Remove Focal Person',
                    message: `Remove the ${f.area} focal person${f.name ? ` "${f.name}"` : ''}?`,
                    confirmLabel: 'Remove',
                    tone: 'danger',
                    onConfirm: () => {
                        focalPersons.splice(index, 1);
                        rerender();
                        if (onChange) onChange();
                    }
                });
            }
        });
    });
}

function openFocalPersonModal(existing, onSave) {
    const editing = !!existing;
    const f = existing || { area: '', name: '', email: '', mobile: '' };
    const platformOpts = FOCAL_PLATFORMS.map(p => `<option value="${escapeHtml(p.value)}"${p.value === f.area ? ' selected' : ''}>${escapeHtml(p.value)}</option>`).join('');

    openFormModal(editing ? 'Edit Focal Person' : 'Add Focal Person', `
        <form id="focalPersonForm" class="modal-form" novalidate>
            <div class="form-field">
                <label for="focal-platform">Platform <span class="required">*</span></label>
                <select id="focal-platform" data-required="true">
                    <option value="">Select platform</option>
                    ${platformOpts}
                </select>
                <div class="field-error" id="focal-platform-error"></div>
                <p class="field-hint" id="focal-platform-hint">${escapeHtml(focalPlatformDescription(f.area))}</p>
            </div>
            <div class="form-field">
                <label for="focal-name">Name</label>
                <input type="text" id="focal-name" value="${escapeHtml(f.name || '')}" />
            </div>
            <div class="form-field">
                <label for="focal-email">Email</label>
                <input type="email" id="focal-email" value="${escapeHtml(f.email || '')}" />
                <div class="field-error" id="focal-email-error"></div>
            </div>
            <div class="form-field">
                <label for="focal-mobile">Mobile</label>
                <input type="text" id="focal-mobile" value="${escapeHtml(f.mobile || '')}" />
            </div>
        </form>`,
        `<button type="button" class="modal-btn" id="focalCancelBtn">Cancel</button>
         <button type="button" class="modal-btn primary" id="focalSaveBtn">${editing ? 'Save Changes' : 'Add Focal Person'}</button>`);

    document.getElementById('focal-platform').addEventListener('change', (e) => {
        document.getElementById('focal-platform-hint').textContent = focalPlatformDescription(e.target.value);
    });

    document.getElementById('focalCancelBtn').addEventListener('click', closeFormModal);
    document.getElementById('focalSaveBtn').addEventListener('click', () => {
        const form = document.getElementById('focalPersonForm');
        if (!validateModalForm(form)) {
            return;
        }
        const entry = {
            area: form.querySelector('#focal-platform').value,
            name: form.querySelector('#focal-name').value.trim(),
            email: form.querySelector('#focal-email').value.trim(),
            mobile: form.querySelector('#focal-mobile').value.trim()
        };
        closeFormModal();
        onSave(entry);
        showToast(editing ? 'Focal person updated.' : 'Focal person added.', 'success');
    });
}

