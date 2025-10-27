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
import { Logger } from '@nestjs/common';
import { WSAuth } from '../../../common/decorators/websocket-auth.decorator';
import { ConnectionHandlerService } from './auth/connection.handler';
import { PresenceService } from './presence/presence.service';
import { BroadcasterService } from './shared/broadcaster.service';
import { FriendsService } from './friends/friends.service';
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

  constructor(
    private readonly connectionHandler: ConnectionHandlerService,
    private readonly presenceService: PresenceService,
    private readonly broadcaster: BroadcasterService,
    private readonly friendsService: FriendsService,
  ) {}

  /**
   * Initialize gateway
   */
  afterInit(server: Server): void {
    this.logger.log('WebSocket Gateway initialized');
    // Set server instance in broadcaster service
    this.broadcaster.setServer(server);
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
