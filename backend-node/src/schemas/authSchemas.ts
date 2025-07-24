import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '請輸入有效的電子郵件地址',
    'any.required': '電子郵件為必填項目'
  }),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.min': '密碼至少需要8個字符',
    'string.pattern.base': '密碼必須包含大小寫字母和數字',
    'any.required': '密碼為必填項目'
  }),
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': '姓名至少需要2個字符',
    'string.max': '姓名不能超過50個字符',
    'any.required': '姓名為必填項目'
  }),
  timezone: Joi.string().optional().default('Asia/Taipei')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '請輸入有效的電子郵件地址',
    'any.required': '電子郵件為必填項目'
  }),
  password: Joi.string().required().messages({
    'any.required': '密碼為必填項目'
  })
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  timezone: Joi.string().optional(),
  preferences: Joi.object({
    language: Joi.string().valid('zh_TW', 'zh', 'en').optional(),
    displayMode: Joi.string().valid('compact', 'detailed', 'expert').optional(),
    notifications: Joi.boolean().optional(),
    theme: Joi.string().valid('light', 'dark').optional()
  }).optional()
});