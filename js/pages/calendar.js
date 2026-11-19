// ===== Events Calendar =====
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toIsoDate(d) {
    return d.toISOString().slice(0, 10);
}

function getCalendarEventType(typeId) {
    return mockData.calendarEventTypes.find(t => t.id === typeId) || mockData.calendarEventTypes[0];
}

// The organization the signed-in user adds events for.
function getCalendarOwnOrganization() {
    return isAdminUser() ? 'NMHP' : getCurrentOrganizationName();
}

// The administrator sees every organization's events and can filter them by
// organization.
function getVisibleCalendarEvents() {
    const org = isAdminUser() ? calendarView.organization : '';
    return org ? mockData.calendarEvents.filter(e => e.organization === org) : mockData.calendarEvents;
}

function getEventsOnDate(isoDate) {
    return getVisibleCalendarEvents().filter(e => e.date === isoDate);
}

function renderCalendarFilters() {
    if (!isAdminUser()) {
        return '';
    }
    const orgs = Array.from(new Set(mockData.calendarEvents.map(e => e.organization).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b));
    return `<div class="list-toolbar calendar-filters">${renderSelect('calendarOrgFilter', 'Organization', orgs, calendarView.organization)}</div>`;
}

function formatTime12h(hhmm) {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = ((h + 11) % 12) + 1;
    return `${hour12}:${String(m).padStart(2, '0')}${period}`;
}

function renderCalendarLegend() {
    const items = [];
    mockData.calendarEventTypes.forEach(t => {
        items.push(`<div class="legend-item"><span class="legend-dot" style="background:${t.color}"></span><span>${escapeHtml(t.label)}</span></div>`);
        items.push(`<div class="legend-item"><span class="legend-dot legend-dot-pending" style="background:${t.color}"></span><span>${escapeHtml(t.label)} Pending</span></div>`);
    });
    items.push(`<div class="legend-item"><span class="legend-dot legend-dot-canceled"></span><span>Canceled</span></div>`);
    return `<div class="calendar-legend">${items.join('')}</div>`;
}

function renderCalendarToolbar() {
    const d = calendarView.currentDate;
    let label;
    if (calendarView.mode === 'month') {
        label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    } else if (calendarView.mode === 'day') {
        label = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    } else {
        const start = new Date(d);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        label = `${MONTH_NAMES[start.getMonth()].slice(0, 3).toUpperCase()} ${start.getDate()} \u2013 ${end.getDate()}, ${end.getFullYear()}`;
    }

    return `
        <div class="calendar-toolbar">
            <div class="calendar-toolbar-views">
                <button class="cal-btn ${calendarView.mode === 'month' ? 'active' : ''}" data-view="month">Month</button>
                <button class="cal-btn ${calendarView.mode === 'week' ? 'active' : ''}" data-view="week">Week</button>
                <button class="cal-btn ${calendarView.mode === 'day' ? 'active' : ''}" data-view="day">Day</button>
            </div>
            <div class="calendar-toolbar-label">${escapeHtml(label)}</div>
            <div class="calendar-toolbar-actions">
                <button class="cal-btn cal-icon-btn" id="calPrevBtn" title="Previous" aria-label="Previous"><i data-lucide="chevron-left"></i></button>
                <button class="cal-btn cal-icon-btn" id="calNextBtn" title="Next" aria-label="Next"><i data-lucide="chevron-right"></i></button>
                <button class="cal-btn cal-today-btn" id="calTodayBtn">Today</button>
            </div>
        </div>`;
}

function renderEventPill(evt) {
    const type = getCalendarEventType(evt.type);
    const classes = ['cal-event-pill', `status-${evt.status}`];
    return `<div class="${classes.join(' ')}" style="--event-color:${type.color}" data-event-id="${evt.id}" title="${escapeHtml(evt.title)}">
        <span class="cal-event-dot"></span><span class="cal-event-label">${escapeHtml(evt.title)}</span>
    </div>`;
}

function renderMonthGrid() {
    const d = calendarView.currentDate;
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const todayIso = toIsoDate(new Date());

    let cells = '';
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + i);
        const iso = toIsoDate(cellDate);
        const inMonth = cellDate.getMonth() === month;
        const isToday = iso === todayIso;
        const dayEvents = getEventsOnDate(iso);
        cells += `
            <div class="cal-month-cell ${inMonth ? '' : 'cal-cell-outside'} ${isToday ? 'cal-cell-today' : ''}" data-date="${iso}">
                <div class="cal-month-cell-header"><span class="cal-day-number">${cellDate.getDate()}</span></div>
                <div class="cal-month-cell-events">
                    ${dayEvents.slice(0, 3).map(renderEventPill).join('')}
                    ${dayEvents.length > 3 ? `<div class="cal-more-events">+${dayEvents.length - 3} more</div>` : ''}
                </div>
            </div>`;
    }

    return `
        <div class="cal-month-view">
            <div class="cal-month-weekdays">${WEEKDAY_LABELS.map(w => `<div>${w}</div>`).join('')}</div>
            <div class="cal-month-grid">${cells}</div>
        </div>`;
}

