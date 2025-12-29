import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { User } from "@prisma/client";
import { UsersService } from "src/modules/users/v1/users.service";
import { IFriendRequestLoader } from "../ready.types";
import { UserDto } from "src/common/dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class ReadyLoader implements IFriendRequestLoader {

    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService
    ) { }
    async getCurrentUser(user: User) {
        return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
    }
    async FriendRequestLoader(user: User) {
        const response = await this.usersService.getFriendRequests(user);
        return response.data;
    }
    async getUserRelations(user: User) {
        const response = await this.usersService.getUserRelations(user, {});
        return response;
    }
}
