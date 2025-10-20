import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestApplication } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

export class SwaggerConfig {
  static setupSwagger(app: NestApplication, configService: ConfigService) {
    const config = new DocumentBuilder()
      .setTitle(configService.get('app.swagger.title') || 'Discord Clone API')
      .setDescription(configService.get('app.swagger.description') || 'Discord Clone Backend API Documentation')
      .setVersion(configService.get('app.swagger.version') || '1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const swaggerPath = configService.get('app.swagger.path') || 'api/docs';
    
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true,
      },
    });

    return {
      path: swaggerPath,
      document,
    };
  }
}
