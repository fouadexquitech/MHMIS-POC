// ===== Public Activities ("Explore Mental Health Services") page =====
// Guest-facing service directory — no sign-in required. Deliberately excludes
// internal/technical fields (referral status, facility status, nationality, age
// range, export) that meant nothing to a guest in the legacy screen — see
// docs/UX-REFERENCE-NOTES.md. The map and results work together: picking a
// governorate pin filters the results, and the results stay in sync with the
// filter bar.

// Approximate demo positions (% of the map panel) for each governorate's pin.
// This POC has no mapping library or geo data (see CLAUDE.md), so placement is a
// stylized approximation over the existing Lebanon silhouette, not a precise
// geographic projection.
const PUBLIC_MAP_PINS = [
    { governorate: "North", top: "25%", left: "46%" },
    { governorate: "Mount Lebanon", top: "41%", left: "47%" },
    { governorate: "Beirut", top: "52%", left: "29%" },
    { governorate: "Bekaa", top: "43%", left: "65%" },
    { governorate: "South", top: "68%", left: "42%" }
];

const publicFilters = {
    query: "",
    governorate: "",
    caza: "",
    populationGroups: []
};

function resetPublicFilters() {
    publicFilters.query = "";
    publicFilters.governorate = "";
    publicFilters.caza = "";
    publicFilters.populationGroups = [];
}

function getLebanonOutlineMarkup() {
    const source = document.querySelector('#loginScreen .lebanon-outline');
    return source ? source.outerHTML : '';
}

function renderPublicActivitiesPage() {
    resetPublicFilters();
    const container = document.getElementById('public-page-container');
    container.innerHTML = `
        <div class="public-page">
            <div class="public-hero">
                <div class="public-hero-text">
                    <h1>Find Mental Health Support Near You</h1>
                    <p>Browse mental health and psychosocial support activities offered by NGOs across Lebanon. Pick a region on the map or use the filters below.</p>
                </div>
                <button type="button" class="btn btn-primary" id="publicLoginBtn">
                    <i data-lucide="log-in"></i><span>Log In</span>
                </button>
            </div>

            <div class="public-filter-bar">
                <div class="search-group">
                    <i data-lucide="search"></i>
                    <input type="search" id="publicSearch" placeholder="Search by service or organization..." aria-label="Search services" />
                </div>
                ${renderSelect('publicGovernorateFilter', 'Governorate', mockData.governorates, '')}
                ${renderSelect('publicCazaFilter', 'Caza', [], '')}
                <div class="filter-group">
                    <label>Who It's For</label>
                    ${renderMultiSelectDropdown('publicPopulationGroupFilter', mockData.populationGroups, [], 'Any population group')}
                </div>
                <button type="button" class="btn btn-secondary public-clear-filters" id="publicClearFiltersBtn" hidden>
                    <i data-lucide="x"></i><span>Clear filters</span>
                </button>
            </div>

            <div class="public-results-layout">
                <div class="lebanon-map-panel">
                    ${getLebanonOutlineMarkup()}
                    <div class="map-pins" id="publicMapPins"></div>
                </div>
                <div class="public-results">
                    <p class="result-count" id="publicResultCount"></p>
                    <div class="service-card-grid" id="publicServiceGrid"></div>
                </div>
            </div>
        </div>`;

    attachPublicActivitiesListeners();
    renderPublicResults();
    refreshLucideIcons();
}

function getFilteredPublicServices() {
    const q = publicFilters.query.trim().toLowerCase();
    return mockData.publicServices.filter(service => {
        if (publicFilters.governorate && service.governorate !== publicFilters.governorate) {
            return false;
        }
        if (publicFilters.caza && service.caza !== publicFilters.caza) {
            return false;
        }
        if (publicFilters.populationGroups.length && !publicFilters.populationGroups.includes(service.populationGroup)) {
            return false;
        }
        if (q) {
            const haystack = `${service.subActivity} ${service.organization} ${service.facility}`.toLowerCase();
            if (!haystack.includes(q)) {
                return false;
            }
        }
        return true;
    });
}

