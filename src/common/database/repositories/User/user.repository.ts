import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma, UserStatus } from '@prisma/client';

/**
 * Repository for managing user data
 * Handles basic CRUD operations and user status management
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find user by ID
   */
  async findById(
    id: string | bigint,
    options?: {
      select?: Prisma.UserSelect;
      include?: Prisma.UserInclude | Record<string, boolean>;
    },
  ) {
    const { select, include } = options || {};
  
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      ...(select && { select }),
      ...(include && { include }),
    });
  
    return user;
  }
  

  /**
   * Find user by email
   */
  async findByEmail(
    email: string,
    select?: Prisma.UserSelect,
  ) {
    const user = await this.prisma.user.findUnique({ 
      where: { email },
      ...(select && { select }),
    });
    return user;
  }

  /**
   * Find user by username
   */
  async findByUsername(
    username: string,
    select?: Prisma.UserSelect,
  ) {
    const user = await this.prisma.user.findUnique({ 
      where: { username },
      ...(select && { select }),
    });
    return user;
  }

  /**
   * Create a new user
   * ID will be generated automatically by Prisma middleware
   */
  async create(
    data: Omit<Prisma.UserUncheckedCreateInput, 'id'>,
    select?: Prisma.UserSelect,
  ) {
    const user = await this.prisma.user.create({ 
      data: data as Prisma.UserUncheckedCreateInput,
      ...(select && { select }),
    });
    return user;
  }

  /**
   * Update user data
   */
  async update(
    id: string | bigint,
    data: Prisma.UserUpdateInput,
    select?: Prisma.UserSelect,
  ) {
    const user = await this.prisma.user.update({ 
      where: { id: BigInt(id) }, 
      data,
      ...(select && { select }),
    });
    return user;
  }

  /**
   * Delete user
   */
  async delete(
    id: string | bigint,
    select?: Prisma.UserSelect,
  ) {
    const user = await this.prisma.user.delete({ 
      where: { id: BigInt(id) },
      ...(select && { select }),
    });
    return user;
  }

  /**
   * Check if user exists by ID
   */
  async existsById(id: string | bigint): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * Check if email is already taken
   */
  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * Check if username is already taken
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * Get user statistics
   * @deprecated online count should use UnifiedPresenceService.getOnlineUsersCount() for real-time data
   * This method still uses DB which may not reflect actual online users
   */
  async getUserStats() {
    const [totalUsers, onlineUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { presence: { status: { not: UserStatus.Invisible } } } }),
    ]);

    return {
      total: totalUsers,
      online: onlineUsers, // This is from DB, may not be accurate - use Redis instead
      offline: totalUsers - onlineUsers,
    };
  }

  /**
   * Search users by username or globalname
   */
  async searchUsers(
    searchTerm: string,
    limit = 20,
    select?: Prisma.UserSelect,
  ) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            globalname: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      ...(select
        ? { select }
        : {
            select: {
              id: true,
              username: true,
              globalname: true,
              avatar: true,
              isBot: true,
            },
          }),
      take: limit,
      orderBy: {
        username: 'asc',
      },
    });
  }
}
