// MHIS Application JavaScript

// Mock Data
const mockData = {
    organization: {
        name: "Community Health NGO",
        activities: 24,
        facilities: 8,
        providers: 15,
        upcomingEvents: 3
    },
    organizationProfile: {
        name: "Community Health NGO",
        acronym: "CHN",
        phone: "+961 1 234 567",
        mobile: "+961 71 234 567",
        email: "info@communityhealthngo.org",
        directorName: "Dr. Layla Haddad",
        directorEmail: "l.haddad@communityhealthngo.org",
        directorMobile: "+961 70 111 222",
        sectors: "Mental Health, Substance Use, Community Awareness",
        website: "https://www.communityhealthngo.org",
        linkedin: "https://www.linkedin.com/company/community-health-ngo",
        daleelMadani: "https://daleel-madani.org/profile/community-health-ngo"
    },
    facilityTypes: ["Primary Health Care Center", "Hospital", "Community Center", "Mobile Unit"],
    governorates: ["Beirut", "Mount Lebanon", "North", "South", "Bekaa"],
    facilities: [
        { id: 1, name: "Central Health Clinic", type: "Primary Health Care Center", governorate: "Beirut", caza: "Beirut", locality: "Achrafieh", contact: "+961 1 200 300" },
        { id: 2, name: "Northern Community Center", type: "Community Center", governorate: "North", caza: "Tripoli", locality: "El Mina", contact: "+961 6 400 500" },
        { id: 3, name: "Bekaa Mental Health Hospital", type: "Hospital", governorate: "Bekaa", caza: "Zahle", locality: "Zahle Center", contact: "+961 8 600 700" },
        { id: 4, name: "Mount Lebanon Mobile Unit", type: "Mobile Unit", governorate: "Mount Lebanon", caza: "Baabda", locality: "Hazmieh", contact: "+961 5 800 900" },
        { id: 5, name: "Southern Wellbeing Center", type: "Community Center", governorate: "South", caza: "Saida", locality: "Old Saida", contact: "+961 7 100 200" }
    ],
    cazasByGovernorate: {
        "Beirut": ["Beirut"],
        "Mount Lebanon": ["Baabda", "Matn", "Kesrouan", "Aley"],
        "North": ["Tripoli", "Zgharta", "Koura", "Akkar"],
        "South": ["Saida", "Tyre", "Jezzine"],
        "Bekaa": ["Zahle", "Baalbek", "West Bekaa"]
    },
    populationGroups: [
        "Children", "Youth", "Women", "Older Persons",
        "Persons with Disabilities", "Refugees & Displaced Persons", "General Population"
    ],
    // Public, guest-facing service directory shown on the "Explore Mental Health
    // Services" page. Deliberately excludes internal/technical fields (referral
    // status, facility status, nationality, age range) that mean nothing to a
    // guest — see docs/UX-REFERENCE-NOTES.md.
    publicServices: [
        { id: 1, subActivity: "Psychiatric Care by Psychiatrists", organization: "INARA", facility: "Fouad Chehab GGFC 2", governorate: "Mount Lebanon", caza: "Matn", populationGroup: "General Population", interventionType: "In-person", contact: { name: "Dina Wehbi", phone: null, email: "dina@inara.org" } },
        { id: 2, subActivity: "Psychotherapy by Clinical Psychologists", organization: "INARA", facility: "Fouad Chehab GGFC 2", governorate: "Mount Lebanon", caza: "Matn", populationGroup: "Youth", interventionType: "In-person, Remote", contact: { name: "Dina Wehbi", phone: null, email: "dina@inara.org" } },
        { id: 3, subActivity: "Supporting Informal Group-Based Community MHPSS Activities", organization: "Medecins Du Monde", facility: "Douris AMEL PHCC", governorate: "Bekaa", caza: "Baalbek", populationGroup: "Refugees & Displaced Persons", interventionType: "In-person", contact: null },
        { id: 4, subActivity: "Case Management for Children at Risk", organization: "International Rescue Committee", facility: "Central Health Clinic", governorate: "Beirut", caza: "Beirut", populationGroup: "Children", interventionType: "In-person", contact: { name: "Rita Aoun", phone: "+961 1 200 301", email: null } },
        { id: 5, subActivity: "Community Awareness Sessions on Mental Health", organization: "Amel Association", facility: "Northern Community Center", governorate: "North", caza: "Tripoli", populationGroup: "General Population", interventionType: "In-person", contact: null },
        { id: 6, subActivity: "Psychological First Aid", organization: "Makhzoumi Foundation", facility: "Northern Community Center", governorate: "North", caza: "Zgharta", populationGroup: "Women", interventionType: "In-person", contact: { name: "Hala Chami", phone: "+961 6 400 501", email: "h.chami@makhzoumi.org" } },
        { id: 7, subActivity: "Individual Counselling Sessions", organization: "Embrace", facility: "Bekaa Mental Health Hospital", governorate: "Bekaa", caza: "Zahle", populationGroup: "Youth", interventionType: "In-person, Remote", contact: { name: "Karim Yousef", phone: "+961 8 600 701", email: null } },
        { id: 8, subActivity: "Remote/Online Psychological Support", organization: "Embrace", facility: "Bekaa Mental Health Hospital", governorate: "Bekaa", caza: "Zahle", populationGroup: "General Population", interventionType: "Remote", contact: { name: "Embrace Lifeline", phone: "1564", email: null } },
        { id: 9, subActivity: "Mobile Mental Health Outreach", organization: "Medair", facility: "Mount Lebanon Mobile Unit", governorate: "Mount Lebanon", caza: "Baabda", populationGroup: "Older Persons", interventionType: "In-person", contact: null },
        { id: 10, subActivity: "Support Groups for Persons with Disabilities", organization: "Arcenciel", facility: "Southern Wellbeing Center", governorate: "South", caza: "Saida", populationGroup: "Persons with Disabilities", interventionType: "In-person", contact: { name: "Maya Fares", phone: "+961 7 100 201", email: "m.fares@arcenciel.org" } },
        { id: 11, subActivity: "School-Based Mental Health Programme", organization: "War Child", facility: "Southern Wellbeing Center", governorate: "South", caza: "Tyre", populationGroup: "Children", interventionType: "In-person", contact: null },
        { id: 12, subActivity: "Caregiver Support and Training", organization: "Community Health NGO", facility: "Central Health Clinic", governorate: "Beirut", caza: "Beirut", populationGroup: "Women", interventionType: "In-person", contact: { name: "Dr. Layla Haddad", phone: "+961 1 234 567", email: "l.haddad@communityhealthngo.org" } },
        { id: 13, subActivity: "Substance Use Awareness and Referral", organization: "Skoun", facility: "Bekaa Mental Health Hospital", governorate: "Bekaa", caza: "West Bekaa", populationGroup: "Youth", interventionType: "In-person", contact: null },
        { id: 14, subActivity: "Refugee Community MHPSS Outreach", organization: "Medecins Du Monde", facility: "Northern Community Center", governorate: "North", caza: "Akkar", populationGroup: "Refugees & Displaced Persons", interventionType: "In-person", contact: { name: "Elie Rahme", phone: "+961 6 400 502", email: "e.rahme@mdm.org" } }
    ],
    providerTypes: ["Psychiatrist", "Psychologist", "Social Worker", "Psychiatric Nurse", "Counselor"],
    providers: [
        { id: 1, name: "Dr. Nour Khalil", type: "Psychiatrist", facility: "Central Health Clinic", phone: "+961 3 111 222", email: "n.khalil@chn.org" },
        { id: 2, name: "Rana Saab", type: "Psychologist", facility: "Northern Community Center", phone: "+961 3 333 444", email: "r.saab@chn.org" },
        { id: 3, name: "Karim Yousef", type: "Social Worker", facility: "Bekaa Mental Health Hospital", phone: "+961 3 555 666", email: "k.yousef@chn.org" },
        { id: 4, name: "Maya Fares", type: "Psychiatric Nurse", facility: "Southern Wellbeing Center", phone: "+961 3 777 888", email: "m.fares@chn.org" },
        { id: 5, name: "Dr. Omar Nassar", type: "Counselor", facility: "Central Health Clinic", phone: "+961 3 999 000", email: "o.nassar@chn.org" }
    ],
    focalPersons: [
        { id: 1, area: "4Ws", name: "Sara Mansour", email: "s.mansour@chn.org", mobile: "+961 71 555 111" },
        { id: 2, area: "Substance Use", name: "Elie Rahme", email: "e.rahme@chn.org", mobile: "+961 71 555 222" }
    ],
    // Surveys (Substance Use data collection) presented inside the MHIS shell.
    surveysIntro: {
        short: "The Substance Use Platform collects detailed data on prevention and treatment activities across populations and settings in Lebanon on an annual basis.",
        full: "The Substance Use Platform collects detailed data on prevention and treatment activities across populations and settings in Lebanon on an annual basis. It maps existing prevention and treatment activities, identifies gaps, and keeps accurate, up-to-date information readily available. By centralising this information, it supports evidence-based policymaking, resource allocation, and strategic planning, feeds regular updates to the National Observatory of Drugs and Drug Addiction (NODDA), and encourages the scaling up of evidence-based interventions."
    },
    surveyTypes: ["Prevention", "Treatment", "Harm Reduction"],
    surveyYears: ["2025", "2024", "2023"],
    surveyStatuses: ["Draft", "Submitted"],
    surveys: [
        { id: 1, name: "Prevention Activities Annual Survey", type: "Prevention", description: "Prevention programmes delivered in schools, communities, and workplaces.", year: "2025", status: "Draft", updated: "12 Feb 2025" },
        { id: 2, name: "Treatment Services Annual Survey", type: "Treatment", description: "Outpatient and residential treatment services and capacity.", year: "2025", status: "Draft", updated: "05 Feb 2025" },
        { id: 3, name: "Harm Reduction Services Survey", type: "Harm Reduction", description: "Needle and syringe programmes, overdose prevention, and outreach.", year: "2024", status: "Submitted", updated: "18 Nov 2024" },
        { id: 4, name: "Prevention Activities Annual Survey", type: "Prevention", description: "Prevention programmes delivered in schools, communities, and workplaces.", year: "2024", status: "Submitted", updated: "22 Oct 2024" },
        { id: 5, name: "Treatment Services Annual Survey", type: "Treatment", description: "Outpatient and residential treatment services and capacity.", year: "2024", status: "Submitted", updated: "09 Oct 2024" },
        { id: 6, name: "Prevention Activities Annual Survey", type: "Prevention", description: "Prevention programmes delivered in schools, communities, and workplaces.", year: "2023", status: "Submitted", updated: "30 Nov 2023" }
    ],
    // Dynamic activity configurations. Each config lists ONLY the sections/fields it needs.
    // The activity form renders strictly from the selected config — no fixed tabs.
    activityConfigs: [
        {
            id: "facility-service",
            code: "3.2",
            subCode: "3.2.1",
            activity: "Service Provision",
            subActivity: "Facility-Based Mental Health Service",
            definition: "Clinical or psychosocial services delivered to individuals at a health facility, such as counselling, psychological intervention, or case management.",
            keywords: ["service", "counselling", "counseling", "psychological intervention", "clinical", "case management", "support provided to children", "individual support", "therapy", "mhpss service"],
            sections: [
                {
                    key: "general", title: "Activity Details", fields: [
                        { id: "title", label: "Activity Title", type: "text", required: true },
                        { id: "startDate", label: "Implementation Start Date", type: "date", required: true },
                        { id: "endDate", label: "Implementation End Date", type: "date", required: true },
                        { id: "description", label: "Description", type: "textarea", required: false }
                    ]
                },
                {
                    key: "location", title: "Location & Facility", fields: [
                        { id: "facility", label: "Facility", type: "select", required: true, optionsFrom: "facilities" },
                        { id: "governorate", label: "Governorate", type: "select", required: true, optionsFrom: "governorates" },
                        { id: "locality", label: "Locality", type: "text", required: false }
                    ]
                },
                {
                    key: "beneficiaries", title: "Beneficiaries", fields: [
                        { id: "beneficiaryType", label: "Beneficiary Type", type: "select", required: true, options: ["Adults", "Children", "Families", "Mixed"] },
                        { id: "beneficiaryCount", label: "Number of Beneficiaries", type: "number", required: true }
                    ]
                },
                {
                    key: "funding", title: "Funding", fields: [
                        { id: "donor", label: "Donor", type: "text", required: false },
                        { id: "budget", label: "Budget (USD)", type: "number", required: false }
                    ]
                }
            ]
        },
        {
            id: "awareness",
            code: "6.1",
            subCode: "6.1.2",
            activity: "Awareness & Information",
            subActivity: "Community Awareness Campaign",
            definition: "Public information and awareness work that spreads mental health messages to communities through campaigns, events, or media.",
            keywords: ["community awareness", "awareness", "campaign", "mental health messages", "information session", "public", "stigma", "outreach messaging", "radio", "social media"],
            sections: [
                {
                    key: "general", title: "Activity Details", fields: [
                        { id: "title", label: "Activity Title", type: "text", required: true },
                        { id: "startDate", label: "Implementation Start Date", type: "date", required: true },
                        { id: "endDate", label: "Implementation End Date", type: "date", required: true },
                        { id: "theme", label: "Campaign Theme", type: "text", required: true }
                    ]
                },
                {
                    key: "beneficiaries", title: "Beneficiaries", fields: [
                        { id: "audience", label: "Target Audience", type: "select", required: true, options: ["General Public", "Youth", "Health Workers", "Caregivers"] },
                        { id: "reach", label: "Estimated Reach", type: "number", required: true }
                    ]
                },
                {
                    key: "funding", title: "Funding", fields: [
                        { id: "donor", label: "Donor", type: "text", required: false },
                        { id: "budget", label: "Budget (USD)", type: "number", required: false }
                    ]
                }
            ]
        },
        {
            id: "coordination",
            code: "8.4",
            subCode: "8.4.1",
            activity: "Coordination & Policy",
            subActivity: "Policy / Research Coordination",
            definition: "Coordination, working-group, policy, or research work carried out with partners at national or sub-national level.",
            keywords: ["coordination", "policy", "research", "working group", "advocacy", "guidelines", "assessment", "study", "partners meeting"],
            sections: [
                {
                    key: "general", title: "Activity Details", fields: [
                        { id: "title", label: "Activity Title", type: "text", required: true },
                        { id: "startDate", label: "Implementation Start Date", type: "date", required: true },
                        { id: "endDate", label: "Implementation End Date", type: "date", required: true },
                        { id: "partners", label: "Coordinating Partners", type: "text", required: false }
                    ]
                },
                {
                    key: "funding", title: "Funding", fields: [
                        { id: "donor", label: "Donor", type: "text", required: false },
                        { id: "budget", label: "Budget (USD)", type: "number", required: false }
                    ]
                }
            ]
        },
        {
            id: "training",
            code: "5.3",
            subCode: "5.3.2",
            activity: "Capacity Building",
            subActivity: "Training of Health Workers",
            definition: "Training, coaching, or supervision delivered to providers and health workers to strengthen mental health service capacity.",
            keywords: ["training", "we trained health workers", "capacity building", "coaching", "supervision", "workshop", "provider training", "trained staff", "skills"],
            sections: [
                {
                    key: "general", title: "Activity Details", fields: [
                        { id: "title", label: "Activity Title", type: "text", required: true },
                        { id: "startDate", label: "Implementation Start Date", type: "date", required: true },
                        { id: "endDate", label: "Implementation End Date", type: "date", required: true },
                        { id: "topic", label: "Training Topic", type: "text", required: true }
                    ]
                },
                {
                    key: "providers", title: "Providers", fields: [
                        { id: "providerType", label: "Providers Trained", type: "select", required: true, options: ["Psychiatrists", "Psychologists", "Social Workers", "Psychiatric Nurses", "General Practitioners", "Mixed"] },
                        { id: "providerCount", label: "Number of Providers Trained", type: "number", required: true },
                        { id: "trainer", label: "Lead Trainer", type: "text", required: false }
                    ]
                },
                {
                    key: "beneficiaries", title: "Beneficiaries", fields: [
                        { id: "beneficiaryCount", label: "Indirect Beneficiaries Reached", type: "number", required: false }
                    ]
                },
                {
                    key: "funding", title: "Funding", fields: [
                        { id: "donor", label: "Donor", type: "text", required: false },
                        { id: "budget", label: "Budget (USD)", type: "number", required: false }
                    ]
                }
            ]
        }
    ],
    activities: [
        {
            id: 1, configId: "facility-service", state: "published", organization: "Community Health NGO",
            data: { title: "Weekly Counselling Sessions", startDate: "2025-01-06", endDate: "2026-06-30", description: "Ongoing individual counselling.", facility: "Central Health Clinic", governorate: "Beirut", locality: "Achrafieh", beneficiaryType: "Adults", beneficiaryCount: 120, donor: "WHO", budget: 45000 },
            updated: "2025-05-12"
        },
        {
            id: 2, configId: "awareness", state: "draft", organization: "Southern Care Network",
            data: { title: "World Mental Health Day Campaign", startDate: "2025-10-01", endDate: "2025-10-10", theme: "Mental Health for All", audience: "General Public", reach: 5000 },
            updated: "2025-05-20"
        },
        {
            id: 3, configId: "coordination", state: "completed", organization: "Coastal Recovery Group",
            data: { title: "National MHPSS Working Group", startDate: "2024-02-01", endDate: "2024-12-15", partners: "MoPH, UNICEF, NMHP", donor: "UNICEF", budget: 20000 },
            updated: "2024-12-16"
        },
        {
            id: 4, configId: "facility-service", state: "completed", organization: "Southern Care Network",
            data: { title: "Mobile Clinic Outreach", startDate: "2024-03-01", endDate: "2024-09-30", description: "Rural outreach sessions.", facility: "Mount Lebanon Mobile Unit", governorate: "Mount Lebanon", locality: "Hazmieh", beneficiaryType: "Mixed", beneficiaryCount: 300, donor: "EU", budget: 60000 },
            updated: "2024-10-02"
        },
        {
            id: 5, configId: "training", state: "published", organization: "Community Health NGO",
            data: { title: "PM+ Training for Health Workers", startDate: "2025-04-01", endDate: "2026-03-31", topic: "Problem Management Plus", providerType: "General Practitioners", providerCount: 28, trainer: "Dr. Nour Khalil", beneficiaryCount: 900, donor: "WHO", budget: 32000 },
            updated: "2025-05-18"
        }
    ],
    notifications: [
        {
            id: 1,
            audience: "ngo",
            type: "announcement",
            title: "New Activity Guidelines Released",
            preview: "We have published updated guidelines for mental health awareness activities...",
            fullContent: "We have published updated guidelines for mental health awareness activities. These new guidelines incorporate feedback from our partner organizations and reflect best practices in community mental health engagement. Please review them at your earliest convenience.",
            timestamp: "2 hours ago",
            unread: true
        },
        {
            id: 2,
            audience: "ngo",
            type: "action",
            title: "Facility Verification Required",
            preview: "Your facility 'Central Health Clinic' requires verification to continue operations...",
            fullContent: "Your facility 'Central Health Clinic' requires verification to continue operations. Please review the verification checklist and submit the required documentation within 7 days.",
            timestamp: "1 day ago",
            unread: true,
            action: "Review Facilities"
        },
        {
            id: 3,
            audience: "ngo",
            type: "event",
            title: "Upcoming Training Session",
            preview: "Join us for a training on Data Quality Standards scheduled for next month...",
            fullContent: "Join us for a comprehensive training on Data Quality Standards scheduled for next month. This training will help your team ensure data accuracy and compliance with MHIS standards.",
            timestamp: "3 days ago",
            unread: true,
            action: "View Event"
        },
        {
            id: 4,
            audience: "ngo",
            type: "system",
            title: "System Maintenance Notice",
            preview: "Scheduled maintenance will occur on Friday, 10 PM - 11 PM local time...",
            fullContent: "Scheduled maintenance will occur on Friday, 10 PM - 11 PM local time. During this period, the system will be temporarily unavailable. We apologize for any inconvenience.",
            timestamp: "5 days ago",
            unread: false
        }
    ],
    needsAttention: [
        {
            title: "Continue Activity Draft",
            description: "Mental Health Awareness Activity - saved but not submitted. Last edited 2 days ago."
        },
        {
            title: "Profile Update Required",
            description: "Your 4Ws Focal Person information needs to be updated to remain current."
        }
    ],
    announcements: [
        {
            title: "Updated Mental Health Guidelines 2024",
            content: "New comprehensive guidelines have been released reflecting the latest best practices in community mental health programs.",
            date: "March 15, 2024"
        },
        {
            title: "Data Submission Deadline Extended",
            content: "The deadline for Q1 activity data submission has been extended to April 30, 2024.",
            date: "March 10, 2024"
        },
        {
            title: "Welcome to MHIS",
            content: "Thank you for joining the Mental Health Information System. Your organization profile is currently under review.",
            date: "March 1, 2024"
        }
    ],
    upcomingEvents: [
        {
            day: 22,
            month: "Mar",
            title: "Regional Mental Health Summit",
            time: "10:00 AM - 4:00 PM"
        },
        {
            day: 28,
            month: "Mar",
            title: "Data Quality Training",
            time: "2:00 PM - 5:00 PM"
        },
        {
            day: 5,
            month: "Apr",
            title: "Community Partners Networking",
            time: "6:00 PM - 8:00 PM"
        }
    ]
};

