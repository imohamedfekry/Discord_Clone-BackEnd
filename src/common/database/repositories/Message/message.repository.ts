import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Repository for managing message data
 * Handles CRUD operations and message listing by channel with pagination
 */
@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new message
   */
  async create(
    data: Omit<Prisma.MessageUncheckedCreateInput, 'id'>,
    select?: Prisma.MessageSelect,
  ) {
    return this.prisma.message.create({
      data,
      ...(select && { select }),
    });
  }

  /**
   * Find message by ID
   */
  async findById(
    id: string | bigint,
    options?: {
      select?: Prisma.MessageSelect;
      include?: Prisma.MessageInclude | Record<string, boolean>;
    },
  ) {
    const { select, include } = options || {};

    return this.prisma.message.findUnique({
      where: { id: BigInt(id) },
      ...(select && { select }),
      ...(include && { include }),
    });
  }

  /**
   * Get messages by channel ID with cursor-based pagination (for infinite scroll / load more)
   * Returns messages ordered by createdAt desc (newest first)
   */
  async findManyByChannelId(
    channelId: string | bigint,
    options?: {
      limit?: number;
      before?: string | bigint; // message id - get messages before this message
      select?: Prisma.MessageSelect;
      include?: Prisma.MessageInclude | Record<string, boolean>;
    },
  ) {
    const { limit = 50, before, select, include } = options || {};

    const where: Prisma.MessageWhereInput = {
      channelId: BigInt(channelId),
      deletedAt: null,
    };

    if (before) {
      const beforeMessage = await this.prisma.message.findUnique({
        where: { id: BigInt(before) },
        select: { createdAt: true },
      });
      if (beforeMessage) {
        where.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    return this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(select && { select }),
      ...(include && { include }),
    });
  }

  /**
   * Update a message
   */
  async update(
    id: string | bigint,
    data: Prisma.MessageUpdateInput,
    select?: Prisma.MessageSelect,
  ) {
    return this.prisma.message.update({
      where: { id: BigInt(id) },
      data,
      ...(select && { select }),
    });
  }

  /**
   * Soft delete a message (set deletedAt)
   */
  async softDelete(id: string | bigint, select?: Prisma.MessageSelect) {
    return this.prisma.message.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
      ...(select && { select }),
    });
  }

  /**
   * Hard delete a message (permanent)
   */
  async delete(id: string | bigint, select?: Prisma.MessageSelect) {
    return this.prisma.message.delete({
      where: { id: BigInt(id) },
      ...(select && { select }),
    });
  }

  /**
   * Check if message exists by ID
   */
  async existsById(id: string | bigint): Promise<boolean> {
    const message = await this.prisma.message.findUnique({
      where: { id: BigInt(id) },
      select: { id: true },
    });
    return !!message;
  }

  /**
   * Get replies for a message
   */
  async findReplies(
    replyToId: string | bigint,
    options?: {
      limit?: number;
      select?: Prisma.MessageSelect;
      include?: Prisma.MessageInclude | Record<string, boolean>;
    },
  ) {
    const { limit = 20, select, include } = options || {};

    return this.prisma.message.findMany({
      where: {
        replyToId: BigInt(replyToId),
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      ...(select && { select }),
      ...(include && { include }),
    });
  }
}
