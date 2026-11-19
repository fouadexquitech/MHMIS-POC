// ===== Organization Profile (approved NGO) =====
// One page with four tabs. Organization Details is a form saved with Save
// Changes; focal persons, facilities and providers are lists whose records
// are saved one at a time. The same tabs are used during registration and by
// the administrator (org-profile.js).
let organizationProfileView = { tab: 'details' };

// An organization that is not eligible for Substance Use has no Substance
// Use focal persons to manage.
function getOwnFocalPersonAreas() {
    return isSubstanceUseEligible() ? ['4Ws', 'Substance Use'] : ['4Ws'];
}

function renderOrganizationProfilePage() {
    const tab = organizationProfileView.tab;
    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Organization Profile</h1>
            </div>
            ${renderProfileTabs(getOrgProfileTabs(), tab)}
            ${renderProfilePanel('details', tab, `
                <form id="profileForm" class="profile-form" novalidate>
                    ${renderOrgDetailsForm(getCurrentNgoProfile())}
                </form>
                <div class="form-actions form-actions-sticky">
                    <button type="button" class="btn btn-secondary" id="profileCancelBtn">Cancel</button>
                    <button type="submit" form="profileForm" class="btn btn-primary">Save Changes</button>
                </div>`)}
            ${renderProfilePanel('focal-persons', tab, renderFocalPersonsTab(mockData.focalPersons, { areas: getOwnFocalPersonAreas() }))}
            ${renderProfilePanel('facilities', tab, renderFacilitiesList())}
            ${renderProfilePanel('providers', tab, renderProvidersList())}
        </div>`;
}

function attachOrganizationProfileListeners() {
    attachProfileTabs(id => { organizationProfileView.tab = id; });

    const form = document.getElementById('profileForm');
    attachOrgDetailsForm(form, () => { appState.profileDirty = true; });

    document.getElementById('profileCancelBtn').addEventListener('click', () => {
        appState.profileDirty = false;
        renderPage('organization-profile');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateProfileForm(form)) {
            return;
        }
        Object.assign(getCurrentNgoProfile(), collectOrgDetails(form));
        appState.profileDirty = false;
        updateTopBarIdentity();
        showToast('Organization Details saved.', 'success');
    });

    attachFocalPersonsTab(mockData.focalPersons, { areas: getOwnFocalPersonAreas() });
    attachFacilitiesListeners();
    attachProvidersListeners();
}

// Long page form: shared validation (shared-ui.js) plus the
// "N fields need attention" line next to the submit button.
function validateProfileForm(form) {
    return validateForm(form, { countNearSubmit: true });
}
