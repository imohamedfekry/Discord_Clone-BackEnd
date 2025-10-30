import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { 
  UserRepository,
  FriendshipRepository,
  UserRelationRepository,
  PresenceRepository,
  UserStatusRecordRepository,
} from './repositories/User';

@Global()
@Module({
  providers: [
    PrismaService,
    UserRepository,
    FriendshipRepository,
    UserRelationRepository,
    PresenceRepository,
    UserStatusRecordRepository,
  ],
  exports: [
    PrismaService,
    UserRepository,
    FriendshipRepository,
    UserRelationRepository,
    PresenceRepository,
    UserStatusRecordRepository,
  ],
})
export class DatabaseModule {}