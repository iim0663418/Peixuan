/* eslint-disable no-unused-vars */
/**
 * AI Service Types
 * Unified type definitions for AI providers
 */

/**
 * AI generation options
 */
export interface AIOptions {
  /** Temperature for response randomness (0.0 - 1.0) */
  temperature?: number;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Top-k sampling parameter */
  topK?: number;
  /** Top-p (nucleus) sampling parameter */
  topP?: number;
  /** Language locale (zh-TW, zh, en) */
  locale?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  /** Number of tokens in the prompt */
  promptTokens: number;
  /** Number of tokens in the completion */
  completionTokens: number;
  /** Total number of tokens used */
  totalTokens: number;
}

/**
 * AI response metadata
 */
export interface AIResponseMetadata {
  /** Provider that generated the response */
  provider: 'gemini' | 'azure';
  /** Whether fallback was triggered */
  fallbackTriggered: boolean;
  /** Response latency in milliseconds */
  latencyMs: number;
  /** Token usage information (if available) */
  usage?: TokenUsage;
}

/**
 * Non-streaming AI response
 */
export interface AIResponse {
  /** Generated text */
  text: string;
  /** Response metadata */
  metadata: AIResponseMetadata;
}

/**
 * Error codes for AI provider failures
 */
export enum AIErrorCode {
  /** Service is unavailable (503) */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  /** Rate limit exceeded (429) */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  /** Request timeout */
  TIMEOUT = 'TIMEOUT',
  /** Invalid API key or authentication failure */
  AUTH_ERROR = 'AUTH_ERROR',
  /** Invalid request format */
  INVALID_REQUEST = 'INVALID_REQUEST',
  /** Unknown error */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * AI provider error
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public statusCode?: number,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'AIProviderError';
  }

  /**
   * Check if this error is retryable
   */
  isRetryable(): boolean {
    return (
      this.code === AIErrorCode.SERVICE_UNAVAILABLE ||
      this.code === AIErrorCode.RATE_LIMIT_EXCEEDED ||
      this.code === AIErrorCode.TIMEOUT
    );
  }
}

/**
 * Unified AI provider interface
 * All AI services (Gemini, Azure OpenAI) must implement this interface
 */
export interface AIProvider {
  /**
   * Get provider name
   */
  getName(): string;

  /**
   * Generate streaming response
   *
   * @param _prompt - Input prompt
   * @param _options - Generation options
   * @returns ReadableStream of text chunks
   * @throws AIProviderError on failure
   */
  generateStream(_prompt: string, _options?: AIOptions): Promise<ReadableStream>;

  /**
   * Generate non-streaming response
   *
   * @param _prompt - Input prompt
   * @param _options - Generation options
   * @returns AI response with text and metadata
   * @throws AIProviderError on failure
   */
  generate(_prompt: string, _options?: AIOptions): Promise<AIResponse>;

  /**
   * Check if provider is available
   *
   * @returns true if provider is configured and ready
   */
  isAvailable(): boolean;
}

/**
 * AI service manager configuration
 */
export interface AIServiceConfig {
  /** Primary AI provider */
  primaryProvider: AIProvider;
  /** Fallback AI provider (optional) */
  fallbackProvider?: AIProvider;
  /** Enable automatic fallback on primary failure */
  enableFallback?: boolean;
  /** Maximum retries for primary provider before fallback */
  maxRetries?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
}
