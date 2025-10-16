import { z } from 'zod';

const zodSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.coerce.number().default(3000),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  JWT_SECRET_ACCESS: z.string().default('your-super-secret-jwt-key-here'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_SECRET_REFRESH: z.string().default('your-super-secret-refresh-key-here'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().optional(),
  DB_PASS: z.string().optional(),
  DB_NAME: z.string().optional(),
  PEPPER: z.string().default('your-super-secret-pepper-here'),
  ENCRYPTION_KEY: z.string().default('your-super-secret-encryption-key-here'),
  ENCRYPTION_ALGORITHM: z.string().default('aes-256-cbc'),
  ENCRYPTION_IV: z.string().default('12547896325489JH'),
  CACHE_HOST: z.string().default('localhost'),
  CACHE_PORT: z.coerce.number().default(6379),
  CACHE_PASS: z.string().optional(),

  EMAIL_HOST: z.string().default('localhost'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_SECURE: z.coerce.boolean().default(false),
  EMAIL_USER: z.string().default(''),
  EMAIL_PASS: z.string().default(''),
  EMAIL_FROM: z.string().default('noreply@example.com'),
});

// Create a Joi-compatible validation function for NestJS
export const envValidationSchema = {
  validate: (env: any) => {
    try {
      const result = zodSchema.parse(env);
      return { error: null, value: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            details: error.issues.map(err => ({
              message: err.message,
              path: err.path.join('.'),
            })),
          },
          value: null,
        };
      }
      throw error;
    }
  },
};