// Application State
let appState = {
    currentPage: 'home',
    notifications: mockData.notifications,
    unreadCount: mockData.notifications.filter(n => n.unread).length,
    profileDirty: false
};

// ===== Events Calendar mock data =====
mockData.calendarEventTypes = [
    { id: 'event', label: 'Event', color: '#1e7e34' },
    { id: 'training', label: 'Training', color: '#1565c0' },
    { id: 'awareness', label: 'Awareness Campaign', color: '#6a4c93' }
];

(function seedCalendarEvents() {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const iso = (d) => d.toISOString().slice(0, 10);
    const withOffset = (days) => {
        const d = new Date(base);
        d.setDate(d.getDate() + days);
        return iso(d);
    };
    mockData.calendarEvents = [
        { id: 1, title: 'Regional Mental Health Summit', type: 'event', status: 'confirmed', date: withOffset(2), startTime: '10:00', endTime: '16:00', location: 'Beirut Conference Center', description: 'Annual summit bringing together mental health practitioners across the region.' },
        { id: 2, title: 'Data Quality Training', type: 'training', status: 'confirmed', date: withOffset(5), startTime: '14:00', endTime: '17:00', location: 'Central Health Clinic', description: 'Hands-on training for facility staff on the 4Ws data collection tools.' },
        { id: 3, title: 'Community Awareness Campaign Kickoff', type: 'awareness', status: 'pending', date: withOffset(1), startTime: '09:00', endTime: '12:00', location: 'Northern Community Center', description: 'Launch event for the stigma-reduction awareness campaign.' },
        { id: 4, title: 'Provider Onboarding Session', type: 'training', status: 'pending', date: withOffset(9), startTime: '11:00', endTime: '13:00', location: 'Bekaa Mental Health Hospital', description: '' },
        { id: 5, title: 'Partners Networking Evening', type: 'event', status: 'confirmed', date: withOffset(12), startTime: '18:00', endTime: '20:00', location: 'Southern Wellbeing Center', description: '' },
        { id: 6, title: 'Youth Awareness Workshop', type: 'awareness', status: 'confirmed', date: withOffset(-3), startTime: '10:00', endTime: '12:30', location: 'Mount Lebanon Mobile Unit', description: '' },
        { id: 7, title: 'Cancelled Field Visit', type: 'event', status: 'canceled', date: withOffset(-1), startTime: '09:00', endTime: '11:00', location: 'Central Health Clinic', description: 'Cancelled due to weather conditions.' },
        { id: 8, title: 'Psychological First Aid Training', type: 'training', status: 'confirmed', date: withOffset(16), startTime: '09:00', endTime: '15:00', location: 'Central Health Clinic', description: '' },
        { id: 9, title: 'Mental Health Awareness Radio Spot Recording', type: 'awareness', status: 'canceled', date: withOffset(6), startTime: '13:00', endTime: '14:00', location: '', description: '' },
        { id: 10, title: 'Monthly Coordination Meeting', type: 'event', status: 'confirmed', date: withOffset(0), startTime: '15:00', endTime: '16:00', location: 'Online', description: '' }
    ];
    mockData.calendarEventNextId = 11;
})();

