# Diagnostic Plan: Remaining Agent Tools Analysis


## 1. get_bazi_profile
**Risk Level: Medium**
*   **Data Structure Access**: Directly accesses `result.bazi` and `result.input`.
*   **Potential Null/Undefined**:
    *   `result.input.solarDate`: Existing check handles string vs object, but verify `result.input` itself exists.
    *   `bazi.wuxingDistribution`: Heavily relies on this. If calculation failed or partial, this might be missing.
    *   `bazi.fourPillars`: Assumes full structure (Year/Month/Day/Hour). Birth time might be optional in some contexts (though likely required here).
*   **Checklist**:
    *   Validate `result.bazi` exists.
    *   Validate `bazi.wuxingDistribution` and `bazi.wuxingDistribution.adjusted` exist before access.

## 2. get_annual_context
**Risk Level: High**
*   **Data Structure Access**: Deeply nested access into `annualFortune`.
*   **Potential Null/Undefined**:
    *   `annual.interactions`: Code accesses `stemCombinations`, `branchClashes`, etc. blindly. Need to ensure `interactions` object exists and arrays are initialized.
    *   `taiSui.xing`: Accesses `taiSui.xing.hasXing`. If `xing` is undefined, this throws.
    *   `annual.yearlyForecast`: Accesses `forecast.currentPeriod`.
*   **Checklist**:
    *   The `if (!result.annualFortune)` check is good.
    *   Verify `annual.interactions` exists before accessing properties.
    *   Verify `taiSui` structure, specifically deeply nested properties like `xing`.

## 3. get_life_forces
**Risk Level: High**
*   **Data Structure Access**: Mixes BaZi wuxing and ZiWei SiHua data.
*   **Potential Null/Undefined**:
    *   `wuxing.adjusted.Wood.toFixed(2)`: If `Wood` is undefined or not a number, this crashes.
    *   `wuxing.balance`: Used for calculation.
    *   `wuxing.raw`: Deep access to `tiangan` and `hiddenStems`.
    *   `sihua.stressNodes`, `resourceNodes`, etc.: Assumed to be arrays.
    *   `sihua.quanCycles`: Accessed directly (`length`) without optional chaining or existence check (unlike `jiCycles` inside `if (hasJiCycle)`).
*   **Checklist**:
    *   Validate all numeric inputs for `toFixed` calls in the wuxing section.
    *   Ensure `ziwei.sihuaAggregation` arrays are safe to iterate (default to empty array if missing).
    *   Check `quanCycles` access safety.

## Summary of Required Actions
1.  **Defensive Coding**: Add Optional Chaining (`?.`) and Nullish Coalescing (`??`) for all deep property accesses.
2.  **Type Safety**: Ensure arrays are defaulted to `[]` if potentially undefined.
3.  **Number Safety**: Ensure numeric values exist before calling methods like `toFixed`.
