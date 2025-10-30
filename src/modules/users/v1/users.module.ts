import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { WebSocketModule } from '../../websocket/websocket.module';
import { 
  FriendshipRepository, 
  PresenceRepository, 
  UserRepository,
  UserStatusRecordRepository,
  UserRelationRepository 
} from 'src/common/database/repositories';

@Module({
  imports: [WebSocketModule],
  controllers: [UsersController],
  providers: [
    UsersService, 
    UserRepository, 
    FriendshipRepository,
    PresenceRepository,
    UserStatusRecordRepository,
    UserRelationRepository
  ],
  exports: [UsersService],
})
export class UsersModule {}