import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { extendPrisma } from './prisma.middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });

    // ✅ Apply middleware directly to this instance
    const extended = extendPrisma(this);
    Object.assign(this, extended);
  }

  async onModuleInit() {
    console.log('Connecting to the database...');
    await this.$connect();
    console.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    console.log('Disconnecting from the database...');
    await this.$disconnect();
    console.log('✅ Database disconnected successfully');
  }
}
