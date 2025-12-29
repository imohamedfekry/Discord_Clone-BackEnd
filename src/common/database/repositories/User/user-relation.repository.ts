import { Injectable } from '@nestjs/common';
import { RelationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { snowflake } from 'src/common/utils/snowflake';

@Injectable()
export class UserRelationRepository {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Create or update a user relation
   */
  async createOrUpdateRelation(
    data: {
      sourceId: bigint;
      targetId: bigint;
      type: RelationType;
      note?: string;
    },
    select?: Prisma.UserRelationSelect,
  ) {
    const options: any = select
      ? { select }
      : {
        include: {
          source: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
          target: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

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
      ...options,
    });
  }

  /**
   * Get all relations for a user (both as source and target)
   */
  async getUserRelations(
    userId: bigint,
    select?: Prisma.UserRelationSelect,
  ) {
    const options: any = select
      ? { select }
      : {
        include: {
          source: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
          target: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

    return this.prisma.userRelation.findMany({
      where: {
        OR: [
          { sourceId: userId },
          { targetId: userId },
        ],
      },
      ...options,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get relations where user is the source (user's actions)
   */
  async getSourceRelations(
    userId: bigint,
    type?: RelationType,
    select?: Prisma.UserRelationSelect,
  ) {
    const where: Prisma.UserRelationWhereInput = {
      sourceId: userId,
    };

    if (type) {
      where.type = type;
    }

    const options: any = select
      ? { select }
      : {
        include: {
          target: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

    return this.prisma.userRelation.findMany({
      where,
      ...options,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get relations where user is the target (actions against user)
   */
  async getTargetRelations(
    userId: bigint,
    type?: RelationType,
    select?: Prisma.UserRelationSelect,
  ) {
    const where: Prisma.UserRelationWhereInput = {
      targetId: userId,
    };

    if (type) {
      where.type = type;
    }

    const options: any = select
      ? { select }
      : {
        include: {
          source: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

    return this.prisma.userRelation.findMany({
      where,
      ...options,
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
    select?: Prisma.UserRelationSelect,
  ) {
    const options: any = select
      ? { select }
      : {
        include: {
          source: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
          target: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

    return this.prisma.userRelation.findUnique({
      where: {
        sourceId_targetId_type: {
          sourceId,
          targetId,
          type,
        },
      },
      ...options,
    });
  }

  /**
   * Get all relations between two users (both directions)
   */
  async getRelationsBetweenUsers(
    user1Id: bigint,
    user2Id: bigint,
    select?: Prisma.UserRelationSelect,
  ) {
    const options: any = select
      ? { select }
      : {
        include: {
          source: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
          target: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

    return this.prisma.userRelation.findMany({
      where: {
        OR: [
          { sourceId: user1Id, targetId: user2Id },
          { sourceId: user2Id, targetId: user1Id },
        ],
      },
      ...options,
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
    select?: Prisma.UserRelationSelect,
  ) {
    return this.prisma.userRelation.delete({
      where: {
        sourceId_targetId_type: {
          sourceId,
          targetId,
          type,
        },
      },
      ...(select && { select }),
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
  async getBlockedUsers(
    userId: bigint,
    select?: Prisma.UserRelationSelect,
  ) {
    const options: any = select
      ? { select }
      : {
        include: {
          target: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

    return this.prisma.userRelation.findMany({
      where: {
        sourceId: userId,
        type: RelationType.BLOCKED,
      },
      ...options,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get ignored users for a user
   */
  async getIgnoredUsers(
    userId: bigint,
    select?: Prisma.UserRelationSelect,
  ) {
    const options: any = select
      ? { select }
      : {
        include: {
          target: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

    return this.prisma.userRelation.findMany({
      where: {
        sourceId: userId,
        type: RelationType.IGNORED,
      },
      ...options,
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
   * Get relation statistics for a user
   */
  async getRelationStats(userId: bigint) {
    const [blockedCount, ignoredCount] = await Promise.all([
      this.prisma.userRelation.count({
        where: { sourceId: userId, type: RelationType.BLOCKED },
      }),
      this.prisma.userRelation.count({
        where: { sourceId: userId, type: RelationType.IGNORED },
      }),
    ]);

    return {
      blocked: blockedCount,
      ignored: ignoredCount,
      total: blockedCount + ignoredCount,
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
    select?: Prisma.UserRelationSelect,
  ) {
    const options: any = select
      ? { select }
      : {
        include: {
          source: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
          target: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

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
      ...options,
    });
  }

  /**
   * Get all users that have blocked the given user
   */
  async getUsersWhoBlocked(
    userId: bigint,
    select?: Prisma.UserRelationSelect,
  ) {
    const options: any = select
      ? { select }
      : {
        include: {
          source: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

    return this.prisma.userRelation.findMany({
      where: {
        targetId: userId,
        type: RelationType.BLOCKED,
      },
      ...options,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get all users that have ignored the given user
   */
  async getUsersWhoIgnored(
    userId: bigint,
    select?: Prisma.UserRelationSelect,
  ) {
    const options: any = select
      ? { select }
      : {
        include: {
          source: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

    return this.prisma.userRelation.findMany({
      where: {
        targetId: userId,
        type: RelationType.IGNORED,
      },
      ...options,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Check if two users can interact (not blocked by either)
   */
  async canInteract(user1Id: bigint, user2Id: bigint): Promise<boolean> {
    const blockingRelations = await this.prisma.userRelation.findMany({
      where: {
        OR: [
          { sourceId: user1Id, targetId: user2Id, type: RelationType.BLOCKED },
          { sourceId: user2Id, targetId: user1Id, type: RelationType.BLOCKED },
        ],
      },
    });

    return blockingRelations.length === 0;
  }

  /**
   * Get interaction status between two users
   */
  async getInteractionStatus(
    user1Id: bigint,
    user2Id: bigint,
    select?: Prisma.UserRelationSelect,
  ) {
    const relations = await this.getRelationsBetweenUsers(user1Id, user2Id, select);

    const status = {
      canInteract: true,
      user1Blocked: false,
      user2Blocked: false,
      user1Ignored: false,
      user2Ignored: false,
      user1Muted: false,
      user2Muted: false,
    };

    relations.forEach(relation => {
      if (relation.sourceId === user1Id) {
        switch (relation.type) {
          case RelationType.BLOCKED:
            status.user1Blocked = true;
            status.canInteract = false;
            break;
          case RelationType.IGNORED:
            status.user1Ignored = true;
            break;
        }
      } else {
        switch (relation.type) {
          case RelationType.BLOCKED:
            status.user2Blocked = true;
            status.canInteract = false;
            break;
          case RelationType.IGNORED:
            status.user2Ignored = true;
            break;
        }
      }
    });

    return status;
  }

  /**
   * Bulk create relations
   */
  async bulkCreateRelations(relations: Array<{
    sourceId: bigint;
    targetId: bigint;
    type: RelationType;
    note?: string;
  }>) {
    const data = relations.map(relation => ({
      id: snowflake.generate(),
      sourceId: relation.sourceId,
      targetId: relation.targetId,
      type: relation.type,
      note: relation.note,
    }));

    return this.prisma.userRelation.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Get relation counts by type for a user
   */
  async getRelationCountsByType(userId: bigint) {
    const counts = await this.prisma.userRelation.groupBy({
      by: ['type'],
      where: {
        sourceId: userId,
      },
      _count: {
        type: true,
      },
    });

    return counts.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<RelationType, number>);
  }

  /**
   * Search relations by username or globalname
   */
  async searchRelations(
    userId: bigint,
    searchTerm: string,
    type?: RelationType,
    limit = 20,
    select?: Prisma.UserRelationSelect,
  ) {
    const where: Prisma.UserRelationWhereInput = {
      sourceId: userId,
      OR: [
        {
          target: {
            username: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          target: {
            globalname: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ],
    };

    if (type) {
      where.type = type;
    }

    const options: any = select
      ? { select }
      : {
        include: {
          target: {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
            },
          },
        },
      };

    return this.prisma.userRelation.findMany({
      where,
      ...options,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}
