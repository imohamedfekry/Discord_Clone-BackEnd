import { Module, Global } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { RedisService } from './cache/redis.service';
import { JwtHelper } from './security';
import CatchAllFilter from '../filters/catchAll.filter';
import CustomHttpException from '../filters/customHttpException.filter';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { snowflake } from '../utils/snowflake';
import { ValidationUtil } from '../utils/validation.util';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.JWT_SECRET_ACCESS') || 'default-secret',
        signOptions: {
          expiresIn: '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    RedisService,
    {
      provide: JwtHelper,
      useFactory: (jwtService: JwtService) => new JwtHelper(jwtService),
      inject: [JwtService],
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
  exports: [RedisService, JwtHelper, 'SNOWFLAKE', 'VALIDATION_UTIL'],
})
export class GlobalModule {}
