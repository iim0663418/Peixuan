# Strategic Analysis: Daily Question Feature Enhancement

## Executive Summary
**Objective:** Transform the "Daily Question" feature from a basic query system into a deep, context-aware "Oracle Companion" by unlocking existing calculation capabilities.
**Strategy:** Leverage the `UnifiedCalculator`'s rich but currently hidden output (Annual Forecasts, Tai Sui interactions, SiHua aggregations). Shift the Agent from "Data Retrieval" to "Insight Synthesis."
**ROI:** High. 80% of required logic exists in the backend; effort is primarily data plumbing and prompt tuning.

---

## 1. Tool Expansion Strategy (Backend)
*Maximize `UnifiedCalculator` reuse. Move from "Raw Data" tools to "Insight" tools.*

### High Priority: `get_annual_context`
**Gap:** The agent knows the user's chart and today's date, but lacks the "Macro Weather Report" (Annual Luck) which dictates the baseline for daily advice.
**Implementation:**
- **Source:** `CalculationResult.annualFortune` (specifically `interactions`, `taiSuiAnalysis`, and `yearlyForecast`).
- **Data Exposed:**
  - Tai Sui Status: (e.g., "Fan Tai Sui - Severity: High")
  - Strategic Advice: (e.g., "Keep a low profile")
  - Interactions: (e.g., "Year Branch clashes with Spouse Palace")
- **Value:** Prevents the agent from giving "Go for it!" advice on a day that is locally good but globally dangerous.
- **Effort:** Low (Expose existing JSON object).

### Medium Priority: `get_life_forces` (SiHua & Energy)
**Gap:** The agent sees stars but not the "Flow" of energy (pressure points vs. resource sources).
**Implementation:**
- **Source:** `CalculationResult.ziwei.sihuaAggregation` & `wuxingDistribution`.
- **Data Exposed:**
  - "Pressure Point" (Hua Ji location).
  - "Power Source" (Hua Quan location).
  - Five Elements Balance (e.g., "Missing Fire").
- **Value:** Allows nuanced answers like "You have the energy to fight (Hua Quan), but you lack the emotional resource (Missing Water) to sustain it."
- **Effort:** Low.

### Low Priority (Optimization): `get_daily_transit` Refinement
**Gap:** Current implementation likely returns just the Calendar date.
**Implementation:**
- **Enhancement:** Ensure it returns the **Daily Pillar** (Stem/Branch) clearly.
- **AI Instruction:** Update System Prompt to explicitly ask the AI to check for `Day Pillar` vs `User Pillar` interactions (Clashes/Combinations) since we are not calculating "Daily Interactions" in code yet.
- **Effort:** Very Low (Prompt Engineering).

---

## 2. Interface Optimization Strategy (Frontend)
*Align with "Companion" philosophy. Make the magic visible.*

### 1. "Transparent Thought Process" (Visualizing Tool Use)
**Concept:** Instead of a generic spinner, show what Peixuan is "consulting."
**Implementation:**
- **Mechanism:** If the SSE stream includes tool calls (or if we emit specific "status" events), display them.
- **UX:**
  - *State 1:* "Opening your chart..." (Calling `get_bazi_profile`)
  - *State 2:* "Checking this year's energy..." (Calling `get_annual_context`)
  - *State 3:* "Consulting the stars..." (Calling `get_ziwei_chart`)
  - *State 4:* "Writing response..."
- **Value:** Builds trust and immersion. "She isn't just guessing; she is checking the data."

### 2. Conversational Continuity (Simulated)
**Concept:** Even with a 1-question limit, the experience should feel like a continuous relationship.
**Implementation:**
- **Context Injection:** When sending the daily question, inject a summary of the *Annual* narrative into the system prompt context.
- **Output:** The Agent refers back to known facts. "Since your year is volatile [Fact], today you should be extra careful with [User Query]."

---

## 3. Implementation Roadmap & Estimates

| Phase | Task | Effort | Impact | Description |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Backend Tool: `get_annual_context`** | **2h** | **High** | Expose Tai Sui & Forecast data. Update Prompt. |
| **1** | **Backend Tool: `get_life_forces`** | **1h** | **Med** | Expose SiHua & Wuxing. Update Prompt. |
| **2** | **Frontend: Visual Feedback** | **3h** | **High** | Map tool calls to UI "Status Toasts" or narrative loader. |
| **3** | **Prompt: Daily Interaction Logic** | **1h** | **Med** | Teach Peixuan to spot Daily Pillar clashes manually. |

### Immediate Action Item
Execute **Phase 1** (Backend Tools). This requires no frontend changes but immediately upgrades the intelligence of the answers.

**Recommendation:** Proceed with defining `get_annual_context` in `AgenticGeminiService.ts`.