let calendarView = {
    mode: 'month',
    currentDate: new Date()
};

// ===== Resources & Help mock data =====
mockData.resources = {
    glossary: [
        { term: '4Ws', definition: 'The "Who, What, Where, When" mapping framework used to track mental health and psychosocial support activities.' },
        { term: 'NGO', definition: 'Non-Governmental Organization implementing mental health and psychosocial support activities.' },
        { term: 'NMHP', definition: 'National Mental Health Programme, the government body overseeing mental health services and reporting.' },
        { term: 'MHPSS', definition: 'Mental Health and Psychosocial Support, the overall sector these activities belong to.' },
        { term: 'Facility', definition: 'A physical location, such as a clinic or hospital, where activities or services are delivered.' },
        { term: 'Provider', definition: 'An individual professional, such as a psychiatrist or social worker, delivering services.' },
        { term: 'Sub-Activity', definition: 'A specific, catalog-defined type of work reported under a broader activity category.' },
        { term: 'Focal Person', definition: 'The designated contact person within an NGO for a specific reporting area, such as 4Ws or Substance Use.' }
    ],
    annualReports: [
        { title: 'MHIS Annual Report 2023', year: 2023, href: '#' },
        { title: 'MHIS Annual Report 2022', year: 2022, href: '#' },
        { title: 'MHIS Annual Report 2021', year: 2021, href: '#' },
        { title: 'National Mental Health Programme Overview 2020', year: 2020, href: '#' }
    ],
    contact: {
        organization: 'National Mental Health Programme (NMHP)',
        email: 'support@mhis-lb.org',
        phone: '+961 1 000 000',
        address: 'Ministry of Public Health, Beirut, Lebanon',
        hours: 'Sunday - Thursday, 9:00 AM - 4:00 PM'
    },
    whatsNew: [
        { id: 1, title: 'Improved Notifications', date: 'March 2024', description: 'Notifications now group by type and support quick actions directly from the bell menu.' },
        { id: 2, title: 'Dynamic Activity Forms', date: 'February 2024', description: 'Activity forms now adapt automatically based on the selected sub-activity.' },
        { id: 3, title: 'New Events Calendar', date: 'January 2024', description: 'A dedicated Events Calendar view replaces the previous scattered event listings.' }
    ]
};

