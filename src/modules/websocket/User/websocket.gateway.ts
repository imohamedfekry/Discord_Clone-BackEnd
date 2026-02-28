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
import { AuthenticatedSocket, StatusUpdateData, WebSocketEvents, WebSocketMessages } from '../../../common/Types/socket.types';
import { UserPresenceDto } from '../../../common/Types/presence.dto';
import { ConnectionHandlerService } from './auth/connection.handler';
import { PresenceService } from './services/presence.service';
import { BroadcasterService } from './presence/broadcaster.service';
import { FriendsCacheService } from '../../../common/Global/cache/User/friends-cache.service';

@WebSocketGateway({
  cors: { origin: 'http://localhost:3001', credentials: true },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class WebSocketGatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGatewayService.name);
  private presenceSubscriber: Redis;

  constructor(
    private readonly connectionHandler: ConnectionHandlerService,
    private readonly presenceService: PresenceService,
    private readonly broadcaster: BroadcasterService,
    private readonly friendsCache: FriendsCacheService,
  ) {}

  afterInit(server: Server): void {
    this.logger.log('WebSocket Gateway initialized');
    this.broadcaster.setServer(server);

    this.presenceSubscriber = new Redis({
      host: process.env.CACHE_HOST || 'localhost',
      port: parseInt(process.env.CACHE_PORT || '6379', 10),
      password: process.env.CACHE_PASS,
    });

    this.presenceSubscriber.subscribe('presence:updates', (err) => {
      if (err)
        this.logger.error('Failed to subscribe to presence:updates', err.stack);
    });

    this.presenceSubscriber.on('message', async (_channel, message) => {
      try {
        const { userId } = JSON.parse(message) as { userId: string };
        if (!userId) return;
        const presence = await this.presenceService.getPresenceStatus(userId);
        const watchers = await this.friendsCache.getUsersWhoseFriend(userId);
        if (watchers.length === 0) return;

        const payload: UserPresenceDto = {
          userId,
          status: presence.actualStatus,
          lastSeen: presence.isOnline ? null : new Date().toISOString(),
        };
        watchers.forEach((wid) =>
          this.broadcaster.sendToUser(wid, WebSocketEvents.PRESENCE_UPDATE, payload),
        );
      } catch (e: any) {
        this.logger.error('presence:updates handler error', e?.stack);
      }
    });
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    await this.connectionHandler.handleConnection(client);
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    await this.connectionHandler.handleDisconnect(client);
  }

  @WSAuth()
  @SubscribeMessage(WebSocketMessages.STATUS_UPDATE)
  async handleStatusUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: StatusUpdateData,
  ): Promise<void> {
    await this.presenceService.handleStatusUpdate(client, data);
  }

  @WSAuth()
  @SubscribeMessage(WebSocketMessages.STATUS_GET)
  async handleGetStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    await this.presenceService.handleGetStatus(client);
  }

  @WSAuth()
  @SubscribeMessage(WebSocketMessages.PRESENCE_UPDATE)
  async handlePresenceUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: StatusUpdateData,
  ): Promise<void> {
    await this.presenceService.handleStatusUpdate(client, data);
  }

  broadcastToRoom(room: string, event: string, data: any): void {
    this.broadcaster.broadcastToRoom(room, event, data);
  }

  sendToUser(userId: string, event: string, data: any): void {
    this.broadcaster.sendToUser(userId, event, data);
  }

  emitToAll(event: string, data: any): void {
    if (!this.server) {
      this.logger.warn('Cannot emit to all: server not initialized');
      return;
    }
    this.server.emit(event, data);
  }
}
