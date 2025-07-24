import Joi from 'joi';

export const baziCalculateSchema = Joi.object({
  birthDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': '出生日期格式應為 YYYY-MM-DD',
    'any.required': '出生日期為必填項目'
  }),
  birthTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
    'string.pattern.base': '出生時間格式應為 HH:MM',
    'any.required': '出生時間為必填項目'
  }),
  gender: Joi.string().valid('male', 'female').required().messages({
    'any.only': '性別必須為 male 或 female',
    'any.required': '性別為必填項目'
  }),
  location: Joi.object({
    name: Joi.string().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    timezone: Joi.string().optional()
  }).required().messages({
    'any.required': '出生地點為必填項目'
  }),
  lunarInfo: Joi.object({
    isLunar: Joi.boolean().default(false),
    leapMonth: Joi.boolean().default(false)
  }).optional()
});

export const baziAnalysisSchema = Joi.object({
  chartData: Joi.object().required().messages({
    'any.required': '命盤資料為必填項目'
  }),
  analysisType: Joi.string().valid('personality', 'career', 'health', 'comprehensive').default('comprehensive')
});