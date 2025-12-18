/**
 * AI Service Manager
 * Manages multiple AI providers with automatic fallback support
 */

import {
  type AIProvider,
  type AIOptions,
  type AIResponse,
  type AIServiceConfig,
  type AIResponseMetadata,
  AIProviderError,
} from '../types/aiTypes';

/**
 * AI Service Manager
 * Provides unified interface for AI generation with automatic fallback
 */
export class AIServiceManager {
  private primaryProvider: AIProvider;
  private fallbackProvider?: AIProvider;
  private enableFallback: boolean;
  private maxRetries: number;
  private timeout: number;

  constructor(config: AIServiceConfig) {
    this.primaryProvider = config.primaryProvider;
    this.fallbackProvider = config.fallbackProvider;
    this.enableFallback = config.enableFallback ?? true;
    this.maxRetries = config.maxRetries ?? 3;
    this.timeout = config.timeout ?? 45000;
  }

  /**
   * Generate streaming response with automatic fallback
   *
   * @param prompt - Input prompt
   * @param options - Generation options
   * @returns ReadableStream of text chunks with metadata
   */
  async generateStream(
    prompt: string,
    options?: AIOptions,
  ): Promise<{ stream: ReadableStream; metadata: AIResponseMetadata }> {
    const startTime = Date.now();

    try {
      console.log(`[AI Manager] Attempting primary provider: ${this.primaryProvider.getName()}`);
      const stream = await this.primaryProvider.generateStream(prompt, {
        ...options,
        timeout: options?.timeout ?? this.timeout,
      });

      const latencyMs = Date.now() - startTime;
      console.log(
        `[AI Manager] Primary provider succeeded in ${latencyMs}ms: ${this.primaryProvider.getName()}`,
      );

      return {
        stream,
        metadata: {
          provider: this.primaryProvider.getName() as 'gemini' | 'azure',
          fallbackTriggered: false,
          latencyMs,
        },
      };
    } catch (error) {
      console.error(
        `[AI Manager] Primary provider failed: ${this.primaryProvider.getName()}`,
        error,
      );

      // Check if we should try fallback
      if (!this.shouldTryFallback(error)) {
        throw error;
      }

      // Try fallback provider
      if (this.fallbackProvider && this.fallbackProvider.isAvailable()) {
        console.log(
          `[AI Manager] Switching to fallback provider: ${this.fallbackProvider.getName()}`,
        );

        try {
          const fallbackStartTime = Date.now();
          const stream = await this.fallbackProvider.generateStream(prompt, {
            ...options,
            timeout: options?.timeout ?? this.timeout,
          });

          const latencyMs = Date.now() - fallbackStartTime;
          const totalLatencyMs = Date.now() - startTime;

          console.log(
            `[AI Manager] Fallback provider succeeded in ${latencyMs}ms (total: ${totalLatencyMs}ms): ${this.fallbackProvider.getName()}`,
          );

          return {
            stream,
            metadata: {
              provider: this.fallbackProvider.getName() as 'gemini' | 'azure',
              fallbackTriggered: true,
              latencyMs: totalLatencyMs,
            },
          };
        } catch (fallbackError) {
          console.error(
            `[AI Manager] Fallback provider also failed: ${this.fallbackProvider.getName()}`,
            fallbackError,
          );
          throw fallbackError;
        }
      }

      // No fallback available, throw original error
      throw error;
    }
  }

  /**
   * Generate non-streaming response with automatic fallback
   *
   * @param prompt - Input prompt
   * @param options - Generation options
   * @returns AI response with text and metadata
   */
  async generate(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      console.log(`[AI Manager] Attempting primary provider: ${this.primaryProvider.getName()}`);
      const response = await this.primaryProvider.generate(prompt, {
        ...options,
        timeout: options?.timeout ?? this.timeout,
      });

      const latencyMs = Date.now() - startTime;
      console.log(
        `[AI Manager] Primary provider succeeded in ${latencyMs}ms: ${this.primaryProvider.getName()}`,
      );

      return {
        ...response,
        metadata: {
          ...response.metadata,
          fallbackTriggered: false,
          latencyMs,
        },
      };
    } catch (error) {
      console.error(
        `[AI Manager] Primary provider failed: ${this.primaryProvider.getName()}`,
        error,
      );

      // Check if we should try fallback
      if (!this.shouldTryFallback(error)) {
        throw error;
      }

      // Try fallback provider
      if (this.fallbackProvider && this.fallbackProvider.isAvailable()) {
        console.log(
          `[AI Manager] Switching to fallback provider: ${this.fallbackProvider.getName()}`,
        );

        try {
          const response = await this.fallbackProvider.generate(prompt, {
            ...options,
            timeout: options?.timeout ?? this.timeout,
          });

          const totalLatencyMs = Date.now() - startTime;
          console.log(
            `[AI Manager] Fallback provider succeeded (total: ${totalLatencyMs}ms): ${this.fallbackProvider.getName()}`,
          );

          return {
            ...response,
            metadata: {
              ...response.metadata,
              fallbackTriggered: true,
              latencyMs: totalLatencyMs,
            },
          };
        } catch (fallbackError) {
          console.error(
            `[AI Manager] Fallback provider also failed: ${this.fallbackProvider.getName()}`,
            fallbackError,
          );
          throw fallbackError;
        }
      }

      // No fallback available, throw original error
      throw error;
    }
  }

  /**
   * Check if we should try fallback based on error type
   */
  private shouldTryFallback(error: unknown): boolean {
    if (!this.enableFallback) {
      console.log('[AI Manager] Fallback disabled, not attempting fallback');
      return false;
    }

    if (!this.fallbackProvider) {
      console.log('[AI Manager] No fallback provider configured');
      return false;
    }

    if (!this.fallbackProvider.isAvailable()) {
      console.log('[AI Manager] Fallback provider not available');
      return false;
    }

    // Check if error is retryable
    if (error instanceof AIProviderError) {
      if (error.isRetryable()) {
        console.log(
          `[AI Manager] Error is retryable (${error.code}), attempting fallback`,
        );
        return true;
      }
      console.log(
        `[AI Manager] Error is not retryable (${error.code}), not attempting fallback`,
      );
      return false;
    }

    // For unknown errors, try fallback as a safety measure
    console.log('[AI Manager] Unknown error type, attempting fallback as precaution');
    return true;
  }

  /**
   * Get current primary provider
   */
  getPrimaryProvider(): AIProvider {
    return this.primaryProvider;
  }

  /**
   * Get current fallback provider
   */
  getFallbackProvider(): AIProvider | undefined {
    return this.fallbackProvider;
  }

  /**
   * Check if fallback is enabled
   */
  isFallbackEnabled(): boolean {
    return this.enableFallback;
  }

  /**
   * Enable or disable fallback
   */
  setFallbackEnabled(enabled: boolean): void {
    this.enableFallback = enabled;
    console.log(`[AI Manager] Fallback ${enabled ? 'enabled' : 'disabled'}`);
  }
}
