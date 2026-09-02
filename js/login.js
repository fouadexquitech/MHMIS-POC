// ===== Login screen: demo scenario switcher, login form, registration wizard =====
//
// Demo scenarios only prefill the login form (or ready the Register button) —
// they never sign the user in directly, so the login step itself stays
// demoable. Signing in still goes through the normal loginForm submit.
const DEMO_SCENARIOS = [
    { kind: 'login', accountId: 'ngo-existing', title: 'Existing NGO', subtitle: 'Approved organization with full MHIS access.' },
    { kind: 'register', title: 'Register New NGO', subtitle: 'Walk through creating a brand-new organization account.' },
    { kind: 'login', accountId: 'ngo-rejected', title: 'NGO with Returned Registration', subtitle: 'Registration was returned by NMHP with a reason to address.' },
    { kind: 'login', accountId: 'admin', title: 'NMHP Administrator', subtitle: 'Reviews and approves or rejects organization registrations.' }
];

function initializeLoginScreen() {
    renderDemoSwitcherList();

    document.getElementById('demoSwitcherToggle').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDemoSwitcher();
    });
    document.addEventListener('click', (e) => {
        const popover = document.getElementById('demoSwitcherPopover');
        const toggle = document.getElementById('demoSwitcherToggle');
        if (!popover.hidden && !popover.contains(e.target) && !toggle.contains(e.target)) {
            closeDemoSwitcher();
        }
    });
    document.getElementById('resetDemoBtn').addEventListener('click', () => {
        resetDemoState();
        closeDemoSwitcher();
        showToast('Demo data has been reset.', 'success');
        startApp();
    });

    document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
    wirePasswordToggle('toggleLoginPasswordBtn', 'loginPassword');
    document.getElementById('forgotPasswordBtn').addEventListener('click', () => {
        showToast('Password reset is simulated in this POC.', 'info');
    });
    document.getElementById('registerOrgBtn').addEventListener('click', () => openRegistrationEmailStep());
    document.getElementById('explorePublicCard').addEventListener('click', () => showPublicExploreScreen());
}

// ===== Demo scenario switcher =====
function renderDemoSwitcherList() {
    const list = document.getElementById('demoSwitcherList');
    list.innerHTML = DEMO_SCENARIOS.map((scenario, index) => `
        <button type="button" class="demo-scenario-row" data-scenario-index="${index}">
            <span class="demo-scenario-title">${escapeHtml(scenario.title)}</span>
            <span class="demo-scenario-subtitle">${escapeHtml(scenario.subtitle)}</span>
        </button>`).join('');

    list.querySelectorAll('.demo-scenario-row').forEach(btn => {
        btn.addEventListener('click', () => {
            const scenario = DEMO_SCENARIOS[Number(btn.getAttribute('data-scenario-index'))];
            applyDemoScenario(scenario);
            closeDemoSwitcher();
        });
    });
}

function toggleDemoSwitcher(forceOpen) {
    const toggle = document.getElementById('demoSwitcherToggle');
    const popover = document.getElementById('demoSwitcherPopover');
    const open = forceOpen !== undefined ? forceOpen : popover.hidden;
    popover.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
}

function closeDemoSwitcher() {
    toggleDemoSwitcher(false);
}

function applyDemoScenario(scenario) {
    clearLoginErrors();

    if (scenario.kind === 'register') {
        document.getElementById('loginForm').reset();
        showToast('Ready to register — click "Register Your Organization" to continue.', 'info');
        const registerBtn = document.getElementById('registerOrgBtn');
        registerBtn.classList.add('demo-highlight');
        registerBtn.focus();
        setTimeout(() => registerBtn.classList.remove('demo-highlight'), 1600);
        return;
    }

    const account = getDemoAccount(scenario.accountId);
    if (!account) {
        return;
    }
    document.getElementById('loginEmail').value = account.loginIdentifier;
    document.getElementById('loginPassword').value = DEMO_LOGIN_PASSWORD_HINT;
    showToast(`${account.label} credentials filled — click Log In.`, 'info');
    document.getElementById('loginSubmitBtn').focus();
}

// ===== Login form =====
function clearLoginErrors() {
    document.getElementById('loginEmail-error').textContent = '';
    document.getElementById('loginPassword-error').textContent = '';
    document.getElementById('loginEmail').classList.remove('invalid');
    document.getElementById('loginPassword').classList.remove('invalid');
}

