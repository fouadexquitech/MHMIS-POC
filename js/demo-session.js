// MHIS UX POC - Demo session and organization registration store
//
// The POC has no authentication. The demo account chosen on the login screen
// decides which experience is shown. State is kept in the browser only.

const DEMO_STORAGE_KEY = 'mhis-demo-state';

// Fully simulated — the POC has no backend, so a fixed code stands in for a
// real emailed verification code during the registration wizard.
const DEMO_VERIFICATION_CODE = '123456';
const DEMO_LOGIN_PASSWORD_HINT = 'demo1234';

const REGISTRATION_STATUS = {
    incomplete: 'Incomplete',
    pendingReview: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected'
};

const ACCOUNT_ACCESS = {
    active: 'Active',
    inactive: 'Inactive'
};

// Demo accounts offered on the login screen. `loginIdentifier` is what gets
// typed/filled into the single Email-or-Username field — NGOs sign in with
// their email, the administrator signs in with a username (not an email).
const DEMO_ACCOUNTS = [
    {
        id: 'ngo-existing',
        role: 'ngo',
        label: 'Existing NGO',
        organization: 'Community Health NGO',
        email: 'info@communityhealthngo.org',
        loginIdentifier: 'info@communityhealthngo.org',
        description: 'Approved organization with full access to MHIS.',
        registrationId: null
    },
    {
        id: 'ngo-new',
        role: 'ngo',
        label: 'New NGO',
        organization: 'Hope Mental Health Association',
        email: 'contact@hopemha.org',
        loginIdentifier: 'contact@hopemha.org',
        description: 'Newly created account that still has to complete and submit its profile.',
        registrationId: 101
    },
    {
        id: 'ngo-rejected',
        role: 'ngo',
        label: 'NGO with a returned registration',
        organization: 'Bright Minds Foundation',
        email: 'info@brightmindsfoundation.org',
        loginIdentifier: 'info@brightmindsfoundation.org',
        description: 'Registration returned by NMHP with a reason to address.',
        registrationId: 102
    },
    {
        id: 'admin',
        role: 'admin',
        label: 'NMHP Administrator',
        organization: 'NMHP Administrator',
        email: 'admin@nmhp.gov.lb',
        loginIdentifier: 'nmhp.admin',
        description: 'Reviews organization registrations and approves or rejects them.',
        registrationId: null
    }
];

