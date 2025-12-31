# Integration Tests

This directory contains integration tests for the agentic ReAct flow and parallel tool execution system.

## Overview

These tests verify the end-to-end behavior of the `AgenticGeminiService` including:
- **ReAct Flow**: Tool calling, conversation history, and reasoning steps
- **Parallel Execution**: Concurrent tool execution with partial failure resilience
- **Error Handling**: Graceful degradation when tools fail

## Test Structure

```
test/integration/
├── README.md (this file)
├── react-flow.test.ts          # ReAct flow integration tests (RF-01 to RF-05)
├── parallel-execution.test.ts  # Parallel execution tests (PE-01 to PE-03)
└── helpers/
    ├── mockLLMProvider.ts      # Mock Gemini API provider
    └── testFixtures.ts         # Test data fixtures
```

## Running Tests

### Run all integration tests
```bash
npm run test:integration
```

### Run specific test file
```bash
npx vitest run test/integration/react-flow.test.ts
npx vitest run test/integration/parallel-execution.test.ts
```

### Run in watch mode (for development)
```bash
npx vitest test/integration
```

## Test Coverage

### Phase 1: ReAct Flow (react-flow.test.ts)

| Test ID | Description | Status |
|---------|-------------|--------|
| **RF-01** | Basic single tool call flow | ✅ Implemented |
| **RF-02** | Multi-turn conversation with sequential tool calls | ✅ Implemented |
| **RF-04** | Conversation history injection | ✅ Implemented |
| **RF-05** | System prompt metadata | ✅ Implemented |

**Note**: RF-03 (malformed JSON handling) is deferred pending identification of the JSON parsing code location.

### Phase 2: Parallel Execution (parallel-execution.test.ts)

| Test ID | Description | Status | Priority |
|---------|-------------|--------|----------|
| **PE-01** | Concurrent execution timing verification | ✅ Implemented | High |
| **PE-02** | Partial tool failure resilience (CRITICAL) | ✅ Implemented | **CRITICAL** |
| **PE-03** | All tools fail scenario | ✅ Implemented | Medium |

**PE-02 is the most critical test** as it prevents regression of the recent `Promise.allSettled` fix that enables graceful degradation when individual tools fail.

### Phase 3: SSE Streaming (DEFERRED)

SSE integration tests (SE-01 to SE-04) are **deferred pending infrastructure decision**:
- **Option A**: Configure Miniflare in `vitest.config.mts` for Workers runtime testing
- **Option B**: Test SSE stream generation logic without HTTP transport
- **Option C**: Run SSE tests against deployed Staging environment

Recommendation: **Option A (Miniflare)** for best production parity while maintaining local testing.

## Test Helpers

### MockLLMProvider

Simulates Gemini API responses with:
- Scripted multi-turn conversations
- Function call generation
- Error injection
- Latency simulation

Example usage:
```typescript
import { MockScenarios } from './helpers/mockLLMProvider';

const scenario = MockScenarios.singleToolCall('get_bazi_profile');
// Use scenario to mock Gemini API responses
```

### Test Fixtures

Provides mock `CalculationResult` and tool observations:
```typescript
import { createMockCalculationResult } from './helpers/testFixtures';

const mockData = createMockCalculationResult();
```

## Critical Regression Prevention

**PE-02 test is CRITICAL** for preventing regression of the partial failure resilience feature:

### What it tests:
When multiple tools execute in parallel using `Promise.allSettled`:
1. If one tool fails, others continue successfully
2. The failed tool's error is passed to the LLM as a function response
3. The stream completes successfully
4. The LLM receives all results (successful + error messages)

### Why it matters:
- **Before fix**: One tool failure = entire request fails
- **After fix**: One tool failure = agent sees error message and adapts gracefully
- **Without this test**: Future refactoring could revert to all-or-nothing behavior

### Test verification:
```typescript
// ✅ Stream completes despite partial failure
expect(streamCompleted).toBe(true);

// ✅ All tools attempted (no early exit)
expect(executeTool).toHaveBeenCalledTimes(3);

// ✅ Failed tool's error included in LLM context
expect(errorResponse).toContain('錯誤');
expect(errorResponse).toContain('執行失敗');
```

## Known Limitations

1. **No SSE client testing**: Cannot test SSE event sequence without Miniflare or staging deployment
2. **Mock-based**: Tests use mocked Gemini API, not actual LLM behavior
3. **No visual streaming verification**: Cannot verify SSE `text` chunk streaming without HTTP client

## Future Enhancements

1. **Add RF-03**: Malformed JSON handling test once JSON parsing code is located
2. **Miniflare integration**: Enable SSE tests (SE-01 to SE-04) with Workers runtime
3. **CI/CD integration**: Add to GitHub Actions workflow
4. **Code coverage**: Track integration test coverage separately from unit tests
5. **Performance benchmarks**: Add timing assertions for tool execution

## Related Documentation

- **Integration Test Plan**: `.specify/specs/integration_test_implementation.md`
- **Integration Test Review**: `.specify/specs/integration_test_review.md`
- **Diagnostic Review**: `.specify/specs/diagnostic_review.md` (null-safety vulnerabilities)
- **CLAUDE.md**: Cloud-first development policy (affects SSE testing strategy)

## Troubleshooting

### Tests fail with "callGeminiAPI is not a function"
The tests mock private methods using `@ts-expect-error` comments. This is expected for integration testing.

### Tests timeout
Default timeout is 5s per test. For parallel execution tests with latency simulation, timeout is extended to 10s.

### Cannot access private methods
This is intentional - integration tests verify public API behavior while mocking internal dependencies.

---

**Last Updated**: 2026-01-01
**Test Coverage**: Phase 1 (ReAct Flow) + Phase 2 (Parallel Execution)
**Status**: Ready for CI/CD integration
