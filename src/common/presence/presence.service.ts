import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { SocketMetadata, PresenceStatus } from './presence.types';

@Injectable()
export class PresenceService {
  private redis: Redis;
  private readonly PRESENCE_TTL = 90; // 90 seconds
  private readonly PING_TIMEOUT = 30000; // 30 seconds

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('CACHE_HOST'),
      port: this.configService.get('CACHE_PORT'),
      password: this.configService.get('CACHE_PASS'),
    });

    this.redis.on('connect', () => {
      console.log('Presence Redis connected');
    });

    this.redis.on('error', (err) => {
      console.error('Presence Redis error:', err);
    });
  }

  /**
   * Mark user as online with socket connection
   * Uses Redis Hash for socket metadata
   */
  async markOnline(
    userId: string,
    socketId: string,
    metadata: Partial<SocketMetadata> = {},
  ): Promise<void> {
    const socketKey = `presence:${userId}:${socketId}`;
    const socketsSetKey = `presence:sockets:${userId}`;
    const onlineKey = `presence:online:${userId}`;

    // Store socket metadata as Hash (more memory efficient)
    await this.redis.hset(socketKey, {
      device: metadata.device || 'unknown',
      connectedAt: metadata.connectedAt?.toISOString() || new Date().toISOString(),
      ip: metadata.ip || '',
      userAgent: metadata.userAgent || '',
      lastPing: new Date().toISOString(),
    });

    // Set TTL on socket key
    await this.redis.expire(socketKey, this.PRESENCE_TTL);

    // Add socketId to set
    await this.redis.sadd(socketsSetKey, socketId);
    await this.redis.expire(socketsSetKey, this.PRESENCE_TTL);

    // Mark user as online with TTL
    const socketCount = await this.redis.scard(socketsSetKey);
    if (socketCount === 1) {
      // First connection, mark as online
      await this.redis.setex(onlineKey, this.PRESENCE_TTL, 'true');

      // Publish presence update via Redis Stream for other instances
      // This allows other server instances to know about user online status
      await this.redis.xadd('presence:stream', '*', 
        'userId', userId,
        'status', PresenceStatus.ONLINE,
        'socketId', socketId,
        'timestamp', new Date().toISOString()
      );
    }
  }

  /**
   * Optimized cleanup: Remove socket and check if user is still online
   */
  async markOffline(userId: string, socketId: string): Promise<void> {
    const socketKey = `presence:${userId}:${socketId}`;
    const socketsSetKey = `presence:sockets:${userId}`;
    const onlineKey = `presence:online:${userId}`;

    // Remove socket metadata
    await this.redis.del(socketKey);

    // Remove socketId from set
    await this.redis.srem(socketsSetKey, socketId);

    // Check if user has any remaining connections
    const count = await this.redis.scard(socketsSetKey);

    if (count === 0) {
      // No more connections, remove online status
      await this.redis.del(onlineKey);

      // Publish presence update via Redis Stream for other instances
      await this.redis.xadd('presence:stream', '*',
        'userId', userId,
        'status', PresenceStatus.OFFLINE,
        'socketId', socketId,
        'timestamp', new Date().toISOString()
      );
    }
  }

  /**
   * Check if user is online
   */
  async isOnline(userId: string): Promise<boolean> {
    const isOnline = await this.redis.get(`presence:online:${userId}`);
    return isOnline === 'true';
  }
  /**
   * Get socket count for user
   */
  async getSocketCount(userId: string): Promise<number> {
    const socketsSetKey = `presence:sockets:${userId}`;
    return await this.redis.scard(socketsSetKey);
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
