import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { MessageRepository, UserRepository } from "src/common/database/repositories";
import { FriendshipRepository } from "src/common/database/repositories/User";
import { UserRelationRepository } from "src/common/database/repositories/User";
import { ChannelRepository } from "src/common/database/repositories/Channel";

@Module({
    providers: [MessageService, UserRepository, FriendshipRepository, UserRelationRepository, ChannelRepository, MessageRepository],
    controllers: [MessageController],
    exports: [MessageService]
})
export class MessageModule { }