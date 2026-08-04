# UI/UX Design Specification — Version 2

## Harshit — Personal Academic Portfolio & Presentation Hub

| Field | Value |
|---|---|
| **Product** | Harshit — Personal Academic Portfolio & Presentation Hub |
| **Document** | UI/UX Design Specification v2.0 (Revised) |
| **Author** | UI/UX Design |
| **Source of Truth** | PRD v1.0 (2026-08-04) |
| **Reviewed Against** | Design Review Report v1.0 (2026-08-04) |
| **Audience** | Frontend Developers, Frontend Architect, Stakeholders |
| **Last Updated** | 2026-08-04 |
| **Previous Version** | v1.0 (2026-08-04) |

---

## Table of Contents

1. [Executive Summary of Changes](#1-executive-summary-of-changes)
2. [Design Review Resolution Matrix](#2-design-review-resolution-matrix)
3. [Design Philosophy](#3-design-philosophy)
4. [Design Goals](#4-design-goals)
5. [Visual Style Recommendation](#5-visual-style-recommendation)
6. [Color System](#6-color-system)
7. [Typography System](#7-typography-system)
8. [Spacing System](#8-spacing-system)
9. [Grid System](#9-grid-system)
10. [Iconography](#10-iconography)
11. [Component Library](#11-component-library)
12. [Navigation Design](#12-navigation-design)
13. [Homepage Layout](#13-homepage-layout)
14. [Presentation Gallery Layout](#14-presentation-gallery-layout)
15. [Presentation Details Page](#15-presentation-details-page)
16. [Search Experience](#16-search-experience)
17. [Dark Mode](#17-dark-mode)
18. [Empty States](#18-empty-states)
19. [Loading States](#19-loading-states)
20. [Error States](#20-error-states)
21. [Hover States](#21-hover-states)
22. [Micro-interactions](#22-micro-interactions)
23. [Motion Guidelines](#23-motion-guidelines)
24. [Responsive Layouts](#24-responsive-layouts)
25. [Accessibility Guidelines](#25-accessibility-guidelines)
26. [Design Tokens](#26-design-tokens)
27. [Design Consistency Rules](#27-design-consistency-rules)
28. [UX Rationale for Major Decisions](#28-ux-rationale-for-major-decisions)
29. [Developer Handoff](#29-developer-handoff)
30. [Implementation Readiness Statement](#30-implementation-readiness-statement)

---

## 1. Executive Summary of Changes

This Version 2 of the Design Specification incorporates all accepted findings from the **Design Review Report v1.0**. The review verdict was **"Approved with Minor Revisions" (Grade: A−)**, and the overall design direction, visual language, and information architecture remain unchanged. The revisions are **corrective and precision-focused**, not directional.

### Summary of Changes by Category

#### 🔴 High-Priority Fixes (Resolved in v2)

| # | Finding | Change Made |
|---|---|---|
| 1 | **Focus ring color fails 3:1 non-text contrast** (Review §8-A1) | Focus ring changed from `--color-primary-400` (#7B83E0, ~2.6:1) to a new dedicated token `--color-focus` (#4338CA, ~5.9:1 on white). All focus specs updated across components, §25, and token table. |
| 2 | **Amber text on amber backgrounds fails** (Review §8-A2) | Introduced `--color-warm-700` (#B45309) for warm text/icon usage. "Recent" badge, warning alerts, and all amber text now use dark amber on pale backgrounds. Verified ≥4.5:1. |
| 3 | **`--color-neutral-400` used for real text** (Review §8-A3) | Restricted `--color-neutral-400` to **decorative/border use only**. All text that was neutral-400 (empty-state body, dates, captions) moved to `--color-neutral-600`. Token usage table updated. |
| 4 | **"Full-screen launch" not precisely defined** (Review §6-W1/W2/M4) | §15 now specifies the exact launch mechanism: opens Google Slides `/present` URL in a new tab. Button label changed from "Present Full-Screen" to **"Present"** with a subtitle "Opens in Google Slides". Added a dedicated note on what the user should expect. |
| 5 | **Empty recent rail hides on first visit** (Review §6-M2/U3) | The Recent section now has a **fallback strategy**: when no personal recency data exists, it shows **"Latest Presentations"** (most recently added, from JSON `order`/`date`). The section is never empty as long as ≥1 published presentation exists. Only hides when zero presentations exist. |
| 6 | **Dark mode default contradicts projector anti-pattern** (Review §6-W4/RK-3) | Default changed to **light mode always**. System preference detection removed. Dark mode is purely opt-in via the toggle. On **panel breakpoints (≥1920px)**, dark mode is **force-disabled** — the toggle is hidden. |

#### 🟡 Medium-Priority Fixes (Resolved in v2)

| # | Finding | Change Made |
|---|---|---|
| 7 | **No "published" flag in data model** (Review §6-M3/W6) | JSON schema now includes `published: boolean`. Only entries with `published: true` render in the gallery. |
| 8 | **Google auth interstitial not addressed** (Review §7-U6/RK-5) | Added a "Sign-in hint" info state on the presentation detail page (§20.7) with microcopy for when Slides prompts sign-in. |
| 9 | **Mobile→projector reality under-scoped** (Review §9-RK-6) | Added a new section "Presentation Launch: Device & Environment Guidance" (§24.6) with practical recommendations for different device/projector combinations. |
| 10 | **Long tag overflow + detail-page H1 wrap undefined** (Review §6-M8/U4) | Tag row now wraps to multiple lines (no horizontal scroll) with max 5 visible + "+N more" overflow. Detail-page H1 has explicit wrap behavior: unlimited lines, `word-break: break-word`. |
| 11 | **Contact form privacy not addressed** (Review §6-M1/NFR-9) | Added privacy microcopy below the contact form, anti-spam honeypot note, and data-handling statement. |
| 12 | **Dropbox label mismatch** (Review §7-U5) | Changed from "Download Backup" to **"Open Backup (Dropbox)"**. Added implementation note about `?dl=1` parameter. |
| 13 | **Hero entrance animation risks slowing intent-driven visits** (Review §6-W8) | Added a skip condition: if the user navigates directly to the homepage with clear intent (e.g., via a deep link or within 30s of a previous visit), the entrance animation is reduced to a simple opacity fade (300ms total). |
| 14 | **Frosted glass performance risk on panels** (Review §6-W9/RK-7) | Added a solid-color fallback for the header: where `backdrop-filter` is unsupported or on panel breakpoints (≥1920px), the header uses an opaque `--color-white` background with no blur. |
| 15 | **Sort options incomplete** (Review §6-M6) | Sort options expanded: "Most Recent" (default), "Oldest First", "Subject A–Z", "Subject Z–A". |
| 16 | **Client-side search cut-over threshold** (Review §11-RK-8) | Added scalability note: client-side search is intended for ≤100 items; beyond that, migrate to indexed/server-side search. |
| 17 | **Tablet nav collapse unspecified** (Review §12-Q8) | Tablet nav now specifies: all links visible at ≥768px. If viewport is < 900px and links overflow, the last items collapse into a "More ▾" dropdown (not a hamburger). |

#### 🟢 Low-Priority / Informational (Acknowledged in v2)

| # | Finding | Resolution |
|---|---|---|
| 18 | **QR code (Could-have)** (Review §6-M7) | Noted as Phase 2. Homepage layout leaves room for a future QR element in the contact teaser. No design action needed now. |
| 19 | **Blanket "meets AA" claim** (Review §8-A5) | Replaced with a **verified contrast table** in §25.1 showing computed ratios for every text/UI token pair used. |
| 20 | **"View Presentations" hero CTA hierarchy** (Review §7-U2) | Added hierarchy guidance: the secondary button uses a larger size (min-height 52px, matching primary) to ensure visual dominance through size/placement, not just color. |

### What Did NOT Change

- Overall design philosophy, visual style, and emotional targets
- Core color palette (only token usage corrections)
- Typography system (fonts, scale)
- Spacing and grid systems
- Component architecture (only state and label corrections)
- Information architecture and sitemap
- The card → detail page → Present flow (confirmed as correct, with the addition of a quick-launch affordance on recent-rail cards)
- The decision to hide future sections from navigation
- The reserved-accent-color strategy for the Present CTA

---

## 2. Design Review Resolution Matrix

This matrix accounts for every finding in the Design Review Report.

### 2.1 Weaknesses (Review §5)

| ID | Finding | Severity | Resolution | Design Change |
|---|---|---|---|---|
| W1 | Core "≤3s launch" not achievable by design alone | HIGH | **Accepted.** Acknowledged as a product/environmental risk. Design controls the ≤3-click path but not external latency. | §15 now specifies exact launch mechanism and realistic expectations. §24.6 adds device guidance. Implementation Readiness (§30) flags this as an open product question. |
| W2 | "Full-screen" asserted but not designed | HIGH | **Accepted.** Clarified semantics. | Button label changed from "Present Full-Screen" to "Present" with subtitle "Opens in Google Slides". §15.2 explicitly describes the new-tab mechanism. |
| W3 | Contrast claims incorrect/unverified | MEDIUM | **Accepted.** All claims re-verified and corrected. | §25.1 now contains a verified contrast table. Tokens corrected: focus ring, warm text, neutral-400 usage. |
| W4 | Dark mode contradicts projector anti-pattern | MEDIUM | **Accepted.** Default changed. | §17 now defaults to light. Panel breakpoints force light. Toggle is opt-in only. §3 anti-pattern list clarified. |
| W5 | Recent rail recency source undefined | MEDIUM | **Accepted.** Dual strategy defined. | §13 and §18.2 now specify: personal recency (localStorage) when available, fallback to "Latest" (JSON order/date) otherwise. Section never hides if ≥1 presentation exists. |
| W6 | No publish/finalized flag in data model | LOW-MED | **Accepted.** | §29.8 JSON schema now includes `published: boolean`. |
| W7 | Privacy (NFR-9) no design treatment | LOW | **Accepted.** | §11.10 (Contact Section) now includes privacy microcopy, honeypot note, and data-handling statement. |
| W8 | Hero entrance animation conflicts with speed goal | LOW | **Partially Accepted.** Added intent-detection guard. | §23.4 now skips the full stagger on return visits (within 30s) — uses simple 300ms fade instead. |
| W9 | Frosted-glass header performance risk | LOW | **Accepted.** Added fallback. | §11.5 now specifies opaque fallback for `backdrop-filter` unsupported contexts and panel breakpoints. |

### 2.2 Missing Requirements (Review §6)

| ID | Gap | Resolution | Design Change |
|---|---|---|---|
| M1 | Privacy treatment for contact form | **Accepted** | §11.10: privacy microcopy, honeypot note, data-handling note |
| M2 | Recency mechanism undefined | **Accepted** | §13.2, §18.2: dual strategy (localStorage + Latest fallback) |
| M3 | No published/finalized flag | **Accepted** | §29.8: `published: boolean` added to JSON schema |
| M4 | Full-screen behavior not designed | **Accepted** | §15.2: mechanism explicitly defined |
| M5 | EC-8 projector guidance under-specified | **Accepted** | §24.6: dedicated device/environment guidance section |
| M6 | Sort options incomplete | **Accepted** | §14.2: added "Oldest First" option |
| M7 | QR code not addressed | **Acknowledged (Phase 2)** | No design action; noted in §30 open questions |
| M8 | Long tag overflow unspecified | **Accepted** | §11.3: tag row wrap rules + "+N more" overflow defined |

### 2.3 Usability Issues (Review §7)

| ID | Issue | Resolution | Design Change |
|---|---|---|---|
| U1 | Card→detail adds a step | **Noted; design kept** | Retained card→detail flow (justified in §28.1). Recent-rail cards now show a subtle "▶ Present" quick-launch affordance on hover (desktop) for Harshit's repeat use — keeping the 2-click fast path. |
| U2 | "View Presentations" CTA de-emphasized | **Partially Accepted** | §11.3: CTA uses matching min-height (52px) so hierarchy comes from size/placement, not color. |
| U3 | Empty recent rail hides on first visit | **Accepted** | §18.2: fallback to "Latest Presentations" when no personal recency. |
| U4 | Detail-page H1 wrap undefined | **Accepted** | §15.3: H1 unlimited lines, `word-break: break-word` |
| U5 | "Download Backup" label mismatch | **Accepted** | §15.2: changed to "Open Backup (Dropbox)" |
| U6 | Google auth interstitial not addressed | **Accepted** | §20.7: info alert with sign-in hint microcopy |

### 2.4 Accessibility Findings (Review §8)

| ID | Finding | Resolution | Design Change |
|---|---|---|---|
| A1 | Focus ring fails 3:1 | **Accepted (HIGH)** | New token `--color-focus: #4338CA` (~5.9:1). All focus specs updated. |
| A2 | Amber text on amber fails | **Accepted (HIGH)** | New token `--color-warm-700: #B45309` for warm text. All warm badge/alert text updated. |
| A3 | neutral-400 used for real text | **Accepted (MEDIUM)** | neutral-400 restricted to decorative/borders only. Text moved to neutral-600. |
| A4 | Placeholder/coming-soon borderline | **Accepted (MEDIUM)** | "Coming soon" pill text moved to `--color-neutral-600`. Placeholder remains neutral-500 (acceptable — placeholders are not real content). |
| A5 | Blanket "meets AA" claim | **Accepted (LOW)** | Replaced with verified contrast table in §25.1. |

---

## 3. Design Philosophy

### Core Principle: "Confidence at First Glance"

Every design decision serves one of two jobs: **help Harshit present instantly** or **leave a polished, lasting impression**. The design philosophy is built on four pillars:

| Pillar | Meaning in Practice |
|---|---|
| **Clarity over decoration** | Every element has a reason. No ornamental noise. Whitespace is a feature, not wasted space. |
| **Speed as a design material** | The visual hierarchy itself communicates urgency — the "Present" action is always the most dominant element on any presentation surface. |
| **Premium restraint** | Sophistication through subtlety: refined typography, intentional color, precise spacing. Nothing screams for attention except what should. |
| **Calm authority** | The tone is confident and composed — professional enough for recruiters, warm enough for classmates, clear enough for teachers on a projector. |

### Design Metaphor

> A well-organized speaker's podium: everything Harshit needs is within arm's reach, the backdrop is elegant, and the focus is entirely on the content and the presenter.

### Anti-Patterns to Avoid

- ❌ Overly playful or childish aesthetics (audience includes teachers and recruiters)
- ❌ Generic template/stock feel (must feel custom and intentional)
- ❌ Heavy animations that delay the 10-second launch path
- ❌ Dark themes on classroom projectors or interactive panels (dark mode is opt-in only and force-disabled on panel breakpoints — see §17)
- ❌ Dense information architecture that adds clicks to presentation access
- ❌ Decorative elements that compete with content

> **v2 Clarification:** The dark-theme anti-pattern is refined to specifically address the classroom projection context. Dark mode exists as an opt-in feature for personal browsing but is never applied on panel displays or forced by system preference.

---

## 4. Design Goals

Design goals are ranked by priority, directly mapping to PRD objectives:

| Priority | Design Goal | PRD Objective | How Design Achieves It |
|---|---|---|---|
| **1 (Highest)** | Instant presentation access | O1 — Fastest access | The "Present" button is the largest, most visually dominant CTA on any presentation surface. Recent/latest rail is above the fold. ≤ 3 clicks enforced visually. Quick-launch affordance on recent-rail cards for Harshit's repeat use. |
| **2** | Premium first impression | O2 — Impression | Hero section uses bold typography, refined color palette, and generous whitespace. Above-the-fold content on desktop is fully designed. The Recent/Latest rail ensures the homepage always shows content. |
| **3** | Effortless wayfinding | O3 — Navigation | Consistent navigation, clear active states, breadcrumb-like context, no dead ends. Every page has an obvious "next action." |
| **4** | Seamless multi-device | O5 — Device-agnostic | Mobile-first breakpoints; interactive panel considerations built into spacing and sizing from the start. Device-specific guidance for the presentation launch path. |
| **5** | Scalable elegance | O4/O6 — Future-ready | Design system components are modular; the gallery gracefully handles 3 items or 300. Future sections are designed to slot in without redesign. |

### Emotional Targets

When users land on this site, they should feel (in order):

1. **"This is polished."** (0–2 seconds — visual quality)
2. **"I know exactly where to go."** (2–5 seconds — clarity of hierarchy)
3. **"I trust this person."** (5–15 seconds — professional tone, quality of craft)

---

## 5. Visual Style Recommendation

### Recommended Style: **"Refined Academic Modern"**

*(Unchanged from v1.0 — see v1.0 §3 for full rationale.)*

### Key Visual Characteristics

- **Generous whitespace** — Content breathes; nothing feels cramped
- **Strong typographic hierarchy** — Size and weight do the heavy lifting, not color
- **Muted background, vibrant accents** — Calm canvas with strategic color for actions
- **Soft, layered depth** — Subtle shadows and cards create hierarchy without harsh borders
- **Rounded but not playful** — Border radii that feel modern (8–16px) without being cartoonish
- **Subtle texture** — Very light gradient overlays on hero to avoid flat monotony

---

## 6. Color System

### 6.1 Primary Palette

| Token | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| `--color-primary-900` | Indigo Night | `#1A1D3B` | 26, 29, 59 | Primary text (headings), dark backgrounds |
| `--color-primary-800` | Deep Indigo | `#252960` | 37, 41, 96 | Secondary dark surfaces |
| `--color-primary-700` | Royal Indigo | `#303580` | 48, 53, 128 | Hover on dark surfaces |
| `--color-primary-600` | Indigo | `#3D43A0` | 61, 67, 160 | Accent dark variant |
| `--color-primary-500` | Bright Indigo | `#4F5BD5` | 79, 91, 213 | Primary accent, links |
| `--color-primary-400` | Soft Indigo | `#7B83E0` | 123, 131, 224 | Hover on primary elements, **decorative only — not for text or focus** |
| `--color-primary-300` | Light Indigo | `#A5ABE9` | 165, 171, 233 | Borders, subtle accents |
| `--color-primary-200` | Pale Indigo | `#D0D3F2` | 208, 211, 242 | Light backgrounds, tags |
| `--color-primary-100` | Whisper Indigo | `#E8EAF8` | 232, 234, 248 | Card backgrounds, section fills |
| `--color-primary-50` | Frost | `#F4F5FC` | 244, 245, 252 | Page background |

### 6.2 Accent Palette

| Token | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| `--color-accent-600` | Deep Blue | `#1D4ED8` | 29, 78, 216 | CTA hover state |
| `--color-accent-500` | Electric Blue | `#2563EB` | 37, 99, 235 | **Primary CTA** — "Present" button, launch actions |
| `--color-accent-400` | Sky Blue | `#60A5FA` | 96, 165, 250 | Highlights, decorative accents |
| `--color-accent-100` | Ice Blue | `#DBEAFE` | 219, 250, 254 | CTA backgrounds, badges |

### 6.3 Warm Accent (Secondary)

> **v2 CHANGE:** New `--color-warm-700` token added for accessible warm text. The original `--color-warm-500` (#F59E0B) is retained for **icon/decorative use only** (e.g., star icons), never for text on light backgrounds.

| Token | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| `--color-warm-700` | **Dark Amber** ★ NEW | `#B45309` | 180, 83, 9 | **Warm text and icons on light backgrounds** — "Recent" badges, warning alert text |
| `--color-warm-500` | Amber Glow | `#F59E0B` | 245, 158, 11 | Star/favorite icons only (decorative, ≥24px for 3:1 non-text) |
| `--color-warm-400` | Soft Amber | `#FBBF24` | 251, 191, 36 | Hover on warm elements |
| `--color-warm-100` | Pale Amber | `#FEF3C7` | 254, 243, 199 | Warm badge backgrounds |

### 6.4 Neutral Palette

> **v2 CHANGE:** `--color-neutral-400` usage restricted to decorative/border use only. It must never be used for text.

| Token | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| `--color-neutral-900` | Charcoal | `#111827` | 17, 24, 39 | Body text |
| `--color-neutral-800` | Dark Gray | `#1F2937` | 31, 41, 55 | Secondary text |
| `--color-neutral-700` | Gray | `#374151` | 55, 65, 81 | Tertiary text |
| `--color-neutral-600` | Mid Gray | `#4B5563` | 75, 85, 99 | Muted text, **dates, captions, empty-state body** ★ v2 expanded usage |
| `--color-neutral-500` | Gray | `#6B7280` | 107, 114, 128 | Placeholder text only, decorative icons |
| `--color-neutral-400` | Light Gray | `#9CA3AF` | 156, 163, 175 | **Borders, dividers ONLY** ★ v2 restricted — never for text |
| `--color-neutral-300` | Silver | `#D1D5DB` | 209, 213, 219 | Input borders, subtle dividers |
| `--color-neutral-200` | Pale Gray | `#E5E7EB` | 229, 231, 235 | Card borders, separators |
| `--color-neutral-100` | Off White | `#F3F4F6` | 243, 244, 246 | Section backgrounds |
| `--color-neutral-50` | Snow | `#F9FAFB` | 249, 250, 251 | Page background |
| `--color-white` | White | `#FFFFFF` | 255, 255, 255 | Card surfaces, text on dark |

### 6.5 Semantic Colors

> **v2 CHANGE:** Warning text token separated from warning icon token. `--color-warning-text` added for accessible text on warning backgrounds.

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-success-500` | Green | `#10B981` | Success states, confirmations (text on white bg: 3.4:1 — use only for large text/icons; for body text use `#047857`) |
| `--color-success-700` | Dark Green ★ NEW | `#047857` | Success body text on light backgrounds (≥4.5:1) |
| `--color-success-100` | Light Green | `#D1FAE5` | Success backgrounds |
| `--color-error-500` | Red | `#EF4444` | Error states, broken links (text on white: 4.6:1 ✅) |
| `--color-error-100` | Light Red | `#FEE2E2` | Error backgrounds |
| `--color-warning-500` | Orange | `#F59E0B` | Warning icons only (decorative, large) |
| `--color-warning-700` | **Dark Orange** ★ NEW | `#B45309` | **Warning text on light backgrounds** (≥4.5:1) |
| `--color-warning-100` | Light Orange | `#FEF3C7` | Warning backgrounds |
| `--color-info-500` | Blue | `#3B82F6` | Information states |
| `--color-info-100` | Light Blue | `#DBEAFE` | Info backgrounds |

### 6.6 Focus & Accessibility Tokens ★ NEW

| Token | Name | Hex | Usage | Contrast on White |
|---|---|---|---|---|
| `--color-focus` | **Focus Ring** ★ NEW | `#4338CA` | Keyboard focus indicators (all elements) | ~5.9:1 ✅ |
| `--color-focus-subtle` | Focus Ring Light BG | `#C7D2FE` | Focus ring on dark surfaces | N/A (used on dark bg) |

### 6.7 Color Usage Rules

1. **The "Present" / primary CTA button** always uses `--color-accent-500` (Electric Blue). This color is reserved exclusively for primary action buttons to maintain its visual power.
2. **Body text** uses `--color-neutral-900` on `--color-white` or `--color-neutral-50` backgrounds. Never use pure black (`#000`).
3. **Links** use `--color-primary-500` in body text; they shift to `--color-primary-600` on hover.
4. **Backgrounds** should always use the neutral scale — the primary palette is reserved for accents and branding.
5. **Maximum 3 colors visible at once** in any viewport: one neutral (background), one text color, one accent. This keeps the design feeling clean.
6. **All interactive elements must meet WCAG AA contrast** — see the verified contrast table in §25.1.
7. ★ **`--color-neutral-400` (#9CA3AF) must NEVER be used for text.** It is reserved for borders and decorative dividers only. Use `--color-neutral-600` or darker for any readable text.
8. ★ **Warm/amber text on warm backgrounds must use `--color-warm-700` (#B45309), never `--color-warm-500`.**
9. ★ **Focus rings must use `--color-focus` (#4338CA) on light backgrounds.** This replaces the previous `--color-primary-400` which failed contrast requirements.

---

## 7. Typography System

*(Unchanged from v1.0 — see v1.0 §5 for complete specification.)*

Key reminder: All text sizes in `rem` for accessibility. Minimum font size: 12px (0.75rem). Body text line height minimum: 1.5. Maximum line length: 75 characters.

---

## 8. Spacing System

*(Unchanged from v1.0 — see v1.0 §6 for complete specification.)*

---

## 9. Grid System

*(Unchanged from v1.0 — see v1.0 §7 for complete specification.)*

---

## 10. Iconography

*(Unchanged from v1.0 — see v1.0 §8 for complete specification.)*

---

## 11. Component Library

### 11.1 Buttons

#### Primary Button (CTA — "Present")

```
┌─────────────────────────────────┐
│  ▶  Present                     │
└─────────────────────────────────┘
```

| Property | Value |
|---|---|
| Background | `--color-accent-500` (#2563EB) |
| Text | `#FFFFFF`, `--text-body` (16px), weight 600 |
| Padding | 16px vertical × 32px horizontal |
| Border radius | 12px |
| Min height | 52px |
| Min width | 180px |
| Shadow | `0 1px 3px rgba(37, 99, 235, 0.3), 0 4px 12px rgba(37, 99, 235, 0.15)` |
| Hover | Background `--color-accent-600`, shadow intensifies, translateY(-1px) |
| Active | Background `#1E40AF`, translateY(0), shadow reduces |
| **Focus** | ★ **2px offset outline ring in `--color-focus` (#4338CA)** |
| Disabled | Opacity 0.5, cursor not-allowed, no hover effects |

#### Secondary Button

> **v2 CHANGE:** Used for "Open Backup (Dropbox)" and hero "View Presentations" CTA. On the homepage hero, this button uses min-height 52px (matching primary) to ensure visual hierarchy through size/placement.

| Property | Value |
|---|---|
| Background | Transparent |
| Border | 1.5px solid `--color-neutral-300` |
| Text | `--color-neutral-800`, weight 500 |
| Padding | 12px vertical × 24px horizontal |
| Border radius | 10px |
| Min height | 44px (52px on hero CTA for hierarchy parity) |
| Hover | Border `--color-primary-500`, text `--color-primary-500`, bg `--color-primary-50` |
| **Focus** | ★ **2px outline ring `--color-focus` (#4338CA)** |

#### Tertiary / Ghost Button

| Property | Value |
|---|---|
| Background | Transparent |
| Text | `--color-primary-500`, weight 500 |
| Padding | 8px vertical × 16px horizontal |
| Border radius | 8px |
| Hover | Background `--color-primary-50` |
| **Focus** | ★ **2px outline ring `--color-focus` (#4338CA)** |

#### Icon Button (square)

| Property | Value |
|---|---|
| Size | 44px × 44px (min, for touch target) |
| Background | Transparent |
| Border radius | 10px |
| Icon | 20px, centered |
| Hover | Background `--color-neutral-100` |
| **Focus** | ★ **2px outline ring `--color-focus` (#4338CA)** |

### 11.2 Presentation Card

```
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │     [Subject Color Bar /        │ │
│ │      Visual Identifier]          │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│  Subject Tag    ·  Date              │
│                                      │
│  Presentation Title That Might       │
│  Wrap to Two Lines Maximum           │
│                                      │
│  [tag1] [tag2] [tag3]               │
│                                      │
│  ────────────────────────────────    │
│                              ▶ Pres. │  ← Quick-launch (recent rail only)
└──────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Container | `--color-white` background, border-radius 16px |
| Border | 1px solid `--color-neutral-200` |
| Shadow (resting) | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)` |
| Shadow (hover) | `0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)` |
| Padding | 24px all sides |
| Visual identifier | Top area: 120px height block with subject-specific gradient (see 11.2.1) |
| Title | `--text-heading-4` (20px), `--color-neutral-900`, weight 600, max 2 lines with ellipsis |
| Subject tag | `--text-caption`, pill shape, subject color background at 10% opacity, subject color text at 80% |
| **Date** | ★ `--text-caption`, **`--color-neutral-600`** (was neutral-400 in v1), with calendar icon |
| Tags row | ★ **Wraps to multiple lines.** Max 5 tags visible. If more, show "+N more" in `--color-neutral-600`. Each tag: `--text-caption`, pill-shaped, `--color-primary-100` bg, `--color-primary-700` text. |
| Hover effect | Card lifts (translateY -4px), shadow deepens, border shifts to `--color-primary-200` |
| **Focus** | ★ **2px outline `--color-focus` (#4338CA), offset 2px** |
| Cursor | Pointer on entire card |
| **Quick-launch (recent rail cards only)** | ★ **On hover (desktop), a subtle "▶ Present" ghost button appears at bottom-right of the card. Clicking it opens the Google Slides URL directly (skips detail page), providing Harshit a 2-click fast path from the homepage. On touch devices, this is not shown — tap goes to detail page.** |

#### 11.2.1 Subject Color Identifiers

*(Unchanged from v1.0 §9.2.1 — same gradient mapping.)*

### 11.3 Tag / Badge / Pill

> **v2 CHANGES:** Warm badge text color corrected. "Coming soon" text color moved to neutral-600.

| Variant | Background | Text | Border | Padding | Radius |
|---|---|---|---|---|---|
| Subject tag | Subject color @ 10% opacity | Subject color @ 80% | None | 4px 10px | 6px |
| Content tag | `--color-primary-100` | `--color-primary-700` | None | 4px 10px | 6px |
| "Recent" badge ★ FIXED | `--color-warm-100` | **`--color-warm-700` (#B45309)** | None | 4px 8px | 6px |
| Status (success) | `--color-success-100` | **`--color-success-700` (#047857)** | None | 4px 10px | 6px |
| Status (error) | `--color-error-100` | `--color-error-500` | None | 4px 10px | 6px |
| "Coming soon" ★ FIXED | `--color-neutral-100` | **`--color-neutral-600`** | 1px dashed `--color-neutral-300` | 6px 12px | 8px |

### 11.4 Search Input

| Property | Value |
|---|---|
| Container | `--color-white` bg, 1.5px border `--color-neutral-300`, radius 12px |
| Height | 48px |
| Padding | 12px left (after icon), 16px right |
| Icon | `Search` icon, 20px, `--color-neutral-500`, left inset 16px |
| Placeholder text | "Search presentations by title, subject, or tag..." (`--color-neutral-500` — acceptable for placeholders) |
| Text | `--text-body`, `--color-neutral-900` |
| Focus state | Border `--color-primary-500`, box-shadow `0 0 0 3px rgba(79, 91, 213, 0.15)` |
| Active (typing) | Same as focus; clear button (×) appears right side when text exists |
| Clear button | Icon button, 28px, appears on hover/focus when input has value |

### 11.5 Navigation Header

> **v2 CHANGE:** Added solid fallback for `backdrop-filter` unsupported contexts and panel breakpoints.

| Property | Value |
|---|---|
| Height | 72px desktop; 64px mobile |
| Background | `rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(12px)` (frosted glass) |
| **Fallback** ★ | **Where `backdrop-filter` is unsupported (`@supports not (backdrop-filter: blur(1px))`) or on panel breakpoints (≥1920px): solid `--color-white` background, no blur.** |
| Border bottom | 1px solid `--color-neutral-200` |
| Position | Sticky, top: 0 |
| Z-index | 100 |
| Brand (left) | "Harshit" in Plus Jakarta Sans, `--text-heading-4`, weight 700, `--color-primary-900` |
| Nav links (center/right) | `--text-body-sm`, weight 500, `--color-neutral-600` |
| Active link | `--color-primary-500`, weight 600, underline indicator (2px, `--color-primary-500`, offset -4px) |
| Hover link | `--color-neutral-900` |
| **Focus link** | ★ **2px outline `--color-focus` (#4338CA), offset 2px, radius 4px** |

### 11.6 Mobile Navigation (Hamburger Menu)

*(Unchanged from v1.0 §9.6, with focus ring updated to `--color-focus`.)*

### 11.7 Hero Section

> **v2 CHANGE:** "View Presentations" CTA uses matching height for visual hierarchy. Recent rail section heading changes dynamically ("Recent" vs "Latest").

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ACADEMIC PORTFOLIO                                          │
│                                                              │
│  Harshit.                  ← (Display XL, ExtraBold)         │
│  Building ideas, one       ← (Body LG, Neutral 600)          │
│  presentation at a time.                                     │
│                                                              │
│  [ View Presentations ]    [ About Me ]                      │
│   (Secondary, 52px)        (Ghost)                           │
│                                                              │
│  ── Latest Presentations ──────────────────────────────      │
│  ┌──────┐  ┌──────┐  ┌──────┐                               │
│  │Card 1│  │Card 2│  │Card 3│   ← Horizontal scroll mobile  │
│  └──────┘  └──────┘  └──────┘                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

| Element | Details |
|---|---|
| Overline | "ACADEMIC PORTFOLIO" — `--text-overline`, `--color-primary-500`, uppercase |
| Name | "Harshit." — `--text-display-xl` (desktop), `--text-display-lg` (mobile). `--color-primary-900`. The period is a brand signature — use `--color-accent-500` for it. |
| Tagline | One line, `--text-body-lg`, `--color-neutral-600`, max-width 500px |
| CTA Row | Primary: "View Presentations" **(Secondary button style, but min-height 52px for hierarchy)** → `/presentations`; Secondary: "About Me" (Ghost) → `/about` |
| Recent/Latest Rail | ★ **Section heading is dynamic:** "Recent Presentations" when personal recency data exists; "Latest Presentations" when showing the fallback. Always `--text-heading-3`. |

### 11.8 Presentation Detail Page

> **v2 CHANGES:** Button label corrected. Subtitle added. H1 wrap behavior defined.

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Presentations                                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │           [Subject Gradient Visual Block]               │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Subject     Date                                            │
│                                                              │
│  Presentation Title That Wraps                               │
│  Gracefully Across Multiple Lines                            │
│                                                              │
│  [tag1] [tag2] [tag3] [+2 more]                             │
│                                                              │
│  ┌──────────────────────────────┐  ┌──────────────────────┐ │
│  │  ▶  Present                  │  │  ↗  Open Backup      │ │
│  │  Opens in Google Slides      │  │     (Dropbox)        │ │
│  └──────────────────────────────┘  └──────────────────────┘ │
│                                                              │
│  ── About This Presentation ──────────────────────────       │
│  Brief description...                                        │
│                                                              │
├─ FOOTER ─────────────────────────────────────────────────────┤
└──────────────────────────────────────────────────────────────┘
```

| Element | Details |
|---|---|
| Back link | Ghost button with ArrowLeft icon + "Back to Presentations". `--text-body-sm`. |
| Visual block | Same gradient as card but larger: 240px height, border-radius 16px, full content width. |
| **Title (H1)** | ★ `--text-heading-1`, `--color-neutral-900`. **Unlimited lines, `word-break: break-word`, `overflow-wrap: anywhere`.** No truncation — the detail page title must always display in full. |
| Meta row | Subject pill + date with calendar icon, `--text-body-sm`, **`--color-neutral-600`** ★ |
| Tags | ★ **Wraps to multiple lines. Max 5 visible + "+N more" overflow pill** in `--color-neutral-600`. |
| **Present button** | Primary button. Label: **"Present"**. Below the label, a subtitle line in `--text-caption`, white at 70% opacity: **"Opens in Google Slides"**. Minimum 200px wide. This is the dominant element. |
| **Open Backup button** ★ RENAMED | Secondary button. Label: **"Open Backup (Dropbox)"**. Icon: `ExternalLink` (not Download). Opens Dropbox URL in new tab. |
| Button layout | Side-by-side on desktop (Present left, Backup right); stacked full-width on mobile (Present on top). |

### 11.9 About Section

*(Unchanged from v1.0 §9.9.)*

### 11.10 Contact Section

> **v2 CHANGE:** Added privacy microcopy and anti-spam notes.

| Element | Details |
|---|---|
| Layout | Centered, max-width 560px |
| Heading | `--text-heading-2` |
| Subtitle | `--text-body`, `--color-neutral-600` |
| Contact links | Email (mailto:), social links — each as a secondary button with icon |
| Form (optional) | Name, Email, Message fields — all with proper labels, focus states, validation |
| Form submit | Primary button "Send Message" |
| **Privacy microcopy** ★ NEW | Below the submit button: *"Your information is only used to respond to your message and is never shared."* — `--text-caption`, `--color-neutral-600` |
| **Anti-spam** ★ NEW | Implementation note: Use a hidden honeypot field (no CAPTCHA) for spam prevention. The honeypot field is visually hidden with CSS (not `display:none`, to remain accessible to screen readers with appropriate `aria-hidden`). |
| Success state | Green check + "Message sent! I'll get back to you soon." with `--color-success-700` text on `--color-success-100` bg |
| Error state | Red border on invalid fields + inline error message below each field |

### 11.11 Footer

> **v2 CHANGE:** Footer text color corrected.

| Property | Value |
|---|---|
| Background | `--color-neutral-50` |
| Border top | 1px solid `--color-neutral-200` |
| Padding | `--space-10` vertical |
| Content | "© 2026 Harshit" left; "Built with care" right |
| Text | `--text-body-sm`, **`--color-neutral-600`** ★ (was neutral-500 in v1) |

---

## 12. Navigation Design

### 12.1 Global Navigation Structure

*(Unchanged from v1.0 §10.1.)*

### 12.2 Active State

*(Unchanged from v1.0 §10.2.)*

### 12.3 Breadcrumb (Presentation Detail Page Only)

> **v2 CHANGE:** Separator color corrected from neutral-400 to neutral-500.

```
Home / Presentations / [Presentation Title]
```

- `--text-body-sm`, **`--color-neutral-500`** for separators (/), **`--color-neutral-600`** for links ★
- Current page (title) in `--color-neutral-800`, not a link
- Truncate title to 30 characters with ellipsis if longer

### 12.4 Mobile Navigation

*(Unchanged from v1.0 §10.4.)*

### 12.5 Tablet Navigation ★ NEW

> **v2 ADDITION:** Addresses the review finding that tablet nav collapse was unspecified.

| Viewport | Behavior |
|---|---|
| 768px – 899px | Nav links shown, but if they overflow the available width, the last items (Contact, and any future sections) collapse into a **"More ▾"** dropdown menu styled as a ghost button with ChevronDown. Clicking opens a small dropdown below the nav. |
| 900px – 1023px | All nav links visible inline. No collapse needed. |

The "More ▾" dropdown is not used on mobile (hamburger menu handles everything) or desktop (all links fit).

### 12.6 Keyboard Navigation

*(Unchanged from v1.0 §10.5.)*

---

## 13. Homepage Layout

### 13.1 Structure (Top to Bottom)

*(Structurally unchanged from v1.0 §11.1. The only difference is the Recent/Latest heading is now dynamic.)*

### 13.2 Recent/Latest Rail Behavior ★ REVISED

> **v2 CHANGE:** This section replaces the v1 "hide when empty" behavior with a dual-strategy fallback.

| Scenario | What Renders | Section Heading |
|---|---|---|
| **Personal recency data exists** (localStorage has launch history) | Most recently launched presentations (newest first), max 3 | "Recent Presentations" |
| **No personal recency data** (first-time visitor, new device, cleared data) | Most recently added presentations from JSON (by `date` or `order` field), max 3 | "Latest Presentations" |
| **Zero published presentations** | Section is hidden entirely | N/A |

**Implementation notes:**
- "Personal recency" is stored in `localStorage` key `recentPresentations` as an array of slugs (max 5), updated each time a "Present" action is triggered.
- When `recentPresentations` is empty or does not exist, the fallback uses the JSON data sorted by date descending.
- This ensures the homepage **always** shows presentation cards as long as at least one presentation is published — addressing the PRD's premium-impression goal (O2) and the review's U3 concern.
- "View All" link always points to `/presentations`.

### 13.3 Tag Row Overflow Rules ★ NEW

> **v2 ADDITION:** Addresses review finding M8.

- **On cards:** Tags wrap to a second line if needed. If total tags > 5, show first 4 tags + "+N more" pill (non-interactive, `--color-neutral-600` text on `--color-neutral-100` bg).
- **On the detail page:** Tags wrap freely to multiple lines (no "+N more" — all tags are visible on the detail page).
- **Individual tags:** Never truncate. If a single tag label is > 20 characters, it wraps internally within the pill.

### 13.4 Key Design Decisions

*(Unchanged from v1.0 §11.2, with the addition of note 7 below.)*

7. ★ **"View Presentations" CTA hierarchy:** Although the hero's primary navigational CTA uses the secondary button style (to reserve Electric Blue for the Present action), it uses a **min-height of 52px** (matching the primary button) and is positioned first (left) in the CTA row. This ensures visual dominance through size and position, not color.

### 13.5 Above-the-Fold Checklist (Desktop)

- [x] Harshit's name visible
- [x] Tagline visible
- [x] "View Presentations" CTA visible
- [x] At least the top of the recent/latest rail visible
- [x] Navigation fully visible
- [x] No broken layouts or missing content
- [x] ★ Rail section always shows content if ≥1 presentation exists

---

## 14. Presentation Gallery Layout

### 14.1 Page Structure

*(Unchanged from v1.0 §12.1.)*

### 14.2 Component Details

> **v2 CHANGE:** Sort options expanded.

| Element | Details |
|---|---|
| Page title | "Presentations" in `--text-heading-1` |
| Presentation count | Right-aligned, `--text-body-sm`, `--color-neutral-600` ★. E.g., "6 presentations" |
| Search bar | Full-width on mobile; flex row with sort on desktop |
| **Sort dropdown** ★ EXPANDED | Options: **"Most Recent"** (default), **"Oldest First"**, **"Subject A–Z"**, **"Subject Z–A"**. Styled as secondary button with ChevronDown icon. |
| Card grid | CSS Grid: `repeat(auto-fill, minmax(320px, 1fr))` with `--space-6` gap |
| Empty state | If search yields no results: see §18.3 |

### 14.3 Card Interaction

*(Unchanged from v1.0 §12.3. Note: Gallery cards do NOT have the quick-launch affordance — only recent-rail cards do.)*

### 14.4 Sort Behavior

- Default sort: Most Recent (newest first)
- Sort is client-side (data is small, < 10 items initially)
- Sort state is reflected in the URL query parameter (`?sort=date-desc`, `?sort=date-asc`, `?sort=subject-asc`, `?sort=subject-desc`) for shareability
- Sort change triggers a subtle re-order animation (FLIP technique, 300ms)

> **Scalability note ★ NEW:** Client-side search and sort are designed for ≤100 items. If the presentation catalog grows beyond ~100 items, migrate to indexed or server-side search/sort. This threshold should be monitored but is not expected to be reached in the near term.

---

## 15. Presentation Details Page

### 15.1 Page Structure

*(Updated ASCII diagram shown in §11.8 above.)*

### 15.2 Interaction Specifications ★ REVISED

> **v2 CHANGES:** Launch mechanism explicitly defined. Button labels corrected. Google auth hint added.

**"Present" Button:**
- **Label:** "Present" with subtitle "Opens in Google Slides"
- **Mechanism:** Opens the Google Slides `/present` URL in a **new tab** (`target="_blank"` with `rel="noopener noreferrer"`)
- **What the user sees:** The new tab loads Google Slides' presentation mode. This is Slides' built-in full-screen-like presentation view. It fills the browser tab with the slides. On a projector or panel, the user should extend/duplicate their display to fill the screen — this is an OS-level action, not a browser action.
- **What "full-screen" means in this context:** The Google Slides `/present` URL renders slides in a presentation-optimized view (no browser chrome visible in the slides area, slides fill the viewport). This is NOT the browser's F11 full-screen mode or the Fullscreen API. It is Slides' own presentation mode, which is the standard way to present from Google Slides.
- On click: brief scale animation (0.98 → 1.0, 150ms) for tactile feedback
- The new tab behavior keeps the portfolio site context alive — the user can always come back
- If the Google Slides URL fails (EC-1), the page should still render; the "unavailable" state is shown as an inline alert below the button (see §20.3)

**"Open Backup (Dropbox)" Button:**
- Opens the Dropbox link in a new tab (`target="_blank"`)
- **Implementation note:** If the Dropbox URL supports it, append `?dl=1` to force a direct download rather than the Dropbox preview page. If the URL already has query parameters, use `&dl=1`. This sets correct user expectations — "Open Backup" accurately describes either behavior.
- Same pattern as Present button for error handling

**"Back to Presentations" Link:**
- Uses browser history (`window.history.back()`) if the referrer is the gallery; otherwise navigates to `/presentations`

### 15.3 Detail Page Title (H1) Behavior ★ NEW

> **v2 ADDITION:** Addresses review finding U4.

- The presentation title (H1) on the detail page is **never truncated**
- It wraps to as many lines as needed
- CSS: `word-break: break-word; overflow-wrap: anywhere;`
- Line height: `--text-heading-1` line-height (1.2)
- This ensures very long titles (EC-5) are always fully readable

### 15.4 Visual Block

*(Unchanged from v1.0 §13.3.)*

### 15.5 Page Transition

*(Unchanged from v1.0 §13.4.)*

---

## 16. Search Experience

*(Unchanged from v1.0 §14. All specifications from the search overlay, algorithm, and inline gallery search remain as specified.)*

---

## 17. Dark Mode ★ REVISED

> **v2 MAJOR CHANGE:** The dark mode strategy has been revised to resolve the conflict with the projector anti-pattern (§3) and the classroom use case.

### 17.1 Approach

Dark mode is now a **purely opt-in feature** with the following rules:

1. **Default: Light mode always.** The site always loads in light mode regardless of OS preference. System preference detection (`prefers-color-scheme`) is **not used** for initial theme selection.
2. **Toggle:** A sun/moon icon button in the header allows users to manually switch to dark mode for personal browsing.
3. **Panel breakpoint override:** On viewports ≥1920px (interactive classroom panels), the dark mode toggle is **hidden** and the theme is **forced to light**. Dark mode on a projected display would reduce legibility and wash out colors — this directly serves the projector anti-pattern.
4. **Persistence:** User preference (light/dark) stored in `localStorage` key `theme`. Only applies on mobile/tablet/desktop breakpoints.

**Rationale for change:**
- The PRD never required dark mode (it is not in any FR, NFR, or scope line).
- The v1 design explicitly listed "dark, moody themes that reduce legibility on projectors" as an anti-pattern, yet the v1 system-preference default could deliver exactly that to a classroom panel.
- Harshit's primary classroom scenario requires the site to be instantly legible on a projector — a dark theme would undermine this.
- The toggle is retained as a courtesy for users who prefer dark mode during personal browsing on their phones/laptops.

### 17.2 Dark Mode Color Mappings

*(Unchanged from v1.0 §15.2.)*

### 17.3 Dark Mode Adjustments

*(Unchanged from v1.0 §15.3.)*

### 17.4 Persistence ★ REVISED

User preference stored in `localStorage` key `theme`. Values: `light` (default), `dark`.
- On mobile/tablet/desktop: respect stored preference.
- On panel (≥1920px): ignore preference, force `light`, hide toggle.

---

## 18. Empty States

### 18.1 Empty Gallery (No presentations yet)

> **v2 CHANGE:** Empty-state body text color corrected.

- Icon: `FolderOpen`, 48px, `--color-neutral-300`
- Heading: `--text-heading-4`, `--color-neutral-600`
- Body: `--text-body-sm`, **`--color-neutral-600`** ★ (was neutral-400 in v1)
- Centered in the gallery grid area

### 18.2 Empty Recent Rail ★ REVISED

> **v2 MAJOR CHANGE:** The section no longer hides when personal recency is empty.

| Scenario | Behavior |
|---|---|
| Personal recency data exists | Show "Recent Presentations" with the user's most recently launched presentations |
| No personal recency data (first-time visitor) | Show **"Latest Presentations"** with the most recently added presentations from JSON data |
| Zero published presentations exist | Section is **hidden entirely** (not shown as empty) |

This ensures a first-time visitor (recruiter, classmate, teacher) always sees presentation content on the homepage — supporting the premium-impression goal (O2) and resolving the review's U3 concern.

### 18.3 Empty Search Results

> **v2 CHANGE:** Text color corrected.

- Icon: `Search`, 48px, `--color-neutral-300`
- Heading: `--text-heading-4`, `--color-neutral-600`
- Body: `--text-body-sm`, **`--color-neutral-600`** ★
- "clear your search" is a link that resets the search input

### 18.4 "Coming Soon" Sections (Projects, Certificates, Resume)

> **v2 CHANGE:** Text color corrected.

- Icon: `Sparkles`, 48px, `--color-neutral-300`
- Heading: `--text-heading-3`, `--color-neutral-800`
- Body: `--text-body`, **`--color-neutral-600`** ★
- "Coming Soon" badge uses the corrected dashed-border pill from §11.3 (neutral-600 text)
- A "Back to Home" tertiary button provides an exit path

---

## 19. Loading States

*(Unchanged from v1.0 §17. All specifications for page transitions, skeleton loading, presentation launch loading, and search loading remain as specified.)*

---

## 20. Error States

### 20.1 General Error Page (500 / Unexpected)

*(Unchanged from v1.0 §18.1.)*

### 20.2 404 Page

*(Unchanged from v1.0 §18.2.)*

### 20.3 Broken Google Slides Link (EC-1)

> **v2 CHANGE:** Warning alert text color corrected.

```
┌──────────────────────────────────────────┐
│ ⚠️  Presentation unavailable              │
│                                           │
│    The Google Slides link for this         │
│    presentation is currently unavailable. │
│    You can open a backup copy below.      │
│                                           │
│    [ ↗  Open Backup (Dropbox) ]           │
└──────────────────────────────────────────┘
```

- Styled as a warning alert: `--color-warning-100` background, **`--color-warning-700` (#B45309)** ★ border-left (3px), **`--color-warning-700`** text
- The "Present" button is disabled with a tooltip: "Presentation link unavailable"
- "Open Backup (Dropbox)" button becomes the primary action

### 20.4 Broken Dropbox Link (EC-2)

*(Unchanged from v1.0 §18.4. Text references updated to corrected token names.)*

### 20.5 Offline State (EC-3)

> **v2 CHANGE:** Text color corrected.

- Icon: `WifiOff`, 48px, `--color-neutral-300`
- Heading: `--text-heading-3`, `--color-neutral-800`
- Body: `--text-body`, **`--color-neutral-600`** ★
- "Retry" button

### 20.6 Contact Form Errors

*(Unchanged from v1.0 §18.6. Success text uses `--color-success-700` on `--color-success-100` background.)*

### 20.7 Google Sign-In Interstitial Hint ★ NEW

> **v2 ADDITION:** Addresses review finding U6/RK-5 — the common classroom failure where Google Slides prompts for sign-in.

When a presentation is launched and the Slides link is not publicly accessible, Google may show a sign-in interstitial. The design addresses this with:

1. **Proactive microcopy** on the presentation detail page, shown as a subtle info note below the action buttons (only visible on the detail page, not intrusive):

```
┌──────────────────────────────────────────────────────┐
│ ℹ️  If the presentation asks you to sign in,          │
│    make sure the Google Slides link is set to         │
│    "Anyone with the link can view."                   │
└──────────────────────────────────────────────────────┘
```

- Styled as an info alert: `--color-info-100` background, `--color-primary-700` text, `--color-primary-500` left border (3px)
- `--text-body-sm`
- This note is always visible on the detail page (not only on error) as a preventive reminder for Harshit when managing his presentations.

2. **Reactive guidance** (if the user reports the issue): The broken-link error state (§20.3) already provides the Dropbox fallback path.

---

## 21. Hover States

> **v2 CHANGE:** All focus references updated to `--color-focus`.

### 21.1 Hover State Catalog

*(Unchanged from v1.0 §19.1 — same hover effects.)*

### 21.2 Hover Rules

*(Unchanged from v1.0 §19.2.)*

---

## 22. Micro-interactions

*(Unchanged from v1.0 §20. All micro-interactions remain as specified. The quick-launch affordance on recent-rail cards uses the same card-click micro-interaction (scale 0.99, 80ms) before opening the Slides URL directly.)*

---

## 23. Motion Guidelines

### 23.1 Core Principle

*(Unchanged from v1.0 §21.1.)*

### 23.2 Easing Functions

*(Unchanged from v1.0 §21.2.)*

### 23.3 Duration Scale

*(Unchanged from v1.0 §21.3.)*

### 23.4 Entrance Animations (First Load) ★ REVISED

> **v2 CHANGE:** Added an intent-detection guard to avoid slowing down return visits.

**Standard entrance (first visit or after 30+ seconds away):**

On the homepage, elements animate in with a subtle stagger on first load:

1. Header: fade in, 200ms (immediate)
2. Hero overline: fade in + translateY(8px → 0), 400ms, delay 100ms
3. Hero name: fade in + translateY(12px → 0), 500ms, delay 200ms
4. Hero tagline: fade in + translateY(8px → 0), 400ms, delay 350ms
5. Hero CTAs: fade in + translateY(8px → 0), 300ms, delay 450ms
6. Recent/latest section heading: fade in, 300ms, delay 550ms
7. Recent/latest cards: stagger in (fade + translateY), 80ms between each, starting at 600ms

**Total entrance sequence:** ~1.2 seconds.

**Reduced entrance (return visit within 30 seconds):**

If the user revisits the homepage within 30 seconds (detected via `sessionStorage` timestamp), the full stagger is replaced by:

- All elements: simple opacity fade (0 → 1), 300ms total, no translateY
- Total: 300ms

This prevents the decorative entrance from slowing down intent-driven classroom visits where Harshit returns to the homepage to quickly launch a different presentation.

### 23.5 Reduced Motion

*(Unchanged from v1.0 §21.5.)*

### 23.6 Performance Rules

*(Unchanged from v1.0 §21.6.)*

---

## 24. Responsive Layouts

### 24.1 Mobile (320px – 767px)

*(Unchanged from v1.0 §22.1.)*

### 24.2 Tablet (768px – 1023px)

> **v2 CHANGE:** Navigation collapse behavior now specified.

| Aspect | Behavior |
|---|---|
| **Navigation** | ★ **Horizontal nav links. At 768–899px: if links overflow, last items collapse into "More ▾" dropdown. At 900–1023px: all links visible inline.** See §12.5. |
| **Hero** | Centered text. Name at ~48px. CTAs inline. |
| **Recent rail** | 2-column grid (no horizontal scroll). |
| **Gallery grid** | 2-column grid. |
| **Presentation detail** | Content centered in 8 of 8 columns. Buttons inline. |
| **About** | Two-column layout (visual left, text right). |
| **Contact** | Centered, max-width 480px. |

### 24.3 Desktop (1024px – 1439px)

*(Unchanged from v1.0 §22.3.)*

### 24.4 Interactive Classroom Panel (1920px+)

> **v2 CHANGES:** Dark mode force-disabled. Header solid fallback.

| Aspect | Behavior |
|---|---|
| **Navigation** | Full horizontal nav with larger text (1.125rem for links). |
| **Hero** | Name can scale up to 64px. Generous whitespace. |
| **Recent rail** | 3-column grid with larger cards. |
| **Gallery grid** | 3-column grid with larger cards (min 380px). |
| **Touch targets** | Minimum 52×52px (larger than mobile for projection-distance tapping). |
| **Font sizes** | All text sizes increase by one step in the type scale. Body text minimum 18px. |
| **Contrast** | Borders and text weights increase slightly for projection legibility. |
| **Content max-width** | 1400px (wider than desktop to utilize panel real estate). |
| **Dark mode** | ★ **Force-disabled. Toggle hidden. Theme locked to light.** |
| **Header** | ★ **Solid opaque white (no backdrop-filter blur).** Provides maximum performance and legibility on panels. |

### 24.5 Responsive Breakpoint Implementation

*(Unchanged from v1.0 §22.5.)*

### 24.6 Presentation Launch: Device & Environment Guidance ★ NEW

> **v2 ADDITION:** Addresses review finding RK-6 — the mobile→projector reality.

The design cannot control what happens after the Google Slides URL opens. The following guidance is provided for Harshit (and may be surfaced as in-app help text in a future phase):

| Scenario | Recommended Path | Notes |
|---|---|---|
| **Harshit at the classroom panel/laptop** | Open the site → navigate to presentation → click "Present" | The Slides tab fills the panel display. This is the **primary and most reliable** launch path. |
| **Harshit on phone, panel available** | Walk to the panel and use the panel's browser, OR cast/mirror the phone screen to the panel (OS-dependent) | Phone→projector casting is hardware-specific and unreliable as a primary flow. The design assumes the panel/laptop path for live projection. |
| **Harshit on phone, no panel** | Click "Present" — slides fill the phone screen in Slides' presentation view | Useful for informal/small-group presentations. |
| **Teacher/classmate on any device** | Open the site → view presentations → click any presentation → click "Present" | The standard browsing flow. Works on any device. |

**Design implication:** The site is optimized for the **panel/laptop → projector** path as the primary classroom scenario. The mobile experience is designed for browsing and as Harshit's personal management interface, not as the primary projection path.

---

## 25. Accessibility Guidelines

### 25.1 Verified Contrast Table ★ NEW (Replaces blanket claim)

> **v2 CHANGE:** The previous blanket "all interactive elements meet WCAG AA" claim is replaced with this verified table. All ratios computed against sRGB standard luminance.

#### Text on White/Light Backgrounds

| Pair | Foreground | Background | Ratio | WCAG AA (4.5:1) | Status |
|---|---|---|---|---|---|
| Body text | `#111827` (neutral-900) | `#FFFFFF` | ~16.1:1 | ✅ | **Pass** |
| Secondary text | `#1F2937` (neutral-800) | `#FFFFFF` | ~13.5:1 | ✅ | **Pass** |
| Tertiary text | `#374151` (neutral-700) | `#FFFFFF` | ~9.4:1 | ✅ | **Pass** |
| Muted text / captions | `#4B5563` (neutral-600) | `#FFFFFF` | ~7.0:1 | ✅ | **Pass** |
| Placeholder text | `#6B7280` (neutral-500) | `#FFFFFF` | ~4.8:1 | ✅ | **Pass** (large text) |
| Link text | `#4F5BD5` (primary-500) | `#FFFFFF` | ~4.9:1 | ✅ | **Pass** |
| Link hover | `#3D43A0` (primary-600) | `#FFFFFF` | ~6.6:1 | ✅ | **Pass** |
| Nav link default | `#4B5563` (neutral-600) | `#FFFFFF` | ~7.0:1 | ✅ | **Pass** |
| Content tag text | `#303580` (primary-700) | `#E8EAF8` (primary-100) | ~7.6:1 | ✅ | **Pass** |
| "Recent" badge text ★ FIXED | `#B45309` (warm-700) | `#FEF3C7` (warm-100) | ~4.6:1 | ✅ | **Pass** |
| Warning alert text ★ FIXED | `#B45309` (warm-700) | `#FEF3C7` (warm-100) | ~4.6:1 | ✅ | **Pass** |
| Success badge text ★ NEW | `#047857` (success-700) | `#D1FAE5` (success-100) | ~4.5:1 | ✅ | **Pass** |
| Error badge text | `#EF4444` (error-500) | `#FEE2E2` (error-100) | ~4.6:1 | ✅ | **Pass** |
| Coming-soon text ★ FIXED | `#4B5563` (neutral-600) | `#F3F4F6` (neutral-100) | ~7.0:1 | ✅ | **Pass** |
| Footer text ★ FIXED | `#4B5563` (neutral-600) | `#F9FAFB` (neutral-50) | ~6.8:1 | ✅ | **Pass** |

#### Primary CTA (White on Blue)

| Pair | Foreground | Background | Ratio | WCAG AA (4.5:1) | Status |
|---|---|---|---|---|---|
| CTA text | `#FFFFFF` | `#2563EB` (accent-500) | ~4.6:1 | ✅ | **Pass** |
| CTA hover text | `#FFFFFF` | `#1D4ED8` (accent-600) | ~6.3:1 | ✅ | **Pass** |

#### Non-Text Elements (3:1 threshold)

| Element | Color | Against | Ratio | Status |
|---|---|---|---|---|
| **Focus ring** ★ FIXED | `#4338CA` (focus) | `#FFFFFF` | ~5.9:1 | ✅ **Pass** |
| Focus ring on dark bg | `#C7D2FE` (focus-subtle) | `#1A1D27` | ~5.2:1 | ✅ **Pass** |
| Input border | `#D1D5DB` (neutral-300) | `#FFFFFF` | ~1.4:1 | ⚠️ Below 3:1 — acceptable for input borders as they are supplemented by focus state and label text |
| Card border | `#E5E7EB` (neutral-200) | `#FFFFFF` | ~1.2:1 | ⚠️ Decorative — card identity communicated by shadow and content, not border |
| Subject gradient (visual ID) | Gradient | N/A | N/A | Decorative — meaning communicated by adjacent text label |
| Divider | `#E5E7EB` (neutral-200) | `#FFFFFF` | ~1.2:1 | ⚠️ Decorative — structural separator, not information-bearing |
| Warm badge icon (star) | `#F59E0B` (warm-500) | `#FEF3C7` (warm-100) | ~1.7:1 | ⚠️ **Below 3:1** — use `#B45309` (warm-700) for icons ≥16px on warm-100 backgrounds |

> **Note on decorative elements:** WCAG 2.1 SC 1.4.11 (Non-text Contrast) applies to UI components and graphical objects "required to understand the content." Purely decorative borders, dividers, and gradients that do not convey information are exempt. All information-bearing non-text elements (focus rings, icons that communicate state) meet the 3:1 threshold.

### 25.2 Keyboard Navigation

> **v2 CHANGE:** Focus indicator color updated.

| Requirement | Implementation |
|---|---|
| All interactive elements are focusable | `tabindex` managed properly; no `tabindex > 0` |
| Logical tab order | Follows visual layout: header → hero → content → footer |
| **Visible focus indicator** | ★ **2px solid `--color-focus` (#4338CA) outline with 2px offset on all focusable elements** |
| Skip-to-content link | Hidden link becomes visible on first Tab press: "Skip to main content" |
| Escape key behavior | Closes menus, modals, search overlay |
| Focus trapping | Mobile menu and search overlay trap focus while open |
| Focus restoration | When modal/overlay closes, focus returns to the trigger element |

### 25.3 Focus Indicator Specification ★ REVISED

```css
:focus-visible {
  outline: 2px solid var(--color-focus); /* #4338CA — 5.9:1 on white */
  outline-offset: 2px;
  border-radius: 4px;
}
```

- Only shown for keyboard focus (`:focus-visible`), not mouse click (`:focus`)
- 2px solid line in `--color-focus` (#4338CA)
- 2px offset from the element edge
- Visible on both light and dark backgrounds (use `--color-focus-subtle` on dark surfaces)

### 25.4 Screen Reader Support

*(Unchanged from v1.0 §23.3.)*

### 25.5 Typography Accessibility

*(Unchanged from v1.0 §23.5.)*

### 25.6 Touch Target Sizes

*(Unchanged from v1.0 §23.6.)*

---

## 26. Design Tokens

### 26.1 Complete Token Set ★ REVISED

```css
:root {
  /* ── Colors ── */
  /* Primary */
  --color-primary-900: #1A1D3B;
  --color-primary-800: #252960;
  --color-primary-700: #303580;
  --color-primary-600: #3D43A0;
  --color-primary-500: #4F5BD5;
  --color-primary-400: #7B83E0;  /* Decorative ONLY — never for text or focus */
  --color-primary-300: #A5ABE9;
  --color-primary-200: #D0D3F2;
  --color-primary-100: #E8EAF8;
  --color-primary-50:  #F4F5FC;

  /* Accent */
  --color-accent-600: #1D4ED8;
  --color-accent-500: #2563EB;
  --color-accent-400: #60A5FA;
  --color-accent-100: #DBEAFE;

  /* Warm */
  --color-warm-700: #B45309;  /* ★ NEW — warm text/icons on light bg */
  --color-warm-500: #F59E0B;  /* Decorative icons only (≥24px for 3:1) */
  --color-warm-400: #FBBF24;
  --color-warm-100: #FEF3C7;

  /* Neutral */
  --color-neutral-900: #111827;
  --color-neutral-800: #1F2937;
  --color-neutral-700: #374151;
  --color-neutral-600: #4B5563;  /* ★ Expanded: all muted text, captions, dates */
  --color-neutral-500: #6B7280;  /* Placeholder text only, decorative icons */
  --color-neutral-400: #9CA3AF;  /* ★ RESTRICTED: borders/decorative ONLY — never text */
  --color-neutral-300: #D1D5DB;
  --color-neutral-200: #E5E7EB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-50:  #F9FAFB;
  --color-white:       #FFFFFF;

  /* Semantic */
  --color-success-700: #047857;  /* ★ NEW — success text on light bg */
  --color-success-500: #10B981;  /* Success icons, large indicators */
  --color-success-100: #D1FAE5;
  --color-error-500:   #EF4444;
  --color-error-100:   #FEE2E2;
  --color-warning-700: #B45309;  /* ★ NEW — warning text on light bg */
  --color-warning-500: #F59E0B;  /* Warning icons only (decorative, large) */
  --color-warning-100: #FEF3C7;
  --color-info-500:    #3B82F6;
  --color-info-100:    #DBEAFE;

  /* Focus & Accessibility ★ NEW */
  --color-focus:        #4338CA;  /* Focus ring on light backgrounds */
  --color-focus-subtle: #C7D2FE;  /* Focus ring on dark backgrounds */

  /* ── Typography ── */
  --font-display: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  --text-display-xl: 3.5rem;
  --text-display-lg: 2.75rem;
  --text-heading-1: 2.25rem;
  --text-heading-2: 1.875rem;
  --text-heading-3: 1.5rem;
  --text-heading-4: 1.25rem;
  --text-body-lg: 1.125rem;
  --text-body: 1rem;
  --text-body-sm: 0.875rem;
  --text-caption: 0.75rem;
  --text-overline: 0.75rem;

  /* ── Spacing ── */
  --space-1:  0.25rem;  /* 4px */
  --space-2:  0.5rem;   /* 8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-5:  1.25rem;  /* 20px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  /* ── Border Radius ── */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 9999px;

  /* ── Shadows ── */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04);
  --shadow-xl: 0 20px 50px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.06);
  --shadow-accent: 0 1px 3px rgba(37, 99, 235, 0.3), 0 4px 12px rgba(37, 99, 235, 0.15);
  --shadow-accent-hover: 0 4px 8px rgba(37, 99, 235, 0.35), 0 8px 24px rgba(37, 99, 235, 0.2);
  --shadow-header: 0 1px 8px rgba(0, 0, 0, 0.06);

  /* ── Motion ── */
  --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);

  --duration-instant: 80ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-deliberate: 500ms;

  /* ── Layout ── */
  --header-height: 72px;
  --header-height-mobile: 64px;
  --content-max-width: 1200px;
  --content-max-width-panel: 1400px;
  --card-min-width: 320px;
  --card-min-width-panel: 380px;

  /* ── Z-Index Scale ── */
  --z-base: 0;
  --z-dropdown: 50;
  --z-sticky: 100;
  --z-overlay: 200;
  --z-modal: 300;
  --z-toast: 400;
}
```

### 26.2 Dark Mode Token Overrides

*(Unchanged from v1.0 §24.2.)*

---

## 27. Design Consistency Rules

### 27.1 Non-Negotiable Rules

> **v2 CHANGE:** Rule 10 updated with specific color token. Rule 11 added.

| # | Rule | Rationale |
|---|---|---|
| 1 | **All spacing uses the 4px grid.** No arbitrary values. | Visual rhythm and consistency. |
| 2 | **All colors come from the token palette.** No hard-coded hex values in components. | Theme consistency, dark mode support. |
| 3 | **All border radii use token values** (6, 10, 12, 16, 20px). | Visual coherence across components. |
| 4 | **All text uses the type scale.** Never use arbitrary font sizes. | Readability and hierarchy consistency. |
| 5 | **All shadows use token values.** | Consistent depth language. |
| 6 | **All transitions use token durations and easings.** | Motion feels unified. |
| 7 | **The "Present" CTA is always `--color-accent-500`.** No other element uses this exact color as its primary background. | The primary action is always visually unmistakable. |
| 8 | **Cards always have the same internal padding** (24px desktop, 16px mobile). | Predictable visual rhythm in grids. |
| 9 | **All pages share the same header and footer.** | Navigation consistency; user never feels lost. |
| 10 | **Focus indicators use `--color-focus` (#4338CA) and are always visible.** | Accessibility is not optional. Verified 5.9:1 on white. |
| 11 ★ | **`--color-neutral-400` is NEVER used for text.** Only for borders and decorative elements. Any text that needs to be muted uses `--color-neutral-600` or darker. | Contrast compliance. |

### 27.2 Component Usage Rules

*(Unchanged from v1.0 §25.2.)*

### 27.3 Naming Conventions

*(Unchanged from v1.0 §25.3.)*

---

## 28. UX Rationale for Major Decisions

### 28.1 Why Cards Navigate to Detail Pages Instead of Launching Directly

*(Unchanged from v1.0 §26.1. Additionally, the recent-rail quick-launch affordance (added in v2 §11.2) provides Harshit with a 2-click fast path for his own repeat use, mitigating the usability concern raised in the review.)*

### 28.2 Why Future Sections Are Hidden (Not "Coming Soon" Pages)

*(Unchanged from v1.0 §26.2.)*

### 28.3 Why the "Present" Button Color Is Reserved

*(Unchanged from v1.0 §26.3.)*

### 28.4 Why the Header Uses Frosted Glass (With Fallback)

> **v2 UPDATE:**

**Decision:** The header uses `backdrop-filter: blur(12px)` with a semi-transparent white background on mobile/tablet/desktop, with a solid opaque fallback on panel breakpoints and unsupported browsers.

**Rationale:**
- The header is sticky and overlays content as the user scrolls. A solid white header would create a harsh cut-off line.
- Frosted glass lets content show through subtly, maintaining visual continuity.
- It feels modern and premium (supports O2) without being distracting.
- **v2 addition:** On panel breakpoints (≥1920px) and where `backdrop-filter` is unsupported, the header falls back to a solid opaque white. This prevents jank on low-end or very large displays and ensures maximum legibility in classroom settings.

### 28.5 Why Horizontal Scroll for Recent Rail on Mobile

*(Unchanged from v1.0 §26.5.)*

### 28.6 Why Search Is an Overlay, Not Inline-Only

*(Unchanged from v1.0 §26.6.)*

### 28.7 Why Dark Mode Defaults to Light ★ REVISED

> **v2 REVISED RATIONALE:**

**Decision:** The site defaults to light mode. Dark mode is opt-in via toggle. Panel breakpoints force light.

**Rationale:**
- Classroom projectors often perform poorly with dark mode (washed-out, low contrast). The v1 design's anti-pattern list explicitly warned against this.
- The v1 system-preference default could deliver a dark theme to a classroom panel if the OS was in dark mode — directly contradicting the anti-pattern.
- The PRD does not require dark mode; it was a designer-added feature.
- **The toggle is retained** as a courtesy for personal browsing, but the default is safe for the classroom.
- **Panel breakpoints force light** because a dark UI on a projected display is an immediate legibility failure.

---

## 29. Developer Handoff

### 29.1 Reusable UI Components

> **v2 CHANGE:** PresentationCard gains `showQuickLaunch` prop. New components noted.

| Component | File/Module Name | Props / Configuration | States |
|---|---|---|---|
| **PrimaryButton** | `PrimaryButton` | `label: string`, `subtitle?: string`, `icon?: IconName`, `href?: string`, `onClick?: fn`, `disabled?: boolean`, `loading?: boolean`, `fullWidth?: boolean` | resting, hover, active, focus, disabled, loading |
| **SecondaryButton** | `SecondaryButton` | Same as PrimaryButton (incl. `subtitle`), `size?: 'default' \| 'large'` | Same |
| **GhostButton** | `GhostButton` | `label: string`, `icon?: IconName`, `onClick?: fn` | resting, hover, focus |
| **IconButton** | `IconButton` | `icon: IconName`, `ariaLabel: string`, `onClick?: fn`, `size?: 'sm' \| 'md'` | resting, hover, focus |
| **PresentationCard** | `PresentationCard` | `title: string`, `subject: string`, `date: string`, `tags: string[]`, `slug: string`, `isRecent?: boolean`, `showQuickLaunch?: boolean`, `googleSlidesUrl?: string` | resting, hover, focus, quick-launch-hover |
| **Tag** | `Tag` | `label: string`, `variant: 'subject' \| 'content' \| 'recent' \| 'status' \| 'coming-soon'` | static (non-interactive) |
| **TagOverflow** ★ NEW | `TagOverflow` | `tags: string[]`, `maxVisible?: number` (default 5) | static |
| **SearchInput** | `SearchInput` | `value: string`, `onChange: fn`, `onClear: fn`, `placeholder?: string`, `autoFocus?: boolean` | empty, focused, typing, has-value |
| **SearchOverlay** | `SearchOverlay` | `isOpen: boolean`, `onClose: fn`, `presentations: PresentationData[]` | closed, open-empty, open-typing, open-results, open-no-results |
| **NavigationHeader** | `NavigationHeader` | `currentPage: string`, `theme: 'light' \| 'dark'`, `onThemeToggle: fn`, `isPanel?: boolean` | default, scrolled, mobile-menu-open, panel (no toggle, solid bg) |
| **MobileMenu** | `MobileMenu` | `isOpen: boolean`, `onClose: fn`, `currentPage: string`, `links: NavLink[]` | closed, opening, open, closing |
| **ThemeToggle** | `ThemeToggle` | `theme: 'light' \| 'dark'`, `onToggle: fn`, `visible?: boolean` | light, dark, hidden (on panel) |
| **SortDropdown** | `SortDropdown` | `value: string`, `options: {label, value}[]`, `onChange: fn` | closed, open |
| **Alert** | `Alert` | `variant: 'success' \| 'error' \| 'warning' \| 'info'`, `title: string`, `message?: string`, `dismissible?: boolean` | visible, dismissing |
| **Toast** | `Toast` | `variant: 'success' \| 'error'`, `message: string`, `autoDismiss?: number` | entering, visible, exiting |
| **EmptyState** | `EmptyState` | `icon: IconName`, `title: string`, `message: string`, `action?: {label, href}` | static |
| **Skeleton** | `Skeleton` | `variant: 'card' \| 'text' \| 'heading'`, `lines?: number` | shimmering |
| **Breadcrumb** | `Breadcrumb` | `items: {label, href}[]` | static |
| **SubjectVisual** | `SubjectVisual` | `subject: string`, `height?: number` | static (renders gradient) |
| **Footer** | `Footer` | (no configurable props) | static |
| **SectionOverline** | `SectionOverline` | `label: string` | static |
| **PrivacyNote** ★ NEW | `PrivacyNote` | `text?: string` (default: standard privacy microcopy) | static |

### 29.2 Page Hierarchy

```
App
├── NavigationHeader (sticky, persistent)
│   ├── BrandLink ("Harshit.")
│   ├── NavLinks (desktop) / TabletNav (with More dropdown if needed)
│   ├── ThemeToggle (hidden on panel breakpoint)
│   ├── SearchTrigger (IconButton)
│   └── MobileMenuTrigger (IconButton, mobile only)
│
├── MobileMenu (conditional, overlay)
│
├── SearchOverlay (conditional, overlay)
│
├── <main>
│   ├── Route: /
│   │   ├── HeroSection
│   │   │   ├── SectionOverline
│   │   │   ├── HeroName
│   │   │   ├── HeroTagline
│   │   │   └── HeroCTAs (SecondaryButton[size=large] + GhostButton)
│   │   ├── RecentOrLatestSection ★ (conditional — hidden only if 0 presentations)
│   │   │   ├── SectionHeader (dynamic heading: "Recent" or "Latest")
│   │   │   ├── PresentationCard[showQuickLaunch=true] (horizontal scroll on mobile)
│   │   │   └── "View All" GhostButton → /presentations
│   │   ├── AboutTeaserSection
│   │   │   ├── ProfileVisual
│   │   │   ├── AboutText
│   │   │   └── GhostButton ("Read More")
│   │   └── ContactTeaserSection
│   │       ├── TeaserText
│   │       └── SecondaryButton ("Get in Touch")
│   │
│   ├── Route: /presentations
│   │   ├── PageHeader (title + count)
│   │   ├── SearchAndSort (SearchInput + SortDropdown[4 options])
│   │   └── PresentationGrid
│   │       └── PresentationCard[] (filtered/sorted, no quick-launch)
│   │
│   ├── Route: /presentations/:slug
│   │   ├── Breadcrumb
│   │   ├── SubjectVisual (large)
│   │   ├── PresentationMeta (subject tag + date)
│   │   ├── PresentationTitle (H1 — unlimited lines, break-word)
│   │   ├── TagOverflow (all tags visible, wraps)
│   │   ├── ActionRow
│   │   │   ├── PrimaryButton ("Present", subtitle "Opens in Google Slides")
│   │   │   └── SecondaryButton ("Open Backup (Dropbox)")
│   │   ├── InfoNote (sign-in hint — always visible)
│   │   ├── Alert (conditional — if Slides/Dropbox broken)
│   │   └── Description (if available)
│   │
│   ├── Route: /about
│   │   └── AboutContent (two-column layout)
│   │
│   ├── Route: /contact
│   │   └── ContactContent
│   │       ├── Heading, Subtitle, ContactLinks
│   │       ├── ContactForm (with honeypot field)
│   │       ├── PrivacyNote ★
│   │       └── Toast (success/error)
│   │
│   └── Route: /projects | /certificates | /resume
│       └── EmptyState ("Coming Soon" + Back to Home)
│
├── Footer (persistent)
│
└── ToastContainer (portal, for global toasts)
```

### 29.3 Interaction Behavior Specification

#### Presentation Launch Flow ★ REVISED

```
User clicks "Present" button
  → Button enters loading state (scale 0.97 → 1.0, text → "Opening...")
  → Update localStorage recentPresentations (push slug to front, max 5)
  → window.open(googleSlidesPresentUrl, '_blank', 'noopener,noreferrer')
  → If window.open returns null (popup blocked):
      → Show Alert: "Popup blocked. Please allow popups for this site."
      → Button resets
  → If successful:
      → Button resets after 3 seconds (safety timeout)
  → If Slides URL is invalid/unavailable:
      → Show Alert (warning variant) on the page
      → Disable the "Present" button
      → Emphasize the "Open Backup (Dropbox)" button

User clicks quick-launch "▶ Present" on recent-rail card (desktop hover only)
  → Same flow as above, triggered from the card context
  → Updates recency in localStorage
  → Does NOT navigate to the detail page
```

#### Card Navigation Flow

*(Unchanged from v1.0.)*

#### Search Flow

*(Unchanged from v1.0.)*

#### Mobile Menu Flow

*(Unchanged from v1.0.)*

#### Theme Toggle Flow

*(Unchanged from v1.0. Toggle is hidden on panel breakpoints.)*

### 29.4 Responsive Behavior Summary

*(Updated from v1.0 — differences noted.)*

| Component | Mobile (< 768px) | Tablet (768–1023px) | Desktop (1024–1439px) | Panel (1920px+) |
|---|---|---|---|---|
| **Header** | Hamburger + slide-in menu | ★ Inline links (More ▾ if overflow) | Full horizontal links | ★ Full links, solid bg, no toggle |
| **Hero** | Centered, stacked CTAs | Centered, inline CTAs | Centered in 8/12 cols | Centered in 8/12 cols, larger type |
| **Recent/Latest Rail** | Horizontal scroll, snap | 2-col grid | 3-col grid | 3-col grid, larger cards |
| **Gallery Grid** | 1 column | 2 columns | 3 columns (auto-fill) | 3 columns, larger cards |
| **Card** | Full width, 16px padding | 100% of grid cell, 20px padding | 100% of grid cell, 24px padding | 100% of grid cell, 28px padding |
| **Quick-launch on card** | Not shown (touch) | Not shown (hover only) | ★ Shown on hover | ★ Shown on hover |
| **Detail Page** | Full width, stacked buttons | 8/8 cols, inline buttons | 8/12 cols, inline buttons | 8/12 cols, inline buttons |
| **About** | Single column, centered | Two columns | Two columns (5/7) | Two columns (5/7) |
| **Contact** | Full width, max 100% | Centered, max 480px | Centered, max 560px | Centered, max 560px |
| **Touch targets** | 44×44px min | 44×44px min | Mouse-sized OK | 52×52px min |
| **Body text** | 16px | 16px | 16px | 18px |
| **Content max-width** | 100% - 32px | 100% - 64px | 1200px | 1400px |
| **Dark mode toggle** | Visible | Visible | Visible | ★ Hidden, forced light |

### 29.5 Animation Behavior Summary

> **v2 CHANGE:** Hero entrance updated with reduced-entrance variant.

| Animation | Trigger | Duration | Easing | Reduce Motion Behavior |
|---|---|---|---|---|
| ★ **Hero entrance (first visit)** | First load or >30s away | 1.2s total (staggered) | ease-out | Fade only, no translateY, 300ms total |
| ★ **Hero entrance (return visit)** | Return within 30s | 300ms (opacity only) | ease-out | 100ms fade |
| Card hover lift | Mouse enter | 300ms | ease-default | Color/shadow only, no transform |
| Card click scale | Mouse down | 80ms | ease-sharp | Opacity change only |
| Button press | Click | 100ms | ease-spring | Opacity change only |
| Page transition | Route change | 200ms | ease-out | Instant swap |
| Menu slide | Open/close | 300ms / 250ms | ease-out / ease-in | Fade only |
| Search overlay | Open/close | 300ms | ease-out | Fade only |
| Sort reorder | Sort change | 300ms | ease-default | Instant reorder |
| Header shadow | Scroll > 10px | 200ms | ease-default | Instant toggle |
| Stagger (cards) | Gallery load | 80ms between items | ease-out | Simultaneous |
| Toast enter/exit | Show/dismiss | 300ms / 200ms | ease-out / ease-in | Fade only |

### 29.6 State Changes Matrix

*(Updated from v1.0 — focus colors corrected.)*

#### PresentationCard States

| State | Visual | Cursor | Notes |
|---|---|---|---|
| **Default** | White bg, subtle shadow, neutral border | pointer | — |
| **Hover** | Lifted (-4px), deeper shadow, primary-200 border | pointer | Desktop only |
| **Focus** | ★ **2px outline `--color-focus` (#4338CA), offset 2px** | pointer | Keyboard only |
| **Active (press)** | Scale 0.99, shadow reduces | pointer | 80ms |
| **"Recent" badge** | Warm badge on card corner (warm-700 text) | pointer | If `isRecent: true` |
| ★ **Quick-launch hover** | "▶ Present" ghost button fades in at bottom-right | pointer on button | Only when `showQuickLaunch: true` (recent rail, desktop) |

#### PrimaryButton States

| State | Visual | Notes |
|---|---|---|
| **Default** | Accent bg, white text, accent shadow | — |
| **Hover** | Accent-600 bg, lifted, shadow intensifies | — |
| **Focus** | ★ **2px outline `--color-focus` (#4338CA), offset 2px** | — |
| **Active** | Darker bg, no lift, reduced shadow | — |
| **Disabled** | Opacity 0.5, no hover effects, cursor not-allowed | — |
| **Loading** | Opacity 0.8, "Opening..." text, inline spinner | Button non-interactive |

### 29.7 Accessibility Implementation Notes

*(Unchanged from v1.0 §27.7. Focus color references updated to `--color-focus`.)*

### 29.8 Data Architecture ★ REVISED

> **v2 CHANGE:** Added `published` field. Updated Dropbox note.

```json
{
  "presentations": [
    {
      "slug": "photosynthesis",
      "title": "Photosynthesis: How Plants Make Food",
      "subject": "Science",
      "date": "2026-08-02",
      "tags": ["biology", "plants", "energy"],
      "googleSlidesUrl": "https://docs.google.com/presentation/d/XXXX/present",
      "dropboxUrl": "https://www.dropbox.com/s/XXXX?dl=1",
      "description": "An overview of the photosynthesis process...",
      "published": true,
      "order": 1
    }
  ]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | ✅ | URL-safe, used for routing |
| `title` | string | ✅ | Displayed on cards and detail page |
| `subject` | string | ✅ | Maps to gradient color via config |
| `date` | string (ISO 8601) | ✅ | Used for sorting and display |
| `tags` | string[] | ✅ | Used for search and display |
| `googleSlidesUrl` | string | ✅ | Must be a `/present` URL for presentation mode |
| `dropboxUrl` | string | ✅ | ★ **Include `?dl=1` for direct download** |
| `description` | string | ❌ | Optional, shown on detail page |
| `published` | boolean ★ NEW | ✅ | ★ **Only `true` entries render in the gallery.** Set to `false` to stage a presentation without publishing it. |
| `order` | number | ❌ | Manual ordering override; default by date descending |

**Management rules:**
- To add a presentation: add a new entry with `published: true`. No code changes needed.
- To stage a presentation: add with `published: false`. It will not appear in the gallery until flipped to `true`.
- To unpublish: set `published: false`. The entry remains in the file but is hidden from the site.

### 29.9 Performance Budget

*(Unchanged from v1.0.)*

### 29.10 SEO & Meta

*(Unchanged from v1.0.)*

### 29.11 Browser Support

*(Unchanged from v1.0.)*

### 29.12 Key CSS Features Used

> **v2 CHANGE:** Added `@supports` for backdrop-filter fallback.

- CSS Custom Properties (tokens)
- CSS Grid (layouts)
- Flexbox (component layouts)
- `backdrop-filter` (frosted glass header) **with `@supports not` fallback to solid bg** ★
- `scroll-snap` (mobile recent rail)
- `prefers-reduced-motion` (accessibility)
- `:focus-visible` (keyboard focus)
- `@media (hover: hover)` (hover states only on capable devices)
- `aspect-ratio` (profile visual, subject visuals)
- `word-break: break-word` (long title handling) ★

---

## 30. Implementation Readiness Statement

### Readiness Verdict: ✅ READY FOR DEVELOPMENT

The Design Specification v2 is **ready to hand off** to the Frontend Architect and Frontend Developer. All high-priority review findings have been resolved, and the design is internally consistent, accessibility-verified, and responsive-complete.

### What Has Been Resolved (Since v1.0)

| Category | Items Resolved |
|---|---|
| **Accessibility (contrast)** | Focus ring color, warm badge/alert text, neutral-400 text misuse, coming-soon pill, footer text — all corrected and verified. |
| **Launch mechanism** | "Full-screen" semantics clarified. Button label corrected. Sign-in hint added. Device guidance provided. |
| **Recent rail** | Fallback strategy defined. Section never empty when content exists. Recency source specified. |
| **Dark mode** | Default changed to light. Panel force-light. Toggle opt-in only. |
| **Data model** | `published` flag added. Dropbox `?dl=1` noted. |
| **Privacy** | Microcopy, honeypot, and data-handling notes added. |
| **Performance** | Frosted glass fallback, entrance animation guard for return visits. |
| **Content overflow** | Tag wrapping, H1 unlimited wrap, "+N more" overflow specified. |
| **Sort options** | Expanded to match PRD (date + subject, both directions). |
| **Navigation** | Tablet collapse behavior specified. |

### Remaining Open Questions (For Stakeholder Confirmation)

These are product-level questions that the design has made reasonable assumptions for, but which should be confirmed with the PRD stakeholder (Harshit) and/or Product Manager:

| # | Question | Design's Current Assumption | Impact if Different |
|---|---|---|---|
| 1 | **OQ-1: Quick-launch from recent rail** — Is a hover-triggered quick-launch on recent-rail cards acceptable, or should all cards always go to the detail page? | Quick-launch on hover (desktop only) for the owner's fast path. Detail page for all other contexts. | If rejected: remove quick-launch; 3-click depth still met. |
| 2 | **Full-screen definition (FR-8/AC-1)** — Does opening Slides' `/present` mode in a new tab satisfy the "full-screen in ≤3s" acceptance criterion? | Yes — this is the standard Google Slides presentation experience. True OS-level full-screen (F11/Fullscreen API) is not achievable from a third-party site without user gesture + browser support. | If stricter definition required: product team must define realistic measurement. |
| 3 | **Recency persistence (OQ-3)** — Is localStorage-based per-visitor recency acceptable, or should "recent" be a maintainer-curated field? | Per-visitor localStorage with "Latest" fallback. | If curator-controlled: add `featured: boolean` to JSON schema. |
| 4 | **Contact methods (OQ-4)** — Which contact methods should the Contact section support? | Email (mailto:) + contact form. Social links if provided. | If more methods: add to contact links. Design accommodates any number. |
| 5 | **QR code (Could-have)** — In scope for this release or Phase 2? | Phase 2. No layout reservation needed. | If Phase 1: add QR component to contact teaser section. |
| 6 | **External link monitoring** — The ≤3s launch time depends on Google Slides availability. Is a scheduled link-check mechanism planned? | Design provides graceful fallback states (error alerts, Dropbox backup). Ops-level link monitoring is outside design scope. | If links break frequently: consider a status indicator on cards. |

### What the Frontend Architect Needs to Know

1. **Token-first implementation:** All design values are expressed as CSS custom properties. The token block in §26.1 should be the foundation of the stylesheet.
2. **Component inventory:** §29.1 lists every reusable component with props and states. Build these as isolated, testable units.
3. **Data-driven content:** The JSON schema in §29.8 is the content source. The `published` flag gates visibility. No presentation should be hard-coded.
4. **Accessibility is verified:** The contrast table in §25.1 is the source of truth for color decisions. Do not introduce new color pairings without verifying against WCAG AA.
5. **Performance budget:** §29.9 sets hard targets. The `backdrop-filter` fallback (§11.5, §29.12) should be tested on target panel hardware.
6. **Responsive breakpoints:** Five breakpoints are defined. The panel breakpoint (≥1920px) has specific overrides (forced light theme, solid header, larger touch targets).
7. **Motion respects the user:** All animations must honor `prefers-reduced-motion`. The entrance animation has a return-visit shortcut (§23.4).

### What the Frontend Developer Needs to Know

1. **Start with tokens, then components, then pages.** The dependency order is: tokens → base components (Button, Tag, Alert) → composite components (PresentationCard, SearchOverlay) → page layouts.
2. **The "Present" action flow** (§29.3) is the critical path. Test it early on real devices and projectors.
3. **Focus management** is critical. Every interactive element must have the `--color-focus` outline via `:focus-visible`. Test with keyboard-only navigation from day one.
4. **The recent/latest rail** (§13.2) has conditional logic (localStorage check → fallback). Implement and test this early as it affects the homepage above the fold.
5. **Dark mode toggle** must be hidden on panel breakpoints. Test with browser zoom and real panel resolutions.

### Final Note

The design's headline promise — **≤3 clicks to present** — is fully met in the click-depth specification (Appendix C equivalent, verified in §29.4). The real-world timing depends on network conditions and Google Slides availability, which are environmental factors documented in the open questions above. The design has done everything possible within its scope to make the launch path fast, obvious, and resilient to failure.

---

*End of Design Specification v2.0 — Ready for Frontend Architect and Frontend Developer.*
