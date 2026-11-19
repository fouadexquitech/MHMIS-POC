// ===== New NGO registration lifecycle =====
// Incomplete → Pending Review → Approved, or Changes Requested (the NGO
// updates and resubmits) or Declined. The registration uses the same
// Organization Profile tabs as an approved NGO; only Organization Details is
// required to submit. A submitted profile is shown as submitted; the NGO can
// still choose Update and Resubmit while NMHP reviews it.

// A submitted profile opened again with Update and Resubmit.
let registrationEditView = { updating: false };

// How the registration's Organization Profile is shown:
// draft, changes, submitted, updating, approved or declined.
function getRegistrationMode(r) {
    switch (r.status) {
        case REGISTRATION_STATUS.incomplete: return 'draft';
        case REGISTRATION_STATUS.changesRequested: return 'changes';
        case REGISTRATION_STATUS.pendingReview: return registrationEditView.updating ? 'updating' : 'submitted';
        case REGISTRATION_STATUS.approved: return 'approved';
        default: return 'declined';
    }
}

function isRegistrationEditable(r) {
    return ['draft', 'changes', 'updating', 'approved'].includes(getRegistrationMode(r));
}

// ---------- Home before approval ----------
function renderRegistrationStatusHomePage() {
    const registration = getCurrentRegistration();
    const orgName = registration ? registration.organization : '';

    let bodyHTML = '';
    if (registration.status === REGISTRATION_STATUS.incomplete) {
        bodyHTML = `
            <div class="section-card">
                <div class="section-header"><h3>Complete Your Organization Profile</h3></div>
                <div class="section-content">
                    <p class="status-text">Your account has been created. Complete the organization profile and submit it so that NMHP can review your registration.</p>
                    <p class="status-text">Only Organization Details is required. You can add focal persons, facilities and providers now or after approval.</p>
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="goToProfileBtn">
                            <i data-lucide="building-2"></i><span>Complete Organization Profile</span>
                        </button>
                    </div>
                </div>
            </div>`;
    } else if (registration.status === REGISTRATION_STATUS.pendingReview) {
        bodyHTML = `
            <div class="section-card">
                <div class="section-header"><h3>Registration Submitted</h3></div>
                <div class="section-content">
                    <p class="status-text">Your organization profile was submitted on ${escapeHtml(registration.submittedDate)} and is being reviewed by NMHP.</p>
                    <p class="status-text">You will be notified once the review is complete. The reporting platforms open after NMHP approves your registration. Need to change something? Update the profile and resubmit it.</p>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" id="goToProfileBtn">
                            <i data-lucide="eye"></i><span>View Submitted Profile</span>
                        </button>
                        <button class="btn btn-secondary" id="updateSubmissionBtn">
                            <i data-lucide="pencil"></i><span>Update and Resubmit</span>
                        </button>
                    </div>
                </div>
            </div>`;
    } else if (registration.status === REGISTRATION_STATUS.changesRequested) {
        bodyHTML = `
            <div class="section-card">
                <div class="section-header"><h3>Changes Requested by NMHP</h3></div>
                <div class="section-content">
                    ${renderReviewMessageBox(registration, 'Message from NMHP')}
                    <p class="status-text">Update your organization profile and resubmit it for review.</p>
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="goToProfileBtn">
                            <i data-lucide="pencil"></i><span>Update and Resubmit</span>
                        </button>
                    </div>
                </div>
            </div>`;
    } else {
        bodyHTML = `
            <div class="section-card">
                <div class="section-header"><h3>Registration Declined</h3></div>
                <div class="section-content">
                    ${renderReviewMessageBox(registration, 'Message from NMHP')}
                    <p class="status-text">Contact NMHP if you have questions about this decision.</p>
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="goToContactBtn">
                            <i data-lucide="mail"></i><span>Contact Us</span>
                        </button>
                    </div>
                </div>
            </div>`;
    }

    return `
        <div class="home-page">
            <div class="welcome-section">
                <h1 class="welcome-heading">Welcome, ${escapeHtml(orgName)}</h1>
                ${renderRegStatusPill(registration.status)}
            </div>
            ${bodyHTML}
        </div>`;
}

function attachRegistrationStatusHomeListeners() {
    document.getElementById('goToProfileBtn')?.addEventListener('click', () => {
        organizationProfileView.tab = 'details';
        navigateTo('organization-profile');
    });
    document.getElementById('updateSubmissionBtn')?.addEventListener('click', () => {
        organizationProfileView.tab = 'details';
        registrationEditView.updating = true;
        navigateTo('organization-profile');
    });
    document.getElementById('goToContactBtn')?.addEventListener('click', () => navigateTo('contact-us'));
}

