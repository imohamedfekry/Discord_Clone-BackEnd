// JWT configuration
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessToken: {
    secret: process.env.JWT_ACCESS,
    expiresIn: process.env.JWT_EXPIRES_IN || '3d',
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
}));