function renderAgendaDay(dateObj) {
    const iso = toIsoDate(dateObj);
    const events = getEventsOnDate(iso).sort((a, b) => a.startTime.localeCompare(b.startTime));
    const isToday = iso === toIsoDate(new Date());
    const heading = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

    return `
        <div class="cal-agenda-day ${isToday ? 'cal-cell-today' : ''}">
            <div class="cal-agenda-day-header">${escapeHtml(heading)}</div>
            <div class="cal-agenda-day-body">
                ${events.length ? events.map(evt => `
                    <div class="cal-agenda-event ${`status-${evt.status}`}" style="--event-color:${getCalendarEventType(evt.type).color}" data-event-id="${evt.id}">
                        <div class="cal-agenda-event-time">${formatTime12h(evt.startTime)} - ${formatTime12h(evt.endTime)}</div>
                        <div class="cal-agenda-event-title">${escapeHtml(evt.title)}</div>
                    </div>`).join('') : '<div class="cal-agenda-empty">No events</div>'}
            </div>
        </div>`;
}

function renderWeekGrid() {
    const d = calendarView.currentDate;
    const start = new Date(d);
    start.setDate(start.getDate() - start.getDay());
    let days = '';
    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        days += renderAgendaDay(day);
    }
    return `<div class="cal-week-view">${days}</div>`;
}

function renderDayGrid() {
    return `<div class="cal-day-view">${renderAgendaDay(calendarView.currentDate)}</div>`;
}

function renderEventsCalendarPage() {
    let body;
    if (calendarView.mode === 'month') {
        body = renderMonthGrid();
    } else if (calendarView.mode === 'week') {
        body = renderWeekGrid();
    } else {
        body = renderDayGrid();
    }

    return `
        <div class="page calendar-page">
            <div class="page-header">
                <h1 class="page-title">Events Calendar</h1>
                <button class="btn btn-primary" id="calAddEventBtn">
                    <i data-lucide="plus"></i><span>Add Event</span>
                </button>
            </div>
            ${renderCalendarFilters()}
            ${renderCalendarLegend()}
            ${renderCalendarToolbar()}
            <div class="calendar-body">${body}</div>
        </div>`;
}

function shiftCalendarDate(direction) {
    const d = calendarView.currentDate;
    if (calendarView.mode === 'month') {
        d.setMonth(d.getMonth() + direction);
    } else if (calendarView.mode === 'week') {
        d.setDate(d.getDate() + direction * 7);
    } else {
        d.setDate(d.getDate() + direction);
    }
}

function attachEventsCalendarListeners() {
    document.querySelectorAll('.calendar-toolbar-views .cal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            calendarView.mode = btn.getAttribute('data-view');
            renderPage('events-calendar');
        });
    });
    document.getElementById('calPrevBtn').addEventListener('click', () => {
        shiftCalendarDate(-1);
        renderPage('events-calendar');
    });
    document.getElementById('calNextBtn').addEventListener('click', () => {
        shiftCalendarDate(1);
        renderPage('events-calendar');
    });
    document.getElementById('calTodayBtn').addEventListener('click', () => {
        calendarView.currentDate = new Date();
        renderPage('events-calendar');
    });
    document.getElementById('calAddEventBtn').addEventListener('click', () => openEventForm());
    document.getElementById('calendarOrgFilter')?.addEventListener('change', e => {
        calendarView.organization = e.target.value;
        renderPage('events-calendar');
    });

    document.querySelectorAll('.cal-month-cell').forEach(cell => {
        cell.addEventListener('dblclick', () => openEventForm(null, cell.getAttribute('data-date')));
    });

    // Double-clicking a day is a mouse shortcut only; "Add Event" is the
    // keyboard path to the same form, so the day cells stay out of the Tab order.
    const eventEls = document.querySelectorAll('[data-event-id]');
    eventEls.forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            openEventDetails(Number(el.getAttribute('data-event-id')));
        });
    });
    makeKeyboardActivatable(eventEls);
}

