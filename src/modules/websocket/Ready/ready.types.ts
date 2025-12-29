import { User, UserRelation } from "@prisma/client";
import { UserDto } from "src/common/dto";
import { FriendRequestItemDto } from "src/modules/users/v1/dto/user-response.dto";

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
    // future fields like guilds, etc.
}
