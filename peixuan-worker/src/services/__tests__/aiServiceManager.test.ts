/**
 * Tests for AI Service Manager
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIServiceManager } from '../aiServiceManager';
import { AIProvider, AIProviderError, AIErrorCode, AIResponse } from '../../types/aiTypes';

// Mock provider for testing
class MockAIProvider implements AIProvider {
  constructor(
    private name: string,
    private shouldFail = false,
    private available = true,
  ) {}

  getName(): string {
    return this.name;
  }

  isAvailable(): boolean {
    return this.available;
  }

  async generateStream(prompt: string): Promise<ReadableStream> {
    if (this.shouldFail) {
      throw new AIProviderError(
        'Mock provider failure',
        AIErrorCode.SERVICE_UNAVAILABLE,
        503,
      );
    }

    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Test response'));
        controller.close();
      },
    });
  }

  async generate(prompt: string): Promise<AIResponse> {
    if (this.shouldFail) {
      throw new AIProviderError(
        'Mock provider failure',
        AIErrorCode.SERVICE_UNAVAILABLE,
        503,
      );
    }

    return {
      text: 'Test response',
      metadata: {
        provider: this.name as 'gemini' | 'azure',
        fallbackTriggered: false,
        latencyMs: 100,
      },
    };
  }
}

describe('AIServiceManager', () => {
  let primaryProvider: MockAIProvider;
  let fallbackProvider: MockAIProvider;
  let manager: AIServiceManager;

  beforeEach(() => {
    primaryProvider = new MockAIProvider('gemini');
    fallbackProvider = new MockAIProvider('azure');
    manager = new AIServiceManager({
      primaryProvider,
      fallbackProvider,
      enableFallback: true,
      maxRetries: 3,
      timeout: 30000,
    });
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(manager.getPrimaryProvider()).toBe(primaryProvider);
      expect(manager.getFallbackProvider()).toBe(fallbackProvider);
      expect(manager.isFallbackEnabled()).toBe(true);
    });

    it('should work without fallback provider', () => {
      const managerNoFallback = new AIServiceManager({
        primaryProvider,
        enableFallback: false,
      });
      expect(managerNoFallback.getFallbackProvider()).toBeUndefined();
      expect(managerNoFallback.isFallbackEnabled()).toBe(false);
    });
  });

  describe('generateStream', () => {
    it('should use primary provider when available', async () => {
      const result = await manager.generateStream('test prompt');
      expect(result.metadata.provider).toBe('gemini');
      expect(result.metadata.fallbackTriggered).toBe(false);
    });

    it('should fallback to secondary provider on primary failure', async () => {
      // Make primary provider fail
      primaryProvider = new MockAIProvider('gemini', true);
      manager = new AIServiceManager({
        primaryProvider,
        fallbackProvider,
        enableFallback: true,
      });

      const result = await manager.generateStream('test prompt');
      expect(result.metadata.provider).toBe('azure');
      expect(result.metadata.fallbackTriggered).toBe(true);
    });

    it('should throw error when both providers fail', async () => {
      primaryProvider = new MockAIProvider('gemini', true);
      fallbackProvider = new MockAIProvider('azure', true);
      manager = new AIServiceManager({
        primaryProvider,
        fallbackProvider,
        enableFallback: true,
      });

      await expect(manager.generateStream('test prompt')).rejects.toThrow();
    });

    it('should not fallback when fallback is disabled', async () => {
      primaryProvider = new MockAIProvider('gemini', true);
      manager = new AIServiceManager({
        primaryProvider,
        fallbackProvider,
        enableFallback: false,
      });

      await expect(manager.generateStream('test prompt')).rejects.toThrow();
    });
  });

  describe('generate', () => {
    it('should use primary provider when available', async () => {
      const result = await manager.generate('test prompt');
      expect(result.metadata.provider).toBe('gemini');
      expect(result.metadata.fallbackTriggered).toBe(false);
      expect(result.text).toBe('Test response');
    });

    it('should fallback to secondary provider on primary failure', async () => {
      primaryProvider = new MockAIProvider('gemini', true);
      manager = new AIServiceManager({
        primaryProvider,
        fallbackProvider,
        enableFallback: true,
      });

      const result = await manager.generate('test prompt');
      expect(result.metadata.provider).toBe('azure');
      expect(result.metadata.fallbackTriggered).toBe(true);
      expect(result.text).toBe('Test response');
    });

    it('should throw error when both providers fail', async () => {
      primaryProvider = new MockAIProvider('gemini', true);
      fallbackProvider = new MockAIProvider('azure', true);
      manager = new AIServiceManager({
        primaryProvider,
        fallbackProvider,
        enableFallback: true,
      });

      await expect(manager.generate('test prompt')).rejects.toThrow();
    });
  });

  describe('setFallbackEnabled', () => {
    it('should enable fallback', () => {
      manager.setFallbackEnabled(false);
      expect(manager.isFallbackEnabled()).toBe(false);

      manager.setFallbackEnabled(true);
      expect(manager.isFallbackEnabled()).toBe(true);
    });
  });
});