function openEventDetails(eventId) {
    const evt = mockData.calendarEvents.find(e => e.id === eventId);
    if (!evt) return;
    const type = getCalendarEventType(evt.type);
    const statusLabel = evt.status === 'confirmed' ? 'Confirmed' : evt.status === 'pending' ? 'Pending' : 'Canceled';
    const rows = [
        ['Organization', evt.organization || '—'],
        ['Type', type.label],
        ['Status', statusLabel],
        ['Date', evt.date],
        ['Time', `${formatTime12h(evt.startTime)} - ${formatTime12h(evt.endTime)}`],
        ['Location', evt.location || '—'],
        ['Description', evt.description || '—']
    ];
    // The administrator does not edit an organization's events, only NMHP's own.
    const canEdit = !isAdminUser() || evt.organization === getCalendarOwnOrganization();
    openFormModal(evt.title,
        `<dl class="detail-list">${rows.map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('')}</dl>`,
        `${canEdit ? '<button class="modal-btn" id="eventEditBtn">Edit</button>' : ''}
         <button class="modal-btn primary" id="detailCloseBtn">Close</button>`);
    document.getElementById('detailCloseBtn').addEventListener('click', closeFormModal);
    document.getElementById('eventEditBtn')?.addEventListener('click', () => openEventForm(evt.id));
}

function openEventForm(id, presetDate) {
    const editing = typeof id === 'number';
    const e = editing
        ? mockData.calendarEvents.find(x => x.id === id)
        : { title: '', type: 'event', status: 'confirmed', date: presetDate || toIsoDate(new Date()), startTime: '09:00', endTime: '10:00', location: '', description: '' };

    const typeOpts = mockData.calendarEventTypes.map(t => `<option value="${t.id}"${t.id === e.type ? ' selected' : ''}>${escapeHtml(t.label)}</option>`).join('');
    const statusOpts = ['confirmed', 'pending', 'canceled'].map(s =>
        `<option value="${s}"${s === e.status ? ' selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('');

    openFormModal(editing ? 'Edit Event' : 'Add Event', `
        <form id="eventForm" class="modal-form" novalidate>
            <div class="form-field">
                <label for="evt-title">Event Title <span class="required">*</span></label>
                <input type="text" id="evt-title" value="${escapeHtml(e.title)}" data-required="true" />
                <div class="field-error" id="evt-title-error"></div>
            </div>
            <div class="form-field">
                <label for="evt-type">Type <span class="required">*</span></label>
                <select id="evt-type" data-required="true">${typeOpts}</select>
                <div class="field-error" id="evt-type-error"></div>
            </div>
            <div class="form-field">
                <label for="evt-status">Status</label>
                <select id="evt-status">${statusOpts}</select>
            </div>
            <div class="form-field">
                <label for="evt-date">Date <span class="required">*</span></label>
                <input type="date" id="evt-date" value="${e.date}" data-required="true" />
                <div class="field-error" id="evt-date-error"></div>
            </div>
            <div class="form-field">
                <label for="evt-start">Start Time</label>
                <input type="time" id="evt-start" value="${e.startTime}" />
            </div>
            <div class="form-field">
                <label for="evt-end">End Time</label>
                <input type="time" id="evt-end" value="${e.endTime}" />
            </div>
            <div class="form-field">
                <label for="evt-location">Location</label>
                <input type="text" id="evt-location" value="${escapeHtml(e.location)}" />
            </div>
            <div class="form-field">
                <label for="evt-description">Description</label>
                <textarea id="evt-description">${escapeHtml(e.description)}</textarea>
            </div>
        </form>`,
        `<button class="modal-btn" id="evtCancelBtn">Cancel</button>
         <button class="modal-btn primary" id="evtSaveBtn">${editing ? 'Save Changes' : 'Add Event'}</button>`);

    document.getElementById('evtCancelBtn').addEventListener('click', closeFormModal);
    document.getElementById('evtSaveBtn').addEventListener('click', () => {
        const form = document.getElementById('eventForm');
        if (!validateModalForm(form)) return;
        const data = {
            title: form.querySelector('#evt-title').value.trim(),
            type: form.querySelector('#evt-type').value,
            status: form.querySelector('#evt-status').value,
            date: form.querySelector('#evt-date').value,
            startTime: form.querySelector('#evt-start').value,
            endTime: form.querySelector('#evt-end').value,
            location: form.querySelector('#evt-location').value.trim(),
            description: form.querySelector('#evt-description').value.trim()
        };
        if (editing) {
            Object.assign(e, data);
        } else {
            mockData.calendarEvents.push({ id: mockData.calendarEventNextId++, organization: getCalendarOwnOrganization(), ...data });
        }
        closeFormModal();
        showToast(editing ? 'Event updated successfully' : 'Event added successfully');
        renderPage('events-calendar');
    });
}

