import { Injectable } from "@nestjs/common";
import { ChannelType, PrismaClient } from "@prisma/client";
import { snowflake } from "src/common/utils/snowflake";

@Injectable()
export class ChannelRecipientRepository {
    constructor(
        private readonly prisma: PrismaClient,
    ) {

    }
    async createChannelRecipient(channelId: bigint | string, userId: bigint | string, flags?: number) {
        return this.prisma.channelRecipient.create({
            data: {
                channelId: BigInt(channelId),
                userId: BigInt(userId),
            },
        });
    }
    async updateChannelRecipient(
        channelId: bigint | string,
        userId: bigint | string,
        data: { show?: boolean }
    ) {
        return this.prisma.channelRecipient.update({
            where: {
                channelId_userId: {
                    channelId: BigInt(channelId),
                    userId: BigInt(userId),
                },
            },
            data, // عشان لو مبعتش ال flags 
            // ميتعملهاش ريسيت لل 0
        });
    }

    async deleteChannelRecipient(channelId: bigint | string, userId: bigint | string) {
        return this.prisma.channelRecipient.delete({
            where: {
                channelId_userId: {
                    channelId: BigInt(channelId),
                    userId: BigInt(userId),
                },
            },
        });
    }
    async getChannelRecipientsByChannelId(channelId: bigint | string) {
        return this.prisma.channelRecipient.findMany({
            where: {
                channelId: BigInt(channelId),
            },
        });
    }

    async getChannelRecipient(channelId: bigint | string, userId: bigint | string) {
        return this.prisma.channelRecipient.findUnique({
            where: {
                channelId_userId: {
                    channelId: BigInt(channelId),
                    userId: BigInt(userId),
                },
            },
        });
    }
    async getChannelRecipientsByUserId(userId: bigint | string) {
        return this.prisma.channelRecipient.findMany({
            where: {
                userId: BigInt(userId),
            },
        });
    }
}