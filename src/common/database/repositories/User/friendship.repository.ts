import { Injectable } from '@nestjs/common';
import { FriendshipStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { snowflake } from 'src/common/utils/snowflake';

@Injectable()
export class FriendshipRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Find friendship between two users
  async findBetweenUsers(
    user1Id: bigint,
    user2Id: bigint,
    select?: Prisma.FriendshipSelect,
  ) {
    const options: any = select
      ? { select }
      : {
          include: {
            user1: true,
            user2: true,
          },
        };
    
    return this.prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id },
        ],
      },
      ...options,
    });
  }

  // Find friendship by ID
  async findById(
    id: string,
    select?: Prisma.FriendshipSelect,
  ) {
    const options: any = select
      ? { select }
      : {
          include: {
            user1: true,
            user2: true,
          },
        };
    
    return this.prisma.friendship.findUnique({
      where: { id: BigInt(id) },
      ...options,
    });
  }

  // Find friendships by status for a user
  async findByUserIdAndStatus(
    userId: bigint,
    status: FriendshipStatus,
    select?: Prisma.FriendshipSelect,
  ) {
    const options: any = select
      ? { select }
      : {
          include: {
            user1: true,
            user2: true,
          },
        };
    
    return this.prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId, status },
          { user2Id: userId, status },
        ],
      },
      ...options,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Count friendships by status for a user
  async countByUserIdAndStatus(userId: bigint, status: FriendshipStatus) {
    return this.prisma.friendship.count({
      where: {
        OR: [
          { user1Id: userId, status },
          { user2Id: userId, status },
        ],
      },
    });
  }

  // Find incoming friend requests for a user
  async findIncomingRequests(
    userId: bigint,
    select?: Prisma.FriendshipSelect,
  ) {
    const options: any = select
      ? { select }
      : {
          include: {
            user1: true,
          },
        };
    
    return this.prisma.friendship.findMany({
      where: {
        user2Id: userId,
        status: FriendshipStatus.PENDING,
      },
      ...options,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Find outgoing friend requests for a user
  async findOutgoingRequests(
    userId: bigint,
    select?: Prisma.FriendshipSelect,
  ) {
    const options: any = select
      ? { select }
      : {
          include: {
            user2: true,
          },
        };
    
    return this.prisma.friendship.findMany({
      where: {
        user1Id: userId,
        status: FriendshipStatus.PENDING,
      },
      ...options,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Check if two users are friends
  async areFriends(user1Id: bigint, user2Id: bigint) {
    const friendship = await this.findBetweenUsers(user1Id, user2Id);
    return friendship?.status === FriendshipStatus.ACCEPTED;
  }

  // Check if there's a pending request between users
  async hasPendingRequest(user1Id: bigint, user2Id: bigint) {
    const friendship = await this.findBetweenUsers(user1Id, user2Id);
    return friendship?.status === FriendshipStatus.PENDING;
  }

  // Get mutual friends between two users
  async getMutualFriends(
    user1Id: bigint,
    user2Id: bigint,
    userSelect?: Prisma.UserSelect,
  ) {
    // Get all friends of user1
    const user1Friends = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [
          { user1Id },
          { user2Id },
        ],
      },
    });

    // Get all friends of user2
    const user2Friends = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [
          { user1Id },
          { user2Id },
        ],
      },
    });

    // Extract user IDs from friendships
    const user1FriendIds = new Set(
      user1Friends.map(f => f.user1Id === user1Id ? f.user2Id : f.user1Id)
    );
    const user2FriendIds = new Set(
      user2Friends.map(f => f.user1Id === user2Id ? f.user2Id : f.user1Id)
    );

    // Find mutual friends
    const mutualFriendIds = [...user1FriendIds].filter(id => user2FriendIds.has(id));

    // Get user details for mutual friends
    return this.prisma.user.findMany({
      where: {
        id: { in: mutualFriendIds },
      },
      ...(userSelect && { select: userSelect }),
    });
  }

  // Create friendship with proper ID generation
  async createFriendship(
    data: Omit<Prisma.FriendshipCreateInput, 'id'>,
    select?: Prisma.FriendshipSelect,
  ) {
    return this.prisma.friendship.create({
      data: {
        ...data,
        id: snowflake.generate(),
      },
      ...(select && { select }),
    });
  }

  // Update friendship status
  async updateStatus(
    id: bigint,
    status: FriendshipStatus,
    select?: Prisma.FriendshipSelect,
  ) {
    return this.prisma.friendship.update({
      where: { id },
      data: { status },
      ...(select && { select }),
    });
  }

  // Delete friendship by user IDs
  async deleteByUserIds(
    user1Id: bigint,
    user2Id: bigint,
    select?: Prisma.FriendshipSelect,
  ) {
    const friendship = await this.findBetweenUsers(user1Id, user2Id);
    if (friendship) {
      return this.prisma.friendship.delete({
        where: { id: friendship.id },
        ...(select && { select }),
      });
    }
    return null;
  }
}