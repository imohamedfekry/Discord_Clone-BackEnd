import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import CatchAllFilter from './common/filters/catchAll.filter';
import CustomHttpException from './common/filters/customHttpException.filter';
async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  // Set global prefix for all routes
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
      stopAtFirstError: true,
      transform: true,
      validateCustomDecorators: true,
    }),
  );
  app.useGlobalFilters(new CatchAllFilter(), new CustomHttpException());
  const config = new DocumentBuilder()
  .setTitle('Discord Clone API')
  .setDescription('Discord Clone Backend API Documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('main.PORT') ?? 3000;
  await app.listen(port ?? 3000);
  console.log(`🚀 Server is running on port ${port ?? 3000}`);
  console.log(`🌍 Environment: ${configService.get<string>('main.NODE_ENV') ?? 'development'}`);
  console.log(`📚 API Documentation: http://localhost:${port ?? 3000}/api/docs`);
  console.log(`🔗 API Base URL: http://localhost:${port ?? 3000}/api/v1`);
}
bootstrap();