// ===== Admin Reviews mock data =====
const EVENT_REVIEW_STATUS = {
    pendingReview: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    needsModification: 'Needs Modification'
};

const FACILITY_DUPLICATE_STATUS = {
    pendingReview: 'Pending Review',
    linked: 'Linked',
    confirmedDistinct: 'Confirmed Distinct'
};

const CUSTOM_VALUE_STATUS = {
    pendingReview: 'Pending Review',
    accepted: 'Accepted',
    merged: 'Merged'
};

mockData.eventReviews = [
    {
        id: 1, organization: 'Community Health NGO', eventTitle: 'World Mental Health Day Community Fair',
        visibility: 'Public', startDate: '2025-10-10', endDate: '2025-10-10', location: 'Central Health Clinic', governorate: 'Beirut',
        description: 'A public awareness fair with information booths, screenings, and activities for World Mental Health Day.',
        submittedDate: '02 Feb 2025', status: EVENT_REVIEW_STATUS.pendingReview, reviewNote: '', reviewedDate: ''
    },
    {
        id: 2, organization: 'Cedars Psychosocial Support Society', eventTitle: 'Internal Staff Debrief Session',
        visibility: 'Private', startDate: '2025-02-14', endDate: '2025-02-14', location: 'Bekaa Mental Health Hospital', governorate: 'Bekaa',
        description: 'Internal debrief session for field staff following recent outreach activities.',
        submittedDate: '05 Feb 2025', status: EVENT_REVIEW_STATUS.pendingReview, reviewNote: '', reviewedDate: ''
    },
    {
        id: 3, organization: 'Southern Care Network', eventTitle: 'Youth Resilience Workshop Series – Session 3',
        visibility: 'Public', startDate: '2025-03-01', endDate: '2025-03-01', location: 'Southern Wellbeing Center', governorate: 'South',
        description: 'Third session of an ongoing youth resilience-building workshop series.',
        submittedDate: '07 Feb 2025', status: EVENT_REVIEW_STATUS.pendingReview, reviewNote: '', reviewedDate: ''
    },
    {
        id: 4, organization: 'Bekaa Wellbeing Initiative', eventTitle: 'Community Mental Health Open Day',
        visibility: 'Public', startDate: '2025-03-20', endDate: '2025-03-20', location: '', governorate: 'Bekaa',
        description: 'An open day for the community to learn about available mental health services.',
        submittedDate: '20 Jan 2025', status: EVENT_REVIEW_STATUS.needsModification,
        reviewNote: 'Specify the exact facility/venue and expected attendee count before resubmitting.', reviewedDate: '22 Jan 2025'
    },
    {
        id: 5, organization: 'Coastal Recovery Group', eventTitle: 'Substance Use Awareness Public Talk',
        visibility: 'Public', startDate: '2025-01-15', endDate: '2025-01-15', location: 'Online', governorate: '',
        description: 'A public talk raising awareness on substance use prevention and support services.',
        submittedDate: '05 Jan 2025', status: EVENT_REVIEW_STATUS.approved, reviewNote: '', reviewedDate: '08 Jan 2025'
    }
];

