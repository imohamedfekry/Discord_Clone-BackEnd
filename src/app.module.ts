import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/v1/users.module';
import { HealthModule } from './modules/health/health.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { GlobalModule } from './common/Global/global.module';
import databaseConfig from './common/Global/config/database.config';
import jwtConfig from './common/Global/config/jwt.config';
import mainConfig from './common/Global/config/main.config';
import { appConfig } from './common/config';
import { envValidationSchema } from './common/Global/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      load: [databaseConfig, jwtConfig, mainConfig, appConfig],
    }),
    GlobalModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    HealthModule,
    WebSocketModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
