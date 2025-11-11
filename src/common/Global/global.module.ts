import { Module, Global } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from '../database/database.module';
import { RedisService } from './cache/redis.service';
import { JwtHelper } from './security';
import CatchAllFilter from '../filters/catchAll.filter';
import CustomHttpException from '../filters/customHttpException.filter';
import { snowflake } from '../utils/snowflake';
import { ValidationUtil } from '../utils/validation.util';
import { UserRepository } from 'src/common/database/repositories';
import { ConfigModule } from '@nestjs/config';
import { ResponseInterceptor } from '../interceptors/response.interceptor';

@Global()
@Module({
  imports: [
    DatabaseModule,
  ],
  providers: [
    RedisService,
    JwtService,
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
      useClass: ResponseInterceptor,
    },
  ],
  exports: [RedisService, JwtService, JwtHelper, 'SNOWFLAKE', 'VALIDATION_UTIL'],
})
export class GlobalModule {}
