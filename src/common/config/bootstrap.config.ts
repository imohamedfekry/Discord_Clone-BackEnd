import { NestApplication } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CatchAllFilter from '../filters/catchAll.filter';
import CustomHttpException from '../filters/customHttpException.filter';
import { BigIntInterceptor } from '../Global/Interceptors/BigInt.interceptors';
import cookieParser from 'cookie-parser';

export class BootstrapConfig {
  static async configureApp(app: NestApplication, configService: ConfigService) {
    // Enable CORS
    app.enableCors({
      origin: configService.get('app.cors.origin') || '*',
      methods: configService.get('app.cors.methods') || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: configService.get('app.cors.credentials') || true,
    });

    // Set global prefix
    app.setGlobalPrefix(configService.get('app.apiPrefix') || 'api');

    // Configure validation pipes
    this.configureValidationPipes(app);

    // Configure global filters and interceptors
    this.configureGlobalFilters(app);
    this.configureGlobalInterceptors(app);

    // Enable versioning
    this.configureVersioning(app);

    // Use cookie parser middleware
    this.configureCookieParser(app);
  }

  private static configureValidationPipes(app: NestApplication) {
    const validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
      stopAtFirstError: true,
      transform: true,
      validateCustomDecorators: true,
    });

    app.useGlobalPipes(validationPipe);
  }

  private static configureGlobalFilters(app: NestApplication) {
    app.useGlobalFilters(new CatchAllFilter(), new CustomHttpException());
  }

  private static configureGlobalInterceptors(app: NestApplication) {
    app.useGlobalInterceptors(new BigIntInterceptor());
  }

  private static configureVersioning(app: NestApplication) {
    app.enableVersioning({
      type: VersioningType.URI,
    });
  }
  // configure cookie parser middleware
    private static configureCookieParser(app: NestApplication) {
    app.use(cookieParser());
  }

  static getServerInfo(configService: ConfigService) {
    const port = configService.get('app.port');
    const nodeEnv = configService.get('app.nodeEnv');
    const apiPrefix = configService.get('app.apiPrefix');
    const apiVersion = configService.get('app.apiVersion');
    const swaggerPath = configService.get('app.swagger.path');

    return {
      port,
      nodeEnv,
      apiUrl: `http://localhost:${port}/${apiPrefix}/${apiVersion}`,
      swaggerUrl: `http://localhost:${port}/${swaggerPath}`,
    };
  }
}
