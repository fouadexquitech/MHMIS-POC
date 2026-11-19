// ===== Administrator: Reviews (Event Reviews, Potential Duplicate Facilities, Pending Custom Values) =====
let reviewsView = {
    eventSearch: '',
    eventStatusFilter: '',
    selectedEventReviewId: null,
    duplicateSearch: '',
    duplicateStatusFilter: '',
    selectedDuplicateId: null,
    customValueSearch: '',
    customValueLookupFilter: '',
    customValueStatusFilter: ''
};

function formatEventDateRange(r) {
    return r.startDate === r.endDate ? r.startDate : `${r.startDate} → ${r.endDate}`;
}

// --- Status pills (extend the existing .reg-status component, no parallel pill system) ---
function eventReviewStatusClass(status) {
    switch (status) {
        case EVENT_REVIEW_STATUS.approved: return 'approved';
        case EVENT_REVIEW_STATUS.rejected: return 'rejected';
        default: return 'pending';
    }
}

function eventReviewStatusIcon(status) {
    switch (status) {
        case EVENT_REVIEW_STATUS.approved: return 'circle-check';
        case EVENT_REVIEW_STATUS.rejected: return 'circle-x';
        case EVENT_REVIEW_STATUS.needsModification: return 'circle-alert';
        default: return 'clock';
    }
}

function renderEventReviewStatusPill(status) {
    return `<span class="reg-status reg-status-${eventReviewStatusClass(status)}"><i data-lucide="${eventReviewStatusIcon(status)}"></i><span>${escapeHtml(status)}</span></span>`;
}

function facilityDuplicateStatusClass(status) {
    switch (status) {
        case FACILITY_DUPLICATE_STATUS.confirmedDistinct: return 'approved';
        case FACILITY_DUPLICATE_STATUS.linked: return 'info';
        default: return 'pending';
    }
}

function facilityDuplicateStatusIcon(status) {
    switch (status) {
        case FACILITY_DUPLICATE_STATUS.confirmedDistinct: return 'circle-check';
        case FACILITY_DUPLICATE_STATUS.linked: return 'git-merge';
        default: return 'clock';
    }
}

function renderFacilityDuplicateStatusPill(status) {
    return `<span class="reg-status reg-status-${facilityDuplicateStatusClass(status)}"><i data-lucide="${facilityDuplicateStatusIcon(status)}"></i><span>${escapeHtml(status)}</span></span>`;
}

function customValueStatusClass(status) {
    switch (status) {
        case CUSTOM_VALUE_STATUS.accepted: return 'approved';
        case CUSTOM_VALUE_STATUS.merged: return 'info';
        default: return 'pending';
    }
}

function customValueStatusIcon(status) {
    switch (status) {
        case CUSTOM_VALUE_STATUS.accepted: return 'circle-check';
        case CUSTOM_VALUE_STATUS.merged: return 'git-merge';
        default: return 'clock';
    }
}

function renderCustomValueStatusPill(status) {
    return `<span class="reg-status reg-status-${customValueStatusClass(status)}"><i data-lucide="${customValueStatusIcon(status)}"></i><span>${escapeHtml(status)}</span></span>`;
}

// ===== Event Reviews =====
function getFilteredEventReviews() {
    const query = reviewsView.eventSearch.trim().toLowerCase();
    return mockData.eventReviews.filter(r => {
        const matchesStatus = !reviewsView.eventStatusFilter || r.status === reviewsView.eventStatusFilter;
        const matchesQuery = !query || r.organization.toLowerCase().includes(query) || r.eventTitle.toLowerCase().includes(query);
        return matchesStatus && matchesQuery;
    });
}

function getEventReviewById(id) {
    return mockData.eventReviews.find(r => r.id === Number(id)) || null;
}

