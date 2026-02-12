import { Friendship, User, UserRelation } from '@prisma/client';
import { UserDto } from 'src/common/dto';
import { FriendDto, FriendRequestItemDto } from 'src/modules/users/v1/dto/user-response.dto';

export interface IFriendRequestLoader {
  FriendRequestLoader(user: any): Promise<any>;
}

export interface ReadyPayload {
  friendRequests?: {
    incoming: FriendRequestItemDto[];
    outgoing: FriendRequestItemDto[];
  };
  userRelations?: UserRelation[];
  currentUser: UserDto;
  friends: FriendDto[];
  // future fields like guilds, etc.
}
