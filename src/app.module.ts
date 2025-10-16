import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { envValidationSchema } from './common/Global/config/env.validation';
import databaseConfig from './common/Global/config/database.config';
import jwtConfig from './common/Global/config/jwt.config';
import mainConfig from './common/Global/config/main.config';
import { RedisService } from './common/Global/cache/redis.service';


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