mockData.facilityDuplicates = [
    {
        id: 1,
        newFacility: { name: 'Achrafieh Community Wellness Point', type: 'Community Center', governorate: 'Beirut', caza: 'Beirut', locality: 'Achrafieh', contact: '+961 1 200 111', submittedBy: 'Hope Mental Health Association', submittedDate: '03 Feb 2025' },
        candidates: [
            { facilityId: 1, name: 'Central Health Clinic', type: 'Primary Health Care Center', governorate: 'Beirut', caza: 'Beirut', locality: 'Achrafieh', contact: '+961 1 200 300', supportedBy: 'Community Health NGO', supportStart: '2022-01-01', supportEnd: '', distanceMeters: 14 }
        ],
        status: FACILITY_DUPLICATE_STATUS.pendingReview, linkedCandidateId: null, resolutionNote: '', resolvedDate: ''
    },
    {
        id: 2,
        newFacility: { name: 'Tripoli Family Support Center', type: 'Community Center', governorate: 'North', caza: 'Tripoli', locality: 'El Mina', contact: '+961 6 400 111', submittedBy: 'Coastal Recovery Group', submittedDate: '06 Feb 2025' },
        candidates: [
            { facilityId: 2, name: 'Northern Community Center', type: 'Community Center', governorate: 'North', caza: 'Tripoli', locality: 'El Mina', contact: '+961 6 400 500', supportedBy: 'Community Health NGO', supportStart: '2021-06-01', supportEnd: '', distanceMeters: 9 },
            { facilityId: 201, name: 'El Mina Family Wellness Hub', type: 'Community Center', governorate: 'North', caza: 'Tripoli', locality: 'El Mina', contact: '+961 6 400 720', supportedBy: 'Southern Care Network', supportStart: '2023-03-01', supportEnd: '2024-12-31', distanceMeters: 18 }
        ],
        status: FACILITY_DUPLICATE_STATUS.pendingReview, linkedCandidateId: null, resolutionNote: '', resolvedDate: ''
    },
    {
        id: 3,
        newFacility: { name: 'Hazmieh Outreach Unit', type: 'Mobile Unit', governorate: 'Mount Lebanon', caza: 'Baabda', locality: 'Hazmieh', contact: '+961 5 800 111', submittedBy: 'Bright Minds Foundation', submittedDate: '18 Jan 2025' },
        candidates: [
            { facilityId: 4, name: 'Mount Lebanon Mobile Unit', type: 'Mobile Unit', governorate: 'Mount Lebanon', caza: 'Baabda', locality: 'Hazmieh', contact: '+961 5 800 900', supportedBy: 'Community Health NGO', supportStart: '2020-05-01', supportEnd: '', distanceMeters: 17 }
        ],
        status: FACILITY_DUPLICATE_STATUS.linked, linkedCandidateId: 4, resolutionNote: '', resolvedDate: '22 Jan 2025'
    },
    {
        id: 4,
        newFacility: { name: 'Zahle Riverside Clinic', type: 'Primary Health Care Center', governorate: 'Bekaa', caza: 'Zahle', locality: 'Zahle Center', contact: '+961 8 600 111', submittedBy: 'Cedars Psychosocial Support Society', submittedDate: '10 Jan 2025' },
        candidates: [
            { facilityId: 3, name: 'Bekaa Mental Health Hospital', type: 'Hospital', governorate: 'Bekaa', caza: 'Zahle', locality: 'Zahle Center', contact: '+961 8 600 700', supportedBy: 'Community Health NGO', supportStart: '2019-09-01', supportEnd: '', distanceMeters: 19 }
        ],
        status: FACILITY_DUPLICATE_STATUS.confirmedDistinct, linkedCandidateId: null,
        resolutionNote: 'Separate outpatient building on the opposite side of the hospital compound.', resolvedDate: '12 Jan 2025'
    }
];