function handleLoginSubmit(e) {
    e.preventDefault();
    clearLoginErrors();

    const identifierInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    let valid = true;

    if (!identifierInput.value.trim()) {
        identifierInput.classList.add('invalid');
        document.getElementById('loginEmail-error').textContent = 'This field is required.';
        valid = false;
    }
    if (!passwordInput.value) {
        passwordInput.classList.add('invalid');
        document.getElementById('loginPassword-error').textContent = 'This field is required.';
        valid = false;
    }
    if (!valid) {
        return;
    }

    const account = getDemoAccountByLoginIdentifier(identifierInput.value);
    if (!account) {
        identifierInput.classList.add('invalid');
        document.getElementById('loginEmail-error').textContent = 'Unknown account. Use "Demo Scenarios" to fill a working account.';
        return;
    }

    signInAs(account.id);
}

function wirePasswordToggle(buttonId, inputId) {
    const btn = document.getElementById(buttonId);
    const input = document.getElementById(inputId);
    if (!btn || !input) {
        return;
    }
    btn.addEventListener('click', () => {
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.innerHTML = `<i data-lucide="${showing ? 'eye' : 'eye-off'}"></i>`;
        btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
        refreshLucideIcons();
    });
}

// ===== Registration wizard (Email -> Verify -> Password) =====
// Personal webmail providers can't be an organization's shared sign-in
// address, so registration requires an organizational email instead.
const PERSONAL_EMAIL_DOMAINS = [
    'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'outlook.com',
    'hotmail.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com',
    'aol.com', 'protonmail.com', 'proton.me', 'gmx.com', 'zoho.com', 'yandex.com'
];

function isPersonalEmailDomain(email) {
    const at = email.lastIndexOf('@');
    if (at === -1) {
        return false;
    }
    const domain = email.slice(at + 1).trim().toLowerCase();
    return PERSONAL_EMAIL_DOMAINS.includes(domain);
}

function openRegistrationEmailStep(prefill) {
    const prevOrgName = (prefill && prefill.organizationName) || '';
    const prevEmail = (prefill && prefill.email) || '';
    const bodyHTML = `
        <p class="wizard-step-label">Step 1 of 3 &middot; Organization &amp; Email</p>
        <div class="modal-form">
            <div class="form-field">
                <label for="regOrgName">Organization Name</label>
                <input type="text" id="regOrgName" data-required="true" autocomplete="organization" value="${escapeHtml(prevOrgName)}" />
                <div class="field-error" id="regOrgName-error"></div>
            </div>
            <div class="form-field">
                <label for="regEmail">Email Address</label>
                <input type="email" id="regEmail" data-required="true" autocomplete="email" value="${escapeHtml(prevEmail)}" />
                <div class="field-error" id="regEmail-error"></div>
            </div>
        </div>
        <p class="wizard-hint">Please use an organizational email address that you and your team can access — not a personal address like Gmail or Outlook. This will become your MHIS sign-in username.</p>`;
    const footerHTML = `
        <button type="button" class="modal-btn" id="regCancelBtn">Cancel</button>
        <button type="button" class="modal-btn primary" id="regSendCodeBtn">Send Verification Code</button>`;
    openFormModal('Register Your Organization', bodyHTML, footerHTML);

    document.getElementById('regCancelBtn').addEventListener('click', closeFormModal);
    document.getElementById('regSendCodeBtn').addEventListener('click', () => {
        const orgInput = document.getElementById('regOrgName');
        const orgErrorEl = document.getElementById('regOrgName-error');
        const emailInput = document.getElementById('regEmail');
        const emailErrorEl = document.getElementById('regEmail-error');
        const orgName = orgInput.value.trim();
        const emailValue = emailInput.value.trim();

        orgInput.classList.remove('invalid');
        orgErrorEl.textContent = '';
        emailInput.classList.remove('invalid');
        emailErrorEl.textContent = '';

        let valid = true;
        if (!orgName) {
            orgInput.classList.add('invalid');
            orgErrorEl.textContent = 'Enter your organization\'s name.';
            valid = false;
        }
        if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            emailInput.classList.add('invalid');
            emailErrorEl.textContent = 'Enter a valid email address.';
            valid = false;
        } else if (isPersonalEmailDomain(emailValue)) {
            emailInput.classList.add('invalid');
            emailErrorEl.textContent = 'This looks like a personal email address. Please enter one from your organization instead (for example, name@yourngo.org) — it will become your MHIS sign-in username, so make sure it\'s an address your organization manages.';
            valid = false;
        }
        if (!valid) {
            return;
        }

        showToast(`Verification code sent to ${emailValue} (demo code: ${DEMO_VERIFICATION_CODE}).`, 'info');
        openRegistrationVerifyStep(emailValue, orgName);
    });
}

