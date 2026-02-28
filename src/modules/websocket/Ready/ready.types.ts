import { User, UserRelation } from '@prisma/client';
import { UserDto } from 'src/common/dto';
import { FriendRequestItemDto } from 'src/modules/users/v1/dto/user-response.dto';

export interface IFriendRequestLoader {
  FriendRequestLoader(user: User): Promise<{ data?: { incoming: FriendRequestItemDto[]; outgoing: FriendRequestItemDto[] } }>;
}

export interface ReadyFriendPayload {
  id: string;
  username: string;
  avatar: string | null;
  friendshipId: string;
  status: string;
  createdAt: string;
  customStatus?: string;
}

export interface ReadyPayload {
  currentUser: UserDto;
  friendRequests: {
    incoming: FriendRequestItemDto[];
    outgoing: FriendRequestItemDto[];
  };
  userRelations: UserRelation[];
  friends: ReadyFriendPayload[];
}
