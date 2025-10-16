import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('cache.host'),
      port: this.configService.get<number>('cache.port'),
    });
    this.client.on('connect', () => console.log('Redis connecting...'));
    this.client.on('ready', () => console.log('✅ Redis ready for commands'));
    this.client.on('error', (err) => console.error('❌ Redis error:', err));
    this.client.on('close', () => console.warn('⚠️ Redis connection closed'));  
}

  async onModuleDestroy() {
    await this.client.quit();
    console.log('Redis connection closed');
  }

  // Set value with expiration
  async set(key: string, value: any, ttlSeconds = 3600) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  // Get cached value
  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Delete key
  async del(key: string) {
    await this.client.del(key);
  }
}
