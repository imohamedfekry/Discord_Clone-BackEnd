import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { WSAuth } from '../../../../common/decorators/websocket-auth.decorator';
import { AuthService } from '../auth/auth.service';
import { FriendshipNotifierService } from './friendship-notifier.service';
import { AuthenticatedSocket } from '../../../../common/Types/websocket.types';
import { WebSocketMessages } from '../../../../common/Types/websocket.types';

/**
 * Friends Service
 * Handles friend-related WebSocket operations
 * Currently no client-initiated messages, all handled via REST + WebSocket notifications
 */
@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly friendshipNotifier: FriendshipNotifierService,
  ) {}

  // WebSocket message handlers for friends can be added here if needed
  // Example: Listen for friendship status queries, etc.
}