function renderEventReviewsPage() {
    const records = getFilteredEventReviews();
    const rowsHTML = records.length
        ? records.map(r => `
            <tr>
                <td>
                    <div class="cell-primary">${escapeHtml(r.eventTitle)}</div>
                    <div class="cell-secondary">${escapeHtml(r.organization)}</div>
                </td>
                <td>${escapeHtml(r.visibility)}</td>
                <td>${escapeHtml(formatEventDateRange(r))}</td>
                <td>${escapeHtml(r.location || '-')}</td>
                <td>${renderEventReviewStatusPill(r.status)}</td>
                <td class="actions-cell">
                    <button type="button" class="btn btn-link" data-review-event="${r.id}">Review</button>
                </td>
            </tr>`).join('')
        : '<tr><td colspan="6" class="empty-cell">No events match the current filters.</td></tr>';

    const statusOptions = [
        EVENT_REVIEW_STATUS.pendingReview,
        EVENT_REVIEW_STATUS.needsModification,
        EVENT_REVIEW_STATUS.approved,
        EVENT_REVIEW_STATUS.rejected
    ];

    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Submitted Events</h1>
                <button type="button" class="btn btn-secondary" id="exportEventReviewsBtn"><i data-lucide="download"></i><span>Export to Excel</span></button>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="eventReviewSearch" placeholder="Search organization or event title..." aria-label="Search events" value="${escapeHtml(reviewsView.eventSearch)}" />
                </div>
                ${renderSelect('eventReviewStatusFilter', 'Status', statusOptions, reviewsView.eventStatusFilter)}
            </div>
            <div class="result-count">${records.length} event${records.length === 1 ? '' : 's'}</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Visibility</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </div>`;
}

function attachEventReviewsListeners() {
    document.getElementById('exportEventReviewsBtn').addEventListener('click', exportEventReviews);

    document.getElementById('eventReviewSearch').addEventListener('input', (e) => {
        reviewsView.eventSearch = e.target.value;
        renderPage('event-reviews');
        document.getElementById('eventReviewSearch').focus();
    });

    document.getElementById('eventReviewStatusFilter').addEventListener('change', (e) => {
        reviewsView.eventStatusFilter = e.target.value;
        renderPage('event-reviews');
    });

    document.querySelectorAll('[data-review-event]').forEach(btn => {
        btn.addEventListener('click', () => {
            reviewsView.selectedEventReviewId = Number(btn.getAttribute('data-review-event'));
            navigateTo('event-review');
        });
    });
}

function exportEventReviews() {
    showToast(`Exported ${mockData.eventReviews.length} events to Excel (simulated).`, 'success');
}

function renderEventReviewDetailPage() {
    const r = getEventReviewById(reviewsView.selectedEventReviewId);
    if (!r) {
        return renderEventReviewsPage();
    }

    const row = (label, value) => `
        <div class="detail-row">
            <div class="detail-label">${escapeHtml(label)}</div>
            <div class="detail-value">${escapeHtml(value || '-')}</div>
        </div>`;

    let actionsHTML = '';
    if (r.status === EVENT_REVIEW_STATUS.pendingReview) {
        actionsHTML = `
            <div class="form-actions">
                <button type="button" class="btn btn-primary" id="approveEventBtn">Approve</button>
                <button type="button" class="btn btn-secondary" id="requestEventModificationBtn">Request Modification</button>
                <button type="button" class="btn btn-secondary" id="rejectEventBtn">Reject</button>
            </div>`;
    } else if (r.status === EVENT_REVIEW_STATUS.rejected) {
        actionsHTML = `
            <div class="reason-box">
                <div class="reason-box-label">Rejection reason sent to the organization</div>
                <p>${escapeHtml(r.reviewNote)}</p>
            </div>`;
    } else if (r.status === EVENT_REVIEW_STATUS.needsModification) {
        actionsHTML = `
            <div class="reason-box">
                <div class="reason-box-label">Modification requested from the organization</div>
                <p>${escapeHtml(r.reviewNote)}</p>
            </div>`;
    } else {
        actionsHTML = '<div class="info-banner">This event has been approved.</div>';
    }

    return `
        <div class="page">
            <div class="page-header page-header-start">
                <h1 class="page-title">${escapeHtml(r.eventTitle)}</h1>
                ${renderEventReviewStatusPill(r.status)}
            </div>

            <section class="profile-section">
                <h2 class="profile-section-title">Event Details</h2>
                ${row('Organization', r.organization)}
                ${row('Visibility', r.visibility)}
                ${row('Start Date', r.startDate)}
                ${row('End Date', r.endDate)}
                ${row('Location', r.location)}
                ${row('Governorate', r.governorate)}
                ${row('Description', r.description)}
                ${row('Submitted', r.submittedDate)}
            </section>

            ${actionsHTML}
        </div>`;
}

function attachEventReviewDetailListeners() {

    document.getElementById('approveEventBtn')?.addEventListener('click', () => {
        const r = approveEventReview(reviewsView.selectedEventReviewId);
        showToast(`${r.eventTitle} has been approved.`, 'success');
        renderPage('event-review');
    });

    document.getElementById('rejectEventBtn')?.addEventListener('click', () => {
        openFormModal(
            'Reject Event',
            `<div class="form-field">
                <label for="rejectEventReason">Reason <span class="required">*</span></label>
                <textarea id="rejectEventReason" rows="4"></textarea>
                <div class="field-error" id="rejectEventReason-error"></div>
            </div>`,
            `<button type="button" class="btn btn-secondary" id="cancelRejectEventBtn">Cancel</button>
             <button type="button" class="btn btn-primary" id="confirmRejectEventBtn">Reject Event</button>`
        );

        document.getElementById('cancelRejectEventBtn').addEventListener('click', closeFormModal);
        document.getElementById('confirmRejectEventBtn').addEventListener('click', () => {
            const reason = document.getElementById('rejectEventReason').value.trim();
            if (!reason) {
                document.getElementById('rejectEventReason-error').textContent = 'A reason is required.';
                return;
            }
            const r = rejectEventReview(reviewsView.selectedEventReviewId, reason);
            closeFormModal();
            showToast(`${r.eventTitle} has been rejected.`, 'success');
            renderPage('event-review');
        });
    });

    document.getElementById('requestEventModificationBtn')?.addEventListener('click', () => {
        openFormModal(
            'Request Modification',
            `<div class="form-field">
                <label for="modificationNote">What needs to change? <span class="required">*</span></label>
                <textarea id="modificationNote" rows="4"></textarea>
                <div class="field-error" id="modificationNote-error"></div>
            </div>`,
            `<button type="button" class="btn btn-secondary" id="cancelModificationBtn">Cancel</button>
             <button type="button" class="btn btn-primary" id="confirmModificationBtn">Send Request</button>`
        );

        document.getElementById('cancelModificationBtn').addEventListener('click', closeFormModal);
        document.getElementById('confirmModificationBtn').addEventListener('click', () => {
            const note = document.getElementById('modificationNote').value.trim();
            if (!note) {
                document.getElementById('modificationNote-error').textContent = 'Please describe the requested change.';
                return;
            }
            const r = requestEventModification(reviewsView.selectedEventReviewId, note);
            closeFormModal();
            showToast(`Modification requested for ${r.eventTitle}.`, 'success');
            renderPage('event-review');
        });
    });
}

function approveEventReview(id) {
    const r = getEventReviewById(id);
    if (!r) return null;
    r.status = EVENT_REVIEW_STATUS.approved;
    r.reviewNote = '';
    r.reviewedDate = formatDemoDate(new Date());
    return r;
}

function rejectEventReview(id, reason) {
    const r = getEventReviewById(id);
    if (!r) return null;
    r.status = EVENT_REVIEW_STATUS.rejected;
    r.reviewNote = reason;
    r.reviewedDate = formatDemoDate(new Date());
    return r;
}

function requestEventModification(id, note) {
    const r = getEventReviewById(id);
    if (!r) return null;
    r.status = EVENT_REVIEW_STATUS.needsModification;
    r.reviewNote = note;
    r.reviewedDate = formatDemoDate(new Date());
    return r;
}

// ===== Potential Duplicate Facilities =====
function getFilteredFacilityDuplicates() {
    const query = reviewsView.duplicateSearch.trim().toLowerCase();
    return mockData.facilityDuplicates.filter(d => {
        const matchesStatus = !reviewsView.duplicateStatusFilter || d.status === reviewsView.duplicateStatusFilter;
        const matchesQuery = !query
            || d.newFacility.name.toLowerCase().includes(query)
            || d.newFacility.submittedBy.toLowerCase().includes(query);
        return matchesStatus && matchesQuery;
    });
}

function getFacilityDuplicateById(id) {
    return mockData.facilityDuplicates.find(d => d.id === Number(id)) || null;
}

function renderFacilityDuplicatesPage() {
    const records = getFilteredFacilityDuplicates();
    const rowsHTML = records.length
        ? records.map(d => {
            const closest = d.candidates.reduce((min, c) => Math.min(min, c.distanceMeters), Infinity);
            const matchLabel = d.candidates.length === 1 ? d.candidates[0].name : `${d.candidates.length} matches`;
            return `
            <tr>
                <td>
                    <div class="cell-primary">${escapeHtml(d.newFacility.name)}</div>
                    <div class="cell-secondary">${escapeHtml(d.newFacility.type)}</div>
                </td>
                <td>${escapeHtml(d.newFacility.submittedBy)}</td>
                <td>${escapeHtml(matchLabel)}</td>
                <td>${closest}m</td>
                <td>${escapeHtml(d.newFacility.submittedDate)}</td>
                <td>${renderFacilityDuplicateStatusPill(d.status)}</td>
                <td class="actions-cell">
                    <button type="button" class="btn btn-link" data-review-duplicate="${d.id}">Review</button>
                </td>
            </tr>`;
        }).join('')
        : '<tr><td colspan="7" class="empty-cell">No potential duplicate facilities match the current filters.</td></tr>';

    const statusOptions = [
        FACILITY_DUPLICATE_STATUS.pendingReview,
        FACILITY_DUPLICATE_STATUS.linked,
        FACILITY_DUPLICATE_STATUS.confirmedDistinct
    ];

    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Possible Duplicate Facilities</h1>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="duplicateSearch" placeholder="Search new facility or submitting organization..." aria-label="Search potential duplicate facilities" value="${escapeHtml(reviewsView.duplicateSearch)}" />
                </div>
                ${renderSelect('duplicateStatusFilter', 'Status', statusOptions, reviewsView.duplicateStatusFilter)}
            </div>
            <div class="result-count">${records.length} record${records.length === 1 ? '' : 's'}</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>New Facility</th>
                        <th>Submitted By</th>
                        <th>Candidate Match(es)</th>
                        <th>Closest Distance</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </div>`;
}

