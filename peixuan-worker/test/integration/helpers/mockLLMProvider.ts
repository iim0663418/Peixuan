/**
 * Mock LLM Provider for Integration Tests
 *
 * Simulates Gemini API responses for testing ReAct flow and tool execution.
 * Supports:
 * - Scripted multi-turn conversations
 * - Function call generation
 * - Error injection
 * - Latency simulation
 */

export interface MockFunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface MockResponsePart {
  text?: string;
  functionCall?: {
    name: string;
    args: Record<string, unknown>;
  };
  thought_signature?: string;
}

export interface MockResponse {
  candidates: Array<{
    content: {
      parts: MockResponsePart[];
      role: string;
    };
    finishReason?: string;
  }>;
}

export interface MockScenario {
  turns: MockTurn[];
  latencyMs?: number;
  shouldError?: boolean;
  errorMessage?: string;
}

export interface MockTurn {
  type: 'function_calls' | 'final_answer';
  parts: MockResponsePart[];
}

/**
 * Creates a mock LLM provider that simulates Gemini API behavior
 */
export class MockLLMProvider {
  private scenario: MockScenario;
  private currentTurn = 0;
  private callHistory: unknown[] = [];

  constructor(scenario: MockScenario) {
    this.scenario = scenario;
  }

  /**
   * Simulates a generateContent call to Gemini API
   */
  async generateContent(conversationHistory: unknown[]): Promise<MockResponse> {
    // Record the call for inspection
    this.callHistory.push(conversationHistory);

    // Simulate latency if specified
    if (this.scenario.latencyMs) {
      await this.sleep(this.scenario.latencyMs);
    }

    // Inject error if specified
    if (this.scenario.shouldError) {
      throw new Error(this.scenario.errorMessage || 'Mock API error');
    }

    // Return next turn in the scenario
    if (this.currentTurn >= this.scenario.turns.length) {
      throw new Error('Mock scenario exhausted: no more turns available');
    }

    const turn = this.scenario.turns[this.currentTurn];
    this.currentTurn++;

    return {
      candidates: [
        {
          content: {
            parts: turn.parts,
            role: 'model'
          },
          finishReason: turn.type === 'final_answer' ? 'STOP' : undefined
        }
      ]
    };
  }

  /**
   * Get the conversation history from all calls
   */
  getCallHistory(): unknown[] {
    return this.callHistory;
  }

  /**
   * Get the current turn number
   */
  getCurrentTurn(): number {
    return this.currentTurn;
  }

  /**
   * Reset the provider to initial state
   */
  reset(): void {
    this.currentTurn = 0;
    this.callHistory = [];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Helper functions to create common mock scenarios
 */
export const MockScenarios = {
  /**
   * Single tool call followed by final answer
   */
  singleToolCall(toolName: string, toolArgs: Record<string, unknown> = {}): MockScenario {
    return {
      turns: [
        {
          type: 'function_calls',
          parts: [
            {
              text: `我需要調用 ${toolName} 工具來獲取資訊`,
              thought_signature: 'thinking'
            },
            {
              functionCall: {
                name: toolName,
                args: toolArgs
              }
            }
          ]
        },
        {
          type: 'final_answer',
          parts: [
            {
              text: '根據工具返回的結果，我可以提供以下分析...'
            }
          ]
        }
      ]
    };
  },

  /**
   * Multiple parallel tool calls
   */
  parallelToolCalls(toolNames: string[]): MockScenario {
    const functionCallParts: MockResponsePart[] = [
      {
        text: '我需要同時調用多個工具來獲取完整資訊',
        thought_signature: 'thinking'
      },
      ...toolNames.map(name => ({
        functionCall: {
          name,
          args: {}
        }
      }))
    ];

    return {
      turns: [
        {
          type: 'function_calls',
          parts: functionCallParts
        },
        {
          type: 'final_answer',
          parts: [
            {
              text: '綜合多個工具的結果，我的分析是...'
            }
          ]
        }
      ]
    };
  },

  /**
   * Multi-turn conversation with tool calls
   */
  multiTurn(turns: { toolName?: string; answer?: string }[]): MockScenario {
    return {
      turns: turns.map(turn => {
        if (turn.toolName) {
          return {
            type: 'function_calls' as const,
            parts: [
              {
                text: `調用 ${turn.toolName}`,
                thought_signature: 'thinking'
              },
              {
                functionCall: {
                  name: turn.toolName,
                  args: {}
                }
              }
            ]
          };
        } else {
          return {
            type: 'final_answer' as const,
            parts: [
              {
                text: turn.answer || '分析完成'
              }
            ]
          };
        }
      })
    };
  },

  /**
   * Scenario that triggers an error
   */
  withError(errorMessage: string): MockScenario {
    return {
      turns: [],
      shouldError: true,
      errorMessage
    };
  },

  /**
   * Scenario with artificial latency
   */
  withLatency(baseScenario: MockScenario, latencyMs: number): MockScenario {
    return {
      ...baseScenario,
      latencyMs
    };
  }
};

/**
 * Creates a mock for the callGeminiAPI method
 */
export function createMockCallGeminiAPI(scenario: MockScenario) {
  const provider = new MockLLMProvider(scenario);

  return {
    mock: async (conversationHistory: unknown[]) => {
      return provider.generateContent(conversationHistory);
    },
    provider
  };
}
