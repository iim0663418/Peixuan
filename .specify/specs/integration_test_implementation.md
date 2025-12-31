# Integration Test Suite Implementation Plan

## 1. Objective
To establish a robust integration test suite for the `peixuan-worker` backend, specifically targeting the "Agentic" capabilities. This plan addresses critical coverage gaps in the ReAct loop, parallel tool execution, and SSE streaming, ensuring system reliability and regression prevention during Phase 2 enhancements.

## 2. Mocking Strategy & Infrastructure

### 2.1 AI Service Mock (`MockLLMProvider`)
Instead of hitting live Gemini/Azure APIs, we will implement a scripted mock provider.
*   **Capabilities**:
    *   **Scripted Responses**: Define a sequence of responses based on input prompts.
    *   **Tool Call Generation**: Simulate the exact JSON structure required for function calling.
    *   **Latency Simulation**: Configurable delays to test timeouts.
    *   **Error Injection**: Simulate 429 (Rate Limit) or 500 (Server Error) to test fallback logic.

### 2.2 Tool Execution Mock
Wrap actual calculation logic or use pure mocks for the 5 analysis tools (Bazi, Ziwei, etc.) to isolate the *orchestration* logic from the *calculation* logic.
*   **Scenarios**: Success, Calculation Error, Timeout.

### 2.3 SSE Client Simulator
A utility to consume the streaming endpoint and parse Server-Sent Events into a structured array for assertion.

## 3. Test Implementation Phases

### Phase 1: ReAct Flow Integration (`test/integration/react_flow.test.ts`)
*Focus: Verifying the reasoning engine's logic.*

| ID | Test Case | Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **RF-01** | **Single Tool Happy Path** | User asks for Bazi chart. Mock LLM returns tool call -> System executes -> Mock LLM summarizes. | Final response contains data from Bazi tool. |
| **RF-02** | **Multi-Tool Sequence** | User asks complex question. LLM calls Bazi, then Ziwei sequentially. | Context accumulates; final answer references both results. |
| **RF-03** | **Malformed JSON Handling** | Mock LLM returns invalid JSON for tool arguments. | System catches parse error, logs it, and asks LLM to retry (or fails gracefully). |
| **RF-04** | **Memory/Context Injection** | User asks follow-up question. | System includes chat history in the prompt sent to Mock LLM. |
| **RF-05** | **System Prompt Compliance** | Verify that `current_date` and user profile are injected into the system prompt. | Prompt sent to Mock LLM contains correct metadata. |

### Phase 2: Parallel Tool Execution (`test/integration/parallel_execution.test.ts`)
*Focus: Verifying the new `Promise.allSettled` implementation.*

| ID | Test Case | Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **PE-01** | **All Systems Go** | Trigger parallel analysis for "Comprehensive Reading". All 5 tools mocked to succeed. | Total execution time approx. max(tool_duration); all results present. |
| **PE-02** | **Partial Failure (Resilience)** | Trigger parallel analysis. Bazi & Annual succeed; Ziwei throws error. | System does *not* crash. Result contains successful data + error info for Ziwei. |
| **PE-03** | **Critical Failure** | Trigger parallel analysis. All tools fail. | System returns a polite "Unable to analyze" message, not a 500 stack trace. |
| **PE-04** | **Race Conditions** | Rapidly trigger parallel requests for different users. | User contexts do not bleed into each other (Scope isolation). |

### Phase 3: SSE Streaming & API (`test/integration/sse_api.test.ts`)
*Focus: User experience and transport layer.*

| ID | Test Case | Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **SE-01** | **Event Sequence** | Monitor the `/stream` endpoint. | Sequence: `connected` -> `thought` -> `tool_start` -> `tool_result` -> `answer` -> `done`. |
| **SE-02** | **Chunk Integrity** | Verify large text responses are chunked correctly. | Concatenated chunks match the full expected string. |
| **SE-03** | **Client Disconnect** | Abort request mid-stream. | Worker stops processing/streaming within reasonable time (no zombie execution). |
| **SE-04** | **Error Propagation** | Simulate fatal error during stream. | Stream emits `error` event before closing, not just a silent close. |

## 4. Implementation Steps

1.  **Scaffold Test Directory**: Create `peixuan-worker/test/integration/`.
2.  **Build Mocks**: Implement `createMockAIProvider` and `createMockContext` helpers.
3.  **Implement RF-01 (Baseline)**: Get the basic ReAct flow passing.
4.  **Implement PE-02 (Resilience)**: Crucial for the new parallel architecture.
5.  **Implement SE-01 (Streaming)**: Ensure the frontend contract is met.
6.  **CI Integration**: Add `npm run test:integration` to `deploy-worker.yml`.

## 5. Success Metrics

*   **Reliability**: 100% pass rate on mocked scenarios.
*   **Performance**: Parallel execution tests verify <3s latency for combined analysis (simulated).
*   **Coverage**: "Agentic" service logic coverage increases from <20% to >80%.