mockData.pendingCustomValues = [
    { id: 1, lookupKey: 'facilityTypes', lookupLabel: 'Facility Type', proposedValue: 'Youth Drop-in Center', submittedBy: 'Hope Mental Health Association', submittedDate: '04 Feb 2025', context: 'Entered while adding a new facility with no matching type in the list.', status: CUSTOM_VALUE_STATUS.pendingReview, mergedIntoValue: '', resolvedDate: '' },
    { id: 2, lookupKey: 'providerTypes', lookupLabel: 'Provider Type', proposedValue: 'Occupational Therapist', submittedBy: 'Southern Care Network', submittedDate: '06 Feb 2025', context: 'Entered while adding a new provider with no matching type in the list.', status: CUSTOM_VALUE_STATUS.pendingReview, mergedIntoValue: '', resolvedDate: '' },
    { id: 3, lookupKey: 'providerTypes', lookupLabel: 'Provider Type', proposedValue: 'Peer Support Worker', submittedBy: 'Bekaa Wellbeing Initiative', submittedDate: '29 Jan 2025', context: 'Entered while adding a new provider with no matching type in the list.', status: CUSTOM_VALUE_STATUS.pendingReview, mergedIntoValue: '', resolvedDate: '' },
    { id: 4, lookupKey: 'facilityTypes', lookupLabel: 'Facility Type', proposedValue: 'Outpatient Counselling Room', submittedBy: 'Cedars Psychosocial Support Society', submittedDate: '20 Jan 2025', context: 'Entered while adding a new facility with no matching type in the list.', status: CUSTOM_VALUE_STATUS.merged, mergedIntoValue: 'Community Center', resolvedDate: '23 Jan 2025' },
    { id: 5, lookupKey: 'providerTypes', lookupLabel: 'Provider Type', proposedValue: 'Clinical Supervisor', submittedBy: 'Coastal Recovery Group', submittedDate: '10 Jan 2025', context: 'Entered while adding a new provider with no matching type in the list.', status: CUSTOM_VALUE_STATUS.accepted, mergedIntoValue: '', resolvedDate: '12 Jan 2025' }
];

