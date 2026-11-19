// ===== Login screen: demo scenario switcher, login form, registration wizard =====
//
// Demo scenarios only prefill the login form (or ready the Register button) —
// they never sign the user in directly, so the login step itself stays
// demoable. Signing in still goes through the normal loginForm submit.
const DEMO_SCENARIOS = [
    { kind: 'login', accountId: 'ngo-existing', title: 'Existing NGO', subtitle: 'Approved organization with full MHIS access.' },
    { kind: 'login', accountId: 'ngo-4ws-only', title: 'Existing NGO (4Ws only)', subtitle: 'Approved organization not eligible for Substance Use.' },
    { kind: 'register', title: 'Register New NGO', subtitle: 'Walk through creating a brand-new organization account.' },
    { kind: 'login', accountId: 'ngo-rejected', title: 'NGO with Changes Requested', subtitle: 'NMHP asked the organization to update its registration.' },
    { kind: 'login', accountId: 'admin', title: 'NMHP Administrator', subtitle: 'Reviews submitted profiles: approves them or requests changes.' }
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
    clearFieldError(document.getElementById('loginEmail'));
    clearFieldError(document.getElementById('loginPassword'));
}

function handleLoginSubmit(e) {
    e.preventDefault();
    clearLoginErrors();

    const form = document.getElementById('loginForm');
    const identifierInput = document.getElementById('loginEmail');
    if (!validateForm(form)) {
        return;
    }

    const account = getDemoAccountByLoginIdentifier(identifierInput.value);
    if (!account) {
        // One short line, so it fits the reserved slot without moving the form.
        setFieldError(identifierInput, 'No account found. Try a Demo Scenario.');
        identifierInput.focus();
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
// The sign-in email is checked by validateOrgEmail() (js/email-policy.js):
// an invalid format or a public/disposable provider blocks the step;
// a mailbox that looks personal or is not recognized as shared shows an amber
// warning that the user must confirm before Send Verification Code is enabled.
// NMHP still makes the final call when it reviews the registration.
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
                <input type="email" id="regEmail" data-required="true" autocomplete="email" aria-describedby="regEmail-error regEmail-warning regEmail-hint" value="${escapeHtml(prevEmail)}" />
                <div class="field-error" id="regEmail-error" role="alert"></div>
                <div class="email-policy-warning" id="regEmail-warning" hidden></div>
            </div>
        </div>
        <p class="wizard-hint" id="regEmail-hint">Please use an organization email address (e.g., info@NMHP.com) that you and your team can access — not a personal work email (e.g., yourname@NMHP.com). This will become your organization’s MHIS sign-in username. Personal work email will <strong>not</strong> be activated and cannot be used.</p>`;
    const footerHTML = `
        <button type="button" class="modal-btn" id="regCancelBtn">Cancel</button>
        <button type="button" class="modal-btn primary" id="regSendCodeBtn">Send Verification Code</button>`;
    openFormModal('Register Your Organization', bodyHTML, footerHTML, false, { dismissOnBackdrop: false });

    const emailInput = document.getElementById('regEmail');
    const emailErrorEl = document.getElementById('regEmail-error');
    const warningEl = document.getElementById('regEmail-warning');
    const sendBtn = document.getElementById('regSendCodeBtn');
    // Email for which the warning is on screen; with requireAckOnWarning off,
    // a second click on Send for the same email continues.
    let warnedEmail = null;

    function clearEmailFeedback() {
        emailInput.classList.remove('invalid', 'warning');
        emailErrorEl.textContent = '';
        warningEl.hidden = true;
        warningEl.innerHTML = '';
        sendBtn.disabled = false;
        warnedEmail = null;
    }

    function showEmailWarning(result, email) {
        emailInput.classList.add('warning');
        const ackHTML = EMAIL_POLICY_CONFIG.requireAckOnWarning
            ? `<label class="email-policy-ack"><input type="checkbox" id="regEmailAck" /> <span>${escapeHtml(EMAIL_POLICY_MESSAGES.ACK_LABEL)}</span></label>`
            : '';
        warningEl.innerHTML = `
            <div class="email-policy-warning-message"><i data-lucide="triangle-alert"></i><span>${escapeHtml(result.message)}</span></div>
            ${ackHTML}`;
        warningEl.hidden = false;
        refreshLucideIcons();
        warnedEmail = email;
        if (EMAIL_POLICY_CONFIG.requireAckOnWarning) {
            sendBtn.disabled = true;
            document.getElementById('regEmailAck').addEventListener('change', e => {
                sendBtn.disabled = !e.target.checked;
            });
        }
    }

    // Any change to the email resets the feedback and the confirmation.
    emailInput.addEventListener('input', () => {
        if (warnedEmail !== null || emailErrorEl.textContent) {
            clearEmailFeedback();
        }
    });

    document.getElementById('regCancelBtn').addEventListener('click', closeFormModal);
    sendBtn.addEventListener('click', () => {
        const orgInput = document.getElementById('regOrgName');
        const orgErrorEl = document.getElementById('regOrgName-error');
        const orgName = orgInput.value.trim();
        const emailValue = emailInput.value.trim().toLowerCase();

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

        const result = validateOrgEmail(emailValue);
        if (result.status === 'empty' || result.status === 'error') {
            clearEmailFeedback();
            emailInput.classList.add('invalid');
            emailErrorEl.textContent = result.status === 'empty' ? 'Enter your organization\'s email address.' : result.message;
            valid = false;
        } else if (result.status === 'warning' && warnedEmail !== emailValue) {
            // First time this email is submitted: show the warning and stop.
            showEmailWarning(result, emailValue);
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
    openFormModal('Register Your Organization', bodyHTML, footerHTML, false, { dismissOnBackdrop: false });

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
    openFormModal('Register Your Organization', bodyHTML, footerHTML, false, { dismissOnBackdrop: false });

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