// NMHP's message with a Changes Requested or Declined decision. Home already
// has a heading, so it labels the box "Message from NMHP".
function renderReviewMessageBox(r, label) {
    const declined = r.status === REGISTRATION_STATUS.declined;
    label = label || (declined ? 'Registration Declined' : 'Changes Requested by NMHP');
    return `
        <div class="reason-box${declined ? '' : ' reason-box-warning'}">
            <div class="reason-box-label">${label}${r.reviewedDate ? ` &middot; ${escapeHtml(r.reviewedDate)}` : ''}</div>
            <p>${escapeHtml(r.reviewMessage || '')}</p>
        </div>`;
}

// ---------- Status pill ----------
function registrationStatusClass(status) {
    switch (status) {
        case REGISTRATION_STATUS.approved: return 'approved';
        case REGISTRATION_STATUS.changesRequested: return 'changes';
        case REGISTRATION_STATUS.declined: return 'declined';
        case REGISTRATION_STATUS.pendingReview: return 'pending';
        default: return 'incomplete';
    }
}

function registrationStatusIcon(status) {
    switch (status) {
        case REGISTRATION_STATUS.approved: return 'circle-check';
        case REGISTRATION_STATUS.changesRequested: return 'file-pen-line';
        case REGISTRATION_STATUS.declined: return 'circle-x';
        case REGISTRATION_STATUS.pendingReview: return 'clock';
        default: return 'circle-alert';
    }
}

function renderRegStatusPill(status) {
    return `<div class="reg-status reg-status-${registrationStatusClass(status)}"><i data-lucide="${registrationStatusIcon(status)}"></i><span>${escapeHtml(status)}</span></div>`;
}

// ---------- Organization Profile during registration ----------
function renderRegistrationProfilePage() {
    const r = getCurrentRegistration();
    const mode = getRegistrationMode(r);
    const editable = isRegistrationEditable(r);
    const withPanel = ['draft', 'changes', 'updating', 'submitted'].includes(mode);
    const tab = organizationProfileView.tab;
    const values = getRegistrationProfileValues(r);

    let bannerHTML = '';
    if (mode === 'changes' || mode === 'declined') {
        bannerHTML = renderReviewMessageBox(r);
    } else if (mode === 'submitted') {
        bannerHTML = `<div class="info-banner">Submitted on ${escapeHtml(r.submittedDate)}. NMHP is reviewing your registration.</div>`;
    } else if (mode === 'updating') {
        bannerHTML = '<div class="info-banner">You are updating your submitted profile. Resubmit it when your changes are ready.</div>';
    }

    const detailsHTML = !editable
        ? renderOrgDetailsReadOnly(values)
        : `<form id="registrationProfileForm" class="profile-form" novalidate>${renderOrgDetailsForm(values)}</form>
           ${mode !== 'approved' ? '' : `
           <div class="form-actions form-actions-sticky">
               <button type="submit" form="registrationProfileForm" class="btn btn-primary">Save Changes</button>
           </div>`}`;

    const tabsHTML = `
        ${renderProfileTabs(getOrgProfileTabs(), tab)}
        ${renderProfilePanel('details', tab, detailsHTML)}
        ${renderProfilePanel('focal-persons', tab, renderFocalPersonsTab(r.focalPersons, { readOnly: !editable }))}
        ${renderProfilePanel('facilities', tab, editable ? renderFacilitiesList() : renderOrganizationRecordsTable('facility', r.facilities || [], { exportable: false }))}
        ${renderProfilePanel('providers', tab, editable ? renderProvidersList() : renderOrganizationRecordsTable('provider', r.providers || [], { exportable: false }))}`;

    return `
        <div class="page">
            <div class="page-header page-header-start">
                <h1 class="page-title">Organization Profile</h1>
                ${renderRegStatusPill(r.status)}
            </div>
            ${bannerHTML}
            ${withPanel
                ? `<div class="registration-layout"><div class="registration-main">${tabsHTML}</div>${renderRegistrationPanel(r, mode)}</div>`
                : tabsHTML}
        </div>`;
}

