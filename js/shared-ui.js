// ===== Keyboard access for click-only elements =====
// Some cards, tiles and list rows are styled <div>s with a click handler.
// This makes them reachable with Tab and operable with Enter/Space, without
// changing how they look. Call it after rendering, on the same elements that
// get the click listener.
function makeKeyboardActivatable(elements) {
    elements.forEach(el => {
        if (el.dataset.kbActivatable) return;
        el.dataset.kbActivatable = 'true';
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                el.click();
            }
        });
    });
}

// ===== Dialog focus =====
// Where focus was before a dialog opened, so closing it can send focus back.
const dialogReturnFocus = {};

function rememberFocusFor(dialogId) {
    dialogReturnFocus[dialogId] = document.activeElement;
}

function restoreFocusFor(dialogId) {
    const el = dialogReturnFocus[dialogId];
    delete dialogReturnFocus[dialogId];
    if (el && document.contains(el) && typeof el.focus === 'function') {
        el.focus();
    }
}

function focusFirstIn(container) {
    const target = container.querySelector('input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex="0"]');
    if (target) target.focus();
    return !!target;
}

// ===== Shared field validation =====
// One behaviour for every form (design-kit ux-patterns §3, §3.1):
// - the message appears in the field's own reserved slot (.field-error), so
//   nothing on the page moves;
// - the message says how to fix it, built from the field's label
//   ("Enter organization name", "Select governorate");
// - the field is marked aria-invalid and linked to its message;
// - the message clears as soon as the field is fixed;
// - on submit, focus goes to the first invalid field (scrolled into view);
//   long forms also show "N fields need attention" next to their submit button.
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldLabelText(input) {
    // A short label can be ambiguous in a message ("Enter email"), so a field
    // may name itself for its messages: data-error-label="director email".
    if (input.dataset && input.dataset.errorLabel) {
        return input.dataset.errorLabel;
    }
    const label = input.id ? document.querySelector(`label[for="${input.id}"]`) : null;
    const raw = label ? label.textContent : (input.getAttribute('aria-label') || '');
    return raw.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
}

// "Organization Name" → "organization name", but keep acronyms ("NGO", "URL").
function labelForSentence(text) {
    return text.split(' ').map(w => (w.length > 1 && w === w.toUpperCase()) ? w : w.toLowerCase()).join(' ');
}

function requiredFieldMessage(input) {
    const label = labelForSentence(fieldLabelText(input)) || 'this field';
    if (input.tagName === 'SELECT') return `Select ${label}`;
    if (input.type === 'checkbox') return `Confirm ${label}`;
    if (input.type === 'date') return `Choose ${label}`;
    return `Enter ${label}`;
}

function fieldErrorElement(input) {
    return input.id ? document.getElementById(`${input.id}-error`) : null;
}

