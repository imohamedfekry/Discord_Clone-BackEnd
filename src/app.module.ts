import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './common/config/env.validation';
import { DatabaseModule } from './common/database/database.module';
import jwtConfig from './common/config/jwt.config';
import databaseConfig from './common/config/database.config';
import mainConfig from './common/config/main.config';
import { RedisService } from './common/cache/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      load: [databaseConfig, jwtConfig, mainConfig],
    }),
    DatabaseModule,

  ],
  controllers: [],
  providers: [RedisService],
  exports: [RedisService],
  
})
export class AppModule {}