function createRegistrationSeed() {
    return [
        {
            id: 101,
            organization: 'Hope Mental Health Association',
            acronym: 'HMHA',
            phone: '',
            mobile: '',
            email: 'contact@hopemha.org',
            directorName: '',
            directorEmail: '',
            directorMobile: '',
            sectors: '',
            website: '',
            linkedin: '',
            daleelMadani: '',
            focalPersons: [],
            status: REGISTRATION_STATUS.incomplete,
            submittedDate: '',
            rejectionReason: '',
            accountAccess: ACCOUNT_ACCESS.active,
            role: 'Organization Admin'
        },
        {
            id: 102,
            organization: 'Bright Minds Foundation',
            acronym: 'BMF',
            phone: '+961 1 555 010',
            mobile: '+961 71 555 010',
            email: 'info@brightmindsfoundation.org',
            directorName: 'Rami Chidiac',
            directorEmail: 'r.chidiac@brightmindsfoundation.org',
            directorMobile: '+961 70 555 010',
            sectors: 'Community Awareness',
            website: 'https://www.brightmindsfoundation.org',
            linkedin: '',
            daleelMadani: '',
            focalPersons: [
                { area: '4Ws', name: 'Lara Aoun', email: 'l.aoun@brightmindsfoundation.org', mobile: '+961 71 555 011' }
            ],
            status: REGISTRATION_STATUS.rejected,
            submittedDate: '18 Jan 2025',
            rejectionReason: 'The Substance Use focal person is missing and the director contact details could not be verified. Please complete both and resubmit.',
            accountAccess: ACCOUNT_ACCESS.active,
            role: 'Organization Admin'
        },
        {
            id: 103,
            organization: 'Cedars Psychosocial Support Society',
            acronym: 'CPSS',
            phone: '+961 6 555 020',
            mobile: '+961 71 555 020',
            email: 'contact@cedarspss.org',
            directorName: 'Dr. Hala Merhi',
            directorEmail: 'h.merhi@cedarspss.org',
            directorMobile: '+961 70 555 020',
            sectors: 'Mental Health, Psychosocial Support',
            website: 'https://www.cedarspss.org',
            linkedin: 'https://www.linkedin.com/company/cedars-pss',
            daleelMadani: 'https://daleel-madani.org/profile/cedars-pss',
            focalPersons: [
                { area: '4Ws', name: 'Joseph Khoury', email: 'j.khoury@cedarspss.org', mobile: '+961 71 555 021' },
                { area: 'Substance Use', name: 'Nada Zeidan', email: 'n.zeidan@cedarspss.org', mobile: '+961 71 555 022' }
            ],
            status: REGISTRATION_STATUS.pendingReview,
            submittedDate: '04 Feb 2025',
            rejectionReason: '',
            accountAccess: ACCOUNT_ACCESS.active,
            role: 'Organization Admin'
        },
        {
            id: 104,
            organization: 'Bekaa Wellbeing Initiative',
            acronym: 'BWI',
            phone: '+961 8 555 030',
            mobile: '+961 71 555 030',
            email: 'info@bekaawellbeing.org',
            directorName: 'Samir Ghanem',
            directorEmail: 's.ghanem@bekaawellbeing.org',
            directorMobile: '+961 70 555 030',
            sectors: 'Mental Health, Substance Use',
            website: '',
            linkedin: '',
            daleelMadani: '',
            focalPersons: [
                { area: '4Ws', name: 'Rita Salameh', email: 'r.salameh@bekaawellbeing.org', mobile: '+961 71 555 031' },
                { area: 'Substance Use', name: 'Ali Daher', email: 'a.daher@bekaawellbeing.org', mobile: '+961 71 555 032' }
            ],
            status: REGISTRATION_STATUS.pendingReview,
            submittedDate: '29 Jan 2025',
            rejectionReason: '',
            accountAccess: ACCOUNT_ACCESS.active,
            role: 'Organization Admin'
        },
        {
            id: 105,
            organization: 'Southern Care Network',
            acronym: 'SCN',
            phone: '+961 7 555 040',
            mobile: '+961 71 555 040',
            email: 'contact@southerncare.org',
            directorName: 'Zeina Farhat',
            directorEmail: 'z.farhat@southerncare.org',
            directorMobile: '+961 70 555 040',
            sectors: 'Mental Health',
            website: 'https://www.southerncare.org',
            linkedin: 'https://www.linkedin.com/company/southern-care-network',
            daleelMadani: 'https://daleel-madani.org/profile/southern-care-network',
            focalPersons: [
                { area: '4Ws', name: 'Hadi Sleiman', email: 'h.sleiman@southerncare.org', mobile: '+961 71 555 041' },
                { area: 'Substance Use', name: 'Maya Chahine', email: 'm.chahine@southerncare.org', mobile: '+961 71 555 042' }
            ],
            status: REGISTRATION_STATUS.approved,
            submittedDate: '11 Dec 2024',
            rejectionReason: '',
            accountAccess: ACCOUNT_ACCESS.active,
            role: 'Organization Admin'
        },
        {
            id: 106,
            organization: 'Coastal Recovery Group',
            acronym: 'CRG',
            phone: '+961 1 555 050',
            mobile: '+961 71 555 050',
            email: 'info@coastalrecovery.org',
            directorName: 'Georges Abou Jaoude',
            directorEmail: 'g.aboujaoude@coastalrecovery.org',
            directorMobile: '+961 70 555 050',
            sectors: 'Substance Use',
            website: '',
            linkedin: '',
            daleelMadani: '',
            focalPersons: [
                { area: '4Ws', name: 'Sandy Rizk', email: 's.rizk@coastalrecovery.org', mobile: '+961 71 555 051' },
                { area: 'Substance Use', name: 'Fadi Nehme', email: 'f.nehme@coastalrecovery.org', mobile: '+961 71 555 052' }
            ],
            status: REGISTRATION_STATUS.approved,
            submittedDate: '02 Oct 2024',
            rejectionReason: '',
            accountAccess: ACCOUNT_ACCESS.inactive,
            role: 'Organization Admin'
        }
    ];
}

let demoState = {
    accountId: null,
    registrations: createRegistrationSeed()
};

// ===== Persistence =====
function loadDemoState() {
    try {
        const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
        if (!raw) {
            // Nothing has ever been persisted in this browser — open on the
            // approved Existing NGO experience, the first scenario shown in
            // a client demo, instead of the login screen.
            demoState.accountId = 'ngo-existing';
            saveDemoState();
            return;
        }
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.registrations) && parsed.registrations.length) {
            demoState.registrations = parsed.registrations;
        }
        if (parsed && parsed.accountId && getDemoAccount(parsed.accountId)) {
            demoState.accountId = parsed.accountId;
        }
    } catch (err) {
        // A corrupt or unavailable storage entry simply starts the demo from scratch.
        demoState.accountId = null;
        demoState.registrations = createRegistrationSeed();
    }
}

function saveDemoState() {
    try {
        window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoState));
    } catch (err) {
        // Persistence is a convenience only; the demo keeps working without it.
    }
}

