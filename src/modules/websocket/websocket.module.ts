import { Module } from '@nestjs/common';
import { WebSocketGatewayService } from './User/websocket.gateway';
import { ConnectionHandlerService } from './User/auth/connection.handler';
import { AuthService } from './User/auth/auth.service';
import { BroadcasterService } from './User/presence/broadcaster.service';
import { UnifiedPresenceService } from './User/services/unified-presence.service';
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
 * Modular architecture with separate handlers
 */
@Module({
  providers: [
    WebSocketGatewayService,
    ConnectionHandlerService,
    AuthService,
    BroadcasterService,
    UnifiedPresenceService,
    FriendsCacheService,
    FriendshipNotifierService,
    FriendsService,
    // Database Repositories
    UserRepository,
    PresenceRepository,
    UserStatusRecordRepository,
    FriendshipRepository,
    UserRelationRepository,
  ],
  exports: [
    WebSocketGatewayService,
    FriendshipNotifierService,
    UnifiedPresenceService,
    FriendsCacheService,
  ],
})
export class WebSocketModule {}
