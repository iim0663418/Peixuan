# Design Tokens Migration Plan

**Date**: 2025-11-30  
**Status**: Planning  
**Estimated Time**: 1-2 hours  
**Risk Level**: Low (CSS-only changes, no logic)

## Problem Statement

12 out of 13 components (92%) use hardcoded colors instead of design tokens from `design-tokens.css`. This prevents:
- Dark theme functionality
- Visual consistency
- Easy maintenance
- Design system enforcement

## Color Mapping Rules

### Background Colors
| Hardcoded | Design Token | Usage |
|-----------|--------------|-------|
| `#fff`, `#ffffff` | `var(--bg-primary)` | Main background |
| `#f9f9f9`, `#f5f7fa`, `#f8f9fa` | `var(--bg-secondary)` | Secondary background |
| `#e9ecef` | `var(--bg-tertiary)` | Tertiary background |

### Text Colors
| Hardcoded | Design Token | Usage |
|-----------|--------------|-------|
| `#333`, `#303133`, `#2c3e50` | `var(--text-primary)` | Primary text |
| `#555`, `#606266`, `#6c757d` | `var(--text-secondary)` | Secondary text |
| `#666`, `#909399`, `#95a5a6` | `var(--text-tertiary)` | Tertiary text |

### Border Colors
| Hardcoded | Design Token | Usage |
|-----------|--------------|-------|
| `#dcdfe6`, `#e4e7ed` | `var(--border-light)` | Light borders |
| `#dee2e6` | `var(--border-medium)` | Medium borders |
| `#adb5bd` | `var(--border-dark)` | Dark borders |

### Accent Colors
| Hardcoded | Design Token | Usage |
|-----------|--------------|-------|
| `#42b983` | `var(--success)` | Success/primary accent |
| `#409eff` | `var(--info)` | Info accent |
| `#d2691e` | `var(--primary-color)` | Brand primary |

## Task Breakdown

### Group 1: Core Display Components (Priority 1)
- **Task 1.1**: UnifiedResultView.vue
- **Task 1.2**: BaziChart.vue
- **Task 1.3**: ElementsChart.vue
- **Task 1.4**: WuXingChart.vue

### Group 2: Timeline & Interaction (Priority 2)
- **Task 2.1**: FortuneTimeline.vue
- **Task 2.2**: YearlyFateTimeline.vue
- **Task 2.3**: AnnualInteraction.vue

### Group 3: Detail Cards (Priority 3)
- **Task 3.1**: DeveloperCard.vue
- **Task 3.2**: TechnicalDetailsCard.vue
- **Task 3.3**: StarSymmetryDisplay.vue
- **Task 3.4**: StarBrightnessIndicator.vue

### Group 4: UI Components (Priority 4)
- **Task 4.1**: LanguageSelector.vue

## Change Budget Estimate

- **Total Lines**: ~150-200 color declarations
- **Core Logic**: 0 lines (CSS-only)
- **Tests**: 0 lines (visual changes only)
- **Comments**: ~12 lines (one per component)

## Rollback Plan

1. Git commit before each group
2. Visual regression: Compare screenshots before/after
3. If issues: `git revert <commit-hash>`
4. Fallback: Keep hardcoded values as comments for 1 sprint

## Acceptance Criteria

- [ ] All 12 components use CSS variables
- [ ] No hardcoded hex colors in `<style>` sections
- [ ] Visual appearance unchanged in light mode
- [ ] Dark theme toggle works (if implemented)
- [ ] No console errors
- [ ] Build succeeds

## Security Considerations

- No security impact (CSS-only changes)
- No external dependencies
- No data flow changes

## Example Transformation

```vue
<!-- BEFORE -->
<style scoped>
.card {
  background: #fff;
  color: #333;
  border: 1px solid #dcdfe6;
}
</style>

<!-- AFTER -->
<style scoped>
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}
</style>
```
