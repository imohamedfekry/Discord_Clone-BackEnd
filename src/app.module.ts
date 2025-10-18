import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GlobalModule } from './common/Global/global.module';
import databaseConfig from './common/Global/config/database.config';
import jwtConfig from './common/Global/config/jwt.config';
import mainConfig from './common/Global/config/main.config';
import { envValidationSchema } from './common/Global/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      load: [databaseConfig, jwtConfig, mainConfig],
    }),
    GlobalModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
