### Analysis of ChatBubble Component Markdown Rendering

**1. Configuration Scope & Consistency Risk (Critical)**
- **Issue:** `marked.setOptions` is a global mutator for the `marked` library. Calling it inside `ChatBubble.vue`'s `<script setup>` means the configuration is applied globally but triggered by this specific component's lifecycle.
- **Impact:** If other components (e.g., `UnifiedResultView`) also import `marked` and set different options (or rely on defaults), race conditions will occur depending on which component loads first. This leads to inconsistent rendering (e.g., line breaks working in Chat but not in Reports).
- **Deprecation:** `marked.setOptions` is deprecated in modern `marked` versions (v5+) in favor of `marked.use()`.

**2. Bold Text Rendering Specifics**
- **Current Implementation:**
  ```css
  .bubble-content :deep(strong),
  .bubble-content :deep(b) {
    font-weight: var(--font-weight-bold);
    color: var(--purple-star);
  }
  ```
- **Dark Mode Override:**
  ```css
  @media (prefers-color-scheme: dark) {
    .bubble-content :deep(strong),
    .bubble-content :deep(b) {
      color: #fbbf24 !important; /* Hardcoded Amber */
    }
  }
  ```
- **Analysis:**
  - The use of `!important` in the dark mode media query makes it difficult to override specific instances if needed.
  - The `color` change for bold text is a strong stylistic choice that might conflict with semantic highlighting (e.g., if bold is used inside a warning block that is already colored).
  - **Variable Dependency:** Reliance on `var(--purple-star)` assumes this variable matches the contrast requirements against `var(--bg-tertiary)`.

**3. Markdown Parser Configuration**
- **Settings:**
  - `breaks: true`: Converts single newlines to `<br>`, which is good for chat-like interfaces but might break complex layouts (tables/lists) if not handled carefully.
  - `gfm: true`: Standard GitHub Flavored Markdown.
- **Missing Sanitization:** The code uses `v-html="formattedContent"` directly with `marked` output. There is no evidence of DOM sanitization (like `DOMPurify`). This is a security vulnerability (XSS) if the AI output or user input (if echoed back) contains malicious HTML/Scripts.

**4. Recommendations for Consistency**

1.  **Centralize Markdown Logic:** Move the `marked` configuration to a dedicated utility (e.g., `src/utils/markdownRenderer.ts`).
2.  **Standardize Styles:** Define a global CSS class (e.g., `.markdown-body`) in `src/styles/` that handles standard tag styling (`h1`, `p`, `strong`, `pre`, etc.) instead of scoping it tightly within `ChatBubble`. This ensures Reports and Chats look identical.
3.  **Sanitize:** Wrap the parser output with a sanitizer.

**Refactored Utility Example (`src/utils/markdown.ts`):**
```typescript
import { marked } from 'marked';
// import DOMPurify from 'dompurify'; // Recommended

marked.use({
  gfm: true,
  breaks: true
});

export const parseMarkdown = (content: string) => {
  const html = marked.parse(content);
  // return DOMPurify.sanitize(html);
  return html;
};
```