function attachFacilityDuplicatesListeners() {
    document.getElementById('duplicateSearch').addEventListener('input', (e) => {
        reviewsView.duplicateSearch = e.target.value;
        renderPage('facility-duplicates');
        document.getElementById('duplicateSearch').focus();
    });

    document.getElementById('duplicateStatusFilter').addEventListener('change', (e) => {
        reviewsView.duplicateStatusFilter = e.target.value;
        renderPage('facility-duplicates');
    });

    document.querySelectorAll('[data-review-duplicate]').forEach(btn => {
        btn.addEventListener('click', () => {
            reviewsView.selectedDuplicateId = Number(btn.getAttribute('data-review-duplicate'));
            navigateTo('facility-duplicate-review');
        });
    });
}

function renderFacilityDuplicateReviewPage() {
    const d = getFacilityDuplicateById(reviewsView.selectedDuplicateId);
    if (!d) {
        return renderFacilityDuplicatesPage();
    }

    const row = (label, value) => `
        <div class="detail-row">
            <div class="detail-label">${escapeHtml(label)}</div>
            <div class="detail-value">${escapeHtml(value || '-')}</div>
        </div>`;

    const isPending = d.status === FACILITY_DUPLICATE_STATUS.pendingReview;

    const candidatesHTML = d.candidates.map(c => {
        const isLinked = d.status === FACILITY_DUPLICATE_STATUS.linked && d.linkedCandidateId === c.facilityId;
        const linkAction = isPending
            ? `<div class="form-actions"><button type="button" class="btn btn-primary" data-link-candidate="${c.facilityId}">Link to This Facility</button></div>`
            : (isLinked ? `<div class="info-banner">Linked as the same physical facility.</div>` : '');
        return `
            <section class="profile-section">
                <h2 class="profile-section-title">Existing Facility — ${escapeHtml(c.distanceMeters)}m away</h2>
                ${row('Name', c.name)}
                ${row('Type', c.type)}
                ${row('Governorate', c.governorate)}
                ${row('Caza', c.caza)}
                ${row('Locality', c.locality)}
                ${row('Contact', c.contact)}
                ${row('Supported By', c.supportedBy)}
                ${row('Support Period', `${c.supportStart}${c.supportEnd ? ' → ' + c.supportEnd : ' → present'}`)}
                ${linkAction}
            </section>`;
    }).join('');

    let resolutionHTML = '';
    if (d.status === FACILITY_DUPLICATE_STATUS.confirmedDistinct) {
        resolutionHTML = `
            <div class="info-banner">Confirmed as a distinct facility${d.resolutionNote ? ': ' + escapeHtml(d.resolutionNote) : '.'}</div>`;
    }

    return `
        <div class="page">
            <div class="page-header page-header-start">
                <h1 class="page-title">${escapeHtml(d.newFacility.name)}</h1>
                ${renderFacilityDuplicateStatusPill(d.status)}
            </div>
            <div class="info-banner">Flagged because ${d.candidates.length} existing facilit${d.candidates.length === 1 ? 'y is' : 'ies are'} within ~20m. Confirm whether this is the same physical facility or genuinely distinct.</div>

            <div class="compare-grid">
                <section class="profile-section">
                    <h2 class="profile-section-title">New Facility — Submitted by ${escapeHtml(d.newFacility.submittedBy)}</h2>
                    ${row('Name', d.newFacility.name)}
                    ${row('Type', d.newFacility.type)}
                    ${row('Governorate', d.newFacility.governorate)}
                    ${row('Caza', d.newFacility.caza)}
                    ${row('Locality', d.newFacility.locality)}
                    ${row('Contact', d.newFacility.contact)}
                    ${row('Submitted', d.newFacility.submittedDate)}
                </section>
                <div>${candidatesHTML}</div>
            </div>

            ${resolutionHTML}
            ${isPending ? `<div class="form-actions"><button type="button" class="btn btn-secondary" id="confirmDistinctBtn">Confirm as Distinct Facility</button></div>` : ''}
        </div>`;
}

