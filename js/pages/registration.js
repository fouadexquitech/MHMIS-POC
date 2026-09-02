// ===== New NGO registration lifecycle =====
function renderRegistrationStatusHomePage() {
    const registration = getCurrentRegistration();
    const orgName = registration ? registration.organization : '';

    let bodyHTML = '';
    if (registration.status === REGISTRATION_STATUS.incomplete) {
        bodyHTML = `
            <div class="section-card">
                <div class="section-header"><h3>Complete your organization profile</h3></div>
                <div class="section-content">
                    <p class="status-text">Your account has been created. Complete the organization profile and submit it so that NMHP can review your registration.</p>
                    <p class="status-text">The rest of MHIS becomes available once your registration is approved.</p>
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
                <div class="section-header"><h3>Registration submitted</h3></div>
                <div class="section-content">
                    <p class="status-text">Your organization profile was submitted on ${escapeHtml(registration.submittedDate)} and is being reviewed by NMHP.</p>
                    <p class="status-text">You will be notified once the review is complete. The remaining MHIS modules stay unavailable until then.</p>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" id="goToProfileBtn">
                            <i data-lucide="eye"></i><span>View Submitted Profile</span>
                        </button>
                    </div>
                </div>
            </div>`;
    } else {
        bodyHTML = `
            <div class="section-card">
                <div class="section-header"><h3>Registration returned by NMHP</h3></div>
                <div class="section-content">
                    <div class="reason-box">
                        <div class="reason-box-label">Reason</div>
                        <p>${escapeHtml(registration.rejectionReason)}</p>
                    </div>
                    <p class="status-text">Update your organization profile and resubmit it for review.</p>
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="goToProfileBtn">
                            <i data-lucide="pencil"></i><span>Update and Resubmit</span>
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
    document.getElementById('goToProfileBtn')?.addEventListener('click', () => navigateTo('organization-profile'));
}

function registrationStatusClass(status) {
    switch (status) {
        case REGISTRATION_STATUS.approved: return 'approved';
        case REGISTRATION_STATUS.rejected: return 'rejected';
        case REGISTRATION_STATUS.pendingReview: return 'pending';
        default: return 'incomplete';
    }
}

function registrationStatusIcon(status) {
    switch (status) {
        case REGISTRATION_STATUS.approved: return 'circle-check';
        case REGISTRATION_STATUS.rejected: return 'circle-x';
        case REGISTRATION_STATUS.pendingReview: return 'clock';
        default: return 'circle-alert';
    }
}

function renderRegStatusPill(status) {
    return `<div class="reg-status reg-status-${registrationStatusClass(status)}"><i data-lucide="${registrationStatusIcon(status)}"></i><span>${escapeHtml(status)}</span></div>`;
}

function renderRegistrationProfilePage() {
    const r = getCurrentRegistration();
    const readOnly = r.status === REGISTRATION_STATUS.pendingReview || r.status === REGISTRATION_STATUS.approved;
    const values = {
        name: r.organization, acronym: r.acronym, phone: r.phone, mobile: r.mobile, email: r.email,
        directorName: r.directorName, directorEmail: r.directorEmail, directorMobile: r.directorMobile,
        sectors: r.sectors, website: r.website, linkedin: r.linkedin, daleelMadani: r.daleelMadani
    };

    let bannerHTML = '';
    if (r.status === REGISTRATION_STATUS.rejected) {
        bannerHTML = `
            <div class="reason-box">
                <div class="reason-box-label">Registration returned by NMHP</div>
                <p>${escapeHtml(r.rejectionReason)}</p>
            </div>`;
    } else if (r.status === REGISTRATION_STATUS.pendingReview) {
        bannerHTML = `<div class="info-banner">Submitted on ${escapeHtml(r.submittedDate)}. The profile cannot be changed while NMHP is reviewing it.</div>`;
    }

    const actionsHTML = readOnly ? '' : `
        <div class="form-actions">
            <button type="submit" form="registrationProfileForm" class="btn btn-primary">${r.status === REGISTRATION_STATUS.rejected ? 'Resubmit for Review' : 'Submit for Review'}</button>
            <button type="button" class="btn btn-secondary" id="regProfileSaveBtn">Save Draft</button>
        </div>`;

    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Organization Profile</h1>
                ${renderRegStatusPill(r.status)}
            </div>
            ${bannerHTML}
            <form id="registrationProfileForm" class="profile-form" novalidate>
                ${renderOrgProfileFields(values, readOnly)}
            </form>

            ${renderFocalPersonsSection(r.focalPersons, readOnly)}

            ${actionsHTML}
        </div>`;
}

function attachRegistrationProfileListeners() {
    const r = getCurrentRegistration();
    const readOnly = r.status === REGISTRATION_STATUS.pendingReview || r.status === REGISTRATION_STATUS.approved;

    attachFocalPersonsSection(r.focalPersons, readOnly, () => {
        appState.profileDirty = true;
        saveDemoState();
    });

    if (readOnly) {
        return;
    }

    const form = document.getElementById('registrationProfileForm');
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => { appState.profileDirty = true; });
    });

    const collect = () => {
        const values = collectOrgProfileFields(form);
        r.organization = values.name;
        r.acronym = values.acronym;
        r.phone = values.phone;
        r.mobile = values.mobile;
        r.email = values.email;
        r.directorName = values.directorName;
        r.directorEmail = values.directorEmail;
        r.directorMobile = values.directorMobile;
        r.sectors = values.sectors;
        r.website = values.website;
        r.linkedin = values.linkedin;
        r.daleelMadani = values.daleelMadani;
        saveDemoState();
    };

    document.getElementById('regProfileSaveBtn').addEventListener('click', () => {
        collect();
        appState.profileDirty = false;
        showToast('Draft saved. Submit the profile when it is complete.', 'success');
        updateTopBarIdentity();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateProfileForm(form)) {
            showToast('Complete the required fields before submitting.', 'error');
            return;
        }
        collect();
        submitRegistrationForReview(r.id);
        appState.profileDirty = false;
        updateTopBarIdentity();
        renderSidebarNav();
        showToast('Profile submitted. NMHP is reviewing your registration.', 'success');
        navigateTo('home');
    });
}

