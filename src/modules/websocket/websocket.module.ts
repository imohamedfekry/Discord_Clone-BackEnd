import { forwardRef, Module } from '@nestjs/common';
import { WebSocketGatewayService } from './User/websocket.gateway';
import { ConnectionHandlerService } from './User/auth/connection.handler';
import { AuthService } from './User/auth/auth.service';
import { BroadcasterService } from './User/presence/broadcaster.service';
import { UnifiedPresenceService } from './User/services/unified-presence.service';
import { UnifiedNotifierService } from './User/services/unified-notifier.service';
import { FriendsCacheService } from '../../common/Global/cache/User/friends-cache.service';
import { FriendshipNotifierService } from './User/friends/friendship.notifier.service';
import { RelationNotifierService } from './User/relations/relations.notifier.service';
import { ProfileNotifierService } from './User/profile/profile.notifier.service';
import {
  UserRepository,
  PresenceRepository,
  UserStatusRecordRepository,
  FriendshipRepository,
  UserRelationRepository,
} from '../../common/database/repositories';
import { ReadyService } from './Ready/ready.service';
import { UsersModule } from '../users/v1/users.module';
import { ReadyLoader } from './Ready/loaders/loader.service';

/**
 * WebSocket Module
 * Modular architecture with layered services
 */
@Module({
  imports: [forwardRef(() => UsersModule)],
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
    FriendshipNotifierService,
    RelationNotifierService,
    ProfileNotifierService,

    // Cache & Database
    FriendsCacheService,
    UserRepository,
    PresenceRepository,
    UserStatusRecordRepository,
    FriendshipRepository,
    UserRelationRepository,
    ReadyService,
    ReadyLoader,
  ],
  exports: [
    WebSocketGatewayService,
    UnifiedNotifierService,
    FriendshipNotifierService,
    RelationNotifierService,
    ProfileNotifierService,
    ReadyService,
    ReadyLoader,
    UnifiedPresenceService,
    FriendsCacheService,
  ],
})
export class WebSocketModule {}
