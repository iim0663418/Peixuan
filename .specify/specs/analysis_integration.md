# Markdown Usage Analysis & Unification Strategy

## Current State Analysis


### 1. Centralized Utility (`src/utils/markdown.ts`)
- **Status**: Implemented but underutilized.
- **Capabilities**:
  - Configured with `gfm: true` and `breaks: true`.
  - Provides semantic wrappers: `parseChatMarkdown` vs `parseReportMarkdown`.
  - **Gap**: Missing sanitization (DOMPurify TODO exists).

### 2. Component Usage Breakdown

| Component | Current Implementation | Refactoring Target |
|-----------|------------------------|-------------------|
| **ChatBubble.vue** | ✅ Uses `parseChatMarkdown` from utility | N/A (Gold Standard) |
| **NarrativeSummary.vue** | ❌ Direct `marked` import | `parseReportMarkdown` |
| **UnifiedAIAnalysisView.vue** | ❌ Direct `marked` import + Custom Config logic | `parseReportMarkdown` |
| **AIAnalysisView.legacy.vue** | ❌ Direct `marked` import | `parseReportMarkdown` (Low Priority) |
| **AdvancedAnalysisView.legacy.vue**| ❌ Direct `marked` import | `parseReportMarkdown` (Low Priority) |

### 3. Key Issues Identified
1.  **Configuration Drift**: `UnifiedAIAnalysisView.vue` sets up keyword highlighting (`setupKeywordHighlighting`), while other components might miss this or duplicate it.
2.  **Type Safety**: Repeated manual type casting (`marked(text) as string`) across components.
3.  **Security**: No centralized XSS sanitization; direct imports bypass any future security layers added to the utility.
4.  **Maintenance**: Updating `marked` versions or config requires touching multiple files.

## Unification Recommendations

### Phase 1: Enhance Utility
Update `src/utils/markdown.ts` to support the advanced needs of `UnifiedAIAnalysisView`:

```typescript
// Proposed enhancement to utils/markdown.ts
import { setupKeywordHighlighting } from '@/utils/keywordHighlighting';

// Ensure highlighting is setup globally or lazily within the parse function
setupKeywordHighlighting(); 

export const parseReportMarkdown = (content: string): string => {
  // Centralize the logic currently inside UnifiedAIAnalysisView
  return parseMarkdown(content);
}
```

### Phase 2: Refactor Components

1.  **UnifiedAIAnalysisView.vue**:
    - Remove `import { marked } from 'marked'`.
    - Import `parseReportMarkdown` from `@/utils/markdown`.
    - Replace `marked(text)` calls with `parseReportMarkdown(text)`.

2.  **NarrativeSummary.vue**:
    - Remove `import { marked } from 'marked'`.
    - Import `parseMarkdown` (or `parseReportMarkdown`) from `@/utils/markdown`.
    - Replace `marked(props.narrativeText)` with `parseMarkdown(props.narrativeText)`.

### Phase 3: Security Hardening
- Once all components use the utility, implement `DOMPurify` inside `parseMarkdown` to instantly secure the entire application.
