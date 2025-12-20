# UX Analysis: Daily Question Feature

### 1. Don't Make Me Think
*   **The "Thoughtless" Entry:** The inclusion of **Quick Prompts** ("How is my luck today?", "Major decisions?") is a textbook application of this principle. It allows users to extract value without formulating a complex query, bridging the gap between "I want insight" and "I don't know what to ask."
*   **Status Transparency:** The mapping of technical backend states (`REASONING`, `FETCHING_DATA`) to human-centric messages ("Peixuan is carefully considering...", "Retrieving your chart data...") prevents users from wondering if the app has frozen. It turns "waiting time" into "witnessing work."
*   **Critique:** The "No Chart" state redirects users to the Unified View (`/unified`) to create a chart. While logical, it breaks the flow. A streamlined "Quick Setup" modal directly within the Daily Question view—asking only essential birth data—would better serve the "Don't Make Me Think" mandate by keeping them in context.

### 2. Breaking the "Owner's Illusion"
*   **Persona vs. Utility:** The feature risks falling into the "Owner's Illusion" if the "Peixuan" persona becomes too chatty before delivering value. Users come with "minimal intent" (get an answer) and "max distraction." The current design keeps the "Welcome Message" static and relatively short, which is good.
*   **Visual Distraction:** The flashing status indicators in the header ("Reasoning...", "Switching...") are engaging but potentially distracting. Ensure these micro-interactions don't compete with the answer itself once it starts streaming. The user's eye should be glued to the *content*, not the *status bar*.

### 3. The Utility Curve
*   **The Scarcity Spike:** The **Daily Limit (1 question/day)** artificially forces the feature into the steep part of the utility curve. It transforms a potentially trivial interaction ("spamming questions") into a high-stakes, high-value moment. Users are likely to value the answer more *because* it is the only one they get.
*   **The "Aha" Moment:** The real value lies in the specific connection between the *user's chart* and *today's date*. The backend tools (`get_daily_transit`) ensure this isn't just a generic horoscope, satisfying the requirement to be "above the zero-value threshold."

### 4. Strategic Friction
*   **The "Irreversible" Action:** The current implementation has *insufficient* friction for the specific constraint of a Daily Limit.
    *   **Problem:** A user typing "Test" or "Hello" consumes their single daily quota immediately.
    *   **Recommendation:** Introduce **"Benign Friction"**—a confirmation step ("This will be your only question for today. Ready?") or an intent analyzer that rejects low-quality queries *before* hitting the API/Limit. This protects the user from wasting their high-value resource on a low-value input.

### 5. Simplicity and Transparency
*   **Progressive Disclosure:** The streaming response (SSE) effectively utilizes progressive disclosure, keeping the user engaged without overwhelming them with a wall of text instantly.
*   **Visual Hierarchy:** The UI distinguishes clear "User" (right/blue) vs. "AI" (left/gray) zones. However, the **Error State** (e.g., limit reached) uses a standard `el-alert`. To align with "Simplicity," this should perhaps be a softer, in-conversation notification from Peixuan herself ("I've used all my energy for today...") rather than a jarring system alert, maintaining immersion.
