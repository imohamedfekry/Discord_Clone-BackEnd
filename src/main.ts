import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppBootstrap } from './common/bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Bootstrap the application
  const { serverInfo } = await AppBootstrap.bootstrap(app as any);
  
  // Start the server
  await app.listen(serverInfo.port);
  
  // Log server information
  AppBootstrap.logServerInfo(serverInfo);
}

bootstrap();