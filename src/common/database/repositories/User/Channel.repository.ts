import { Injectable } from "@nestjs/common";
import { ChannelType, PrismaClient } from "@prisma/client";
import { snowflake } from "src/common/utils/snowflake";

@Injectable()
export class ChannelRepository {
    constructor(
        private readonly prisma: PrismaClient,
    ) {

    }
    async findChannelById(channelId: bigint | string) {
        return this.prisma.channel.findUnique({
            where: {
                id: BigInt(channelId),
            },
        });
    }

    async createChannel(type: ChannelType) {
        return this.prisma.channel.create({
            data: {
                id: snowflake.generate(),
                type,
            },
        });
    }

}