import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Friends Cache Service
 * Manages friends list in Redis for efficient real-time updates
 * Stores: friends:{userId} -> Set of friend IDs
 */
@Injectable()
export class FriendsCacheService implements OnModuleDestroy {
  private redis: Redis;
  private readonly FRIENDS_TTL = 86400; // 24 hours
  private readonly logger = new Logger(FriendsCacheService.name);

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('CACHE_HOST') || 'localhost',
      port: this.configService.get('CACHE_PORT') || 6379,
      password: this.configService.get('CACHE_PASS'),
    });

    this.redis.on('connect', () => {
      this.logger.log('Friends Cache Redis connected');
    });

    this.redis.on('error', (err) => {
      this.logger.error('Friends Cache Redis error:', err);
    });
  }

  /**
   * Add friend to cache
   * When user1 adds user2 as friend, both are added to each other's set
   */
  async addFriend(userId1: string, userId2: string): Promise<void> {
    const key1 = `friends:${userId1}`;
    const key2 = `friends:${userId2}`;

    await Promise.all([
      this.redis.sadd(key1, userId2),
      this.redis.sadd(key2, userId1),
      this.redis.expire(key1, this.FRIENDS_TTL),
      this.redis.expire(key2, this.FRIENDS_TTL),
    ]);
  }

  /**
   * Remove friend from cache
   */
  async removeFriend(userId1: string, userId2: string): Promise<void> {
    const key1 = `friends:${userId1}`;
    const key2 = `friends:${userId2}`;

    await Promise.all([
      this.redis.srem(key1, userId2),
      this.redis.srem(key2, userId1),
    ]);
  }

  /**
   * Get user's friends list from cache
   */
  async getFriends(userId: string): Promise<string[]> {
    const key = `friends:${userId}`;
    const friends = await this.redis.smembers(key);
    console.log('friends', friends);
    console.log('key', key);
    return friends || [];
  }

  /**
   * Check if two users are friends (cached)
   */
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const key = `friends:${userId1}`;
    const isMember = await this.redis.sismember(key, userId2);
    return isMember === 1;
  }

  /**
   * Invalidate cache for a user (clear their friends list)
   */
  async invalidateCache(userId: string): Promise<void> {
    const key = `friends:${userId}`;
    await this.redis.del(key);
  }

  /**
   * Get all users who have a specific user in their friends list
   * Useful for broadcasting updates to all friends
   */
  async getUsersWhoseFriend(userId: string): Promise<string[]> {
    const pattern = `friends:*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length === 0) return [];

    const results: string[] = [];
    
    // Check each key to see if it contains this userId
    for (const key of keys) {
      const isMember = await this.redis.sismember(key, userId);
      if (isMember === 1) {
        // Extract userId from key (friends:userId)
        const friendOfUserId = key.replace('friends:', '');
        results.push(friendOfUserId);
      }
    }

    return results;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}

