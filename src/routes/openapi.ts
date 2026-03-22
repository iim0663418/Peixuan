/**
 * OpenAPI 3.1 Specification
 * Compatible with ChatGPT GPT Actions
 */

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Peixuan Astrology API',
    description: 'Chinese astrology calculation service (BaZi + Zi Wei Dou Shu). Returns structured chart data for LLM interpretation. No AI analysis included — your LLM interprets the results.',
    version: '2.0.0',
  },
  servers: [
    { url: 'https://peixuan.sfan-tech.com', description: 'Production' },
  ],
  paths: {
    '/calculate/unified': {
      post: {
        operationId: 'calculateUnified',
        summary: 'Calculate complete astrology chart (BaZi + Zi Wei)',
        description: 'Returns Four Pillars, Ten Gods, Five Elements, Zi Wei palaces, stars, SiHua, and fortune cycles.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CalculateRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Complete chart data', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnifiedResult' } } } },
          '400': { description: 'Invalid input' },
        },
      },
    },
    '/calculate/bazi': {
      post: {
        operationId: 'calculateBazi',
        summary: 'Calculate BaZi (Four Pillars) only',
        description: 'Returns Four Pillars, Ten Gods, Hidden Stems, Five Elements distribution, and fortune cycles.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CalculateRequest' } } },
        },
        responses: {
          '200': { description: 'BaZi chart data' },
          '400': { description: 'Invalid input' },
        },
      },
    },
    '/calculate/ziwei': {
      post: {
        operationId: 'calculateZiwei',
        summary: 'Calculate Zi Wei Dou Shu only',
        description: 'Returns 12 palaces, star positions, SiHua transformations, and star symmetry.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CalculateRequest' } } },
        },
        responses: {
          '200': { description: 'Zi Wei chart data' },
          '400': { description: 'Invalid input' },
        },
      },
    },
    '/persona/character': {
      get: {
        operationId: 'getPersonaCharacter',
        summary: 'Get Peixuan persona definition',
        description: 'Returns the character definition for Peixuan (佩璇). Add to your system prompt to role-play as a Chinese astrology consultant.',
        responses: { '200': { description: 'Persona definition in Markdown' } },
      },
    },
    '/persona/personality-guide': {
      get: {
        operationId: 'getPersonalityGuide',
        summary: 'Get personality analysis guide',
        description: 'Instructions for interpreting BaZi/ZiWei data as a personality reading.',
        responses: { '200': { description: 'Analysis guide in Markdown' } },
      },
    },
    '/persona/fortune-guide': {
      get: {
        operationId: 'getFortuneGuide',
        summary: 'Get fortune analysis guide',
        description: 'Instructions for interpreting fortune/transit data as a 6-month forecast.',
        responses: { '200': { description: 'Analysis guide in Markdown' } },
      },
    },
    '/glossary': {
      get: {
        operationId: 'getGlossary',
        summary: 'Get Chinese astrology glossary',
        description: 'Terminology reference for BaZi, Zi Wei Dou Shu, Ten Gods, SiHua, etc.',
        responses: { '200': { description: 'Glossary in Markdown' } },
      },
    },
  },
  components: {
    schemas: {
      CalculateRequest: {
        type: 'object',
        required: ['birthDate', 'birthTime', 'gender'],
        properties: {
          birthDate: { type: 'string', format: 'date', description: 'Birth date in YYYY-MM-DD format', example: '1990-05-15' },
          birthTime: { type: 'string', description: 'Birth time in HH:MM format (24h)', example: '14:30' },
          gender: { type: 'string', enum: ['male', 'female'], description: 'Gender for Zi Wei calculations' },
          longitude: { type: 'number', description: 'Birth location longitude (East positive). Default: 121.5 (Taipei)', example: 121.5 },
        },
      },
      UnifiedResult: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            description: 'Contains bazi (Four Pillars) and ziwei (Purple Star) calculation results',
          },
          _hint: { type: 'string', description: 'Guidance for LLM usage' },
        },
      },
    },
  },
};