function resetDemoState() {
    demoState = { accountId: null, registrations: createRegistrationSeed() };
    try {
        window.localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch (err) {
        // Ignore storage failures.
    }
}

// ===== Session =====
function getDemoAccount(accountId) {
    return DEMO_ACCOUNTS.find(a => a.id === accountId) || null;
}

function getDemoAccountByEmail(email) {
    const value = (email || '').trim().toLowerCase();
    return DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === value) || null;
}

function getDemoAccountByLoginIdentifier(identifier) {
    const value = (identifier || '').trim().toLowerCase();
    return DEMO_ACCOUNTS.find(a => a.loginIdentifier.toLowerCase() === value) || null;
}

function getCurrentAccount() {
    return getDemoAccount(demoState.accountId);
}

function isSignedIn() {
    return !!getCurrentAccount();
}

function isAdminUser() {
    const account = getCurrentAccount();
    return !!account && account.role === 'admin';
}

function demoSignIn(accountId) {
    if (!getDemoAccount(accountId)) {
        return false;
    }
    demoState.accountId = accountId;
    saveDemoState();
    return true;
}

function demoSignOut() {
    demoState.accountId = null;
    saveDemoState();
}

// ===== Registrations =====
function getRegistrations() {
    return demoState.registrations;
}

function getRegistrationById(id) {
    return demoState.registrations.find(r => r.id === Number(id)) || null;
}

// The registration record bound to the signed-in NGO, or null for the
// already-approved existing NGO which uses the standard mock organization.
function getCurrentRegistration() {
    const account = getCurrentAccount();
    if (!account || account.role !== 'ngo' || !account.registrationId) {
        return null;
    }
    return getRegistrationById(account.registrationId);
}

function getCurrentRegistrationStatus() {
    const registration = getCurrentRegistration();
    return registration ? registration.status : REGISTRATION_STATUS.approved;
}

function isCurrentNgoApproved() {
    return getCurrentRegistrationStatus() === REGISTRATION_STATUS.approved;
}

function countRegistrationsByStatus(status) {
    return demoState.registrations.filter(r => r.status === status).length;
}

function formatDemoDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function submitRegistrationForReview(id) {
    const registration = getRegistrationById(id);
    if (!registration) {
        return null;
    }
    registration.status = REGISTRATION_STATUS.pendingReview;
    registration.rejectionReason = '';
    registration.submittedDate = formatDemoDate(new Date());
    saveDemoState();
    return registration;
}

function approveRegistration(id) {
    const registration = getRegistrationById(id);
    if (!registration) {
        return null;
    }
    registration.status = REGISTRATION_STATUS.approved;
    registration.rejectionReason = '';
    registration.accountAccess = ACCOUNT_ACCESS.active;
    saveDemoState();
    return registration;
}

function rejectRegistration(id, reason) {
    const registration = getRegistrationById(id);
    if (!registration) {
        return null;
    }
    registration.status = REGISTRATION_STATUS.rejected;
    registration.rejectionReason = reason;
    saveDemoState();
    return registration;
}

// ===== Organizations & Users: account access (separate from registration review) =====
function activateAccountAccess(id) {
    const registration = getRegistrationById(id);
    if (!registration) {
        return null;
    }
    registration.accountAccess = ACCOUNT_ACCESS.active;
    saveDemoState();
    return registration;
}

function deactivateAccountAccess(id) {
    const registration = getRegistrationById(id);
    if (!registration) {
        return null;
    }
    registration.accountAccess = ACCOUNT_ACCESS.inactive;
    saveDemoState();
    return registration;
}

// Derives an initials-style acronym from an organization name, e.g.
// "Bright Minds Foundation" -> "BMF".
function deriveAcronymFromName(name) {
    return (name || '')
        .split(/\s+/)
        .filter(word => /[A-Za-z]/.test(word))
        .map(word => word.match(/[A-Za-z]/)[0].toUpperCase())
        .join('')
        .slice(0, 6);
}

// ===== New organization registration wizard (login screen) =====
// Completing the wizard signs the demo in as the seeded "New NGO" account
// (id 101), reset to its pristine incomplete state so the registration demo
// can be run repeatedly, with the organization name and email the presenter
// typed bound onto it.
function completeNewNgoRegistration(email, organizationName) {
    const account = getDemoAccount('ngo-new');
    const pristine = createRegistrationSeed().find(r => r.id === 101);
    const index = demoState.registrations.findIndex(r => r.id === 101);
    if (index === -1) {
        return null;
    }
    demoState.registrations[index] = pristine;

    const enteredEmail = (email || '').trim();
    if (enteredEmail) {
        pristine.email = enteredEmail;
        account.email = enteredEmail;
        account.loginIdentifier = enteredEmail;
    }

    const enteredOrgName = (organizationName || '').trim();
    if (enteredOrgName) {
        pristine.organization = enteredOrgName;
        pristine.acronym = deriveAcronymFromName(enteredOrgName);
        account.organization = enteredOrgName;
    }

    demoSignIn('ngo-new');
    return pristine;
}