function countEventReviewsByStatus(status) {
    return mockData.eventReviews.filter(r => r.status === status).length;
}

function countFacilityDuplicatesByStatus(status) {
    return mockData.facilityDuplicates.filter(r => r.status === status).length;
}

function countPendingCustomValuesByStatus(status) {
    return mockData.pendingCustomValues.filter(r => r.status === status).length;
}

// ===== Admin Announcements mock data =====
// The organizations with real system access today: the two Approved
// registrations, plus 'Community Health NGO' (the "Existing NGO" demo
// account's org, which is approved but — same limitation User Management
// already has — isn't tracked in demoState.registrations at all).
function getAnnouncementOrganizationDirectory() {
    return ['Community Health NGO', 'Southern Care Network', 'Coastal Recovery Group'];
}

mockData.announcementGroups = [
    {
        id: 1,
        name: 'Beirut Facility-Based Services',
        description: 'NGOs running facility-based services in Beirut.',
        criteria: { activityTypes: ['facility-service'], locations: ['Beirut'], fundingSources: [], organizations: [] }
    },
    {
        id: 2,
        name: 'WHO-Funded Programs',
        description: 'NGOs with at least one WHO-funded activity.',
        criteria: { activityTypes: [], locations: [], fundingSources: ['WHO'], organizations: [] }
    },
    {
        id: 3,
        name: 'Substance Use Partners',
        description: 'Manually selected partner organizations for substance-use coordination updates.',
        criteria: { activityTypes: [], locations: [], fundingSources: [], organizations: ['Coastal Recovery Group', 'Community Health NGO'] }
    }
];

