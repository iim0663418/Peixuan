# Hotfix Specification: Font Rendering & Cache Issues

## Problem Analysis

### Issue 1: Font Rendering Gradients
- Backend Markdown output may be stripping CSS classes or inline styles
- StarBrightnessIndicator semantic colors (廟、旺、得地) not preserved
- Gradient rendering broken in AI analysis output

### Issue 2: Analysis Cache Cross-Contamination
- analysisType cache key may not properly isolate personality vs fortune analysis
- Cache pollution between ai-advanced-zh-TW types
- Switching between analysis modes shows wrong cached content

## Root Cause

1. **Font Issue**: Backend markdownFormatter may not preserve frontend CSS classes
2. **Cache Issue**: analysisType differentiation insufficient between personality/fortune modes

## Fix Strategy

### Minimal Changes Required
1. Preserve CSS classes in Markdown output
2. Add analysis mode to cache key (personality vs fortune)
3. Clear cross-contaminated cache entries

### Implementation
- Backend: Enhance markdownFormatter to preserve font classes
- Frontend: Update cache key to include analysis mode
- Database: Clear affected cache entries

## Safety Measures
- Backward compatible cache keys
- Gradual rollout with monitoring
- Rollback plan ready
