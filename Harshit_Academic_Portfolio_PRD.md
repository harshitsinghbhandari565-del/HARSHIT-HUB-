# Product Requirements Document (PRD)

# Harshit — Personal Academic Portfolio & Presentation Hub

| Field | Value |
|---|---|
| **Product Name** | Harshit — Personal Academic Portfolio & Presentation Hub |
| **Document Status** | Draft v1.0 — For Review |
| **Author** | Product Management |
| **Audience** | UI/UX Designers, Frontend Developers, Stakeholders |
| **Last Updated** | 2026-08-04 |
| **Classification** | Internal — Engineering & Design Read |

---

## 1. Executive Summary

Harshit is a student who presents frequently in class. He needs to share presentations quickly during live classroom sessions — often with less than a minute of warning — while simultaneously presenting himself to teachers, classmates, and future recruiters as a polished, professional, and memorable individual.

This document specifies a **single premium website** that serves two tightly-coupled jobs:

1. **The 10-second launch** — a blazing-fast, low-friction path from "teacher asks for the presentation" to "full-screen slides are on the projector." Speed and reliability win in the classroom; there is no time for navigation, searching, or fiddling.
2. **The polished impression** — a modern, premium portfolio surface (home, about, contact, and future projects/certificates/resume) that leaves classmates and teachers impressed and that can evolve into a long-term academic and professional portfolio.

The product ships with **fewer than ten finalized presentations** and is explicitly built to be **future-ready and easy to extend**. It must be responsive across mobile, desktop, and interactive classroom panels.

This PRD is the single source of truth for scope, requirements, and acceptance criteria. **All visual, stylistic, and implementation decisions are deliberately out of scope** for this document and are handed to the UI/UX Designer and Frontend Developer (see **Section 24 — Handoff to UI/UX Designer**).

---

## 2. Product Vision

To make every class presentation by Harshit begin with confidence — where his materials are one click away on any screen, and his portfolio makes an immediate, professional, and memorable impression. The hub is designed to grow with him from a classroom tool today into a lifelong academic and professional portfolio.

---

## 3. Product Objectives

| # | Objective | Measurable Intention |
|---|---|---|
| O1 | **Fastest presentation access** | Reach full-screen presentation from the homepage in ≤ 3 clicks and ≤ 3 seconds on a typical device/network. |
| O2 | **Premium first impression** | Visitors form a positive, professional, memorable impression within the first 5 seconds on the homepage. |
| O3 | **Effortless navigation** | Users can find any presentation, or the About/Contact content, with minimal clicks and no dead ends. |
| O4 | **Future-ready foundation** | New presentations can be added by Harshit (or a maintainer) without code changes. |
| O5 | **Device-agnostic** | Consistent, usable experience on mobile, desktop, and interactive classroom panels. |
| O6 | **Low-maintenance** | The site requires minimal ongoing upkeep and degrades gracefully if external services are unavailable. |

---

## 4. Success Metrics

### 4.1 Primary Metrics (classroom experience)
- **Time-to-presentation:** Median time from homepage to full-screen launch ≤ 3 seconds.
- **Click depth:** 100% of presentations reachable in ≤ 3 clicks from the homepage.
- **Launch success rate:** ≥ 99% of launch attempts render the presentation successfully.

### 4.2 Secondary Metrics (portfolio impression)
- **Homepage first-visit experience:** No broken content; meaningful content visible above the fold on mobile and desktop.
- **Contact reachability:** Contact action reachable in ≤ 2 clicks from anywhere.

### 4.3 Operational / Hygiene Metrics
- **Zero broken links:** Every internal link and every presentation external link resolves (checked on a maintenance schedule).
- **Offline graceful degradation:** With Google Slides or Dropbox unavailable, the UI shows a clear, non-broken state.

> **Note:** Because the audience is small and in-person, precise analytics (e.g., conversion rates) are lower-value than the operational reliability metrics above. Anonymous, privacy-respecting page-view analytics may be added later; see **Section 21 — Assumptions**.

---

## 5. Target Audience

