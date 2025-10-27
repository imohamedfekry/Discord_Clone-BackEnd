import { Module, Global } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from '../database/database.module';
import { RedisService } from './cache/redis.service';
import { JwtHelper } from './security';
import { PresenceService } from '../presence/presence.service';
import CatchAllFilter from '../filters/catchAll.filter';
import CustomHttpException from '../filters/customHttpException.filter';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { snowflake } from '../utils/snowflake';
import { ValidationUtil } from '../utils/validation.util';
import { UserRepository } from '../database/repositories/user.repository';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    DatabaseModule,
  ],
  providers: [
    RedisService,
    JwtService,
    PresenceService,
    {
      provide: JwtHelper,
      useFactory: (jwtService: JwtService, userRepository: UserRepository, configService: ConfigService) => {
        return new JwtHelper(jwtService, userRepository, configService);
      },
      inject: [JwtService, UserRepository, ConfigService],
    },
    {
      provide: 'SNOWFLAKE',
      useValue: snowflake,
    },
    {
      provide: 'VALIDATION_UTIL',
      useValue: ValidationUtil,
    },
    {
      provide: APP_FILTER,
      useClass: CatchAllFilter,
    },
    {
      provide: APP_FILTER,
      useClass: CustomHttpException,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  exports: [RedisService, JwtService, JwtHelper, PresenceService, 'SNOWFLAKE', 'VALIDATION_UTIL'],
})
export class GlobalModule {}
