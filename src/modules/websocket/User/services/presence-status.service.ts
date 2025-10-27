import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Service for managing user display status in Redis
 * Display status is what the user sets (ONLINE, IDLE, DND)
 * This is different from actual presence status (online/offline based on connection)
 */
@Injectable()
export class PresenceStatusService {
  private redis: Redis;
  private readonly DISPLAY_STATUS_TTL = 86400; // 24 hours

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('CACHE_HOST') || 'localhost',
      port: this.configService.get('CACHE_PORT') || 6379,
      password: this.configService.get('CACHE_PASS'),
    });

    this.redis.on('connect', () => {
      console.log('Presence Status Redis connected');
    });

    this.redis.on('error', (err) => {
      console.error('Presence Status Redis error:', err);
    });
  }

  /**
   * Set user's display status
   * @param userId - User ID
   * @param status - Display status (ONLINE, IDLE, DND, OFFLINE)
   */
  async setDisplayStatus(userId: string, status: string): Promise<void> {
    const key = `display:status:${userId}`;
    await this.redis.setex(key, this.DISPLAY_STATUS_TTL, status);
  }

  /**
   * Get user's display status
   * @param userId - User ID
   * @returns Display status or null if not set
   */
  async getDisplayStatus(userId: string): Promise<string | null> {
    const key = `display:status:${userId}`;
    return await this.redis.get(key);
  }

  /**
   * Remove user's display status (cleanup on logout)
   * @param userId - User ID
   */
  async removeDisplayStatus(userId: string): Promise<void> {
    const key = `display:status:${userId}`;
    await this.redis.del(key);
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}