| Segment | Role | Needs | Concerns |
|---|---|---|---|
| **Harshit** | Primary user / owner | Instant launch, easy management, professional image | Speed, reliability, low maintenance |
| **Teachers** | Secondary | View presentations during/after class; assess professionalism | Legibility on projector, easy navigation |
| **Classmates** | Secondary | Browse work, find shared presentations, connect | Speed, clear structure |
| **Future recruiters / collaborators** | Secondary (future) | Assess skill, achievements, contact info | Professional polish, complete info, contact path |

---

## 6. User Personas

### Persona 1 — Harshit (Primary User, Owner)
- **Age:** Student, secondary/higher secondary to early college.
- **Goals:** Present confidently, look professional, keep materials organized, grow the portfolio over time.
- **Frustrations:** Rushing to open a file during class, clutter, hard-to-maintain sites.
- **Device:** Smartphone first, laptop second; often connects to a classroom panel/projector.
- **Tech comfort:** High — comfortable adding content with basic guidance.

### Persona 2 — Ms. Rao (Teacher)
- **Age:** 40s, subject teacher.
- **Goals:** View Harshit's work quickly during or after class; verify effort and understanding.
- **Frustrations:** Slow loading, tiny text, confusing navigation when projected.
- **Device:** Classroom interactive panel or laptop + projector.
- **Tech comfort:** Moderate.

### Persona 3 — Aarav (Classmate)
- **Age:** Peer, similar age.
- **Goals:** See what Harshit presented, explore projects, maybe connect.
- **Frustrations:** Dead links, presentations that won't open on their phone.
- **Device:** Smartphone primarily.
- **Tech comfort:** High.

### Persona 4 — Recruiter (Future, Opportunistic)
- **Age:** Professional, may visit in 1–3 years.
- **Goals:** Quickly assess skill, achievements, and contact info.
- **Frustrations:** Cluttered or unfinished pages, no clear contact path.
- **Device:** Desktop/laptop primarily.
- **Tech comfort:** High.

---

## 7. User Journey

### Journey A — Live Classroom Presentation (The "10-Second Launch")
1. **Trigger:** Teacher asks Harshit to present; Harshit grabs a phone or walks to the panel.
2. **Action:** Opens the homepage. Recent presentations are visible without scrolling (or reachable in one tap).
3. **Decision:** Taps the target presentation card.
4. **Action:** Taps **"Present" / full-screen** — the presentation launches full-screen (Google Slides presentation mode).
5. **Outcome:** Slides render on the projector; class begins. **Total target: ≤ 3 seconds from open to slides.**
6. **Recovery path:** If the connection fails, a clear fallback message + Dropbox backup link appears.

### Journey B — First-Time Visitor Exploring the Portfolio
1. **Entry:** Lands on the homepage via a link/QR code shared by Harshit.
2. **Impression (0–5 s):** Sees a clear hero (name, tagline) and obvious entry points. Feels impressed and oriented.
3. **Explore:** Browses About; reads Harshit's story and goals.
4. **View work:** Opens one or more presentations (full-screen) or future Projects section.
5. **Connect:** Reaches the Contact section and sends a message or copies contact details.
6. **Exit:** Leaves with a positive, professional impression.

### Journey C — Returning Visitor Revisiting a Presentation
1. **Entry:** Returns to homepage (or bookmark).
2. **Find:** Uses search or the Recent/Presentations gallery to locate a talk.
3. **View:** Launches or downloads (via Dropbox).
4. **Exit:** Confident navigation; minimal friction.

---

## 8. Information Architecture

The content is organized around **two primary top-level functions** (Present + Portfolio), with the presentation surfaces prioritized for speed.

```
HARSHIT ACADEMIC HUB
├── PRESENTATION HUB (primary, speed-first)
│   ├── Recent Presentations (fast-access rail)
│   ├── Presentation Gallery (all)
│   │     └── Individual Presentation Page
│   │           ├── Launch (full-screen Google Slides)
│   │           ├── Meta (title, subject, date, tags)
│   │           └── Dropbox backup link
│   └── Search
└── PORTFOLIO
    ├── Home
    ├── About
    ├── Projects (future)
    ├── Certificates (future)
    ├── Resume (future)
    └── Contact
```

**Guiding principle:** Presentation-related content is surfaced at the top and kept shallow (≤ 3 clicks). Portfolio content is informational and can be slightly deeper.

---

## 9. Sitemap

