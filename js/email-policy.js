// ===== Organization email policy (registration sign-in email) =====
// The sign-in email must be a SHARED organization mailbox (info@yourngo.org),
// not a person's work address (yourname@yourngo.org), and never a public or
// disposable provider.
//
// validateOrgEmail(email) is a pure function with no DOM access. It returns
//   { status: 'empty' | 'error' | 'warning' | 'ok', code, message, strength?, checks[] }
// where checks[] = { id, label, result: 'pass' | 'fail' | 'warn' | 'skip', detail }.
//
// Rules run in order and stop at the first blocking failure:
//   1. Format    (error: INVALID_FORMAT)
//   2. Provider  (error: DENIED_DOMAIN, DISPOSABLE_PROVIDER, FREE_PROVIDER)
//   3. Mailbox   (never blocks: ok ROLE_BASED, or warning PERSONAL_LIKELY /
//                 UNRECOGNIZED_MAILBOX)
// Registration has no contact name at this step, so the mailbox check relies
// on name patterns and a common-first-names list only.
//
// In the real system these lists live in one shared JSON file used by both
// the frontend and the .NET backend, and the backend re-runs the same rules.
// They are inline here because the POC has no build step and no backend.

const EMAIL_POLICY_CONFIG = {
    // When true, a warning requires the "shared mailbox" confirmation
    // checkbox before Send Verification Code is enabled.
    requireAckOnWarning: true
};

const EMAIL_POLICY = {
    freeProviders: [
        'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'rocketmail.com',
        'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'windowslive.com', 'passport.com',
        'icloud.com', 'me.com', 'mac.com', 'aol.com', 'aim.com',
        'protonmail.com', 'protonmail.ch', 'proton.me', 'pm.me', 'tutanota.com', 'tuta.io',
        'gmx.com', 'gmx.net', 'gmx.de', 'web.de', 'mail.com', 'zoho.com', 'zohomail.com',
        'yandex.com', 'yandex.ru', 'ya.ru', 'mail.ru', 'inbox.ru', 'list.ru', 'bk.ru',
        'fastmail.com', 'hushmail.com', 'mailfence.com', 'hey.com', 'inbox.com', 'lycos.com',
        'qq.com', '163.com', '126.com', 'sina.com', 'rediffmail.com',
        'att.net', 'comcast.net', 'verizon.net', 'sbcglobal.net', 'btinternet.com',
        'orange.fr', 'free.fr', 'laposte.net', 'sfr.fr', 'wanadoo.fr', 'libero.it', 't-online.de'
    ],
    // Regional consumer ISP mailboxes. To be confirmed with NMHP before go-live.
    regionalIspProviders: [
        'idm.net.lb', 'terra.net.lb', 'cyberia.net.lb', 'inco.com.lb', 'sodetel.net.lb', 'dm.net.lb',
        'emirates.net.ae', 'eim.ae',
        'awalnet.net.sa'
    ],
    // Country variants of the major providers (hotmail.fr, outlook.sa, yahoo.com.sa).
    // Never add generic words such as "mail" here (it would match mail.gov.sa).
    providerFamilyPattern: /^(gmail|googlemail|hotmail|outlook|live|windowslive|msn|yahoo|ymail|aol|icloud|protonmail|gmx|yandex)\.[a-z]{2,3}(\.[a-z]{2})?$/,
    disposableProviders: [
        'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'sharklasers.com',
        '10minutemail.com', 'temp-mail.org', 'tempmail.com', 'tempail.com', 'yopmail.com',
        'trashmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'throwawaymail.com',
        'fakeinbox.com', 'mintemail.com', 'mohmal.com', 'emailondeck.com', 'mailnesia.com',
        'spamgourmet.com', 'moakt.com', 'burnermail.io'
    ],
    roleWords: [
        // General
        'info', 'information', 'contact', 'contactus', 'hello', 'admin', 'administrator',
        'administration', 'office', 'mail', 'email', 'general', 'team', 'staff', 'support',
        'help', 'helpdesk', 'service', 'services', 'customer', 'customerservice', 'customercare',
        'enquiries', 'enquiry', 'inquiries', 'inquiry', 'reception', 'frontdesk', 'secretariat',
        'secretary', 'hr', 'humanresources', 'recruitment', 'careers', 'jobs', 'finance',
        'accounts', 'accounting', 'billing', 'payments', 'procurement', 'purchasing', 'operations',
        'ops', 'it', 'tech', 'webmaster', 'web', 'sales', 'marketing', 'media', 'press',
        'pr', 'communications', 'comms', 'news', 'newsletter', 'legal', 'compliance', 'management',
        'board', 'director', 'directorate', 'executive', 'headoffice', 'hq', 'main', 'central',
        // NGO and programmes
        'ngo', 'org', 'association', 'foundation', 'program', 'programs', 'programme', 'programmes',
        'project', 'projects', 'field', 'partnerships', 'partners', 'donations', 'donate',
        'fundraising', 'grants', 'volunteer', 'volunteers', 'outreach', 'community', 'relief',
        'protection', 'education', 'youth', 'women', 'monitoring', 'mel', 'meal',
        // Healthcare and mental health
        'health', 'mental', 'mentalhealth', 'mhpss', 'psychosocial', 'wellbeing', 'care',
        'clinic', 'pharmacy', 'admissions', 'appointments', 'patients', 'claims', 'medical',
        'nursing', 'lab', 'counseling', 'counselling', 'hotline', 'helpline'
    ],
    commonFirstNames: [
        // Arabic / Levant (common transliterations)
        'ahmad', 'ahmed', 'mohammad', 'mohamad', 'mohammed', 'muhammad', 'mohamed', 'ali', 'hassan',
        'hasan', 'hussein', 'hussain', 'husein', 'omar', 'umar', 'khaled', 'khalid', 'mahmoud',
        'mustafa', 'mostafa', 'youssef', 'yousef', 'yusuf', 'ibrahim', 'issa', 'imad', 'wael',
        'tarek', 'tareq', 'tariq', 'nader', 'nadim', 'rabih', 'rabie', 'hadi', 'hady', 'majed',
        'majid', 'marwan', 'rawad', 'jad', 'karim', 'kareem', 'rami', 'ramy', 'sami', 'samir',
        'fadi', 'fady', 'ziad', 'ziyad', 'walid', 'nabil', 'bilal', 'elie', 'elias', 'charbel',
        'georges', 'antoine', 'pierre', 'michel', 'nicolas', 'joseph', 'tony', 'roy', 'ralph',
        'fatima', 'fatmeh', 'zeinab', 'zainab', 'mariam', 'maryam', 'rana', 'rania', 'nour',
        'noor', 'lara', 'layla', 'leila', 'laila', 'rita', 'nada', 'rima', 'reem', 'rim', 'hiba',
        'hala', 'dina', 'dana', 'maya', 'mira', 'nadine', 'carla', 'carine', 'joelle', 'hanan',
        'huda', 'salma', 'amal', 'aya', 'ghada', 'samar', 'rola', 'roula', 'mona', 'muna',
        'nisrine', 'nesrine', 'sawsan', 'wafaa', 'zahra', 'lina', 'yasmine', 'yasmin',
        // English
        'john', 'james', 'david', 'daniel', 'michael', 'robert', 'william', 'richard', 'thomas',
        'chris', 'christopher', 'andrew', 'matthew', 'anthony', 'steven', 'kevin', 'brian',
        'jason', 'ryan', 'eric', 'adam', 'paul', 'peter', 'mark', 'george', 'mary', 'maria',
        'sarah', 'sara', 'jessica', 'jennifer', 'linda', 'patricia', 'elizabeth', 'susan', 'lisa',
        'karen', 'emily', 'emma', 'olivia', 'sophia', 'anna', 'christine', 'nancy', 'joanna'
    ],
    // Client-maintained exceptions, checked before the lists above.
    overrides: {
        allowDomains: [],
        denyDomains: []
    }
};

