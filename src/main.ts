import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { snowflake } from './common/utils/snowflake';
import { UserRepository } from './common/database/repositories/user.repository';
import { Prisma } from '@prisma/client';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
  const config = new DocumentBuilder()
  .setTitle('My API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('main.PORT') ?? 3000;
  await app.listen(port ?? 3000);
  console.log(`Server is running on port ${port ?? 3000}`);
  console.log(`Server is running on ${configService.get<string>('main.NODE_ENV') ?? 'development'} environment`);
  // const user = await app.get(UserRepository).create({
  //   username: 'test',
  //   email: 'test@test.com',
  //   password: 'test',
  //   phone: '1234567890',
  // } as Prisma.UserCreateInput);
  // console.log(`User created: ${user.username}`);
}
bootstrap();