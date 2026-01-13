import { Injectable } from "@nestjs/common";
import { ChannelType } from "@prisma/client";
import { PrismaService } from "../../prisma.service";
import { snowflake } from "src/common/utils/snowflake";

@Injectable()
export class ChannelRepository {
    constructor(
        private readonly prisma: PrismaService,
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


    async findDMChannelBetweenUsers(
        userId: bigint | string,
        targetUserId: bigint | string,
    ) {
        return this.prisma.channel.findFirst({
            where: {
                type: ChannelType.DM,
                AND: [
                    {
                        recipients: {
                            some: {
                                userId: BigInt(userId),
                            },
                        },
                    },
                    {
                        recipients: {
                            some: {
                                userId: BigInt(targetUserId),
                            },
                        },
                    },
                ],
            },
        });
    }
    async getDMChannelsByUserId(userId: bigint | string) {
        return await this.prisma.channel.findMany({
            where: {
                recipients: {
                    some: { userId: BigInt(userId) },
                },
            },
            include: {
                recipients: {
                    where: { userId: BigInt(userId), show: true },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
    }
}