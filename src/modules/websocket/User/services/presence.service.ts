import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { User, UserStatus } from '@prisma/client';
import {
  AuthenticatedSocket,
  StatusUpdateData,
  WebSocketEvents,
} from '../../../../common/Types/socket.types';
import type { SocketMetadata } from '../../../../common/Types/socket.types';
import { UserPresenceDto } from '../../../../common/Types/presence.dto';
import { PresenceRepository } from 'src/common/database/repositories';
import { FriendsCacheService } from '../../../../common/Global/cache/User/friends-cache.service';
import { AuthService } from '../auth/auth.service';
import { BroadcasterService } from '../presence/broadcaster.service';
import { ProfileNotifierService } from '../profile/profile.notifier.service';

@Injectable()
export class PresenceService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(PresenceService.name);
  private readonly PRESENCE_TTL = 90;
  private readonly DISPLAY_STATUS_TTL = 86400;

  constructor(
    configService: ConfigService,
    private readonly presenceRepository: PresenceRepository,
    private readonly broadcaster: BroadcasterService,
    private readonly friendsCache: FriendsCacheService,
    private readonly authService: AuthService,
    private readonly profileNotifier: ProfileNotifierService,
  ) {
    this.redis = new Redis({
      host: configService.get('CACHE_HOST') ?? 'localhost',
      port: configService.get('CACHE_PORT') ?? 6379,
      password: configService.get('CACHE_PASS'),
    });
    this.redis.on('connect', () => this.logger.log('Presence Redis connected'));
    this.redis.on('error', (err) => this.logger.error('Presence Redis error', err));
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async markOnline(
    userId: string | bigint,
    socketId: string,
    metadata: Partial<SocketMetadata> = {},
  ): Promise<{ displayStatus: UserStatus }> {
    const idStr = userId.toString();
    const dbPresence = await this.presenceRepository.getPresenceByUserId(userId);
    const displayStatus = dbPresence?.status ?? UserStatus.ONLINE;

    if (displayStatus !== UserStatus.INVISIBLE) {
      await this.setDisplayStatus(idStr, displayStatus);
    }

    const socketKey = `presence:${idStr}:${socketId}`;
    const socketsSetKey = `presence:sockets:${idStr}`;
    const onlineKey = `presence:online:${idStr}`;

    const now = new Date().toISOString();
    await this.redis.hset(socketKey, {
      device: metadata.device ?? 'unknown',
      connectedAt: metadata.connectedAt?.toISOString() ?? now,
      ip: metadata.ip ?? '',
      userAgent: metadata.userAgent ?? '',
      lastPing: now,
    });
    await this.redis.expire(socketKey, this.PRESENCE_TTL);
    await this.redis.sadd(socketsSetKey, socketId);
    await this.redis.expire(socketsSetKey, this.PRESENCE_TTL);

    const socketCount = await this.redis.scard(socketsSetKey);
    if (socketCount === 1) {
      if (displayStatus !== UserStatus.INVISIBLE) {
        await this.redis.setex(onlineKey, this.PRESENCE_TTL, 'true');
      }
    
      await this.redis.xadd(
        'presence:stream',
        '*',
        'userId', idStr,
        'status', displayStatus,
        'socketId', socketId,
      );
    }

    return { displayStatus };
  }

  async markOffline(userId: string, socketId: string): Promise<void> {
    const socketKey = `presence:${userId}:${socketId}`;
    const socketsSetKey = `presence:sockets:${userId}`;
    const onlineKey = `presence:online:${userId}`;

    await this.redis.del(socketKey);
    await this.redis.srem(socketsSetKey, socketId);

    const count = await this.redis.scard(socketsSetKey);
    if (count === 0) {
      await this.redis.del(onlineKey);
      await this.redis.xadd(
        'presence:stream',
        '*',
        'userId', userId,
        'status', UserStatus.INVISIBLE,
        'socketId', socketId,
      );
    }
  }

  async isOnline(userId: string): Promise<boolean> {
    return (await this.redis.get(`presence:online:${userId}`)) === 'true';
  }

  async getSocketCount(userId: string): Promise<number> {
    return this.redis.scard(`presence:sockets:${userId}`);
  }

  async getOnlineUsersCount(): Promise<number> {
    const keys = await this.redis.keys('presence:online:*');
    if (keys.length === 0) return 0;
    const values = await this.redis.mget(...keys);
    return values.filter((v) => v === 'true').length;
  }

  async setDisplayStatus(userId: string, status: UserStatus): Promise<void> {
    await this.redis.setex(`display:status:${userId}`, this.DISPLAY_STATUS_TTL, status);
  }

  async getDisplayStatus(userId: string): Promise<UserStatus | null> {
    return (await this.redis.get(`display:status:${userId}`)) as UserStatus | null;
  }

  async getPresenceStatus(userId: string): Promise<{
    isOnline: boolean;
    displayStatus: UserStatus;
    actualStatus: UserStatus;
  }> {
    const [isOnlineValue, displayStatusValue] = await this.redis.mget(
      `presence:online:${userId}`,
      `display:status:${userId}`,
    );
    const isOnline = isOnlineValue === 'true';
    const displayStatus = displayStatusValue as UserStatus | null;
    const actualStatus = !isOnline
      ? UserStatus.INVISIBLE
      : displayStatus ?? UserStatus.ONLINE;

    return {
      isOnline,
      displayStatus: displayStatus ?? UserStatus.ONLINE,
      actualStatus,
    };
  }

  async getBatchPresence(userIds: string[]): Promise<UserPresenceDto[]> {
    if (!userIds?.length) return [];

    const pipeline = this.redis.pipeline();
    for (const id of userIds) {
      pipeline.get(`presence:online:${id}`);
      pipeline.get(`display:status:${id}`);
    }
    const results = await pipeline.exec();
    return userIds.map((userId, i) => {
      const isOnlineVal = results?.[i * 2]?.[1] as string | null;
      const displayVal = results?.[i * 2 + 1]?.[1] as string | null;
      const isOnline = isOnlineVal === 'true';
      const displayStatus = (displayVal as UserStatus | null) ?? UserStatus.ONLINE;
      const status = isOnline ? displayStatus : UserStatus.INVISIBLE;
      return { userId, status, lastSeen: null };
    });
  }

  async removeDisplayStatus(userId: string): Promise<void> {
    await this.redis.del(`display:status:${userId}`);
  }

  async updatePresenceStatus(
    userId: string,
    _username: string,
    status: UserStatus,
    updateDisplay = true,
  ): Promise<void> {
    let presence = await this.presenceRepository.getPresenceByUserId(userId);
    if (!presence) {
      presence = await this.presenceRepository.createPresence(userId);
    }
    await this.presenceRepository.updateStatus(presence.id, status);
    if (updateDisplay) await this.setDisplayStatus(userId, status);
    this.broadcaster.sendToUserStd(userId, WebSocketEvents.STATUS_UPDATED, 'Status updated', {
      userId,
      status,
    });
  }

  async handleUserOffline(userId: string, username: string , user : User): Promise<void> {
 
    this.logger.log(`User ${userId} (${username}) disconnected`);
  }

  async handleManualStatusUpdate(
    userId: string,
    username: string,
    status: UserStatus,
  ): Promise<void> {
    await this.updatePresenceStatus(userId, username, status, true);
  }

  async handleStatusUpdate(
    client: AuthenticatedSocket,
    data: StatusUpdateData,
  ): Promise<void> {
    const user = this.authService.getUserFromClient(client);
    if (!user) return;
    await this.handleManualStatusUpdate(String(user.id), user.username, data.status as UserStatus);
    this.logger.log(`User ${user.id} set display status to ${data.status}`);
  }

  async handleGetStatus(client: AuthenticatedSocket): Promise<void> {
    const user = this.authService.getUserFromClient(client);
    if (!user) return;
    const presence = await this.getPresenceStatus(String(user.id));
    client.emit(WebSocketEvents.STATUS_CURRENT, {
      connectionStatus: presence.isOnline ? UserStatus.ONLINE : UserStatus.INVISIBLE,
      displayStatus: presence.displayStatus,
      actualStatus: presence.actualStatus,
    });
  }
}