function attachFacilityDuplicateReviewListeners() {

    document.querySelectorAll('[data-link-candidate]').forEach(btn => {
        btn.addEventListener('click', () => {
            const candidateFacilityId = Number(btn.getAttribute('data-link-candidate'));
            showConfirmDialog({
                title: 'Link Facility',
                message: 'Link this new facility as the same physical facility as the selected existing record? This cannot be undone.',
                confirmLabel: 'Confirm Link',
                tone: 'primary',
                onConfirm: () => {
                    const d = linkFacilityDuplicate(reviewsView.selectedDuplicateId, candidateFacilityId);
                    showToast(`${d.newFacility.name} has been linked.`, 'success');
                    renderPage('facility-duplicate-review');
                }
            });
        });
    });

    document.getElementById('confirmDistinctBtn')?.addEventListener('click', () => {
        showConfirmDialog({
            title: 'Confirm as Distinct Facility',
            message: 'Confirm this is a genuinely distinct facility, separate from the candidate match(es) shown?',
            confirmLabel: 'Confirm as Distinct',
            tone: 'primary',
            onConfirm: () => {
                const d = confirmFacilityDistinct(reviewsView.selectedDuplicateId);
                showToast(`${d.newFacility.name} has been confirmed as a distinct facility.`, 'success');
                renderPage('facility-duplicate-review');
            }
        });
    });
}