```
/                          Home (hero + recent presentations + about teaser + contact teaser)
/presentations             Presentation gallery (all, searchable)
/presentations/:slug       Individual presentation page (launch + meta + backup)
/about                     About Harshit
/projects                  Projects (future / placeholder)
/certificates              Certificates (future / placeholder)
/resume                    Resume (future / placeholder)
/contact                   Contact section (form / details)
```

**Routes marked "future"** may ship as hidden, inert, or clearly-labeled "Coming soon" placeholders — decided during design. See **Section 15.3** and **Section 23**.

---

## 10. Navigation Flow

### 10.1 Global Navigation
- Persistent header with the brand (name) and primary links: **Presentations**, **About**, **Projects\***, **Certificates\***, **Resume\***, **Contact**. (\* = future)
- On mobile: hamburger/menu with the same links; the **"Present"** action should remain one tap from the homepage.
- On interactive panels: larger touch targets, readable text at projection distance.

### 10.2 Presentation Launch Flow (fastest path)
```
Home
  └─ Recent rail → tap card → presentation page → "Present" (full-screen)
  └─ (or) Presentations → gallery → card → presentation page → "Present"
```
- The **"Present"** (full-screen) button is the primary call-to-action on any presentation page.
- Full-screen launch opens Google Slides presentation mode in a new tab/full-screen; a **Dropbox backup** link is available for offline access.

### 10.3 Search
- Available from the **Presentations** gallery (and optionally the header).
- Filters/finds by title, subject, and tags.
- Results shown inline; each result links to its presentation page.

---

## 11. Functional Requirements

**ID legend:** `FR-` = functional requirement. See **Section 15** for detailed per-feature requirements.

### Presentation Module
- **FR-1** Presentation gallery listing all presentations.
- **FR-2** Search across presentations (title, subject, tags).
- **FR-3** "Recently used" rail for fast re-access.
- **FR-4** Presentation cards with clear titles, subjects, and visual identifiers.
- **FR-5** Individual presentation page with meta and actions.
- **FR-6** Google Slides as the primary presentation source.
- **FR-7** Dropbox backup link per presentation.
- **FR-8** Full-screen presentation launch.

### Portfolio Module
- **FR-9** Home page (hero + recent presentations + about teaser + contact teaser).
- **FR-10** About section.
- **FR-11** Projects (future).
- **FR-12** Certificates (future).
- **FR-13** Resume (future).
- **FR-14** Contact section (message form or contact details).

### Presentation Management
- **FR-15** Ship with < 10 finalized presentations.
- **FR-16** Only finalized presentations are published.
- **FR-17** Adding a new presentation should not require code changes.

### Navigation
- **FR-18** Clear global navigation.
- **FR-19** Fast access with minimal clicks (presentation ≤ 3 clicks).
- **FR-20** Responsive layout across mobile, desktop, interactive panels.

---

## 12. Non-Functional Requirements

| ID | Requirement | Target / Guideline |
|---|---|---|
| **NFR-1** | **Premium experience** | Cohesive, refined, intentional design; no default/stock feel. |
| **NFR-2** | **Performance** | Homepage loads and becomes interactive quickly; presentation launch ≤ 3 s; minimal loading states. |
| **NFR-3** | **Responsive** | Usable and legible on mobile (portrait), desktop, and interactive panels. |
| **NFR-4** | **Professional** | Tone and content appropriate for teachers and recruiters. |
| **NFR-5** | **Maintainability** | Content additions (e.g., new presentations) require no code changes. |
| **NFR-6** | **Scalability** | Architecture supports growing from < 10 to many presentations and new portfolio sections. |
| **NFR-7** | **Reliability / graceful degradation** | Clear fallback if Google Slides or Dropbox is unavailable; no dead links. |
| **NFR-8** | **Accessibility** | Legible contrast, keyboard navigation, meaningful link text, focus states. |
| **NFR-9** | **Privacy** | Minimal data collection; contact form data handled responsibly. |

---

## 13. User Stories

