/**
 * Integration Tests: Parallel Tool Execution
 *
 * Tests the Promise.allSettled-based parallel execution strategy.
 * This is CRITICAL for regression prevention of the recent fix.
 *
 * Covers:
 * - PE-01: Concurrent execution timing
 * - PE-02: Partial failure resilience (CRITICAL)
 * - PE-03: All-failure scenario handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgenticGeminiService } from '../../src/services/agenticGeminiService';
import { createMockCalculationResult } from './helpers/testFixtures';
import type { CalculationResult } from '../../src/calculation/types';
import type { MockResponse } from './helpers/mockLLMProvider';

describe('Parallel Tool Execution Integration Tests', () => {
  let service: AgenticGeminiService;
  let mockCalculationResult: CalculationResult;
  let mockCallGeminiAPI: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service = new AgenticGeminiService('test-api-key', 'gemini-2.0-flash-exp');
    mockCalculationResult = createMockCalculationResult();
    mockCallGeminiAPI = vi.fn();
  });

  /**
   * PE-01: Concurrent Execution Timing
   *
   * Verifies that multiple tools execute in parallel (not sequentially)
   */
  describe('PE-01: Parallel Execution Timing', () => {
    it('should execute multiple tools concurrently, not sequentially', async () => {
      // Setup: Mock response requesting 3 parallel tool calls
      const mockResponses: MockResponse[] = [
        // Turn 1: Request 3 tools in parallel
        {
          candidates: [
            {
              content: {
                parts: [
                  { text: '我需要同時查看多個資料', thought_signature: 'thinking' },
                  { functionCall: { name: 'get_bazi_profile', args: {} } },
                  { functionCall: { name: 'get_ziwei_chart', args: {} } },
                  { functionCall: { name: 'get_annual_context', args: {} } }
                ],
                role: 'model'
              }
            }
          ]
        },
        // Turn 2: Final answer
        {
          candidates: [
            {
              content: {
                parts: [{ text: '綜合分析完成' }],
                role: 'model'
              },
              finishReason: 'STOP'
            }
          ]
        }
      ];

      let callCount = 0;
      mockCallGeminiAPI.mockImplementation(async () => {
        return mockResponses[callCount++];
      });

      // Mock executeTool with artificial latency to test concurrency
      const toolExecutionTimes: Record<string, number[]> = {};
      const originalExecuteTool = (service as any).executeTool.bind(service);

      (service as any).executeTool = vi.fn(async (toolName: string, ...args: any[]) => {
        const startTime = Date.now();

        // Record start time
        if (!toolExecutionTimes[toolName]) {
          toolExecutionTimes[toolName] = [];
        }
        toolExecutionTimes[toolName].push(startTime);

        // Simulate tool latency (50ms)
        await new Promise(resolve => setTimeout(resolve, 50));

        return originalExecuteTool(toolName, ...args);
      });

      // @ts-expect-error - Accessing private method for testing
      service.callGeminiWithFunctions = mockCallGeminiAPI;

      // Execute
      const startTime = Date.now();
      const stream = await service.generateDailyInsight(
        '請完整分析',
        mockCalculationResult,
        'zh-TW'
      );

      // Consume stream
      const reader = stream.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
      const totalTime = Date.now() - startTime;

      // Assert: All 3 tools should have been called
      expect((service as any).executeTool).toHaveBeenCalledTimes(3);

      // Assert: Tools should have started within a short time window (parallel)
      const allStartTimes = Object.values(toolExecutionTimes).flat();
      const minStartTime = Math.min(...allStartTimes);
      const maxStartTime = Math.max(...allStartTimes);
      const startTimeSpread = maxStartTime - minStartTime;

      // If tools run in parallel, they should all start within ~20ms
      // If sequential, it would be >100ms (50ms * 2 gaps)
      expect(startTimeSpread).toBeLessThan(30);

      // Assert: Total execution time should be close to 1x latency, not 3x
      // Parallel: ~50ms + overhead
      // Sequential: ~150ms + overhead
      expect(totalTime).toBeLessThan(120); // Allow some overhead
    }, 10000); // 10s timeout
  });

  /**
   * PE-02: Partial Failure Resilience (CRITICAL)
   *
   * This is the MOST IMPORTANT test - it prevents regression of the
   * Promise.allSettled fix that allows partial tool failures.
   *
   * Previously: If one tool failed, entire request failed
   * Now: If one tool fails, others continue and agent sees error message
   */
  describe('PE-02: Partial Tool Failure Resilience (CRITICAL)', () => {
    it('should continue when one tool fails but others succeed', async () => {
      // Setup: Mock response requesting 3 parallel tool calls
      const mockResponses: MockResponse[] = [
        {
          candidates: [
            {
              content: {
                parts: [
                  { text: '查看三個工具', thought_signature: 'thinking' },
                  { functionCall: { name: 'get_bazi_profile', args: {} } },
                  { functionCall: { name: 'get_annual_context', args: {} } }, // This will fail
                  { functionCall: { name: 'get_ziwei_chart', args: {} } }
                ],
                role: 'model'
              }
            }
          ]
        },
        {
          candidates: [
            {
              content: {
                parts: [{ text: '雖然流年資料暫時無法獲取，但根據八字和紫微...' }],
                role: 'model'
              },
              finishReason: 'STOP'
            }
          ]
        }
      ];

      let callCount = 0;
      mockCallGeminiAPI.mockImplementation(async () => {
        return mockResponses[callCount++];
      });

      // Mock executeTool to fail for get_annual_context
      const originalExecuteTool = (service as any).executeTool.bind(service);
      (service as any).executeTool = vi.fn(async (toolName: string, ...args: any[]) => {
        if (toolName === 'get_annual_context') {
          throw new Error('流年資料計算失敗: 缺少必要數據');
        }
        return originalExecuteTool(toolName, ...args);
      });

      // @ts-expect-error - Accessing private method for testing
      service.callGeminiWithFunctions = mockCallGeminiAPI;

      // Execute
      const stream = await service.generateDailyInsight(
        '請分析我的運勢',
        mockCalculationResult,
        'zh-TW'
      );

      // Consume stream and collect events
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let streamCompleted = false;
      let errorEncountered = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            streamCompleted = true;
            break;
          }

          const chunk = decoder.decode(value);
          // Check if error message is mentioned in stream
          if (chunk.includes('流年資料') || chunk.includes('失敗')) {
            errorEncountered = true;
          }
        }
      } catch (error) {
        // Should NOT throw - this is what we're testing!
        throw new Error(`Stream should not throw error, but got: ${error}`);
      }

      // CRITICAL ASSERTIONS:
      // 1. Stream should complete successfully despite one tool failing
      expect(streamCompleted).toBe(true);

      // 2. All three tools should have been attempted
      expect((service as any).executeTool).toHaveBeenCalledTimes(3);

      // 3. Second API call should include all function responses (including error)
      const secondCall = mockCallGeminiAPI.mock.calls[1][0];
      // Find the LAST user message (which contains function responses)
      const userMessages = secondCall.filter((msg: any) => msg.role === 'user');
      const functionResponseParts = userMessages[userMessages.length - 1]?.parts || [];

      // Should have 3 function responses
      expect(functionResponseParts.length).toBe(3);

      // 4. The failed tool's response should contain error message
      const annualContextResponse = functionResponseParts.find(
        (part: any) => part.functionResponse?.name === 'get_annual_context'
      );
      expect(annualContextResponse).toBeDefined();
      expect(JSON.stringify(annualContextResponse)).toContain('失敗');

      // 5. Other tools should have successful responses
      const baziResponse = functionResponseParts.find(
        (part: any) => part.functionResponse?.name === 'get_bazi_profile'
      );
      expect(baziResponse).toBeDefined();

      const ziweiResponse = functionResponseParts.find(
        (part: any) => part.functionResponse?.name === 'get_ziwei_chart'
      );
      expect(ziweiResponse).toBeDefined();

      console.log('✅ PE-02 CRITICAL TEST PASSED: Partial failure resilience verified');
    }, 10000);

    it('should provide error context to LLM for graceful degradation', async () => {
      // Setup: Same as above but verify error message format
      const mockResponses: MockResponse[] = [
        {
          candidates: [
            {
              content: {
                parts: [
                  { text: '檢查', thought_signature: 'thinking' },
                  { functionCall: { name: 'get_life_forces', args: {} } }
                ],
                role: 'model'
              }
            }
          ]
        },
        {
          candidates: [
            {
              content: {
                parts: [{ text: '抱歉，生命力數據暫時無法獲取' }],
                role: 'model'
              },
              finishReason: 'STOP'
            }
          ]
        }
      ];

      let callCount = 0;
      mockCallGeminiAPI.mockImplementation(async () => {
        return mockResponses[callCount++];
      });

      // Mock tool failure
      (service as any).executeTool = vi.fn(async () => {
        throw new Error('Null reference: taiSui.xing.hasXing');
      });

      // @ts-expect-error - Accessing private method for testing
      service.callGeminiWithFunctions = mockCallGeminiAPI;

      // Execute
      const stream = await service.generateDailyInsight(
        '測試',
        mockCalculationResult,
        'zh-TW'
      );

      const reader = stream.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }

      // Assert: Error message should be in Chinese and informative
      const secondCall = mockCallGeminiAPI.mock.calls[1][0];
      // Find the LAST user message (which contains function responses)
      const userMessages = secondCall.filter((msg: any) => msg.role === 'user');
      const errorResponse = userMessages[userMessages.length - 1]?.parts[0];

      expect(errorResponse).toBeDefined();
      const errorText = JSON.stringify(errorResponse);

      // Error should be in Chinese
      expect(errorText).toContain('錯誤');
      // Error should mention the tool name
      expect(errorText).toContain('get_life_forces');
      // Error should include the actual error message
      expect(errorText).toContain('執行失敗');
    });
  });

  /**
   * PE-03: All-Failure Scenario
   *
   * Verifies behavior when all tools fail
   */
  describe('PE-03: All Tools Fail', () => {
    it('should handle scenario where all tools fail gracefully', async () => {
      const mockResponses: MockResponse[] = [
        {
          candidates: [
            {
              content: {
                parts: [
                  { text: '檢查工具', thought_signature: 'thinking' },
                  { functionCall: { name: 'get_bazi_profile', args: {} } },
                  { functionCall: { name: 'get_ziwei_chart', args: {} } }
                ],
                role: 'model'
              }
            }
          ]
        },
        {
          candidates: [
            {
              content: {
                parts: [{ text: '很抱歉，目前系統暫時無法提供分析' }],
                role: 'model'
              },
              finishReason: 'STOP'
            }
          ]
        }
      ];

      let callCount = 0;
      mockCallGeminiAPI.mockImplementation(async () => {
        return mockResponses[callCount++];
      });

      // All tools fail
      (service as any).executeTool = vi.fn(async () => {
        throw new Error('System error');
      });

      // @ts-expect-error - Accessing private method for testing
      service.callGeminiWithFunctions = mockCallGeminiAPI;

      // Execute
      const stream = await service.generateDailyInsight(
        '測試全部失敗',
        mockCalculationResult,
        'zh-TW'
      );

      // Should still complete
      const reader = stream.getReader();
      let completed = false;
      while (true) {
        const { done } = await reader.read();
        if (done) {
          completed = true;
          break;
        }
      }

      expect(completed).toBe(true);

      // Both tools should have been attempted
      expect((service as any).executeTool).toHaveBeenCalledTimes(2);

      // Second call should have 2 error responses
      const secondCall = mockCallGeminiAPI.mock.calls[1][0];
      // Find the LAST user message (which contains function responses)
      const userMessages = secondCall.filter((msg: any) => msg.role === 'user');
      const responses = userMessages[userMessages.length - 1]?.parts || [];
      expect(responses.length).toBe(2);

      // Both should contain error messages
      responses.forEach((response: any) => {
        expect(JSON.stringify(response)).toContain('失敗');
      });
    });
  });
});