// ---------- The registration track ----------
// Beside the tabs: one step per tab (Organization Details is required, the
// others are optional), then Submit. Each step opens its tab; the open tab
// is highlighted, so the track also shows where the user is.
function getRegistrationSteps(r, missingOverride) {
    const missing = typeof missingOverride === 'number' ? missingOverride : countMissingOrgDetails(getRegistrationProfileValues(r));
    const focal = area => r.focalPersons.filter(f => f.area === area).length;
    const focal4ws = focal('4Ws');
    const focalSu = focal('Substance Use');
    const facilities = (r.facilities || []).length;
    const providers = (r.providers || []).length;
    const added = (n, one, many) => (n ? `${n} ${n === 1 ? one : many} added` : 'None yet');
    return [
        {
            tab: 'details', label: 'Organization Details', required: true,
            state: missing ? 'missing' : 'done',
            detail: missing ? `${missing} field${missing === 1 ? '' : 's'} missing` : 'Complete'
        },
        {
            tab: 'focal-persons', label: 'Focal Persons', required: false,
            state: focal4ws + focalSu ? 'done' : 'empty',
            detail: focal4ws + focalSu ? `4Ws: ${focal4ws} · Substance Use: ${focalSu}` : 'None yet'
        },
        { tab: 'facilities', label: 'Facilities', required: false, state: facilities ? 'done' : 'empty', detail: added(facilities, 'facility', 'facilities') },
        { tab: 'providers', label: 'Providers', required: false, state: providers ? 'done' : 'empty', detail: added(providers, 'provider', 'providers') }
    ];
}

function renderRegistrationTrack(r, missingOverride) {
    const steps = getRegistrationSteps(r, missingOverride);
    const filled = steps.filter(step => step.state === 'done').length;
    const current = organizationProfileView.tab;
    return `
        <div class="reg-track-progress">
            <div class="reg-track-progress-bar" role="progressbar" aria-label="Sections filled" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="${filled}">
                <span style="width: ${Math.round((filled / steps.length) * 100)}%"></span>
            </div>
            <span class="reg-track-progress-text">${filled} of ${steps.length} sections filled</span>
        </div>
        <ol class="reg-track">
            ${steps.map((step, index) => `
            <li class="reg-track-step is-${step.state}${step.tab === current ? ' is-current' : ''}">
                <button type="button" class="reg-track-button" data-track-tab="${step.tab}"${step.tab === current ? ' aria-current="step"' : ''}>
                    <span class="reg-track-marker">${step.state === 'done' ? '<i data-lucide="check"></i>' : index + 1}</span>
                    <span class="reg-track-text">
                        <span class="reg-track-label">${escapeHtml(step.label)}</span>
                        <span class="reg-track-meta">
                            <span class="reg-track-tag${step.required ? ' is-required' : ''}">${step.required ? 'Required' : 'Optional'}</span>
                            <span class="reg-track-detail">${escapeHtml(step.detail)}</span>
                        </span>
                    </span>
                    <i data-lucide="chevron-right" class="reg-track-arrow"></i>
                </button>
            </li>`).join('')}
        </ol>`;
}

function renderRegistrationPanel(r, mode) {
    const submitted = mode === 'submitted';
    let finalHTML;
    if (submitted) {
        finalHTML = `
            <div class="reg-track-final is-done">
                <span class="reg-track-marker"><i data-lucide="check"></i></span>
                <div class="reg-track-final-body">
                    <div class="reg-track-label">Submitted for Review</div>
                    <div class="reg-track-detail">Submitted on ${escapeHtml(r.submittedDate)}. You can still update it and resubmit.</div>
                </div>
            </div>
            <div class="registration-checklist-actions">
                <button type="button" class="btn btn-secondary" id="regUpdateBtn"><i data-lucide="pencil"></i><span>Update and Resubmit</span></button>
            </div>`;
    } else {
        const submitLabel = mode === 'draft' ? 'Submit for Review' : 'Resubmit for Review';
        finalHTML = `
            <div class="reg-track-final">
                <span class="reg-track-marker">5</span>
                <div class="reg-track-final-body">
                    <div class="reg-track-label">${submitLabel}</div>
                    <div class="reg-track-detail">Only Organization Details is required. NMHP may contact you about the rest before approval.</div>
                </div>
            </div>
            <div class="registration-checklist-actions">
                ${mode === 'updating'
                    ? '<button type="button" class="btn btn-secondary" id="regCancelUpdateBtn">Cancel</button>'
                    : '<button type="button" class="btn btn-secondary" id="regProfileSaveBtn" hidden>Save Draft</button>'}
                <button type="submit" form="registrationProfileForm" class="btn btn-primary">${submitLabel}</button>
            </div>`;
    }
    return `
        <aside class="registration-checklist" aria-labelledby="registrationChecklistTitle">
            <h2 class="registration-checklist-title" id="registrationChecklistTitle">${submitted ? 'Your Registration' : 'Before You Submit'}</h2>
            <div id="registrationTrack">${renderRegistrationTrack(r)}</div>
            ${finalHTML}
        </aside>`;
}