| ID | Role | Story | Priority |
|---|---|---|---|
| **US-1** | Harshit | As Harshit, I want to reach full-screen slides from the homepage in seconds, so I can start presenting without delay. | Must |
| **US-2** | Harshit | As Harshit, I want a "recent" rail, so I can re-open the talk I most recently presented quickly. | Must |
| **US-3** | Harshit | As Harshit, I want to search presentations, so I can find any talk fast. | Must |
| **US-4** | Teacher | As a teacher, I want presentations to open and be legible on the classroom panel, so I can follow along. | Must |
| **US-5** | Harshit | As Harshit, I want a polished homepage, so visitors get a premium first impression. | Must |
| **US-6** | Classmate | As a classmate, I want to browse and open presentations on my phone, so I can review them. | Should |
| **US-7** | Harshit | As Harshit, I want to add a new presentation without coding, so the site stays up to date. | Should |
| **US-8** | Harshit | As Harshit, I want an About section, so visitors learn about me. | Must |
| **US-9** | Recruiter | As a recruiter, I want to reach contact details easily, so I can reach out. | Should |
| **US-10** | Harshit | As Harshit, I want a backup download link per presentation, so I can present even if Slides is down. | Should |
| **US-11** | Visitor | As a visitor, I want the site to work on any device, so I can use it comfortably. | Must |
| **US-12** | Harshit | As Harshit, I want a Contact section, so people can reach me. | Should |
| **US-13** | Harshit | As Harshit, I want the portfolio to grow (projects/certificates/resume), so it remains relevant long-term. | Could |

---

## 14. Feature Prioritization (MoSCoW)

### Must Have (MVP — ship first)
- Home page (hero + recent presentations + about teaser + contact teaser).
- Presentation gallery.
- Individual presentation page with **full-screen launch**.
- Google Slides as primary source.
- Responsive layout (mobile, desktop, panel).
- Clear global navigation (≤ 3 clicks to present).
- "Recently used" rail.
- About section.

### Should Have
- Search within presentations.
- Dropbox backup link per presentation.
- Contact section.
- Content-management path for adding presentations without code.
- Graceful offline/fallback states.

### Could Have
- Projects, Certificates, Resume sections (future expansion).
- Privacy-respecting page-view analytics.
- QR code to the site (printed for in-class sharing).

### Won't Have (this release)
- User accounts / authentication for visitors.
- On-site presentation editing.
- Commenting / social features.
- Payment or e-commerce.
- Any visual/styling decisions made by product (explicitly deferred to Design).

---

## 15. Detailed Requirements for Every Feature

### 15.1 Home Page
- Hero with Harshit's name and a one-line professional tagline.
- **Recent Presentations rail** — the most recently used presentations, visible without scrolling (desktop) and reachable in one tap (mobile).
- About teaser (short bio + link to full About page).
- Contact teaser (quick link/action).
- Clear, obvious entry to the full **Presentations** gallery.
- **Acceptance:** A first-time visitor understands what this is and where to go within 5 seconds.

### 15.2 Presentation Gallery
- Grid/list of all published presentations.
- Each card shows title, subject, and a visual identifier (see **Section 24**).
- Sortable (e.g., by date/subject) and searchable.
- Each card links to its individual presentation page.
- **Acceptance:** Every presentation is reachable in ≤ 3 clicks from the homepage.

### 15.3 Individual Presentation Page
- Title, subject, date, and tags.
- Primary action: **Present** (full-screen launch of Google Slides presentation mode in a new tab/full-screen).
- Secondary action: **Dropbox backup link** (download/open copy).
- Back link to gallery.
- **Acceptance:** One clear primary action; no ambiguity about how to start.

### 15.4 Search
- Queries against title, subject, and tags.
- Inline results with presentation cards.
- Empty state ("no results") with a clear reset.
- **Acceptance:** Typing returns relevant results as the user types (or on submit).

### 15.5 "Recently Used" Rail
- Shows the most recently launched presentations, newest first.
- One tap opens the presentation page (or directly launches — per Design decision).
- **Acceptance:** The last used presentation is reachable in ≤ 2 clicks from the homepage.

### 15.6 About Section
- Bio, background, academic focus, interests.
- Professional, authentic tone.
- **Acceptance:** Clearly communicates who Harshit is and what he does.

### 15.7 Contact Section
- Contact details (email and/or social links) and/or a simple message form.
- Clear success/error states for the form (if used).
- **Acceptance:** Contact reachable in ≤ 2 clicks from any page; form provides confirmation.

