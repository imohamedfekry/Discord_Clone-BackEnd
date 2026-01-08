import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { FriendsCacheService } from '../../../../common/Global/cache/User/friends-cache.service';
import { AuthService } from '../auth/auth.service';
import { AuthenticatedSocket, StatusUpdateData, WebSocketEvents } from '../../../../common/Types/websocket.types';
import type { SocketMetadata } from '../../../../common/Types/websocket.types';
import { BroadcasterService } from '../presence/broadcaster.service';
import { UserRepository, PresenceRepository, UserStatusRecordRepository } from 'src/common/database/repositories';
import { UserStatus } from '@prisma/client';
import { UserPresenceDto } from '../../../../common/Types/presence.dto';

/**
 * Unified Presence Service
 * Single service that handles ALL presence-related functionality:
 * - Connection/disconnection tracking (Redis)
 * - Display status management (Redis)
 * - Database updates
 * - WebSocket broadcasting to friends
 * - WebSocket event handling
 */
@Injectable()
export class UnifiedPresenceService implements OnModuleDestroy {
  private redis: Redis;
  private readonly logger = new Logger(UnifiedPresenceService.name);

  // Redis TTL settings
  private readonly PRESENCE_TTL = 90; // 90 seconds for connection tracking
  private readonly DISPLAY_STATUS_TTL = 86400; // 24 hours for display status

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly presenceRepository: PresenceRepository,
    private readonly statusRecordRepository: UserStatusRecordRepository,
    private readonly broadcaster: BroadcasterService,
    private readonly friendsCache: FriendsCacheService,
    private readonly authService: AuthService,
  ) {
    this.redis = new Redis({
      host: this.configService.get('CACHE_HOST') || 'localhost',
      port: this.configService.get('CACHE_PORT') || 6379,
      password: this.configService.get('CACHE_PASS'),
    });

    this.redis.on('connect', () => {
      this.logger.log('Unified Presence Redis connected');
    });

    this.redis.on('error', (err) => {
      this.logger.error('Unified Presence Redis error:', err);
    });
  }

  // ==================== CONNECTION TRACKING ====================

  /**
   * Mark user as online with socket connection
   */
  async markOnline(
    userId: string,
    socketId: string,
    metadata: Partial<SocketMetadata> = {},
  ): Promise<void> {
    const socketKey = `presence:${userId}:${socketId}`;
    const socketsSetKey = `presence:sockets:${userId}`;
    const onlineKey = `presence:online:${userId}`;

    // Store socket metadata
    await this.redis.hset(socketKey, {
      device: metadata.device || 'unknown',
      connectedAt: metadata.connectedAt?.toISOString() || new Date().toISOString(),
      ip: metadata.ip || '',
      userAgent: metadata.userAgent || '',
      lastPing: new Date().toISOString(),
    });

    await this.redis.expire(socketKey, this.PRESENCE_TTL);
    await this.redis.sadd(socketsSetKey, socketId);
    await this.redis.expire(socketsSetKey, this.PRESENCE_TTL);

    // Check if this is the first connection
    const socketCount = await this.redis.scard(socketsSetKey);
    if (socketCount === 1) {
      await this.redis.setex(onlineKey, this.PRESENCE_TTL, 'true');
      // Publish to Redis Stream for other instances
      await this.redis.xadd('presence:stream', '*',
        'userId', userId,
        'status', UserStatus.ONLINE,
        'socketId', socketId,
        'timestamp', new Date().toISOString()
      );
    }

    // Pub/Sub broadcast
    await this.publishPresenceUpdate(userId, { event: 'ONLINE', socketId });
  }

  /**
   * Mark user as offline (remove socket)
   */
  async markOffline(userId: string, socketId: string): Promise<void> {
    const socketKey = `presence:${userId}:${socketId}`;
    const socketsSetKey = `presence:sockets:${userId}`;
    const onlineKey = `presence:online:${userId}`;

    await this.redis.del(socketKey);
    await this.redis.srem(socketsSetKey, socketId);

    const count = await this.redis.scard(socketsSetKey);
    if (count === 0) {
      await this.redis.del(onlineKey);
      // Publish to Redis Stream for other instances
      await this.redis.xadd('presence:stream', '*',
        'userId', userId,
        'status', UserStatus.INVISIBLE,
        'socketId', socketId,
        'timestamp', new Date().toISOString()
      );
    }

    // Pub/Sub broadcast
    await this.publishPresenceUpdate(userId, { event: 'OFFLINE', socketId });
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
   * Get count of online users (users with active socket connections)
   */
  async getOnlineUsersCount(): Promise<number> {
    // Get all keys matching presence:online:*
    const pattern = 'presence:online:*';
    const keys = await this.redis.keys(pattern);

    // Count how many are actually set to 'true'
    if (keys.length === 0) return 0;

    const values = await this.redis.mget(...keys);
    return values.filter(v => v === 'true').length;
  }

  // ==================== DISPLAY STATUS MANAGEMENT ====================

  /**
   * Set user's display status (ONLINE, IDLE, DND)
   */
  async setDisplayStatus(userId: string, status: UserStatus): Promise<void> {
    const key = `display:status:${userId}`;
    await this.redis.setex(key, this.DISPLAY_STATUS_TTL, status);
  }

  /**
   * Get user's display status
   */
  async getDisplayStatus(userId: string): Promise<UserStatus | null> {
    const key = `display:status:${userId}`;
    return await this.redis.get(key) as UserStatus | null;
  }

  /**
   * Get complete presence status (connection + display status)
   * Optimized: Uses MGET for single Redis round-trip instead of 2 separate calls
   */
  async getPresenceStatus(userId: string): Promise<{
    isOnline: boolean;
    displayStatus: UserStatus;
    actualStatus: UserStatus;
  }> {
    // Optimized: Fetch both values in a single Redis round-trip using MGET
    const [isOnlineValue, displayStatusValue] = await this.redis.mget(
      `presence:online:${userId}`,
      `display:status:${userId}`
    );

    const isOnline = isOnlineValue === 'true';
    const displayStatus = displayStatusValue as UserStatus | null;

    // Determine actual status
    // If offline → status is OFFLINE
    // If online → use display status or default to ONLINE
    const actualStatus = !isOnline
      ? UserStatus.INVISIBLE
      : (displayStatus || UserStatus.ONLINE);

    return {
      isOnline,
      displayStatus: displayStatus || UserStatus.INVISIBLE,
      actualStatus,
    };
  }

  /**
   * Batch presence lookup using Redis pipeline
   * Returns presence snapshot suitable for friend lists or guild members
   */
  async getBatchPresence(userIds: string[]): Promise<UserPresenceDto[]> {
    if (!userIds || userIds.length === 0) return [];

    const pipeline = this.redis.pipeline();
    for (const id of userIds) {
      pipeline.get(`presence:online:${id}`);
      pipeline.get(`display:status:${id}`);
    }
    const execResults = await pipeline.exec();
    // results is array of [err, value]; pair per user (online, display)
    const presences: UserPresenceDto[] = [];
    for (let i = 0; i < userIds.length; i++) {
      const onlineIdx = i * 2;
      const displayIdx = i * 2 + 1;
      const isOnlineVal = execResults?.[onlineIdx]?.[1] as string | null;
      const displayVal = execResults?.[displayIdx]?.[1] as string | null;
      const isOnline = isOnlineVal === 'true';
      const displayStatus = (displayVal as UserStatus | null) || UserStatus.INVISIBLE;
      const status: UserStatus = isOnline ? (displayStatus || UserStatus.ONLINE) : UserStatus.INVISIBLE;
      presences.push({ userId: userIds[i], status, lastSeen: null });
    }
    return presences;
  }

  // Publish presence updates to Redis Pub/Sub
  private async publishPresenceUpdate(userId: string, payload: any) {
    try {
      await this.redis.publish('presence:updates', JSON.stringify({ userId, ...payload }));
    } catch { }
  }

  // (Removed duplicate alternative markOnline/markOffline implementation)

  /**
   * Remove user's display status
   */
  async removeDisplayStatus(userId: string): Promise<void> {
    const key = `display:status:${userId}`;
    await this.redis.del(key);
  }

  // ==================== PRESENCE UPDATES & BROADCASTING ====================

  /**
   * Update user presence status and broadcast to friends
   * This is ONLY for display status changes (IDLE, DND, etc.) - NOT for connection status
   */
  async updatePresenceStatus(
    userId: string,
    username: string,
    status: UserStatus,
    updateDisplayStatus: boolean = true,
  ): Promise<void> {
    try {
      // Get or create presence record for user
      let presence = await this.presenceRepository.getPresenceByUserId(userId);
      if (!presence) {
        presence = await this.presenceRepository.createPresence(userId);
      }

      // Update presence status directly
      await this.presenceRepository.updateStatus(presence.id, status as UserStatus);

      // Update display status in Redis if requested
      if (updateDisplayStatus) {
        await this.setDisplayStatus(userId, status);
      }

      // Broadcast to user's room via WebSocket (all their devices)
      this.broadcaster.sendToUserStd(
        userId,
        WebSocketEvents.STATUS_UPDATED,
        'Status updated',
        { userId, status },
      );

      // Get friends list from cache and broadcast to them
      const friendsIds = await this.friendsCache.getFriends(userId);

      friendsIds.forEach(friendId => {
        this.broadcaster.sendToUserStd(
          friendId,
          WebSocketEvents.PRESENCE_UPDATED,
          'Presence updated',
          { userId, username, status },
        );
      });

      this.logger.log(`User ${userId} (${username}) display status updated to ${status} - notified ${friendsIds.length} friends`);
    } catch (error) {
      this.logger.error(`Error updating presence for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle connection - mark user as online and notify friends
   * This only updates connection status, not display status
   */
  async handleUserOnline(userId: string, username: string): Promise<void> {
    // Only update connection status - don't change display status
    // The user's display status remains whatever it was before
    this.logger.log(`User ${userId} (${username}) connected - connection status updated`);
  }

  /**
   * Handle disconnection - mark user as offline and notify friends
   * This only updates connection status, not display status
   */
  async handleUserOffline(userId: string, username: string): Promise<void> {
    // Only update connection status - don't change display status
    // The user's display status remains whatever it was before
    this.logger.log(`User ${userId} (${username}) disconnected - connection status updated`);
  }

  /**
   * Handle manual status update (IDLE, DND, etc.) - update display status and notify friends
   * This is separate from connection status
   */
  async handleManualStatusUpdate(userId: string, username: string, status: UserStatus): Promise<void> {
    await this.updatePresenceStatus(userId, username, status, true);
  }

  // ==================== WEBSOCKET EVENT HANDLERS ====================

  /**
   * Handle status update via WebSocket
   */
  async handleStatusUpdate(client: AuthenticatedSocket, data: StatusUpdateData): Promise<void> {
    const user = this.authService.getUserFromClient(client);
    if (!user) return;

    const { status } = data;
    await this.handleManualStatusUpdate(user.id, user.username, status as UserStatus);
    this.logger.log(`User ${user.id} set display status to ${status}`);
  }

  /**
   * Handle get status request via WebSocket
   */
  async handleGetStatus(client: AuthenticatedSocket): Promise<void> {
    const user = this.authService.getUserFromClient(client);
    if (!user) return;

    const presence = await this.getPresenceStatus(user.id);

    client.emit(WebSocketEvents.STATUS_CURRENT, {
      connectionStatus: presence.isOnline ? UserStatus.ONLINE : UserStatus.INVISIBLE, // Based on socket connection
      displayStatus: presence.displayStatus, // User's chosen display status
      actualStatus: presence.actualStatus, // Final status to display (OFFLINE if disconnected, else display status)
    });
  }

  /**
   * Handle deprecated presence update (for backward compatibility)
   */
  async handlePresenceUpdate(client: AuthenticatedSocket, data: StatusUpdateData): Promise<void> {
    const user = this.authService.getUserFromClient(client);
    if (!user) return;

    const { status } = data;
    await this.updatePresenceStatus(user.id, user.username, status as UserStatus, true);
    this.logger.warn(`User ${user.id} used deprecated presence:update event`);
  }

  // ==================== CLEANUP ====================

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
