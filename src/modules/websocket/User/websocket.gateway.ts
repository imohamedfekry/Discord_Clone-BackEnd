import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import { WSAuth } from '../../../common/decorators/websocket-auth.decorator';
import { ConnectionHandlerService } from './auth/connection.handler';
import { UnifiedPresenceService } from './services/unified-presence.service';
import { BroadcasterService } from './presence/broadcaster.service';
import { FriendsService } from './friends/friends.service';
import { FriendsCacheService } from '../../../common/Global/cache/User/friends-cache.service';
import { Events } from '../../../common/constants/events.constants';
import { UserPresenceDto } from '../../../common/Types/presence.dto';
import {
  AuthenticatedSocket,
  StatusUpdateData,
  WebSocketMessages,
} from '../../../common/Types/websocket.types';

/**
 * WebSocket Gateway Service
 * Main orchestrator for WebSocket functionality
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class WebSocketGatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGatewayService.name);
  private presenceSubscriber: Redis;

  constructor(
    private readonly connectionHandler: ConnectionHandlerService,
    private readonly presenceService: UnifiedPresenceService,
    private readonly broadcaster: BroadcasterService,
    private readonly friendsService: FriendsService,
    private readonly friendsCache: FriendsCacheService,
  ) {}

  /**
   * Initialize gateway
   */
  afterInit(server: Server): void {
    this.logger.log('WebSocket Gateway initialized');
    // Set server instance in broadcaster service
    this.broadcaster.setServer(server);

    // Subscribe to Redis presence updates for cross-instance sync
    this.presenceSubscriber = new Redis({
      host: process.env.CACHE_HOST || 'localhost',
      port: parseInt(process.env.CACHE_PORT || '6379', 10),
      password: process.env.CACHE_PASS,
    });

    this.presenceSubscriber.subscribe('presence:updates', (err) => {
      if (err) this.logger.error('Failed to subscribe to presence:updates', err.stack);
    });

    this.presenceSubscriber.on('message', async (_channel, message) => {
      try {
        const { userId } = JSON.parse(message) as { userId: string };
        if (!userId) return;
        // Build current presence snapshot
        const presence = await this.presenceService.getPresenceStatus(userId);

        // Find all users who have this user as friend
        const watchers = await this.friendsCache.getUsersWhoseFriend(userId);
        if (watchers.length === 0) return;

        const payload: UserPresenceDto = {
          userId,
          status: presence.actualStatus,
          lastSeen: presence.isOnline ? null : new Date().toISOString(),
        };

        // Broadcast to all watchers user-rooms
        watchers.forEach((wid) => this.broadcaster.sendToUser(wid, Events.PRESENCE_UPDATE, payload));
      } catch (e: any) {
        this.logger.error('presence:updates handler error', e?.stack);
      }
    });
  }

  /**
   * Handle connection
   */
  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    await this.connectionHandler.handleConnection(client);
  }

  /**
   * Handle disconnection
   */
  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    await this.connectionHandler.handleDisconnect(client);
  }

  // ========== MESSAGE HANDLERS ==========

  /**
   * Update user's display status via WebSocket
   * @deprecated Use REST API instead
   */
  @WSAuth()
  @SubscribeMessage(WebSocketMessages.STATUS_UPDATE)
  async handleStatusUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: StatusUpdateData,
  ): Promise<void> {
    await this.presenceService.handleStatusUpdate(client, data);
  }

  /**
   * Get current display status
   */
  @WSAuth()
  @SubscribeMessage(WebSocketMessages.STATUS_GET)
  async handleGetStatus(@ConnectedSocket() client: AuthenticatedSocket): Promise<void> {
    await this.presenceService.handleGetStatus(client);
  }

  /**
   * @deprecated Use PUT /users/profile/presence-status instead
   */
  @WSAuth()
  @SubscribeMessage(WebSocketMessages.PRESENCE_UPDATE)
  async handlePresenceUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: StatusUpdateData,
  ): Promise<void> {
    await this.presenceService.handlePresenceUpdate(client, data);
  }

  // ========== PUBLIC API METHODS ==========

  /**
   * Broadcast message to all users in a room
   */
  broadcastToRoom(room: string, event: string, data: any): void {
    this.broadcaster.broadcastToRoom(room, event, data);
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId: string, event: string, data: any): void {
    this.broadcaster.sendToUser(userId, event, data);
  }

  /**
   * Emit to all connected clients
   */
  emitToAll(event: string, data: any): void {
    if (!this.server) {
      this.logger.warn('Cannot emit to all: server not initialized');
      return;
    }
    this.server.emit(event, data);
  }
}
