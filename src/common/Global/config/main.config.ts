// JWT configuration
import { registerAs } from '@nestjs/config';

export default registerAs('main', () => ({
    // enviroment variables
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
}));

