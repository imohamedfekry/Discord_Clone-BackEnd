import { Injectable } from "@nestjs/common";
import { ChannelType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma.service";
import { snowflake } from "src/common/utils/snowflake";

@Injectable()
export class ChannelRecipientRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) {

    }
    async createChannelRecipients(
        channelId: bigint | string,
        recipients: Array<{ userId: bigint | string; show?: boolean }>
    ) {
        return this.prisma.channelRecipient.createMany({
            data: recipients.map(r => ({
                channelId: BigInt(channelId),
                userId: BigInt(r.userId),
                show: r.show ?? true,
            })),
            skipDuplicates: true, // أمان زيادة
        });
    }
    async updateChannelRecipient(
        channelId: bigint | string,
        userId: bigint | string,
        show?: boolean
    ) {
        return this.prisma.channelRecipient.update({
            where: {
                channelId_userId: {
                    channelId: BigInt(channelId),
                    userId: BigInt(userId),
                },
            },
            data: {
                show,
            },
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
    async getChannelRecipients(options: {
        where: Prisma.ChannelRecipientWhereInput;
        userFields?: Array<'id' | 'username' | 'avatar' | 'global_name'>;
    }) {
        const { where, userFields = ['id', 'username', 'avatar'] } = options;

        // بناء select object بأمان
        const selectUser = userFields.reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {} as Record<string, boolean>);

        return this.prisma.channelRecipient.findMany({
            where,
            include: {
                user: {
                    select: selectUser,
                },
            },
        });
    }




    async findChannelRecipient(
        channelId: bigint | string,
        userId: bigint | string,
    ) {
        return this.prisma.channelRecipient.findFirst({
            where: {
                userId: BigInt(userId),
                channelId: BigInt(channelId),
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