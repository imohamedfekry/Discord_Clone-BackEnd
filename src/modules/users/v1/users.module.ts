import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { WebSocketModule } from '../../websocket/websocket.module';
import {
  FriendshipRepository,
  PresenceRepository,
  UserRepository,
  UserStatusRecordRepository,
  UserRelationRepository,
} from 'src/common/database/repositories';
import { UserNoteRepository } from 'src/common/database/repositories/User';
import { ChannelRepository } from 'src/common/database/repositories/Channel';
import { ChannelRecipientRepository } from 'src/common/database/repositories/Channel';

@Module({
  imports: [forwardRef(() => WebSocketModule)],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    FriendshipRepository,
    PresenceRepository,
    UserStatusRecordRepository,
    UserRelationRepository,
    UserNoteRepository,
    ChannelRepository,
    ChannelRecipientRepository,
  ],
  exports: [UsersService],
})
export class UsersModule { }
