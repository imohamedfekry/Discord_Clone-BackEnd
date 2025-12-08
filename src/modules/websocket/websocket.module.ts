import { Module } from '@nestjs/common';
import { WebSocketGatewayService } from './User/websocket.gateway';
import { ConnectionHandlerService } from './User/auth/connection.handler';
import { AuthService } from './User/auth/auth.service';
import { BroadcasterService } from './User/presence/broadcaster.service';
import { UnifiedPresenceService } from './User/services/unified-presence.service';
import { UnifiedNotifierService } from './User/services/unified-notifier.service';
import { PresenceNotifierService } from './User/services/presence-notifier.service';
import { FriendsCacheService } from '../../common/Global/cache/User/friends-cache.service';
import { FriendshipNotifierService } from './User/friends/friendship-notifier.service';
import { FriendsService } from './User/friends/friends.service';
import {
  UserRepository,
  PresenceRepository,
  UserStatusRecordRepository,
  FriendshipRepository,
  UserRelationRepository
} from '../../common/database/repositories';

/**
 * WebSocket Module
 * Modular architecture with layered services
 */
@Module({
  providers: [
    // Gateway
    WebSocketGatewayService,
    ConnectionHandlerService,
    AuthService,

    // Core Services (Layer 1 - Socket.IO)
    BroadcasterService,

    // Unified Services (Layer 2 - Standardized messaging)
    UnifiedNotifierService,

    // Domain Services (Layer 3 - Business logic)
    UnifiedPresenceService,
    PresenceNotifierService,
    FriendshipNotifierService,
    FriendsService,

    // Cache & Database
    FriendsCacheService,
    UserRepository,
    PresenceRepository,
    UserStatusRecordRepository,
    FriendshipRepository,
    UserRelationRepository,
  ],
  exports: [
    WebSocketGatewayService,
    UnifiedNotifierService,
    FriendshipNotifierService,
    PresenceNotifierService,
    UnifiedPresenceService,
    FriendsCacheService,
  ],
})
export class WebSocketModule { }