// User-facing text in one place, ready for localisation (Arabic).
// {domain}, {reason} and {token} are replaced at runtime.
const EMAIL_POLICY_MESSAGES = {
    INVALID_FORMAT: 'Enter a valid email address, for example info@yourngo.org.',
    DENIED_DOMAIN: 'Addresses on {domain} cannot be used for registration. Enter your organization\'s shared email address.',
    DISPOSABLE_PROVIDER: 'Temporary or disposable email addresses cannot be used. Enter your organization\'s shared email address.',
    FREE_PROVIDER: '{domain} is a public email provider and cannot be used. Enter a shared address on your organization\'s own domain, for example info@yourngo.org.',
    ROLE_BASED: 'This looks like a shared organization mailbox.',
    PERSONAL_LIKELY: 'This looks like a personal work email ({reason}). Use a shared address your team can access, such as info@{domain}.',
    UNRECOGNIZED_MAILBOX: 'We could not confirm that this is a shared organization mailbox. If it is not, use a shared address your team can access, such as info@{domain}.',
    ACK_LABEL: 'I confirm this is a shared organization mailbox that my team can access',
    reasons: {
        nameDotName: 'it follows the firstname.lastname pattern',
        initialSurname: 'it follows the initial + surname pattern',
        firstName: '"{token}" is a common first name'
    }
};

// WHATWG email pattern, tightened to require at least one dot in the domain.
const EMAIL_FORMAT_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