mockData.announcementLogs = [
    { id: 1, groupId: 1, groupName: 'Beirut Facility-Based Services', title: 'Updated Facility Service Guidelines', message: 'Please review the updated clinical service guidelines for facility-based programs, effective immediately.', sentDate: '2025-05-15', sentBy: 'NMHP Administrator', recipients: ['Community Health NGO'] },
    { id: 2, groupId: 2, groupName: 'WHO-Funded Programs', title: 'WHO Reporting Deadline Reminder', message: 'A reminder that WHO-funded activity reports for this quarter are due by the end of the month.', sentDate: '2025-06-02', sentBy: 'NMHP Administrator', recipients: ['Community Health NGO'] },
    { id: 3, groupId: 1, groupName: 'Beirut Facility-Based Services', title: 'Beirut Facility Site Visits Scheduled', message: 'NMHP will be conducting routine site visits to Beirut-based facilities over the coming weeks.', sentDate: '2025-06-20', sentBy: 'NMHP Administrator', recipients: ['Community Health NGO'] }
];

function getLastSentDateForGroup(groupId) {
    const logs = mockData.announcementLogs.filter(l => l.groupId === groupId);
    if (!logs.length) {
        return '';
    }
    return logs.reduce((latest, l) => (l.sentDate > latest ? l.sentDate : latest), logs[0].sentDate);
}

