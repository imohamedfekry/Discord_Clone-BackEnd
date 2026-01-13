import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class UserNoteRepository {
    constructor(private readonly prisma: PrismaService) { }

    async getUserNotes(sourceId: string | bigint) {
        return this.prisma.userNote.findMany({ where: { sourceId: BigInt(sourceId) } });
    }
    // crate & update
    async upsert(
        sourceId: string | bigint,
        targetId: string | bigint,
        note: string
    ) {
        return this.prisma.userNote.upsert({
            where: {
                sourceId_targetId: {
                    sourceId: BigInt(sourceId),
                    targetId: BigInt(targetId),
                },
            },
            update: {
                note,
            },
            create: {
                sourceId: BigInt(sourceId),
                targetId: BigInt(targetId),
                note,
            },
        })
    }

    async getByTargetId(sourceId: string | bigint, targetId: string | bigint) {
        return this.prisma.userNote.findUnique(
            {
                where: {
                    sourceId_targetId: {
                        sourceId: BigInt(sourceId),
                        targetId: BigInt(targetId),
                    },
                },
            }
        );
    }
    async getBySourceId(sourceId: string | bigint,) {
        return this.prisma.userNote.findFirst(
            {
                where: { sourceId: BigInt(sourceId) },
            }
        )
    }
    async delete(sourceId: string | bigint, targetId: string | bigint) {
        return this.prisma.userNote.delete(
            {
                where: {
                    sourceId_targetId: {
                        sourceId: BigInt(sourceId),
                        targetId: BigInt(targetId),
                    },
                },
            }
        );
    }
}
