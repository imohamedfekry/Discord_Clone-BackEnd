import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { 
  UserRepository,
  FriendshipRepository,
  UserRelationRepository,
} from './repositories';

@Global()
@Module({
  providers: [
    PrismaService,
    UserRepository,
    FriendshipRepository,
    UserRelationRepository,
  ],
  exports: [
    PrismaService,
    UserRepository,
    FriendshipRepository,
    UserRelationRepository,
  ],
})
export class DatabaseModule {}