function linkFacilityDuplicate(id, candidateFacilityId) {
    const d = getFacilityDuplicateById(id);
    if (!d) return null;
    d.status = FACILITY_DUPLICATE_STATUS.linked;
    d.linkedCandidateId = candidateFacilityId;
    d.resolvedDate = formatDemoDate(new Date());
    return d;
}

function confirmFacilityDistinct(id) {
    const d = getFacilityDuplicateById(id);
    if (!d) return null;
    d.status = FACILITY_DUPLICATE_STATUS.confirmedDistinct;
    d.resolvedDate = formatDemoDate(new Date());
    return d;
}

// ===== Pending Custom Values =====
function getFilteredPendingCustomValues() {
    const query = reviewsView.customValueSearch.trim().toLowerCase();
    return mockData.pendingCustomValues.filter(v => {
        const matchesStatus = !reviewsView.customValueStatusFilter || v.status === reviewsView.customValueStatusFilter;
        const matchesLookup = !reviewsView.customValueLookupFilter || v.lookupLabel === reviewsView.customValueLookupFilter;
        const matchesQuery = !query || v.proposedValue.toLowerCase().includes(query) || v.submittedBy.toLowerCase().includes(query);
        return matchesStatus && matchesLookup && matchesQuery;
    });
}

function getPendingCustomValueById(id) {
    return mockData.pendingCustomValues.find(v => v.id === Number(id)) || null;
}

