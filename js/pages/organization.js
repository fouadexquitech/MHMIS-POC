// ===== Organization Profile =====
function renderOrganizationProfilePage() {
    const p = mockData.organizationProfile;

    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Organization Profile</h1>
            </div>

            <form id="profileForm" class="profile-form" novalidate>
                ${renderOrgProfileFields(p, false)}
            </form>

            ${renderFocalPersonsSection(mockData.focalPersons, false)}

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="profileCancelBtn">Cancel</button>
                <button type="submit" form="profileForm" class="btn btn-primary">Save Changes</button>
            </div>
        </div>`;
}

function attachOrganizationProfileListeners() {
    const form = document.getElementById('profileForm');
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => { appState.profileDirty = true; });
    });

    document.getElementById('profileCancelBtn').addEventListener('click', () => {
        appState.profileDirty = false;
        renderPage('organization-profile');
    });

    document.getElementById('uploadLogoBtn').addEventListener('click', () => {
        showToast('Logo upload is simulated in this POC.', 'info');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateProfileForm(form)) {
            return;
        }
        Object.assign(mockData.organizationProfile, collectOrgProfileFields(form));
        appState.profileDirty = false;
        showToast('Organization profile saved successfully.', 'success');
    });

    attachFocalPersonsSection(mockData.focalPersons, false, () => {
        appState.profileDirty = true;
    });
}

function validateProfileForm(form) {
    let valid = true;
    form.querySelectorAll('.field-error').forEach(el => (el.textContent = ''));
    form.querySelectorAll('input').forEach(el => el.classList.remove('invalid'));

    form.querySelectorAll('input[data-required="true"]').forEach(input => {
        const errorEl = document.getElementById(`${input.id}-error`);
        if (!input.value.trim()) {
            input.classList.add('invalid');
            if (errorEl) errorEl.textContent = 'This field is required.';
            valid = false;
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
            input.classList.add('invalid');
            if (errorEl) errorEl.textContent = 'Enter a valid email address.';
            valid = false;
        }
    });
    return valid;
}

