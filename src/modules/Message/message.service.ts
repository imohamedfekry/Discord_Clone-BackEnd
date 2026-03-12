import { BadRequestException, Injectable } from "@nestjs/common";
import { ChannelRepository, FriendshipRepository, MessageRepository, UserRelationRepository, UserRepository } from "src/common/database/repositories";
import { GetMessagesQueryDto } from "./dto/message.dto";
import { User } from "@prisma/client";

@Injectable()
export class MessageService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly friendshipRepository: FriendshipRepository,
        private readonly userRelationRepository: UserRelationRepository,
        private readonly ChannelRepository: ChannelRepository,
        private readonly MessageRepository: MessageRepository,

    ) { }
    async getMessages(user: User, channelId: bigint, query: GetMessagesQueryDto) {
        const channel = await this.ChannelRepository.findChannelById(channelId, user.id);
        if (!channel) {
            throw new BadRequestException('Channel not found');
        }
        // if (channel.type === 'DM') {
        //     const dm = await this.userRelationRepository.({ channelId });
        //     if (!dm) {
        //         throw new BadRequestException('Channel not found');
        //     }
        //     if (dm.userId !== user.id) {
        //         throw new BadRequestException('Channel not found');
        //     }
        // }
        // return this.MessageRepository.findMany(
        //     {
        //         channelId: channelId,
        //         deletedAt: null,
        //     },
        //     {
        //         limit: query.limit,
        //         cursor: query.before,
        //         orderBy: { createdAt: 'desc' },
        //     }
        // )
        return 1
    }
}