### 15.8 Future Sections (Projects, Certificates, Resume)
- If shipped as placeholders: clearly labeled "Coming soon," never appearing broken.
- If hidden: not linked in navigation until content exists.
- **Acceptance:** No dead or confusing "empty" pages in the live site.

### 15.9 Presentation Management (Admin/Maintainer)
- A documented, non-code method to add a presentation (e.g., config file, CMS, or data-driven list).
- Fields: title, subject, date, tags, Google Slides link, Dropbox link, ordering.
- **Acceptance:** Adding a presentation publishes it to the gallery without code changes.

---

## 16. Edge Cases

| ID | Scenario | Expected Behavior |
|---|---|---|
| **EC-1** | Google Slides link is broken/expired | Clear "unavailable" state; still show Dropbox backup link; no crash. |
| **EC-2** | Dropbox link is broken/expired | Show Slides launch normally; warn/omit backup without breaking the page. |
| **EC-3** | No network connection | Show a friendly offline message; if Slides is cached/embeddable, offer it. |
| **EC-4** | Presentation opens in a new tab vs. same-tab | Full-screen launch must not lose the site context unexpectedly; behavior defined in Design. |
| **EC-5** | Very long or very few presentation titles | Layout handles truncation gracefully (cards, gallery, search). |
| **EC-6** | Search yields no results | Empty state with reset/clear; no dead page. |
| **EC-7** | No "recent" presentations yet | Rail hides or shows an empty prompt; does not look broken. |
| **EC-8** | Projected display aspect ratio / small field of view | Presentation content legible at projection distance; UI doesn't obstruct. |
| **EC-9** | Emoji/character-heavy tags or titles | Rendered safely (no broken encoding). |
| **EC-10** | Future sections have no content yet | Hidden or clearly "Coming soon," never a broken blank page. |
| **EC-11** | Keyboard-only user | All navigation and launch actions keyboard-accessible with visible focus. |
| **EC-12** | Invalid route (typo URL) | Friendly 404 with a path back to Home/Presentations. |

---

## 17. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **R-1** External link fragility (Slides/Dropbox) | Medium | High | Backup link on every page; graceful fallback; scheduled link checks. |
| **R-2** Slow launch in classroom (no time to spare) | Low-Medium | High | Shallow nav, fast-loading homepage, recent rail, minimal assets. |
| **R-3** Scope creep on visual decisions in product phase | Medium | Medium | Visual decisions explicitly deferred to Design (Section 24). |
| **R-4** Difficulty maintaining content over time | Medium | Medium | Data-driven management (Section 15.9); documented process. |
| **R-5** Portfolio looks unfinished (empty future sections) | Medium | Medium | Ship hidden or "Coming soon" placeholders; never broken blanks. |
| **R-6** Mobile launch not reliable for projection | Medium | High | Test mobile launch path; keep recent rail one tap away. |
| **R-7** Privacy of contact form data | Low | Medium | Minimal collection; responsible handling; no unnecessary storage. |

---

## 18. Future Roadmap

| Phase | Focus | Items |
|---|---|---|
| **Phase 1 — MVP** | Classroom speed + polish | Home, gallery, presentation page + full-screen launch, recent rail, About, responsive layout. |
| **Phase 2 — Trust & Utility** | Reliability + reach | Search, Dropbox backups, Contact, content-management path, QR sharing. |
| **Phase 3 — Portfolio Growth** | Academic depth | Projects, Certificates, Resume sections. |
| **Phase 4 — Professional Evolution** | Long-term career | Recruiter-oriented enhancements, richer project case studies, analytics (privacy-respecting), broader collaboration options. |

Each phase is gated on the prior phase's acceptance criteria being met.

---

## 19. Acceptance Criteria

The release is **accepted** when ALL of the following are true:

- **AC-1** Every published presentation is reachable in **≤ 3 clicks** and **≤ 3 seconds** from the homepage on a typical device.
- **AC-2** The homepage makes a premium, professional impression; hero and recent rail are visible without scrolling (desktop).
- **AC-3** Full-screen launch works for **100%** of published presentations.
- **AC-4** Each presentation page exposes a Google Slides primary source and a Dropbox backup link.
- **AC-5** Search returns correct results across title, subject, and tags, with a proper empty state.
- **AC-6** Global navigation is clear and consistent on mobile, desktop, and interactive panels; no dead ends or broken links.
- **AC-7** All external links (Slides, Dropbox) are valid at release.
- **AC-8** About and Contact are complete and reachable within 2 clicks.
- **AC-9** Adding a new presentation requires **no code changes** and is documented.
- **AC-10** Future sections ship hidden or as clear "Coming soon" states — never broken blank pages.
- **AC-11** Site functions correctly with keyboard navigation and passes basic accessibility checks.
- **AC-12** The site ships with fewer than ten finalized presentations, all finalized before publishing.
- **AC-13** No visual, typographic, color, or animation decision has been overridden by this PRD; all such decisions originate from the UI/UX Designer (Section 24).