function setFieldError(input, message) {
    input.classList.add('invalid');
    input.setAttribute('aria-invalid', 'true');
    const errorEl = fieldErrorElement(input);
    if (errorEl) {
        errorEl.textContent = message;
        const described = (input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
        if (!described.includes(errorEl.id)) {
            described.unshift(errorEl.id);
            input.setAttribute('aria-describedby', described.join(' '));
        }
    }
    enableLiveFieldClearing(input);
}

function clearFieldError(input) {
    input.classList.remove('invalid');
    input.removeAttribute('aria-invalid');
    const errorEl = fieldErrorElement(input);
    if (errorEl) errorEl.textContent = '';
}

function isFieldEmpty(input) {
    if (input.type === 'checkbox') return !input.checked;
    return !String(input.value || '').trim();
}

// What a field's error is right now ('' when it is fine).
function fieldProblem(input) {
    if (input.dataset.required === 'true' && isFieldEmpty(input)) {
        return requiredFieldMessage(input);
    }
    if (input.type === 'email' && input.value.trim() && !EMAIL_FORMAT.test(input.value.trim())) {
        return 'Enter a valid email address, like name@organization.org';
    }
    return '';
}

// Once a field has shown an error, re-check it as the user types and clear
// the message the moment it is fixed (never add new errors while typing).
function enableLiveFieldClearing(input) {
    if (input.dataset.liveClear) return;
    input.dataset.liveClear = 'true';
    const recheck = () => {
        if (input.classList.contains('invalid') && !fieldProblem(input)) {
            clearFieldError(input);
            updateFormErrorCount(input.closest('form'));
        }
    };
    input.addEventListener('input', recheck);
    input.addEventListener('change', recheck);
}

function focusFirstInvalid(inputs) {
    const first = inputs[0];
    if (!first) return;
    first.scrollIntoView({ block: 'center', behavior: 'smooth' });
    first.focus({ preventScroll: true });
}

// Validates every [data-required] field (plus email format) in the form,
// shows the messages, moves focus to the first problem, and returns
// whether the form is valid.
function validateForm(form, { countNearSubmit = false } = {}) {
    const fields = Array.from(form.querySelectorAll('input, select, textarea'))
        .filter(el => !el.disabled && el.type !== 'hidden');
    const invalid = [];
    fields.forEach(input => {
        const problem = fieldProblem(input);
        if (problem) {
            setFieldError(input, problem);
            invalid.push(input);
        } else {
            clearFieldError(input);
        }
    });
    if (countNearSubmit) {
        form.dataset.errorCount = 'true';
    }
    updateFormErrorCount(form);
    focusFirstInvalid(invalid);
    return invalid.length === 0;
}

// "3 fields need attention" next to a long form's submit button. The slot
// is created once and keeps its space, so showing it never moves anything.
function updateFormErrorCount(form) {
    if (!form || form.dataset.errorCount !== 'true') return;
    const submit = form.id ? document.querySelector(`button[type="submit"][form="${form.id}"]`) || form.querySelector('button[type="submit"]') : form.querySelector('button[type="submit"]');
    if (!submit) return;
    let slot = submit.parentElement.querySelector('.form-error-count');
    if (!slot) {
        slot = document.createElement('span');
        slot.className = 'form-error-count';
        slot.setAttribute('role', 'status');
        submit.parentElement.insertBefore(slot, submit.parentElement.firstChild);
    }
    const count = form.querySelectorAll('[aria-invalid="true"]').length;
    slot.textContent = count === 0 ? '' : `${count} ${count === 1 ? 'field needs' : 'fields need'} attention`;
}

// ===== Reusable Form Modal =====
// options.dismissOnBackdrop: false keeps the modal open when the user clicks
// outside it, so it closes only from the X or its own buttons (used by the
// registration wizard, where an accidental click would lose what was typed).
function openFormModal(title, bodyHTML, footerHTML, wide, options = {}) {
    document.getElementById('formModalTitle').textContent = title;
    document.getElementById('formModalBody').innerHTML = bodyHTML;
    document.getElementById('formModalFooter').innerHTML = footerHTML;
    const overlay = document.getElementById('formModalOverlay');
    overlay.classList.toggle('modal-wide', !!wide);
    overlay.dataset.dismissOnBackdrop = options.dismissOnBackdrop === false ? 'false' : 'true';
    if (!overlay.classList.contains('show')) {
        rememberFocusFor('formModalOverlay');
    }
    overlay.style.display = 'flex';
    overlay.classList.add('show');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
    // Into the dialog: its first field, else its first action, else Close.
    focusFirstIn(document.getElementById('formModalBody'))
        || focusFirstIn(document.getElementById('formModalFooter'))
        || document.getElementById('closeFormModal').focus();
}

function closeFormModal() {
    const overlay = document.getElementById('formModalOverlay');
    overlay.style.display = 'none';
    overlay.classList.remove('show');
    overlay.classList.remove('modal-wide');
    delete overlay.dataset.dismissOnBackdrop;
    restoreFocusFor('formModalOverlay');
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
    rememberFocusFor('confirmDialogOverlay');
    overlay.style.display = 'flex';
    overlay.classList.add('show');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }

    confirmDialogHandler = onConfirm;
    // Cancel is the safe default, so Enter never confirms a destructive action by accident.
    document.getElementById('confirmDialogCancelBtn').focus();
}

function closeConfirmDialog() {
    const overlay = document.getElementById('confirmDialogOverlay');
    overlay.style.display = 'none';
    overlay.classList.remove('show');
    confirmDialogHandler = null;
    restoreFocusFor('confirmDialogOverlay');
}

// ===== Esc closes the topmost open layer =====
// Order: confirm dialog, form modal, notification detail, notification panel,
// account menu. A form modal opened with dismissOnBackdrop: false (the
// registration wizard) also ignores Esc, so typed input isn't lost by accident.
function handleEscapeKey(e) {
    if (e.key !== 'Escape') return;
    const isOpen = (id) => {
        const el = document.getElementById(id);
        return el && el.style.display !== 'none' && el.style.display !== '';
    };

    if (isOpen('confirmDialogOverlay')) {
        closeConfirmDialog();
    } else if (isOpen('formModalOverlay')) {
        if (document.getElementById('formModalOverlay').dataset.dismissOnBackdrop === 'false') return;
        closeFormModal();
    } else if (isOpen('notificationDetailOverlay')) {
        closeDetailModal();
    } else if (isOpen('notificationModal')) {
        closeNotificationModal();
        document.getElementById('notificationBell').focus();
    } else if (isOpen('accountDropdown')) {
        const dropdown = document.getElementById('accountDropdown');
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
        document.getElementById('accountBtn').focus();
    } else {
        return;
    }
    e.preventDefault();
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
