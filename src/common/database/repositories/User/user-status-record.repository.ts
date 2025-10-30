import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma, UserStatus } from '@prisma/client';
import { snowflake } from 'src/common/utils/snowflake';

/**
 * Repository for managing user status records
 * Handles status history, temporary statuses, and status transitions
 */
@Injectable()
export class UserStatusRecordRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new custom status record
   */
  async createStatusRecord(
    data: {
      userId: string | bigint;
      customText?: string;
      customEmoji?: string;
      expiresAt?: Date;
    },
    select?: Prisma.UserStatusRecordSelect,
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
    
    return this.prisma.userStatusRecord.create({
      data: {
        id: snowflake.generate(),
        userId: BigInt(data.userId),
        customText: data.customText,
        customEmoji: data.customEmoji,
        expiresAt: data.expiresAt,
      },
      ...options,
    });
  }

  /**
   * Get status record by ID
   */
  async getStatusRecordById(
    recordId: string | bigint,
    select?: Prisma.UserStatusRecordSelect,
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
    
    return this.prisma.userStatusRecord.findUnique({
      where: { id: BigInt(recordId) },
      ...options,
    });
  }

  /**
   * Get status record by user ID
   */
  async getStatusRecordByUserId(
    userId: string | bigint,
    select?: Prisma.UserStatusRecordSelect,
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
    
    return this.prisma.userStatusRecord.findUnique({
      where: { userId: BigInt(userId) },
      ...options,
    });
  }

  /**
   * Update status record
   */
  async updateStatusRecord(
    recordId: string | bigint,
    data: {
      text?: string;
      emoji?: string;
      expiresAt?: Date;
    },
    select?: Prisma.UserStatusRecordSelect,
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

    return this.prisma.userStatusRecord.update({
      where: { id: BigInt(recordId) },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      ...options,
    });
  }
}
