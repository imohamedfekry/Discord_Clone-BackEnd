import { Injectable } from '@nestjs/common';
import { RelationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { snowflake } from 'src/common/utils/snowflake';

@Injectable()
export class UserRelationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create or update a user relation
   */
  async createOrUpdateRelation(data: {
    sourceId: bigint;
    targetId: bigint;
    type: RelationType;
    note?: string;
  }) {
    return this.prisma.userRelation.upsert({
      where: {
        sourceId_targetId_type: {
          sourceId: data.sourceId,
          targetId: data.targetId,
          type: data.type,
        },
      },
      update: {
        note: data.note,
        updatedAt: new Date(),
      },
      create: {
        id: snowflake.generate(),
        sourceId: data.sourceId,
        targetId: data.targetId,
        type: data.type,
        note: data.note,
      },
      include: {
        source: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
          },
        },
        target: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Get all relations for a user (both as source and target)
   */
  async getUserRelations(userId: bigint) {
    return this.prisma.userRelation.findMany({
      where: {
        OR: [
          { sourceId: userId },
          { targetId: userId },
        ],
      },
      include: {
        source: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
            status: true,
          },
        },
        target: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get relations where user is the source (user's actions)
   */
  async getSourceRelations(userId: bigint, type?: RelationType) {
    const where: Prisma.UserRelationWhereInput = {
      sourceId: userId,
    };

    if (type) {
      where.type = type;
    }

    return this.prisma.userRelation.findMany({
      where,
      include: {
        target: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get relations where user is the target (actions against user)
   */
  async getTargetRelations(userId: bigint, type?: RelationType) {
    const where: Prisma.UserRelationWhereInput = {
      targetId: userId,
    };

    if (type) {
      where.type = type;
    }

    return this.prisma.userRelation.findMany({
      where,
      include: {
        source: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Check if user has a specific relation with another user
   */
  async hasRelation(
    sourceId: bigint,
    targetId: bigint,
    type: RelationType,
  ): Promise<boolean> {
    const relation = await this.prisma.userRelation.findUnique({
      where: {
        sourceId_targetId_type: {
          sourceId,
          targetId,
          type,
        },
      },
    });

    return !!relation;
  }

  /**
   * Get specific relation between two users
   */
  async getRelation(
    sourceId: bigint,
    targetId: bigint,
    type: RelationType,
  ) {
    return this.prisma.userRelation.findUnique({
      where: {
        sourceId_targetId_type: {
          sourceId,
          targetId,
          type,
        },
      },
      include: {
        source: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
          },
        },
        target: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Get all relations between two users (both directions)
   */
  async getRelationsBetweenUsers(user1Id: bigint, user2Id: bigint) {
    return this.prisma.userRelation.findMany({
      where: {
        OR: [
          { sourceId: user1Id, targetId: user2Id },
          { sourceId: user2Id, targetId: user1Id },
        ],
      },
      include: {
        source: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
          },
        },
        target: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Remove a specific relation
   */
  async removeRelation(
    sourceId: bigint,
    targetId: bigint,
    type: RelationType,
  ) {
    return this.prisma.userRelation.delete({
      where: {
        sourceId_targetId_type: {
          sourceId,
          targetId,
          type,
        },
      },
    });
  }

  /**
   * Remove all relations between two users
   */
  async removeAllRelationsBetweenUsers(user1Id: bigint, user2Id: bigint) {
    return this.prisma.userRelation.deleteMany({
      where: {
        OR: [
          { sourceId: user1Id, targetId: user2Id },
          { sourceId: user2Id, targetId: user1Id },
        ],
      },
    });
  }

  /**
   * Get blocked users for a user
   */
  async getBlockedUsers(userId: bigint) {
    return this.prisma.userRelation.findMany({
      where: {
        sourceId: userId,
        type: RelationType.BLOCKED,
      },
      include: {
        target: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get ignored users for a user
   */
  async getIgnoredUsers(userId: bigint) {
    return this.prisma.userRelation.findMany({
      where: {
        sourceId: userId,
        type: RelationType.IGNORED,
      },
      include: {
        target: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get muted users for a user
   */
  async getMutedUsers(userId: bigint) {
    return this.prisma.userRelation.findMany({
      where: {
        sourceId: userId,
        type: RelationType.MUTED,
      },
      include: {
        target: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Check if user is blocked by another user
   */
  async isBlockedBy(sourceId: bigint, targetId: bigint): Promise<boolean> {
    return this.hasRelation(sourceId, targetId, RelationType.BLOCKED);
  }

  /**
   * Check if user is ignored by another user
   */
  async isIgnoredBy(sourceId: bigint, targetId: bigint): Promise<boolean> {
    return this.hasRelation(sourceId, targetId, RelationType.IGNORED);
  }

  /**
   * Check if user is muted by another user
   */
  async isMutedBy(sourceId: bigint, targetId: bigint): Promise<boolean> {
    return this.hasRelation(sourceId, targetId, RelationType.MUTED);
  }

  /**
   * Get relation statistics for a user
   */
  async getRelationStats(userId: bigint) {
    const [blockedCount, ignoredCount, mutedCount] = await Promise.all([
      this.prisma.userRelation.count({
        where: { sourceId: userId, type: RelationType.BLOCKED },
      }),
      this.prisma.userRelation.count({
        where: { sourceId: userId, type: RelationType.IGNORED },
      }),
      this.prisma.userRelation.count({
        where: { sourceId: userId, type: RelationType.MUTED },
      }),
    ]);

    return {
      blocked: blockedCount,
      ignored: ignoredCount,
      muted: mutedCount,
      total: blockedCount + ignoredCount + mutedCount,
    };
  }

  /**
   * Update relation note
   */
  async updateRelationNote(
    sourceId: bigint,
    targetId: bigint,
    type: RelationType,
    note: string,
  ) {
    return this.prisma.userRelation.update({
      where: {
        sourceId_targetId_type: {
          sourceId,
          targetId,
          type,
        },
      },
      data: {
        note,
        updatedAt: new Date(),
      },
    });
  }
}
