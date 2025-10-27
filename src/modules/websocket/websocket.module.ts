import { Module } from '@nestjs/common';
import { WebSocketGatewayService } from './User/websocket.gateway';
import { ConnectionHandlerService } from './User/auth/connection.handler';
import { PresenceService } from './User/presence/presence.service';
import { AuthService } from './User/auth/auth.service';
import { BroadcasterService } from './User/shared/broadcaster.service';
import { PresenceStatusService } from './User/services/presence-status.service';
import { FriendsCacheService } from '../../common/Global/cache/User/friends-cache.service';
import { FriendshipNotifierService } from './User/friends/friendship-notifier.service';
import { FriendsService } from './User/friends/friends.service';

/**
 * WebSocket Module
 * Modular architecture with separate handlers
 */
@Module({
  providers: [
    WebSocketGatewayService,
    ConnectionHandlerService,
    PresenceService,
    AuthService,
    BroadcasterService,
    PresenceStatusService,
    FriendsCacheService,
    FriendshipNotifierService,
    FriendsService,
  ],
  exports: [
    WebSocketGatewayService,
    FriendshipNotifierService,
    PresenceStatusService,
    FriendsCacheService,
  ],
})
export class WebSocketModule {}