---

## 20. Open Questions

To be resolved with stakeholders (Harshit), ideally before or during the design phase:

| ID | Question | Impact |
|---|---|---|
| **OQ-1** | Should tapping a card launch full-screen directly, or open a presentation page first? | Affects click depth (O1, AC-1). |
| **OQ-2** | Should the site be a static site, a small app, or CMS-backed? | Affects maintainability (O6) — deferred to developer but needs content needs confirmed. |
| **OQ-3** | Does the "recent" rail need to persist across sessions/devices? | Affects UX and any storage needs. |
| **OQ-4** | What exact contact methods should the Contact section use (email, socials, form)? | Affects Contact scope. |
| **OQ-5** | Should "future" sections ship as placeholders or be hidden entirely for now? | Affects navigation and first impression. |
| **OQ-6** | Is on-page (embedded) playback needed, or is full-screen tab launch sufficient? | Affects performance and presentation source handling. |
| **OQ-7** | Does Harshit need a simple admin login, or is a shared config/export enough for adding presentations? | Affects management scope (FR-17). |

---

## 21. Assumptions

- **A-1** All initial presentations are **finalized** before upload; no editing in-place.
- **A-2** The initial catalog is **fewer than ten** presentations.
- **A-3** Google Slides is the **primary** presentation source; Dropbox provides **backup** access.
- **A-4** Presentation links can be shared via a **public URL**; no auth is required to view.
- **A-5** The primary audience is in-person (classroom); heavy analytics are not required at launch.
- **A-6** Harshit (or a maintainer) can perform light content maintenance with basic guidance.
- **A-7** Devices in scope: modern mobile browsers, desktop browsers, and interactive classroom panels.
- **A-8** Any future analytics will be **privacy-respecting** and minimal.

---

## 22. Scope

### In Scope (this release)
- Home page, presentation gallery, individual presentation pages, recent rail, search.
- Full-screen launch (Google Slides) + Dropbox backup links.
- About section and Contact section.
- Responsive layouts for mobile, desktop, and interactive panels.
- Global navigation.
- Data-driven path to add presentations without code.
- Graceful fallback states for external services.

### Out of Scope (see Section 23)
- Projects, Certificates, Resume content (roadmap, Phase 3).
- All visual, typographic, color, animation, and technology-stack decisions (delegated).
- User accounts, editing, comments, e-commerce, analytics dashboards.

---

## 23. Out of Scope

The following are **explicitly out of scope** for the product team and are either deferred to later phases or owned by other roles:

### For the UI/UX Designer
- **Colors, typography, animations, and overall UI style.** These decisions belong exclusively to the UI/UX Designer (Section 24). Product must not dictate them.

### For the Frontend Developer / Tech Owner
- **Technology stack and implementation choices.** These are the developer's call, informed by the functional and non-functional requirements here.

### Deferred to Future Phases
- Projects, Certificates, and Resume sections (Phase 3).
- Recruiter-focused enhancements and richer case studies (Phase 4).
- Advanced analytics (Phase 4).

### Deliberately Not Built (this release)
- Visitor accounts / login.
- On-site editing or CMS-level authoring by end users.
- Comments, likes, or social features.
- Any payment or e-commerce functionality.

---

## 24. Handoff to UI/UX Designer

> This section is the explicit handoff from Product to Design. Product has deliberately **not** specified colors, typography, animations, or UI style. Design owns all of these. Below is the *context* design needs to make the right decisions.

### 24.1 What Problems the Design Must Solve

