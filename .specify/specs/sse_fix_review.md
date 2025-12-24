## Impact Analysis: SSE JSON Fix Specification vs Current Implementation

### Current State (useDailyQuestion.ts:134-164)

**Strengths:**
- ✅ Handles memory metadata events correctly
- ✅ Processes state updates and text/content fields
- ✅ Filters empty objects `{}` and control messages `[DONE]`

**Critical Gap:**
- ❌ **Lines 158-164**: When JSON.parse() fails, the entire raw JSON string is appended to `response.value`
- ❌ No content extraction from malformed/complex JSON objects
- ❌ Displays `{ "thought": "...", "action": "..." }` verbatim to users

---

### Proposed Fix (sse_json_fix.md)

**Key Changes:**
1. **Lines 24-43**: Intelligent fallback logic inside catch block
2. **Regex-based extraction** for `thought`, `text`, `content` fields when JSON.parse() fails
3. **Simple unescape** for `\n` and `\"` characters
4. **Graceful degradation** to plain text if extraction fails

---

### Risk Assessment

#### **HIGH RISK** ⚠️
1. **Regex Complexity**
   - Pattern: `/"thought"\s*:\s*"((?:[^"\\]|\\.)*)"/`
   - **Risk**: May fail on nested quotes, Unicode escapes, or multiline strings with literal `\n`
   - **Example**: `"thought": "He said \"hello\" and\nsmiled"` might break regex capture group

2. **Unescape Logic Incompleteness**
   - Only handles `\n` and `\"`
   - **Missing**: `\t`, `\r`, `\\`, `\b`, `\f`, Unicode escapes (`\uXXXX`)
   - **Risk**: Malformed output if backend sends other escape sequences

3. **Double Unescape Potential**
   - If backend already sends un-escaped text, applying `.replace(/\\n/g, '\n')` could corrupt content
   - **Example**: `"Path is C:\\new\\folder"` becomes `"Path is C:\new\folder"` (unintended)

#### **MEDIUM RISK** ⚙️
4. **Performance Overhead**
   - Three regex matches per failed JSON parse (thought, text, content)
   - **Impact**: Minimal on normal payloads, but could slow down on very large malformed chunks

5. **Field Priority Ambiguity**
   - Priority: `thought > text > content`
   - **Risk**: If backend sends both `thought` and `text`, only `thought` is shown
   - **Expected behavior unclear** without backend contract verification

#### **LOW RISK** ✓
6. **Backward Compatibility**
   - Still handles valid JSON via original try block (lines 136-157)
   - Plain text fallback preserved (lines 40-42)
   - **Assessment**: Should not break existing flows

---

### Validation Gaps

#### **Missing Test Cases:**
1. **Nested quotes in JSON values**
   ```json
   {"thought": "User said \"I'm stressed\" today"}
   ```

2. **Multiline content with literal newlines**
   ```json
   {"thought": "Line 1
   Line 2
   Line 3"}
   ```

3. **Mixed escape sequences**
   ```json
   {"thought": "Path: C:\\Users\\test\nFile: data.txt"}
   ```

4. **Unicode content**
   ```json
   {"thought": "心情 \u4e0d\u9519"}
   ```

5. **Multiple fields present**
   ```json
   {"thought": "analyzing...", "text": "response text", "content": "main content"}
   ```

#### **Missing Error Handling:**
- No logging when regex extraction fails
- No fallback indication when content is truncated/corrupted

---

### Recommended Mitigations (Analysis Only, No Edits)

**Before Deployment:**

1. **Add Comprehensive Logging**
   ```typescript
   if (extracted) {
     console.debug('[SSE] Extracted via regex:', { field: 'thought|text|content', length: extracted.length });
   } else {
     console.warn('[SSE] Failed to extract content from malformed JSON:', textContent.substring(0, 100));
   }
   ```

2. **Enhance Unescape Logic**
   - Consider using `JSON.parse()` on extracted values if they look JSON-encoded
   - Or use a proper JSON string unescaper library

3. **Add Integration Tests**
   - Create test fixture with problematic JSON payloads
   - Verify extracted content matches expected output

4. **Backend Contract Review**
   - Verify what escape sequences backend actually sends
   - Confirm field naming conventions (`thought` vs `text` vs `content`)
   - Check if `action` field should also be extracted/logged

5. **Fallback Monitoring**
   - Add telemetry to track how often regex fallback is triggered
   - If > 5% of chunks use fallback, indicates backend issue

---

### Summary Table

| Aspect | Current Code | Proposed Fix | Risk Level |
|--------|-------------|--------------|------------|
| Valid JSON parsing | ✅ Works | ✅ Unchanged | LOW |
| Empty object filtering | ✅ Works | ✅ Enhanced | LOW |
| Malformed JSON display | ❌ Shows raw JSON | ✅ Extracts content | HIGH |
| Escape sequence handling | N/A | ⚠️ Incomplete | HIGH |
| Nested quote support | N/A | ⚠️ Regex may fail | HIGH |
| Field priority logic | N/A | ⚠️ Undocumented | MEDIUM |
| Error logging | ❌ Silent failures | ❌ Still silent | MEDIUM |

---

### Final Recommendation

**PROCEED WITH CAUTION** 🟡

The fix addresses the immediate user-facing issue (raw JSON display) but introduces regex-based parsing that may fail on edge cases. Recommend:

1. ✅ **Deploy to Staging first** with enhanced logging
2. ✅ **Manual testing** with various JSON payloads (see test cases above)
3. ✅ **Monitor error logs** for 24-48 hours before production
4. ⚠️ **Document field priority** in code comments
5. ⚠️ **Plan follow-up** to replace regex with proper JSON streaming parser if issues arise

**Primary concern**: Incomplete escape sequence handling could corrupt content containing backslashes or special characters. Verify backend output format before deploying.
