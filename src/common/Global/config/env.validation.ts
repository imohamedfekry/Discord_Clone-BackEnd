import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  PORT: Joi.number().default(3000),

  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  JWT_SECRET_ACCESS: Joi.string().default('your-super-secret-jwt-key-here'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_SECRET_REFRESH: Joi.string().default('your-super-secret-refresh-key-here'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  DATABASE_URL: Joi.string().optional(),
  DB_HOST: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
  DB_PASS: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
  DB_NAME: Joi.string().when('DATABASE_URL', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
  PEPPER: Joi.string().default('your-super-secret-pepper-here'),
  ENCRYPTION_KEY: Joi.string().default('your-super-secret-encryption-key-here'),
  ENCRYPTION_ALGORITHM: Joi.string().default('aes-256-cbc'),
  ENCRYPTION_IV: Joi.string().default('12547896325489JH'),
  CACHE_HOST: Joi.string().default('localhost'),
  CACHE_PORT: Joi.number().default(6379),
  CACHE_PASS: Joi.string().optional(),

  EMAIL_HOST: Joi.string().default('localhost'),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_SECURE: Joi.boolean().default(false),
  EMAIL_USER: Joi.string().default(''),
  EMAIL_PASS: Joi.string().default(''),
  EMAIL_FROM: Joi.string().default('noreply@example.com'),
});
