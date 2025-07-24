import swaggerJSDoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI 配置
 * 安全措施：隱藏敏感端點，僅暴露公開 API
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '佩璇 - 智能命理分析平台 API',
    version: '1.0.0',
    description: `
      佩璇平台提供多維度命理分析服務，結合傳統八字與紫微斗數。
      
      ## 功能特色
      - 🔄 多術數交互驗證系統
      - 🔐 分層響應設計 (匿名/會員/VIP)
      - 🧠 智能分析模組
      - 🚀 高效能快取系統
      
      ## 安全性
      - JWT 身份驗證
      - 基於角色的存取控制
      - 輸入驗證與過濾
      - 頻率限制保護
    `,
    contact: {
      name: 'API 支援',
      email: 'support@peixuan.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://api.peixuan.com' 
        : 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' 
        ? '生產環境' 
        : '開發環境'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 認證 Token'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['error', 'message'],
        properties: {
          error: {
            type: 'string',
            description: '錯誤類型'
          },
          message: {
            type: 'string',
            description: '錯誤訊息'
          },
          details: {
            type: 'array',
            items: { type: 'string' },
            description: '詳細錯誤資訊'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            description: '回應資料'
          },
          message: {
            type: 'string',
            description: '成功訊息'
          }
        }
      },
      BirthInfo: {
        type: 'object',
        required: ['birthDate', 'birthTime', 'gender'],
        properties: {
          birthDate: {
            type: 'string',
            format: 'date',
            example: '1990-01-01',
            description: '出生日期 (YYYY-MM-DD)'
          },
          birthTime: {
            type: 'string',
            pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
            example: '12:30',
            description: '出生時間 (HH:MM)'
          },
          gender: {
            type: 'string',
            enum: ['male', 'female'],
            description: '性別'
          },
          location: {
            $ref: '#/components/schemas/Location'
          }
        }
      },
      Location: {
        type: 'object',
        required: ['latitude', 'longitude'],
        properties: {
          name: {
            type: 'string',
            example: '台北市',
            description: '地點名稱'
          },
          latitude: {
            type: 'number',
            minimum: -90,
            maximum: 90,
            example: 25.0330,
            description: '緯度'
          },
          longitude: {
            type: 'number',
            minimum: -180,
            maximum: 180,
            example: 121.5654,
            description: '經度'
          },
          timezone: {
            type: 'string',
            example: 'Asia/Taipei',
            description: '時區'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: '用戶 ID'
          },
          email: {
            type: 'string',
            format: 'email',
            description: '電子郵件'
          },
          name: {
            type: 'string',
            description: '用戶姓名'
          },
          membershipLevel: {
            type: 'string',
            enum: ['anonymous', 'member', 'vip'],
            description: '會員等級'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: '建立時間'
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: '未授權存取',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Unauthorized',
              message: '需要有效的認證 Token'
            }
          }
        }
      },
      ForbiddenError: {
        description: '權限不足',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Forbidden',
              message: '權限不足，需要更高等級會員'
            }
          }
        }
      },
      ValidationError: {
        description: '輸入驗證失敗',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Validation Error',
              message: '輸入資料驗證失敗',
              details: ['出生日期格式錯誤', '性別為必填項目']
            }
          }
        }
      },
      RateLimitError: {
        description: '請求頻率超限',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Rate Limit Exceeded',
              message: '請求過多，請稍後再試'
            }
          }
        }
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: '用戶認證相關 API'
    },
    {
      name: 'Users',
      description: '用戶管理相關 API'
    },
    {
      name: 'Purple Star',
      description: '紫微斗數計算 API'
    },
    {
      name: 'BaZi',
      description: '八字分析 API'
    },
    {
      name: 'Astrology Integration',
      description: '命理整合分析 API'
    },
    {
      name: 'History',
      description: '歷史記錄管理 API'
    },
    {
      name: 'System',
      description: '系統狀態和監控 API'
    }
  ]
};

const options: Options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/types/*.ts'
  ]
};

/**
 * 生成 Swagger 規範
 * 安全措施：僅包含公開 API，過濾內部端點
 */
export const swaggerSpec = swaggerJSDoc(options);

/**
 * Swagger UI 配置選項
 * 安全措施：禁用不安全的功能
 */
export const swaggerUiOptions = {
  explorer: false,
  swaggerOptions: {
    persistAuthorization: false,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: process.env.NODE_ENV !== 'production'
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #1f2937; }
  `,
  customSiteTitle: '佩璇 API 文檔'
};