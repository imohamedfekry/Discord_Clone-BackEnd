import { NestApplication } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { BootstrapConfig } from '../config/bootstrap.config';
import { SwaggerConfig } from '../config/swagger.config';
import { VersioningType } from '@nestjs/common';

export class AppBootstrap {
  static async bootstrap(app: NestApplication) {
    const configService = app.get(ConfigService);

    // Configure app
    await BootstrapConfig.configureApp(app, configService);

    // Setup Swagger
    const swagger = SwaggerConfig.setupSwagger(app, configService);

    // Get server info
    const serverInfo = BootstrapConfig.getServerInfo(configService);

    return {
      app,
      configService,
      swagger,
      serverInfo,
    };
  }


  static logServerInfo(serverInfo: any) {
    console.log(`🚀 Server is running on port ${serverInfo.port}`);
    console.log(`🌍 Environment: ${serverInfo.nodeEnv}`);
    console.log(`📚 API Documentation: ${serverInfo.swaggerUrl}`);
    console.log(`🔗 API Base URL: ${serverInfo.apiUrl}`);
  }
}