function renderPublicMapPins(filteredServices) {
    const wrap = document.getElementById('publicMapPins');
    wrap.innerHTML = PUBLIC_MAP_PINS.map(pin => {
        const count = filteredServices.filter(s => s.governorate === pin.governorate).length;
        const selected = publicFilters.governorate === pin.governorate;
        return `
            <button type="button" class="map-pin${selected ? ' selected' : ''}${count === 0 ? ' is-empty' : ''}"
                style="top:${pin.top}; left:${pin.left};" data-governorate="${escapeHtml(pin.governorate)}"
                title="${escapeHtml(pin.governorate)}: ${count} service${count === 1 ? '' : 's'}">
                <span class="map-pin-count">${count}</span>
                <span class="map-pin-label">${escapeHtml(pin.governorate)}</span>
            </button>`;
    }).join('');

    wrap.querySelectorAll('.map-pin').forEach(pinEl => {
        pinEl.addEventListener('click', () => {
            const gov = pinEl.getAttribute('data-governorate');
            publicFilters.governorate = publicFilters.governorate === gov ? '' : gov;
            publicFilters.caza = '';
            document.getElementById('publicGovernorateFilter').value = publicFilters.governorate;
            populateCazaOptions();
            renderPublicResults();
        });
    });
}

function renderServiceCard(service) {
    const contactLine = service.contact ? `
        <div class="service-card-contact">
            ${service.contact.phone ? `<span><i data-lucide="phone"></i>${escapeHtml(service.contact.phone)}</span>` : ''}
            ${service.contact.email ? `<span><i data-lucide="mail"></i>${escapeHtml(service.contact.email)}</span>` : ''}
        </div>` : '';

    return `
        <article class="service-card">
            <h3 class="service-card-title">${escapeHtml(service.subActivity)}</h3>
            <p class="service-card-org"><i data-lucide="building-2"></i>${escapeHtml(service.organization)}</p>
            <p class="service-card-location"><i data-lucide="map-pin"></i>${escapeHtml(service.facility)} &middot; ${escapeHtml(service.caza)}, ${escapeHtml(service.governorate)}</p>
            <span class="service-card-pill">${escapeHtml(service.populationGroup)}</span>
            ${contactLine}
        </article>`;
}

function renderPublicResults() {
    const filtered = getFilteredPublicServices();
    renderPublicMapPins(filtered);

    const countEl = document.getElementById('publicResultCount');
    const scope = publicFilters.governorate ? ` in ${publicFilters.governorate}` : '';
    countEl.textContent = `${filtered.length} service${filtered.length === 1 ? '' : 's'} found${scope}`;

    const grid = document.getElementById('publicServiceGrid');
    grid.innerHTML = filtered.length
        ? filtered.map(renderServiceCard).join('')
        : `<div class="public-empty-state">
               <i data-lucide="search-x"></i>
               <p>No services match these filters yet. Try a different region or population group.</p>
           </div>`;

    const anyFilterActive = publicFilters.query || publicFilters.governorate || publicFilters.caza || publicFilters.populationGroups.length;
    document.getElementById('publicClearFiltersBtn').hidden = !anyFilterActive;

    refreshLucideIcons();
}

function populateCazaOptions() {
    const cazaSelect = document.getElementById('publicCazaFilter');
    const cazas = publicFilters.governorate ? (mockData.cazasByGovernorate[publicFilters.governorate] || []) : [];
    const opts = cazas.map(c => `<option value="${escapeHtml(c)}"${c === publicFilters.caza ? ' selected' : ''}>${escapeHtml(c)}</option>`).join('');
    cazaSelect.innerHTML = `<option value="">All</option>${opts}`;
    cazaSelect.disabled = !publicFilters.governorate;
}

function attachPublicActivitiesListeners() {
    document.getElementById('publicLoginBtn').addEventListener('click', () => showLoginScreenFromPublic());

    document.getElementById('publicSearch').addEventListener('input', (e) => {
        publicFilters.query = e.target.value;
        renderPublicResults();
    });

    document.getElementById('publicGovernorateFilter').addEventListener('change', (e) => {
        publicFilters.governorate = e.target.value;
        publicFilters.caza = '';
        populateCazaOptions();
        renderPublicResults();
    });

    document.getElementById('publicCazaFilter').addEventListener('change', (e) => {
        publicFilters.caza = e.target.value;
        renderPublicResults();
    });

    attachMultiSelectDropdown('publicPopulationGroupFilter', (values) => {
        publicFilters.populationGroups = values;
        renderPublicResults();
    });

    document.getElementById('publicClearFiltersBtn').addEventListener('click', () => {
        renderPublicActivitiesPage();
    });

    populateCazaOptions();
}
