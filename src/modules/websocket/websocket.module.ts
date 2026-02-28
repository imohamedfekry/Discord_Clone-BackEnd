import { forwardRef, Module } from '@nestjs/common';
import { WebSocketGatewayService } from './User/websocket.gateway';
import { ConnectionHandlerService } from './User/auth/connection.handler';
import { AuthService } from './User/auth/auth.service';
import { BroadcasterService } from './User/presence/broadcaster.service';
import { PresenceService } from './User/services/presence.service';
import { NotificationService } from './User/services/notification.service';
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

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [
    WebSocketGatewayService,
    ConnectionHandlerService,
    AuthService,
    BroadcasterService,
    NotificationService,
    PresenceService,
    FriendshipNotifierService,
    RelationNotifierService,
    ProfileNotifierService,
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
    NotificationService,
    PresenceService,
    FriendshipNotifierService,
    RelationNotifierService,
    ProfileNotifierService,
    ReadyService,
    ReadyLoader,
    FriendsCacheService,
  ],
})
export class WebSocketModule {}
