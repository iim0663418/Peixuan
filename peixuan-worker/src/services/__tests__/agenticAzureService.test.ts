/**
 * Agentic Azure Service Tests
 */

import { describe, it, expect } from 'vitest';
import { AgenticAzureService } from '../agenticAzureService';
import type { CalculationResult } from '../../calculation/types';

describe('AgenticAzureService', () => {
  const mockConfig = {
    endpoint: 'https://test.openai.azure.com',
    apiKey: 'test-api-key',
    deployment: 'gpt-4.1-mini',
    apiVersion: '2024-08-01-preview',
    maxRetries: 3,
    maxIterations: 8
  };

  // Mock calculation result for testing
  const mockCalculationResult: Partial<CalculationResult> = {
    input: {
      solarDate: new Date('2024-01-15T10:30:00'),
      gender: 'male',
      longitude: 121.5,
      isLeapMonth: false
    },
    bazi: {
      fourPillars: {
        year: { stem: '甲', branch: '子', nayin: '海中金', hiddenStems: { primary: '癸' } },
        month: { stem: '丙', branch: '寅', nayin: '爐中火', hiddenStems: { primary: '甲', middle: '丙', residual: '戊' } },
        day: { stem: '戊', branch: '午', nayin: '天上火', hiddenStems: { primary: '丁', middle: '己' } },
        hour: { stem: '壬', branch: '子', nayin: '桑柘木', hiddenStems: { primary: '癸' } }
      },
      wuXing: {
        distribution: { wood: 1, fire: 2, earth: 2, metal: 0, water: 3 },
        strength: '身弱',
        yongshen: ['木', '火'],
        jishen: ['金', '水']
      },
      wuxingDistribution: {
        adjusted: { Wood: 1, Fire: 2, Earth: 2, Metal: 0, Water: 3 },
        dominant: '水',
        deficient: '金'
      },
      tenGods: {},
      fortune: {
        direction: 'forward',
        startAge: 5,
        qiyunDate: new Date('2029-02-04'),
        dayun: {
          list: [],
          current: {
            stem: '丁',
            branch: '卯',
            startAge: 25,
            endAge: 34,
            nayin: '爐中火'
          }
        },
        annual: {
          pillar: { stem: '乙', branch: '巳', nayin: '佛燈火', hiddenStems: { primary: '丙', middle: '庚', residual: '戊' } },
          taiSui: {
            deity: '太歲巳',
            direction: '東南'
          }
        }
      }
    },
    ziwei: {
      lifePalace: { name: '命宮', position: 0, stem: '甲', branch: '子', stars: ['紫微', '天府'] },
      bodyPalace: { name: '身宮', position: 6, stem: '庚', branch: '午' },
      bureau: '水二局',
      palaces: [],
      sihua: {
        summary: {
          lu: '紫微化祿',
          quan: '天機化權',
          ke: '太陽化科',
          ji: '天同化忌'
        }
      }
    },
    metadata: {
      birthInfo: {
        solarDate: new Date('2024-01-15T10:30:00'),
        gender: 'male',
        longitude: 121.5,
        isLeapMonth: false
      },
      calculatedAt: new Date(),
      version: '1.0.0'
    }
  } as CalculationResult;

  it('should create service with correct configuration', () => {
    const service = new AgenticAzureService(mockConfig);
    expect(service).toBeDefined();
  });

  it('should have 5 tools defined', () => {
    const service = new AgenticAzureService(mockConfig);
    // Access private field for testing via type assertion
    const {tools} = (service as any);
    expect(tools).toHaveLength(5);
    expect(tools.map((t: any) => t.name)).toEqual([
      'get_bazi_profile',
      'get_ziwei_chart', 
      'get_daily_transit',
      'get_annual_context',
      'get_life_forces'
    ]);
  });

  it('should execute get_bazi_profile tool', async () => {
    const service = new AgenticAzureService(mockConfig);
    const executeTool = (service as any).executeTool.bind(service);

    const result = await executeTool('get_bazi_profile', mockCalculationResult);

    expect(result).toContain('【八字命盤資料】');
    expect(result).toContain('甲子');
    expect(result).toContain('丙寅');
    expect(result).toContain('戊午');
    expect(result).toContain('壬子');
  });

  it('should execute get_ziwei_chart tool', async () => {
    const service = new AgenticAzureService(mockConfig);
    const executeTool = (service as any).executeTool.bind(service);

    const result = await executeTool('get_ziwei_chart', mockCalculationResult);

    expect(result).toContain('【紫微斗數命盤】');
    expect(result).toContain('命宮');
    expect(result).toContain('水二局');
  });

  it('should execute get_daily_transit tool', async () => {
    const service = new AgenticAzureService(mockConfig);
    const executeTool = (service as any).executeTool.bind(service);

    const result = await executeTool('get_daily_transit', mockCalculationResult);

    expect(result).toContain('【今日流運資訊】');
    expect(result).toContain('流年干支');
  });

  it('should return error for unknown tool', async () => {
    const service = new AgenticAzureService(mockConfig);
    const executeTool = (service as any).executeTool.bind(service);

    const result = await executeTool('unknown_tool', mockCalculationResult);

    expect(result).toContain('錯誤');
    expect(result).toContain('unknown_tool');
  });

  it('should build correct system prompt in Chinese', () => {
    const service = new AgenticAzureService(mockConfig);
    const buildSystemPrompt = (service as any).buildSystemPrompt.bind(service);

    const prompt = buildSystemPrompt('zh-TW');

    expect(prompt).toContain('佩璇');
    expect(prompt).toContain('get_bazi_profile');
    expect(prompt).toContain('get_ziwei_chart');
    expect(prompt).toContain('get_daily_transit');
  });

  it('should build correct system prompt in English', () => {
    const service = new AgenticAzureService(mockConfig);
    const buildSystemPrompt = (service as any).buildSystemPrompt.bind(service);

    const prompt = buildSystemPrompt('en');

    expect(prompt).toContain('Peixuan');
    expect(prompt).toContain('BaZi');
    expect(prompt).toContain('Zi Wei Dou Shu');
  });

  it('should split text into chunks correctly', () => {
    const service = new AgenticAzureService(mockConfig);
    const splitIntoChunks = (service as any).splitIntoChunks.bind(service);

    const text = '這是一段測試文字用來驗證分塊功能是否正常運作';
    const chunks = splitIntoChunks(text, 5);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join('')).toBe(text);
  });

  it('should extract tool calls from Azure OpenAI response', () => {
    const service = new AgenticAzureService(mockConfig);
    const extractToolCalls = (service as any).extractToolCalls.bind(service);

    const mockResponse = {
      choices: [{
        message: {
          role: 'assistant',
          tool_calls: [
            {
              id: 'call_1',
              type: 'function',
              function: { name: 'get_bazi_profile', arguments: '{}' }
            },
            {
              id: 'call_2',
              type: 'function',
              function: { name: 'get_daily_transit', arguments: '{}' }
            }
          ]
        }
      }]
    };

    const toolCalls = extractToolCalls(mockResponse);

    expect(toolCalls).toHaveLength(2);
    expect(toolCalls![0].function.name).toBe('get_bazi_profile');
    expect(toolCalls![1].function.name).toBe('get_daily_transit');
  });

  it('should extract content from Azure OpenAI response', () => {
    const service = new AgenticAzureService(mockConfig);
    const extractContent = (service as any).extractContent.bind(service);

    const mockResponse = {
      choices: [{
        message: {
          role: 'assistant',
          content: '這是測試回答'
        }
      }]
    };

    const content = extractContent(mockResponse);

    expect(content).toBe('這是測試回答');
  });

  it('should return null when no content in response', () => {
    const service = new AgenticAzureService(mockConfig);
    const extractContent = (service as any).extractContent.bind(service);

    const mockResponse = {
      choices: [{
        message: {
          role: 'assistant',
          tool_calls: [
            {
              id: 'call_1',
              type: 'function',
              function: { name: 'get_bazi_profile', arguments: '{}' }
            }
          ]
        }
      }]
    };

    const content = extractContent(mockResponse);

    expect(content).toBeNull();
  });

  it('should remove trailing slash from endpoint', () => {
    const configWithSlash = {
      ...mockConfig,
      endpoint: 'https://test.openai.azure.com/'
    };

    const service = new AgenticAzureService(configWithSlash);
    const {endpoint} = (service as any);

    expect(endpoint).toBe('https://test.openai.azure.com');
    expect(endpoint.endsWith('/')).toBe(false);
  });

  it('should use default values for optional config', () => {
    const minimalConfig = {
      endpoint: 'https://test.openai.azure.com',
      apiKey: 'test-key',
      deployment: 'gpt-4'
    };

    const service = new AgenticAzureService(minimalConfig);

    expect((service as any).apiVersion).toBe('2024-08-01-preview');
    expect((service as any).maxRetries).toBe(3);
    expect((service as any).maxIterations).toBe(8);
  });
});