function renderPendingCustomValuesPage() {
    const records = getFilteredPendingCustomValues();
    const rowsHTML = records.length
        ? records.map(v => `
            <tr>
                <td>${escapeHtml(v.lookupLabel)}</td>
                <td>
                    <div class="cell-primary">${escapeHtml(v.proposedValue)}</div>
                    ${v.status === CUSTOM_VALUE_STATUS.merged ? `<div class="cell-secondary">Merged into ${escapeHtml(v.mergedIntoValue)}</div>` : ''}
                </td>
                <td>${escapeHtml(v.submittedBy)}</td>
                <td>${escapeHtml(v.submittedDate)}</td>
                <td>${renderCustomValueStatusPill(v.status)}</td>
                <td class="actions-cell">
                    ${v.status === CUSTOM_VALUE_STATUS.pendingReview
                        ? `<button type="button" class="btn btn-link" data-accept-value="${v.id}">Accept</button>
                           <button type="button" class="btn btn-link" data-merge-value="${v.id}">Merge</button>`
                        : ''}
                </td>
            </tr>`).join('')
        : '<tr><td colspan="6" class="empty-cell">No pending custom values match the current filters.</td></tr>';

    const statusOptions = [CUSTOM_VALUE_STATUS.pendingReview, CUSTOM_VALUE_STATUS.accepted, CUSTOM_VALUE_STATUS.merged];
    const lookupOptions = [...new Set(mockData.pendingCustomValues.map(v => v.lookupLabel))];

    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Submitted Custom Values</h1>
            </div>
            <div class="list-toolbar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="customValueSearch" placeholder="Search value or organization..." aria-label="Search pending custom values" value="${escapeHtml(reviewsView.customValueSearch)}" />
                </div>
                ${renderSelect('customValueLookupFilter', 'Lookup Type', lookupOptions, reviewsView.customValueLookupFilter)}
                ${renderSelect('customValueStatusFilter', 'Status', statusOptions, reviewsView.customValueStatusFilter)}
            </div>
            <div class="result-count">${records.length} value${records.length === 1 ? '' : 's'}</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Lookup Type</th>
                        <th>Proposed Value</th>
                        <th>Submitted By</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </div>`;
}

function attachPendingCustomValuesListeners() {
    document.getElementById('customValueSearch').addEventListener('input', (e) => {
        reviewsView.customValueSearch = e.target.value;
        renderPage('pending-custom-values');
        document.getElementById('customValueSearch').focus();
    });

    document.getElementById('customValueLookupFilter').addEventListener('change', (e) => {
        reviewsView.customValueLookupFilter = e.target.value;
        renderPage('pending-custom-values');
    });

    document.getElementById('customValueStatusFilter').addEventListener('change', (e) => {
        reviewsView.customValueStatusFilter = e.target.value;
        renderPage('pending-custom-values');
    });

    document.querySelectorAll('[data-accept-value]').forEach(btn => {
        btn.addEventListener('click', () => {
            const v = acceptCustomValue(Number(btn.getAttribute('data-accept-value')));
            showToast(`${v.proposedValue} has been accepted as a new ${v.lookupLabel.toLowerCase()}.`, 'success');
            renderPage('pending-custom-values');
        });
    });

    document.querySelectorAll('[data-merge-value]').forEach(btn => {
        btn.addEventListener('click', () => {
            const v = getPendingCustomValueById(Number(btn.getAttribute('data-merge-value')));
            const existingValues = (mockData[v.lookupKey] || []).filter(val => val !== v.proposedValue);
            openFormModal(
                'Merge Custom Value',
                `<div class="form-field">
                    <label for="mergeTargetValue">Merge "${escapeHtml(v.proposedValue)}" into <span class="required">*</span></label>
                    <select id="mergeTargetValue">
                        ${existingValues.map(val => `<option value="${escapeHtml(val)}">${escapeHtml(val)}</option>`).join('')}
                    </select>
                </div>`,
                `<button type="button" class="btn btn-secondary" id="cancelMergeBtn">Cancel</button>
                 <button type="button" class="btn btn-primary" id="confirmMergeBtn">Merge</button>`
            );
            document.getElementById('cancelMergeBtn').addEventListener('click', closeFormModal);
            document.getElementById('confirmMergeBtn').addEventListener('click', () => {
                const target = document.getElementById('mergeTargetValue').value;
                const merged = mergeCustomValue(v.id, target);
                closeFormModal();
                showToast(`${merged.proposedValue} has been merged into ${merged.mergedIntoValue}.`, 'success');
                renderPage('pending-custom-values');
            });
        });
    });
}

function acceptCustomValue(id) {
    const v = getPendingCustomValueById(id);
    if (!v) return null;
    v.status = CUSTOM_VALUE_STATUS.accepted;
    v.resolvedDate = formatDemoDate(new Date());
    if (mockData[v.lookupKey] && !mockData[v.lookupKey].includes(v.proposedValue)) {
        mockData[v.lookupKey].push(v.proposedValue);
    }
    return v;
}

function mergeCustomValue(id, existingValue) {
    const v = getPendingCustomValueById(id);
    if (!v) return null;
    v.status = CUSTOM_VALUE_STATUS.merged;
    v.mergedIntoValue = existingValue;
    v.resolvedDate = formatDemoDate(new Date());
    return v;
}