function openRegistrationVerifyStep(email, organizationName) {
    const bodyHTML = `
        <p class="wizard-step-label">Step 2 of 3 &middot; Verify Email</p>
        <p class="wizard-hint">Enter the 6-digit code sent to <strong>${escapeHtml(email)}</strong>.</p>
        <div class="modal-form">
            <div class="form-field">
                <label for="regCode">Verification Code</label>
                <input type="text" id="regCode" maxlength="6" data-required="true" autocomplete="one-time-code" />
                <div class="field-error" id="regCode-error"></div>
            </div>
        </div>
        <button type="button" class="link-btn" id="regResendBtn">Resend code</button>`;
    const footerHTML = `
        <button type="button" class="modal-btn" id="regBackToEmailBtn">Back</button>
        <button type="button" class="modal-btn primary" id="regVerifyBtn">Verify</button>`;
    openFormModal('Register Your Organization', bodyHTML, footerHTML);

    document.getElementById('regBackToEmailBtn').addEventListener('click', () => openRegistrationEmailStep({ organizationName, email }));
    document.getElementById('regResendBtn').addEventListener('click', () => {
        showToast(`Verification code resent (demo code: ${DEMO_VERIFICATION_CODE}).`, 'info');
    });
    document.getElementById('regVerifyBtn').addEventListener('click', () => {
        const input = document.getElementById('regCode');
        const errorEl = document.getElementById('regCode-error');
        errorEl.textContent = '';
        input.classList.remove('invalid');
        if (input.value.trim() !== DEMO_VERIFICATION_CODE) {
            input.classList.add('invalid');
            errorEl.textContent = `Incorrect code. Use ${DEMO_VERIFICATION_CODE} for this demo.`;
            return;
        }
        openRegistrationPasswordStep(email, organizationName);
    });
}

function openRegistrationPasswordStep(email, organizationName) {
    const bodyHTML = `
        <p class="wizard-step-label">Step 3 of 3 &middot; Create Password</p>
        <div class="modal-form">
            <div class="form-field">
                <label for="regPassword">Password</label>
                <div class="password-input-wrapper">
                    <input type="password" id="regPassword" data-required="true" autocomplete="new-password" />
                    <button type="button" class="password-toggle-btn" id="toggleRegPasswordBtn" aria-label="Show password"><i data-lucide="eye"></i></button>
                </div>
                <div class="field-error" id="regPassword-error"></div>
            </div>
            <div class="form-field">
                <label for="regPasswordConfirm">Confirm Password</label>
                <div class="password-input-wrapper">
                    <input type="password" id="regPasswordConfirm" data-required="true" autocomplete="new-password" />
                    <button type="button" class="password-toggle-btn" id="toggleRegPasswordConfirmBtn" aria-label="Show password"><i data-lucide="eye"></i></button>
                </div>
                <div class="field-error" id="regPasswordConfirm-error"></div>
            </div>
        </div>`;
    const footerHTML = `
        <button type="button" class="modal-btn" id="regBackToVerifyBtn">Back</button>
        <button type="button" class="modal-btn primary" id="regCreateBtn">Create Account</button>`;
    openFormModal('Register Your Organization', bodyHTML, footerHTML);

    wirePasswordToggle('toggleRegPasswordBtn', 'regPassword');
    wirePasswordToggle('toggleRegPasswordConfirmBtn', 'regPasswordConfirm');

    document.getElementById('regBackToVerifyBtn').addEventListener('click', () => openRegistrationVerifyStep(email, organizationName));
    document.getElementById('regCreateBtn').addEventListener('click', () => {
        const pw = document.getElementById('regPassword');
        const pwConfirm = document.getElementById('regPasswordConfirm');
        const pwError = document.getElementById('regPassword-error');
        const pwConfirmError = document.getElementById('regPasswordConfirm-error');
        pw.classList.remove('invalid');
        pwConfirm.classList.remove('invalid');
        pwError.textContent = '';
        pwConfirmError.textContent = '';

        let valid = true;
        if (pw.value.length < 8) {
            pw.classList.add('invalid');
            pwError.textContent = 'Password must be at least 8 characters.';
            valid = false;
        }
        if (!pwConfirm.value || pwConfirm.value !== pw.value) {
            pwConfirm.classList.add('invalid');
            pwConfirmError.textContent = 'Passwords do not match.';
            valid = false;
        }
        if (!valid) {
            return;
        }

        closeFormModal();
        completeNewNgoRegistration(email, organizationName);
        signInAs('ngo-new');
        showToast('Account created. Complete your organization profile to continue.', 'success');
    });
}
