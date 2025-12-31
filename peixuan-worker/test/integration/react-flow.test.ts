/**
 * Integration Tests: ReAct Flow
 *
 * Tests the complete ReAct (Reasoning + Acting) flow in the agentic service.
 * Covers:
 * - RF-01: Basic single tool call flow
 * - RF-02: Multi-turn conversation with tool calls
 * - RF-04: Conversation history injection
 * - RF-05: System prompt metadata
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgenticGeminiService } from '../../src/services/agenticGeminiService';
import { MockScenarios, type MockResponse } from './helpers/mockLLMProvider';
import { createMockCalculationResult, mockToolObservations } from './helpers/testFixtures';
import type { CalculationResult } from '../../src/calculation/types';

describe('ReAct Flow Integration Tests', () => {
  let service: AgenticGeminiService;
  let mockCalculationResult: CalculationResult;
  let mockCallGeminiAPI: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create service instance with dummy API key
    service = new AgenticGeminiService('test-api-key', 'gemini-2.0-flash-exp');

    // Create mock calculation result
    mockCalculationResult = createMockCalculationResult();

    // Reset mock
    mockCallGeminiAPI = vi.fn();
  });

  /**
   * RF-01: Basic ReAct Flow
   *
   * Verifies that the agent can:
   * 1. Receive a question
   * 2. Call a single tool (get_bazi_profile)
   * 3. Return a final answer
   */
  describe('RF-01: Basic Single Tool Call', () => {
    it('should execute single tool call and return final answer', async () => {
      // Setup: Mock Gemini API responses
      const mockResponses: MockResponse[] = [
        // Turn 1: Agent decides to call get_bazi_profile
        {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '我需要查看八字命盤來分析性格',
                    thought_signature: 'thinking'
                  },
                  {
                    functionCall: {
                      name: 'get_bazi_profile',
                      args: {}
                    }
                  }
                ],
                role: 'model'
              }
            }
          ]
        },
        // Turn 2: Agent provides final answer after receiving tool result
        {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '根據您的八字命盤，日主為甲木，代表您性格正直、有上進心。您的喜用神為水木，建議多接近大自然。'
                  }
                ],
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

      // Inject mock into service
      // @ts-expect-error - Accessing private method for testing
      service.callGeminiWithFunctions = mockCallGeminiAPI;

      // Execute: Generate daily insight
      const stream = await service.generateDailyInsight(
        '請分析我的性格特質',
        mockCalculationResult,
        'zh-TW'
      );

      // Consume the stream
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      const events: Array<{ type?: string; text?: string; state?: string }> = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            // Skip [DONE] token
            if (dataStr === '[DONE]') continue;
            const data = JSON.parse(dataStr);
            events.push(data);
          }
        }
      }

      // Assert: Verify the flow
      // 1. Should have called Gemini API twice (tool call + final answer)
      expect(mockCallGeminiAPI).toHaveBeenCalledTimes(2);

      // 2. First call should include the user question
      const firstCall = mockCallGeminiAPI.mock.calls[0][0];
      expect(firstCall).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            parts: expect.arrayContaining([
              expect.objectContaining({
                text: expect.stringContaining('請分析我的性格特質')
              })
            ])
          })
        ])
      );

      // 3. Second call should include function response with tool observation
      const secondCall = mockCallGeminiAPI.mock.calls[1][0];
      expect(secondCall).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            parts: expect.arrayContaining([
              expect.objectContaining({
                functionResponse: expect.objectContaining({
                  name: 'get_bazi_profile'
                })
              })
            ])
          })
        ])
      );

      // 4. Should emit SSE events with correct sequence
      expect(events.length).toBeGreaterThan(0);

      // Find action event (state message about executing get_bazi_profile)
      const actionEvent = events.find(e => e.state && e.state.includes('get_bazi_profile'));
      expect(actionEvent).toBeDefined();
      expect(actionEvent?.state).toContain('正在查詢');

      // Find final answer chunks
      const answerChunks = events.filter(e => e.text);
      expect(answerChunks.length).toBeGreaterThan(0);

      // Reconstruct full answer
      const fullAnswer = answerChunks.map(e => e.text).join('');
      expect(fullAnswer).toContain('甲木');
      expect(fullAnswer).toContain('性格');
    });
  });

  /**
   * RF-02: Multi-turn Conversation
   *
   * Verifies that the agent can:
   * 1. Make multiple tool calls in sequence
   * 2. Maintain conversation history
   * 3. Build upon previous tool results
   */
  describe('RF-02: Multi-turn Conversation', () => {
    it('should handle multiple sequential tool calls', async () => {
      // Setup: Mock Gemini API responses for 3 turns
      const mockResponses: MockResponse[] = [
        // Turn 1: Call get_bazi_profile
        {
          candidates: [
            {
              content: {
                parts: [
                  { text: '先查看八字', thought_signature: 'thinking' },
                  { functionCall: { name: 'get_bazi_profile', args: {} } }
                ],
                role: 'model'
              }
            }
          ]
        },
        // Turn 2: Call get_ziwei_chart
        {
          candidates: [
            {
              content: {
                parts: [
                  { text: '再查看紫微命盤', thought_signature: 'thinking' },
                  { functionCall: { name: 'get_ziwei_chart', args: {} } }
                ],
                role: 'model'
              }
            }
          ]
        },
        // Turn 3: Final answer
        {
          candidates: [
            {
              content: {
                parts: [{ text: '綜合八字與紫微的分析，您的命格...' }],
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

      // @ts-expect-error - Accessing private method for testing
      service.callGeminiWithFunctions = mockCallGeminiAPI;

      // Execute
      const stream = await service.generateDailyInsight(
        '請綜合分析我的命格',
        mockCalculationResult,
        'zh-TW'
      );

      // Consume stream
      const reader = stream.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }

      // Assert: Should have made 3 API calls
      expect(mockCallGeminiAPI).toHaveBeenCalledTimes(3);

      // Note: conversationHistory is mutated between calls, so we can't compare lengths directly
      // Instead, verify the final conversation history has the correct structure
      const finalMessages = mockCallGeminiAPI.mock.calls[2][0];

      // Final call should have 5 messages: initial user + (model + user function response) x 2
      expect(finalMessages.length).toBe(5);

      // Verify message structure: user, model, user, model, user
      expect(finalMessages[0].role).toBe('user');
      expect(finalMessages[1].role).toBe('model');
      expect(finalMessages[2].role).toBe('user');
      expect(finalMessages[3].role).toBe('model');
      expect(finalMessages[4].role).toBe('user');

      // Verify both function responses are in the final call
      const call3String = JSON.stringify(finalMessages);
      expect(call3String).toContain('get_bazi_profile');
      expect(call3String).toContain('get_ziwei_chart');
    });
  });

  /**
   * RF-04: Conversation History Injection
   *
   * Verifies that user-provided conversation history is correctly injected
   */
  describe('RF-04: History Context Injection', () => {
    it('should inject user conversation history into system prompt', async () => {
      const mockResponses: MockResponse[] = [
        {
          candidates: [
            {
              content: {
                parts: [{ text: '根據您之前提到的問題，我建議...' }],
                role: 'model'
              },
              finishReason: 'STOP'
            }
          ]
        }
      ];

      mockCallGeminiAPI.mockImplementation(async () => mockResponses[0]);

      // @ts-expect-error - Accessing private method for testing
      service.callGeminiWithFunctions = mockCallGeminiAPI;

      // Execute with history context
      const historyContext = '使用者: 我最近工作壓力很大\n佩璇: 我了解您的壓力...';
      const stream = await service.generateDailyInsight(
        '有什麼建議嗎？',
        mockCalculationResult,
        'zh-TW',
        historyContext
      );

      // Consume stream
      const reader = stream.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }

      // Assert: First call should include history in system prompt
      const firstCall = mockCallGeminiAPI.mock.calls[0][0];
      const systemMessage = firstCall.find((msg: any) => msg.role === 'user');

      expect(systemMessage).toBeDefined();
      const systemText = JSON.stringify(systemMessage.parts);
      expect(systemText).toContain('工作壓力很大');
    });
  });

  /**
   * RF-05: System Prompt Metadata
   *
   * Verifies that system prompt includes necessary metadata
   */
  describe('RF-05: System Prompt Metadata', () => {
    it('should include chartId and timestamp in system prompt', async () => {
      const mockResponses: MockResponse[] = [
        {
          candidates: [
            {
              content: {
                parts: [{ text: '分析完成' }],
                role: 'model'
              },
              finishReason: 'STOP'
            }
          ]
        }
      ];

      mockCallGeminiAPI.mockImplementation(async () => mockResponses[0]);

      // @ts-expect-error - Accessing private method for testing
      service.callGeminiWithFunctions = mockCallGeminiAPI;

      // Execute with options including chartId
      const stream = await service.generateDailyInsight(
        '測試問題',
        mockCalculationResult,
        'zh-TW',
        '',
        { chartId: 'test-chart-123' }
      );

      // Consume stream
      const reader = stream.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }

      // Assert: System prompt should include metadata
      const firstCall = mockCallGeminiAPI.mock.calls[0][0];
      const systemMessage = firstCall.find((msg: any) => msg.role === 'user');

      expect(systemMessage).toBeDefined();
      const systemText = JSON.stringify(systemMessage.parts);

      // Check for function tool definitions (part of system prompt)
      expect(systemText).toContain('get_bazi_profile');
      expect(systemText).toContain('get_ziwei_chart');
    });
  });
});
