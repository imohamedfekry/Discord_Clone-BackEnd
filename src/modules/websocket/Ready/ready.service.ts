import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { ReadyPayload, ReadyFriendPayload } from './ready.types';
import { ReadyLoader } from './loaders/loader.service';

@Injectable()
export class ReadyService {
  private readonly logger = new Logger(ReadyService.name);

  constructor(private readonly ReadyLoader: ReadyLoader) {}

  async prepareUserData(user: User): Promise<ReadyPayload> {
    this.logger.log(`Preparing ready data for user ${user.id}`);

    const [currentUser, friendsRes, friendRequestsRes, userRelations] =
      await Promise.all([
        this.ReadyLoader.getCurrentUser(user),
        this.ReadyLoader.getFriends(user),
        this.ReadyLoader.FriendRequestLoader(user),
        this.ReadyLoader.getUserRelations(user),
      ]);

    const friendRequests = friendRequestsRes?.data ?? {
      incoming: [],
      outgoing: [],
    };

    const rawFriends = friendsRes?.friends ?? [];
    const friends: ReadyFriendPayload[] = rawFriends.map((f: any) => ({
      id: String(f.id),
      username: f.username,
      avatar: f.avatar ?? null,
      friendshipId: String(f.friendshipId),
      status: f.status,
      createdAt:
        f.createdAt instanceof Date
          ? f.createdAt.toISOString()
          : String(f.createdAt ?? ''),
      ...(f.customStatus != null && { customStatus: f.customStatus }),
    }));

    return {
      currentUser,
      friendRequests,
      userRelations: userRelations ?? [],
      friends,
    };
  }
}
