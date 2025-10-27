import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from '../../../common/database/repositories/user.repository';
import { FriendshipRepository } from '../../../common/database/repositories/friendship.repository';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [WebSocketModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, FriendshipRepository],
  exports: [UsersService],
})
export class UsersModule {}