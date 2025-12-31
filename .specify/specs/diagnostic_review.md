Now I have all the information needed. Let me create a comprehensive validation report:

## Validation Report: Diagnostic Spec vs Implementation

### Executive Summary
The diagnostic spec **accurately identifies critical null-safety vulnerabilities** in three of five agent tools. All findings are verified against the actual implementation. Below is the detailed analysis with specific code locations requiring fixes.

---

## 1. `get_bazi_profile` - **VERIFIED** ✅

**Risk Level: Medium** (as stated)

### Verified Issues:

#### Line 200-250: Missing null guards
- **Line 200**: `const bazi = result.bazi;` - No validation that `result.bazi` exists
- **Line 207, 231**: `result.input.solarDate` - Handled correctly with ternary for string vs object
- **Line 218-219**: Direct access to `bazi.wuxingDistribution.adjusted.Wood` without checking if `wuxingDistribution` or `adjusted` exist

### Specific Vulnerable Code Paths:
```typescript
// Line 218-219 (Chinese version)
`木：${bazi.wuxingDistribution.adjusted.Wood} | 火：${bazi.wuxingDistribution.adjusted.Fire}...`

// Line 243 (English version)
`Wood: ${bazi.wuxingDistribution.adjusted.Wood} | Fire: ${bazi.wuxingDistribution.adjusted.Fire}...`
```

**If `bazi.wuxingDistribution` is undefined → Runtime error**

### Type Definition Check (types/index.ts):
- Line 123: `wuxingDistribution: WuXingDistribution` - Required field, but runtime validation missing
- Line 94-99: `fourPillars` - Required, but no runtime validation

---

## 2. `get_annual_context` - **VERIFIED** ✅

**Risk Level: High** (as stated)

### Verified Issues:

#### Line 372-374: Good null guard exists
✅ `if (!result.annualFortune) return context.join('\n');`

#### Line 401-403: **CRITICAL** - Unsafe nested access
```typescript
if (taiSui.xing.hasXing) {
  const xingDesc = taiSui.xing.description || '刑太歲';
  interactions.push(xingDesc);
}
```

**Problem**: Checks `taiSui.xing.hasXing` but doesn't verify `taiSui.xing` exists first. If `xing` is `undefined`, this throws `Cannot read property 'hasXing' of undefined`.

### Type Definition Check (types/index.ts:247-251):
```typescript
xing: {
  hasXing: boolean;
  xingType?: 'san_xing' | 'zi_xing' | 'wu_en_xing';
  description?: string;
};
```
The type shows `xing` as a required object, but runtime data may not match.

#### Line 429-455: Unsafe array access
```typescript
// Line 429
if (interactions.stemCombinations.length > 0) {
  interactions.stemCombinations.forEach(comb => {
```

**Problem**: Assumes `interactions.stemCombinations` is an array. If `interactions` exists but `stemCombinations` is `undefined`, this crashes.

### Type Definition Check (types/index.ts:229-238):
```typescript
interactions: {
  stemCombinations: StemCombination[];
  branchClashes: BranchClash[];
  harmoniousCombinations: HarmoniousCombination[];
};
```
All arrays are required fields, but no runtime validation.

#### Line 464-476: Unsafe nested object access
```typescript
if (forecast.currentPeriod) {
  const curr = forecast.currentPeriod;
  context.push(`當前階段：${curr.pillar.stem}${curr.pillar.branch}年`);
```

**Problem**: Checks `currentPeriod` exists but doesn't validate `curr.pillar` before accessing `stem` and `branch`.

---

## 3. `get_life_forces` - **VERIFIED** ✅

**Risk Level: High** (as stated)

### Verified Issues:

#### Line 502-520: Multiple unsafe numeric operations
```typescript
// Line 506-510: .toFixed() without number validation
forces.push(`  木：${wuxing.adjusted.Wood.toFixed(2)}`);
forces.push(`  火：${wuxing.adjusted.Fire.toFixed(2)}`);
// ... etc
```

**Problem**: If `Wood`, `Fire`, etc. are `undefined` or not numbers → `TypeError: Cannot read property 'toFixed' of undefined`

#### Line 514: Unsafe calculation
```typescript
forces.push(`平衡指數：${(wuxing.balance * 100).toFixed(1)}%...`);
```

**Problem**: If `wuxing.balance` is `undefined` → `NaN` or crash

#### Line 518-520: Deep nested access without guards
```typescript
forces.push(`    木：${wuxing.raw.tiangan.Wood} | 火：${wuxing.raw.tiangan.Fire}...`);
forces.push(`    木：${wuxing.raw.hiddenStems.Wood.toFixed(2)} | 火：${wuxing.raw.hiddenStems.Fire.toFixed(2)}...`);
```

