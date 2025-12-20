/**
 * Agentic Gemini Service Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { AgenticGeminiService } from '../agenticGeminiService';
import type { CalculationResult } from '../../calculation/types';

describe('AgenticGeminiService', () => {
  const mockApiKey = 'test-api-key';

  // Mock calculation result for testing
  const mockCalculationResult: Partial<CalculationResult> = {
    input: {
      solarDate: new Date('2024-01-15T10:30:00'),
      gender: 'male',
      longitude: 121.5
    },
    bazi: {
      fourPillars: {
        year: { stem: '甲', branch: '子', nayin: '海中金', hiddenStems: { primary: '癸' } },
        month: { stem: '丙', branch: '寅', nayin: '爐中火', hiddenStems: { primary: '甲', middle: '丙', residual: '戊' } },
        day: { stem: '戊', branch: '午', nayin: '天上火', hiddenStems: { primary: '丁', middle: '己' } },
        hour: { stem: '壬', branch: '子', nayin: '桑柘木', hiddenStems: { primary: '癸' } }
      },
      wuxingDistribution: {
        raw: {
          tiangan: { Wood: 1, Fire: 2, Earth: 1, Metal: 0, Water: 2 },
          hiddenStems: { Wood: 1.5, Fire: 2.5, Earth: 1.5, Metal: 0, Water: 2.5 }
        },
        adjusted: { Wood: 1.5, Fire: 2.5, Earth: 1.5, Metal: 0, Water: 2.5 },
        dominant: '火',
        deficient: '金',
        balance: 0.6
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
      lifePalace: { name: '命宮', position: 0, stem: '甲', branch: '子', stars: [] },
      bodyPalace: { name: '身宮', position: 6, stem: '庚', branch: '午', stars: [] },
      bureau: '水二局',
      palaces: [],
      sihua: {
        summary: {
          lu: '紫微化祿',
          quan: '天機化權',
          ke: '太陽化科',
          ji: '天同化忌'
        }
      },
      sihuaAggregation: {
        stressNodes: [
          { palaceName: '疾厄宮', inDegree: 2, severity: 'medium' }
        ],
        resourceNodes: [
          { palaceName: '財帛宮', outDegree: 2, severity: 'medium' }
        ],
        powerNodes: [
          { palaceName: '官祿宮', outDegree: 1, severity: 'low' }
        ],
        fameNodes: [],
        hasJiCycle: true,
        jiCycles: [
          { description: '命宮化忌入疾厄宮 -> 疾厄宮化忌入財帛宮', severity: 'medium' }
        ],
        hasLuCycle: false,
        luCycles: [],
        quanCycles: [],
        keCycles: [],
        totalEdges: 10,
        edgesByType: { '化祿': 3, '化權': 2, '化科': 2, '化忌': 3 },
        edgesByLayer: { '本命': 8, '流年': 2 }
      }
    },
    annualFortune: {
      annualPillar: { stem: '乙', branch: '巳', nayin: '佛燈火', hiddenStems: { primary: '丙', middle: '庚', residual: '戊' } },
      annualLifePalaceIndex: 4,
      taiSuiAnalysis: {
        severity: 'low',
        types: [],
        zhi: false,
        chong: false,
        xing: { hasXing: false },
        po: false,
        hai: false,
        recommendations: []
      },
      interactions: {
        stemCombinations: [],
        branchClashes: [],
        harmoniousCombinations: []
      },
      yearlyForecast: {
        currentPeriod: {
          pillar: { stem: '乙', branch: '巳', nayin: '佛燈火', hiddenStems: { primary: '丙' } },
          startDate: '2025-02-04T00:00:00Z',
          endDate: '2026-02-03T23:59:59Z',
          age: 1
        },
        nextPeriod: {
          pillar: { stem: '丙', branch: '午', nayin: '天河水', hiddenStems: { primary: '丁' } },
          startDate: '2026-02-04T00:00:00Z',
          endDate: '2027-02-03T23:59:59Z',
          age: 2
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
    const service = new AgenticGeminiService(mockApiKey, 'gemini-3-flash-preview', 3, 5);
    expect(service).toBeDefined();
  });

  it('should have 5 tools defined', () => {
    const service = new AgenticGeminiService(mockApiKey);
    // Access private field for testing via type assertion
    const tools = (service as any).tools;
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
    const service = new AgenticGeminiService(mockApiKey);
    const executeTool = (service as any).executeTool.bind(service);

    const result = await executeTool('get_bazi_profile', mockCalculationResult);

    expect(result).toContain('【八字命盤資料】');
    expect(result).toContain('甲子');
    expect(result).toContain('丙寅');
    expect(result).toContain('戊午');
    expect(result).toContain('壬子');
  });

  it('should execute get_ziwei_chart tool', async () => {
    const service = new AgenticGeminiService(mockApiKey);
    const executeTool = (service as any).executeTool.bind(service);

    const result = await executeTool('get_ziwei_chart', mockCalculationResult);

    expect(result).toContain('【紫微斗數命盤】');
    expect(result).toContain('命宮');
    expect(result).toContain('水二局');
  });

  it('should execute get_daily_transit tool', async () => {
    const service = new AgenticGeminiService(mockApiKey);
    const executeTool = (service as any).executeTool.bind(service);

    const result = await executeTool('get_daily_transit', mockCalculationResult);

    expect(result).toContain('【今日流運資訊】');
    expect(result).toContain('流年干支');
  });

  it('should execute get_annual_context tool', async () => {
    const service = new AgenticGeminiService(mockApiKey);
    const executeTool = (service as any).executeTool.bind(service);

    const result = await executeTool('get_annual_context', mockCalculationResult);

    expect(result).toContain('【流年大環境背景】');
    expect(result).toContain('流年干支');
    expect(result).toContain('太歲互動狀況');
    expect(result).toContain('流年與命盤互動');
  });

  it('should execute get_life_forces tool', async () => {
    const service = new AgenticGeminiService(mockApiKey);
    const executeTool = (service as any).executeTool.bind(service);

    const result = await executeTool('get_life_forces', mockCalculationResult);

    expect(result).toContain('【命盤能量流動與五行結構】');
    expect(result).toContain('五行能量分布');
    expect(result).toContain('四化能量聚散分析');
    expect(result).toContain('壓力匯聚點');
  });

  it('should return error for unknown tool', async () => {
    const service = new AgenticGeminiService(mockApiKey);
    const executeTool = (service as any).executeTool.bind(service);

    const result = await executeTool('unknown_tool', mockCalculationResult);

    expect(result).toContain('錯誤');
    expect(result).toContain('unknown_tool');
  });

  it('should build correct system prompt in Chinese', () => {
    const service = new AgenticGeminiService(mockApiKey);
    const buildSystemPrompt = (service as any).buildSystemPrompt.bind(service);

    const prompt = buildSystemPrompt('zh-TW');

    expect(prompt).toContain('佩璇');
    expect(prompt).toContain('get_bazi_profile');
    expect(prompt).toContain('get_ziwei_chart');
    expect(prompt).toContain('get_daily_transit');
    expect(prompt).toContain('get_annual_context');
    expect(prompt).toContain('get_life_forces');
  });

  it('should build correct system prompt in English', () => {
    const service = new AgenticGeminiService(mockApiKey);
    const buildSystemPrompt = (service as any).buildSystemPrompt.bind(service);

    const prompt = buildSystemPrompt('en');

    expect(prompt).toContain('Peixuan');
    expect(prompt).toContain('BaZi');
    expect(prompt).toContain('Zi Wei Dou Shu');
  });

  it('should split text into chunks correctly', () => {
    const service = new AgenticGeminiService(mockApiKey);
    const splitIntoChunks = (service as any).splitIntoChunks.bind(service);

    const text = '這是一段測試文字用來驗證分塊功能是否正常運作';
    const chunks = splitIntoChunks(text, 5);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join('')).toBe(text);
  });

  it('should extract function calls from Gemini response', () => {
    const service = new AgenticGeminiService(mockApiKey);
    const extractFunctionCalls = (service as any).extractFunctionCalls.bind(service);

    const mockResponse = {
      candidates: [{
        content: {
          parts: [
            { functionCall: { name: 'get_bazi_profile', args: {} } },
            { functionCall: { name: 'get_daily_transit', args: {} } }
          ]
        }
      }]
    };

    const functionCalls = extractFunctionCalls(mockResponse);

    expect(functionCalls).toHaveLength(2);
    expect(functionCalls[0].name).toBe('get_bazi_profile');
    expect(functionCalls[1].name).toBe('get_daily_transit');
  });

  it('should extract text from Gemini response', () => {
    const service = new AgenticGeminiService(mockApiKey);
    const extractText = (service as any).extractText.bind(service);

    const mockResponse = {
      candidates: [{
        content: {
          parts: [
            { text: '這是測試回答' }
          ]
        }
      }]
    };

    const text = extractText(mockResponse);

    expect(text).toBe('這是測試回答');
  });

  it('should return null when no text in response', () => {
    const service = new AgenticGeminiService(mockApiKey);
    const extractText = (service as any).extractText.bind(service);

    const mockResponse = {
      candidates: [{
        content: {
          parts: [
            { functionCall: { name: 'get_bazi_profile', args: {} } }
          ]
        }
      }]
    };

    const text = extractText(mockResponse);

    expect(text).toBeNull();
  });
});