| # | Problem | Design implication |
|---|---|---|
| **P1** | Presenting with almost no notice in class | The path to full-screen slides must be visually obvious and require near-zero thought. The **"Present"** action must dominate the presentation page. |
| **P2** | Making a premium, memorable first impression in seconds | The homepage hero must feel intentional and high-quality immediately — no "default/stock" feel. |
| **P3** | Serving very different screens (phone → projector/panel) | Layouts must reflow gracefully; text and targets must remain legible at projection distance. |
| **P4** | Communicating professionalism to teachers and future recruiters | The tone must feel credible and refined, not childish, and not hollow. |
| **P5** | Filling a site with < 10 items without looking empty | The gallery/rail must feel designed even when sparse; future sections must not look abandoned. |
| **P6** | Guiding users without overwhelming them | Clear visual hierarchy: presentation actions first, portfolio content second. |

### 24.2 What Emotions Users Should Feel
- **Confidence** — "I can start right now, no fiddling."
- **Impressment** — "This is polished and deliberate."
- **Trust** — "This is credible and professional."
- **Ease / calm** — "Everything is where I expect; nothing is broken."
- **Motivation / interest** — "I want to see more of his work."

### 24.3 What Screens Must Be Designed
1. **Home** (hero + recent presentations rail + about teaser + contact teaser).
2. **Presentation Gallery** (cards grid, search, sort).
3. **Individual Presentation Page** (meta + primary "Present" action + Dropbox backup link).
4. **About**.
5. **Contact** (details and/or form + success/error states).
6. **Future section placeholders** (Projects / Certificates / Resume "Coming soon" state) **or** hidden states.
7. **404 / empty / offline / broken-link fallback states.**
8. **Global navigation** (header for desktop/panel, menu for mobile).

### 24.4 What Interactions Require Visual Treatment
- **Presentation launch** — hover/focus/active states and clear affordance on the "Present" action; confidence-inspiring micro-interaction.
- **Presentation cards** — hover/focus states, legible metadata, clear tap targets.
- **Search** — input state, live/inline results, empty result state.
- **Recent rail** — scannable, one-tap, shows "most recent" clearly.
- **Navigation** — active/current-page indication, mobile menu open/close, focus states.
- **Contact form** — validation, success, and error feedback (if a form is used).
- **Scroll/loading states** — minimal, smooth loading placeholders (content is light, so avoid heavy spinners).

> **Note on animations:** Any animation must **support** the goals (speed, calm, confidence) and must not delay or obscure the 10-second launch path. Decorative motion should be subtle and never interfere with access.

### 24.5 What Responsive Layouts Are Required
- **Mobile (portrait) — phone:** hero, stacked cards, one-tap recent rail, hamburger menu, thumb-reachable primary actions.
- **Desktop — laptop/monitor:** hero, multi-column gallery, visible persistent nav, obvious "Present" CTA.
- **Interactive classroom panel / projector (large, possibly touch):** large text and touch targets, high legibility at distance, no content clipped at panel aspect ratios.

### 24.6 What Deliverables the UI/UX Designer Must Produce
1. **Design system / style guide** — color palette, typography scale, spacing, radii, shadows, iconography, and component states (colors/type are Design's to define).
2. **Hi-fi mockups** for all screens in **24.3**, in at least two breakpoints (mobile + desktop/panel).
3. **Interaction/state spec** — hover, focus, active, loading, empty, error, and offline states.
4. **Responsive specifications** — behavior across mobile, desktop, and panel breakpoints.
5. **Prototype** (optional but recommended) demonstrating the 10-second launch path and the first-impression homepage.
6. **Accessibility notes** — contrast ratios, focus visibility, keyboard order, meaningful labels.
7. **A shared component inventory** the developer can build from (buttons, cards, inputs, navigation).

### 24.7 Which Product Goals Are Highest Priority (for Design to prioritize)
Ranked for the designer, highest first:
1. **O1 — Fastest presentation access:** the "Present" path must be visually unmissable and one tap from the presentation page.
2. **O2 — Premium first impression:** the homepage hero sets the entire perception.
3. **O3 — Effortless navigation:** clear, calm, consistent wayfinding.
4. **O5 — Device-agnostic:** mobile and panel experiences must not be afterthoughts.
5. **O4/O6 — Future-ready and low-maintenance:** scalable design that doesn't break when content is added.

---

*End of PRD — Hand to UI/UX Designer and Frontend Developer for visual and implementation work.*