**Problem**: Chain of `wuxing.raw.tiangan.Wood` and `wuxing.raw.hiddenStems.Wood` assumes all intermediate objects exist.

#### Line 595-596: **CONFIRMED INCONSISTENCY**
```typescript
// Line 595: Direct access without flag check
if (sihua.quanCycles.length > 0) {
  forces.push(`  • 偵測到化權循環（${sihua.quanCycles.length}個）`);
}

// Line 599: Direct access without flag check
if (sihua.keCycles.length > 0) {
  forces.push(`  • 偵測到化科循環（${sihua.keCycles.length}個）`);
}

// Compare to Line 581-586: Safe pattern with flag check
if (sihua.hasJiCycle) {
  forces.push(`  • 偵測到化忌循環（${sihua.jiCycles.length}個）`);
  sihua.jiCycles.forEach((cycle, idx) => {
```

**Problem**: `quanCycles` and `keCycles` are accessed directly without checking if they exist, unlike the safe pattern used for `jiCycles` which checks `hasJiCycle` first.

#### Line 532-575: Array assumptions without defaults
```typescript
// Line 532-539: stressNodes
if (sihua.stressNodes.length > 0) {
  sihua.stressNodes.forEach(node => {

// Line 544-551: resourceNodes
if (sihua.resourceNodes.length > 0) {
  sihua.resourceNodes.forEach(node => {
```

**Problem**: These arrays might be `undefined` if calculation failed partially. Should default to `[]`.

---

## 4. Tools NOT Mentioned in Diagnostic (Verified Safe)

### `get_ziwei_chart` (Line 256-311)
✅ **No issues found** - Uses safe array checks:
- Line 272: `if (palace.stars && palace.stars.length > 0)`
- Line 286: `if (ziwei.sihuaAggregation?.edges && result.bazi.fourPillars.year.stem)` - Uses optional chaining

### `get_daily_transit` (Line 316-357)
✅ **No issues found** - Safe null checks:
- Line 330: `if (result.annualFortune)`
- Line 334: `if (annual.taiSuiAnalysis && annual.taiSuiAnalysis.severity !== 'none')`
- Line 342: `if (bazi.fortuneCycles && bazi.fortuneCycles.currentDayun)`

---

## Summary of Required Actions (from Diagnostic)

### Validated Recommendations:

1. **Defensive Coding**: ✅ Confirmed needed for all 3 tools
   - Add optional chaining (`?.`) for deep property access
   - Add nullish coalescing (`??`) for default values

2. **Type Safety**: ✅ Confirmed needed
   - Default arrays to `[]` if potentially undefined
   - Example: `sihua.stressNodes ?? []`, `interactions.stemCombinations ?? []`

3. **Number Safety**: ✅ Confirmed needed
   - Validate numeric values exist before `.toFixed()` calls
   - Example: `(wuxing.adjusted.Wood ?? 0).toFixed(2)`

---

## Code Locations Requiring Fixes

| Tool | Line Range | Issue | Fix Required |
|------|-----------|-------|--------------|
| `get_bazi_profile` | 200 | No `bazi` validation | Add `if (!result.bazi) throw error` |
| `get_bazi_profile` | 218-219 | No `wuxingDistribution` guard | Add `bazi.wuxingDistribution?.adjusted?.Wood ?? 0` |
| `get_annual_context` | 401 | `taiSui.xing.hasXing` without checking `xing` | Change to `taiSui.xing?.hasXing` |
| `get_annual_context` | 429-455 | Direct array access | Add `?? []` defaults: `interactions.stemCombinations ?? []` |
| `get_annual_context` | 466 | `curr.pillar` not validated | Add `curr.pillar?.stem` |
| `get_life_forces` | 506-510 | `.toFixed()` on potentially undefined numbers | Add `?? 0` before `.toFixed()` |
| `get_life_forces` | 514 | `wuxing.balance` multiplication | Add `(wuxing.balance ?? 0) * 100` |
| `get_life_forces` | 518-520 | Deep `raw.tiangan`/`hiddenStems` access | Add optional chaining: `wuxing.raw?.tiangan?.Wood ?? 0` |
| `get_life_forces` | 532-575 | Arrays assumed to exist | Add `?? []`: `sihua.stressNodes ?? []` |
| `get_life_forces` | 595, 599 | `quanCycles`/`keCycles` without existence check | Check existence before `.length` access |

---

## Conclusion

**The diagnostic spec is 100% accurate.** All identified issues are real runtime hazards that would cause crashes if the calculation system returns incomplete data (e.g., network failure, API timeout, partial calculation errors). The spec correctly prioritizes them as Medium-High risk and provides actionable fix recommendations.

**No edits performed** as per your instructions (VALIDATOR mode, review only).