function formatEmailPolicyMessage(template, values) {
    return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));
}

function validateOrgEmail(rawEmail) {
    const email = String(rawEmail || '').trim().toLowerCase();
    const checks = [
        { id: 'format', label: 'Email format', result: 'skip', detail: '' },
        { id: 'provider', label: 'Email provider', result: 'skip', detail: '' },
        { id: 'mailbox', label: 'Shared mailbox', result: 'skip', detail: '' }
    ];
    const [formatCheck, providerCheck, mailboxCheck] = checks;
    const msg = EMAIL_POLICY_MESSAGES;
    const policy = EMAIL_POLICY;

    if (!email) {
        return { status: 'empty', code: 'EMPTY', message: '', checks };
    }

    // 1. Format (blocks)
    const at = email.lastIndexOf('@');
    const localPart = at > 0 ? email.slice(0, at) : '';
    const domain = at > 0 ? email.slice(at + 1) : '';
    if (email.length > 254 || localPart.length > 64 || !EMAIL_FORMAT_PATTERN.test(email)) {
        formatCheck.result = 'fail';
        formatCheck.detail = 'Not a valid email address (max 254 characters, 64 before the @).';
        return { status: 'error', code: 'INVALID_FORMAT', message: msg.INVALID_FORMAT, checks };
    }
    formatCheck.result = 'pass';
    formatCheck.detail = email;

    // 2. Provider (blocks)
    if (policy.overrides.denyDomains.includes(domain)) {
        providerCheck.result = 'fail';
        providerCheck.detail = `${domain} is on the deny list.`;
        return { status: 'error', code: 'DENIED_DOMAIN', message: formatEmailPolicyMessage(msg.DENIED_DOMAIN, { domain }), checks };
    }
    if (!policy.overrides.allowDomains.includes(domain)) {
        if (policy.disposableProviders.includes(domain)) {
            providerCheck.result = 'fail';
            providerCheck.detail = `${domain} is a disposable email provider.`;
            return { status: 'error', code: 'DISPOSABLE_PROVIDER', message: msg.DISPOSABLE_PROVIDER, checks };
        }
        if (policy.freeProviders.includes(domain)
            || policy.regionalIspProviders.includes(domain)
            || policy.providerFamilyPattern.test(domain)) {
            providerCheck.result = 'fail';
            providerCheck.detail = `${domain} is a public email provider.`;
            return { status: 'error', code: 'FREE_PROVIDER', message: formatEmailPolicyMessage(msg.FREE_PROVIDER, { domain }), checks };
        }
    }
    providerCheck.result = 'pass';
    providerCheck.detail = `${domain} is an organization domain.`;

    // 3. Mailbox (never blocks)
    const baseLocal = localPart.split('+')[0];
    const tokens = baseLocal.split(/[._-]+/).filter(Boolean);
    const orgLabel = domain.split('.')[0];
    const compact = tokens.join('');
    const isRoleWord = token => policy.roleWords.includes(token) || policy.roleWords.includes(token.replace(/\d+$/, ''));
    const isRoleLike = token => isRoleWord(token) || token === orgLabel || /^\d+$/.test(token);

    if (isRoleWord(compact) || (tokens.length > 0 && tokens.every(isRoleLike))) {
        mailboxCheck.result = 'pass';
        mailboxCheck.detail = `"${baseLocal}" is a role-based mailbox.`;
        return { status: 'ok', code: 'ROLE_BASED', message: msg.ROLE_BASED, checks };
    }

    const personalTokens = tokens.filter(token => /^[a-z]+$/.test(token) && !isRoleLike(token));
    let reason = '';
    if (tokens.length === 2 && personalTokens.length === 2) {
        reason = personalTokens.some(token => token.length === 1)
            ? msg.reasons.initialSurname
            : msg.reasons.nameDotName;
    } else {
        const nameToken = tokens
            .map(token => token.replace(/\d+$/, ''))
            .find(token => policy.commonFirstNames.includes(token));
        if (nameToken) {
            reason = formatEmailPolicyMessage(msg.reasons.firstName, { token: nameToken });
        }
    }

    mailboxCheck.result = 'warn';
    if (reason) {
        mailboxCheck.detail = reason;
        return {
            status: 'warning', code: 'PERSONAL_LIKELY', strength: 'strong',
            message: formatEmailPolicyMessage(msg.PERSONAL_LIKELY, { reason, domain }), checks
        };
    }
    mailboxCheck.detail = `"${baseLocal}" is not a known role-based mailbox.`;
    return {
        status: 'warning', code: 'UNRECOGNIZED_MAILBOX', strength: 'weak',
        message: formatEmailPolicyMessage(msg.UNRECOGNIZED_MAILBOX, { domain }), checks
    };
}
