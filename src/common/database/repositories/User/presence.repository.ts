import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma, UserStatus } from '@prisma/client';
import { snowflake } from 'src/common/utils/snowflake';

/**
 * Repository for managing user presence data
 * Handles presence creation, updates, and status management
 */
@Injectable()
export class PresenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new presence record for a user
   */
  async createPresence(
    userId: string | bigint,
    select?: Prisma.PresenceSelect,
  ) {
    const options: any = select
      ? { select }
      : {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                globalname: true,
                avatar: true,
              },
            },
          },
        };
    
    return this.prisma.presence.create({
      data: {
        id: snowflake.generate(),
        userId: BigInt(userId),
      },
      ...options,
    });
  }

  /**
   * Get presence by user ID
   */
  async getPresenceByUserId(
    userId: string | bigint,
    select?: Prisma.PresenceSelect,
  ) {
    const options: any = select
      ? { select }
      : {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                globalname: true,
                avatar: true,
              },
            },
          },
        };
    
    return this.prisma.presence.findUnique({
      where: { userId: BigInt(userId) },
      ...options,
    });
  }

  /**
   * Get presence by ID
   */
  async getPresenceById(
    presenceId: string | bigint,
    select?: Prisma.PresenceSelect,
  ) {
    const options: any = select
      ? { select }
      : {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                globalname: true,
                avatar: true,
              },
            },
          },
        };
    
    return this.prisma.presence.findUnique({
      where: { id: BigInt(presenceId) },
      ...options,
    });
  }

  /**
   * Update status for a presence
   */
  async updateStatus(
    presenceId: string | bigint,
    status: UserStatus,
    expiresAt?: Date,
    select?: Prisma.PresenceSelect,
  ) {
    const options: any = select
      ? { select }
      : {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                globalname: true,
                avatar: true,
              },
            },
          },
        };
    
    return this.prisma.presence.update({
      where: { id: BigInt(presenceId) },
      data: {
        status,
        expiresAt,
        updatedAt: new Date(),
      },
      ...options,
    });
  }

  /**
   * Get presence with current status only
   */
  async getPresenceWithCurrentStatus(
    userId: string | bigint,
    select?: Prisma.PresenceSelect,
  ) {
    const options: any = select || {
      select: {
        id: true,
        userId: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            globalname: true,
            avatar: true,
          },
        },
      },
    };
    
    return this.prisma.presence.findUnique({
      where: { userId: BigInt(userId) },
      ...options,
    });
  }

  /**
   * Get multiple presences by user IDs
   */
  async getPresencesByUserIds(
    userIds: string[] | bigint[],
    select?: Prisma.PresenceSelect,
  ) {
    const options: any = select
      ? { select }
      : {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                globalname: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        };
    
    return this.prisma.presence.findMany({
      where: {
        userId: { in: userIds.map(id => BigInt(id)) },
      },
      ...options,
    });
  }

  /**
   * Delete presence record
   */
  async deletePresence(
    presenceId: string | bigint,
    select?: Prisma.PresenceSelect,
  ) {
    return this.prisma.presence.delete({
      where: { id: BigInt(presenceId) },
      ...(select && { select }),
    });
  }

  /**
   * Delete presence by user ID
   */
  async deletePresenceByUserId(
    userId: string | bigint,
    select?: Prisma.PresenceSelect,
  ) {
    return this.prisma.presence.delete({
      where: { userId: BigInt(userId) },
      ...(select && { select }),
    });
  }

  /**
   * Check if presence exists for user
   */
  async hasPresence(userId: string | bigint): Promise<boolean> {
    const presence = await this.prisma.presence.findUnique({
      where: { userId: BigInt(userId) },
      select: { id: true },
    });
    return !!presence;
  }

  /**
   * Update presence updatedAt timestamp
   */
  async touchPresence(
    presenceId: string | bigint,
    select?: Prisma.PresenceSelect,
  ) {
    return this.prisma.presence.update({
      where: { id: BigInt(presenceId) },
      data: { updatedAt: new Date() },
      ...(select && { select }),
    });
  }
}
