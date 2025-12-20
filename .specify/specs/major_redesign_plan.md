I cannot directly create the file `REDESIGN_SPEC.md` on your system due to tool restrictions (no write access). However, here is the comprehensive redesign plan generated from the UX analysis.

***

# Project Peixuan: "Luminous Guide" Redesign Specification

**Version:** 2.0
**Date:** 2025-12-20
**Objective:** Transform Peixuan from a "Tool" to a "Companion".
**Target Audience:** General Public (90%) / Professional Astrologers (10% - Hidden)

---

## 1. Design Philosophy: "The Oracle, Not The Spreadsheet"

The current interface exposes the *mechanics* of destiny (coordinates, star positions, god names). The redesign will expose the *narrative* of destiny.

*   **Principle:** "Don't show me the math, show me the path."
*   **Aesthetic:** Minimalist, ethereal, focusing on text readability and warmth over data density.
*   **Interaction:** Conversational First.

---

## 2. User Flow & Architecture Overhaul

### A. The "Zero Friction" Onboarding (UnifiedInputForm)
**Goal:** Eliminate "Coordinate Intimidation" and reduce cognitive load.

1.  **Default View:**
    *   **Name:** Simple text input.
    *   **Birth Date/Time:** Native datetime picker.
    *   **Location:** Single "City Search" bar (Google Places style autocomplete).
    *   **Hidden by Default:** Latitude, Longitude, Timezone, Solar Time Correction.
    *   **Action:** "Awaken Peixuan" (Submit).

2.  **The "Advanced" Toggle:**
    *   Small, subtle link: "Manual Coordinate Entry" (for the 10%).
    *   Only upon clicking does the map and lat/long input reveal itself.

3.  **Fallback Strategy:**
    *   If geocoding is ambiguous, show a simple modal: "Did you mean: London, UK or London, Ontario?" instead of failing or asking for coords.

### B. The "Luminous" Dashboard (UnifiedResultView)
**Goal:** Progressive Disclosure. Mobile-First.

1.  **Hierarchy (Top to Bottom):**
    *   **Zone 1: The Narrative (AI Analysis).** "Your day is marked by [Keyword]. Peixuan suggests..."
    *   **Zone 2: The Weather Report (Annual/Daily Luck).** Simple visual indicators (Stars/Icons) for Wealth, Career, Love.
    *   **Zone 3: The Interaction (Daily Question).** Prominent "Ask" button if quota exists.
    *   **Zone 4: The Deep Dive (Collapsed).** Accordion titled "View Astrological Data". Contains the Bazi Chart, Ziwei Chart, and Tables.

2.  **Tab Reorganization:**
    *   **Remove:** "Developer" Tab (Hard delete from UI).
    *   **Merge:** "Annual" and "Bazi" into a "Life Path" view.
    *   **Prioritize:** Ensure "Annual Fortune" is visible immediately on mobile load.

### C. The "Conversation" (DailyQuestionView)
**Goal:** Enhance the "Owner's Illusion" and Manage Expectations.

1.  **Pre-Input State:**
    *   Display "Daily Insight Quota: 1/1" prominently *before* typing.
    *   Suggested questions chips: "Is today good for signing contracts?", "Watch out for...?"

2.  **During Processing:**
    *   Replace generic spinners with semantic stages: "Calculating Star Positions..." -> "Consulting the Oracle..." -> "Formulating Answer...".

---

## 3. UI/Visual Specifics

*   **Animations:**
    *   Remove continuous loops (pulse/rotate) on mobile. Use "Intro" animations that play once and settle to save battery.
*   **Typography:**
    *   Increase line-height for all reading texts.
    *   Use a serif font for "Peixuan's Voice" (AI output) to distinguish from UI labels (Sans-serif).
*   **Color Palette:**
    *   Retain the purple/gold mystical theme but reduce contrast on background gradients to improve text legibility.

---

## 4. Implementation Roadmap

### Phase 1: The Great Simplification (Immediate)
*   [ ] **Refactor `UnifiedInputForm`:** Hide Lat/Long/Timezone behind `v-if="showAdvanced"`.
*   [ ] **Purge `UnifiedResultView`:** Comment out `DeveloperCard`. Move `AnnualFortuneCard` to index 0 in the tabs list.
*   [ ] **UX Text:** Add "Questions remaining: 1/1" to `DailyQuestionPanel`.

### Phase 2: The Narrative Shift (Next Sprint)
*   [ ] **New Component `NarrativeSummary.vue`:** A dedicated component that takes the raw `analyze` result and displays *only* the summary text, placed at the top of the Results view.
*   [ ] **Geocoding Fallback:** Implement the city-center fallback logic in `useGeocoding.ts`.

### Phase 3: Visual Polish (Future)
*   [ ] **Animation Audit:** Profile CSS performance.
*   [ ] **Theme Update:** Implement Serif/Sans-Serif typography split.

---

## 5. Technical Constraints & Notes
*   **Geocoding:** Ensure strict error handling. If `location` string exists but coords fail, default to "Unknown Location" prompt rather than blocking the user.
*   **State Management:** Persist `showAdvanced` preference in `localStorage` so pros don't have to toggle it every time.
