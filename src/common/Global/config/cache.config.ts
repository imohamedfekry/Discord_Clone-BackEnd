// JWT configuration
import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  host: process.env.CACHE_HOST || 'localhost',
  port: parseInt(process.env.CACHE_PORT ?? '6379', 10),
  password: process.env.CACHE_PASS || '',
}));