// Keeps the track in step with what was typed or added, and with the open tab.
function refreshRegistrationChecklist() {
    const holder = document.getElementById('registrationTrack');
    const r = getCurrentRegistration();
    if (!holder || !r) {
        return;
    }
    const form = document.getElementById('registrationProfileForm');
    const missing = form ? countMissingOrgDetails(collectOrgDetails(form)) : undefined;
    holder.innerHTML = renderRegistrationTrack(r, missing);
    refreshLucideIcons();
}

// A step opens its tab. On Organization Details, it goes straight to the
// first required field that is still empty.
function openRegistrationStep(tab) {
    organizationProfileView.tab = tab;
    showProfileTab(tab);
    refreshRegistrationChecklist();
    const form = document.getElementById('registrationProfileForm');
    if (tab === 'details' && form) {
        const firstEmpty = Array.from(form.querySelectorAll('[data-required="true"]')).find(isFieldEmpty);
        if (firstEmpty) {
            firstEmpty.scrollIntoView({ block: 'center', behavior: 'smooth' });
            firstEmpty.focus({ preventScroll: true });
            return;
        }
    }
    document.querySelector('.registration-main .tabs')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

// Save Draft shows only when there are unsaved changes in Organization Details.
function updateSaveDraftButton() {
    const btn = document.getElementById('regProfileSaveBtn');
    if (btn) {
        btn.hidden = !appState.profileDirty;
    }
}

function attachRegistrationProfileListeners() {
    const r = getCurrentRegistration();
    const mode = getRegistrationMode(r);

    attachProfileTabs(id => {
        organizationProfileView.tab = id;
        refreshRegistrationChecklist();
    });
    document.querySelector('.registration-checklist')?.addEventListener('click', (e) => {
        const step = e.target.closest('[data-track-tab]');
        if (step) {
            openRegistrationStep(step.getAttribute('data-track-tab'));
        }
    });

    if (!isRegistrationEditable(r)) {
        attachOrganizationRecordsTables(r.facilities || [], r.providers || [], r.organization);
        document.getElementById('regUpdateBtn')?.addEventListener('click', () => {
            registrationEditView.updating = true;
            renderPage('organization-profile');
        });
        return;
    }

    attachFocalPersonsTab(r.focalPersons, {
        onChange: () => {
            saveDemoState();
            refreshRegistrationChecklist();
        }
    });
    attachFacilitiesListeners();
    attachProvidersListeners();

    const form = document.getElementById('registrationProfileForm');
    attachOrgDetailsForm(form, () => {
        appState.profileDirty = true;
        updateSaveDraftButton();
        refreshRegistrationChecklist();
    });

    const collect = () => {
        applyProfileValuesToRegistration(r, collectOrgDetails(form));
        saveDemoState();
    };

    // An approved organization that registered in the demo edits its profile here.
    if (mode === 'approved') {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validateProfileForm(form)) {
                return;
            }
            collect();
            appState.profileDirty = false;
            updateTopBarIdentity();
            showToast('Organization Details saved.', 'success');
        });
        return;
    }

    document.getElementById('regProfileSaveBtn')?.addEventListener('click', () => {
        collect();
        appState.profileDirty = false;
        updateSaveDraftButton();
        updateTopBarIdentity();
        showToast('Draft saved. Submit the profile when it is ready.', 'success');
    });

    // Updating a submitted profile: Cancel keeps the submitted version.
    document.getElementById('regCancelUpdateBtn')?.addEventListener('click', () => {
        const cancel = () => {
            appState.profileDirty = false;
            registrationEditView.updating = false;
            renderPage('organization-profile');
        };
        if (!appState.profileDirty) {
            cancel();
            return;
        }
        showConfirmDialog({
            title: 'Discard Your Changes?',
            message: 'Your changes to Organization Details will be lost. The submitted profile stays as it is.',
            confirmLabel: 'Discard Changes',
            tone: 'danger',
            onConfirm: cancel
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Errors are shown on Organization Details, so open it first.
        organizationProfileView.tab = 'details';
        showProfileTab('details');
        refreshRegistrationChecklist();
        if (!validateProfileForm(form)) {
            // Errors show at the fields and the count sits next to Submit; no toast.
            return;
        }
        collect();
        submitRegistrationForReview(r.id);
        registrationEditView.updating = false;
        appState.profileDirty = false;
        updateTopBarIdentity();
        renderSidebarNav();
        showToast(mode === 'draft'
            ? 'Profile submitted. NMHP is reviewing your registration.'
            : 'Profile resubmitted. NMHP is reviewing your registration.', 'success');
        navigateTo('home');
    });
}
