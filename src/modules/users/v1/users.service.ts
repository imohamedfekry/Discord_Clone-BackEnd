import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { FriendshipRepository } from '../../../common/database/repositories/friendship.repository';
import { UserRelationRepository } from '../../../common/database/repositories/user-relation.repository';
import { UserProfileResponseDto } from '../../../common/dto/shared-response.dto';
import { User, RelationType } from '@prisma/client';
import {
  SendFriendRequestDto,
  RespondToFriendRequestDto,
  RemoveFriendDto,
  GetFriendsQueryDto,
  GetMutualFriendsDto,
} from './dto/friendship.dto';
import {
  UpdatePasswordDto,
  UpdateGlobalNameDto,
  UpdateCustomStatusDto,
  UpdateUsernameDto,
} from './dto/profile.dto';
import {
  CreateUserRelationDto,
  UpdateUserRelationDto,
  RemoveUserRelationDto,
  GetUserRelationsQueryDto,
  CheckUserRelationDto,
  UpdateRelationNoteDto,
} from './dto/user-relation.dto';
import { FriendshipStatus } from '@prisma/client';
import { UserRepository } from 'src/common/database/repositories';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userRelationRepository: UserRelationRepository,
  ) {}

  // ==================== PROFILE MANAGEMENT ====================
  /**
   * Get current user profile
   */
  async getProfile(user: User): Promise<UserProfileResponseDto> {
    return {
      id: user.id.toString(),
      username: user.username,
      globalName: user.globalName || undefined,
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || undefined,
      status: user.status,
      customStatus: user.customStatus || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update user password
   */
  async updatePassword(user: User, dto: UpdatePasswordDto) {
    // Get current user with password
    const currentUser = await this.userRepository.findById(user.id.toString());
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // Verify current password (you'll need to implement password verification)
    // For now, we'll assume there's a password verification method
    // const isCurrentPasswordValid = await this.verifyPassword(dto.currentPassword, currentUser.password);
    // if (!isCurrentPasswordValid) {
    //   throw new BadRequestException('Current password is incorrect');
    // }

    // Hash new password (you'll need to implement password hashing)
    // const hashedNewPassword = await this.hashPassword(dto.newPassword);

    // Update password
    const updatedUser = await this.userRepository.update(user.id.toString(), {
      password: dto.newPassword, // In real implementation, use hashedNewPassword
    });

    return {
      message: 'Password updated successfully',
      updatedAt: updatedUser.updatedAt,
    };
  }

  /**
   * Update global name
   */
  async updateGlobalName(user: User, dto: UpdateGlobalNameDto) {
    const updatedUser = await this.userRepository.update(user.id.toString(), {
      globalName: dto.globalName || null,
    });

    return {
      globalName: updatedUser.globalName,
      message: 'Global name updated successfully',
      updatedAt: updatedUser.updatedAt,
    };
  }

  /**
   * Update custom status
   */
  async updateCustomStatus(user: User, dto: UpdateCustomStatusDto) {
    const updatedUser = await this.userRepository.update(user.id.toString(), {
      customStatus: dto.customStatus || null,
    });

    return {
      customStatus: updatedUser.customStatus,
      message: 'Custom status updated successfully',
      updatedAt: updatedUser.updatedAt,
    };
  }

  /**
   * Update username
   */
  async updateUsername(user: User, dto: UpdateUsernameDto) {
    // Check if username is already taken
    const existingUser = await this.userRepository.findByUsername(dto.username);
    if (existingUser && existingUser.id !== user.id.toString()) {
      throw new ConflictException('Username is already taken');
    }

    const updatedUser = await this.userRepository.update(user.id.toString(), {
      username: dto.username,
    });

    return {
      username: updatedUser.username,
      message: 'Username updated successfully',
      updatedAt: updatedUser.updatedAt,
    };
  }


  // ==================== FRIENDSHIP MANAGEMENT ====================
  /**
   * Send friend request by username or user ID
   * @param user - Current authenticated user
   * @param dto - Send friend request data (username OR userId required)
   * @returns Created friendship or auto-accepted friendship
   */
  async sendFriendRequest(user: User, dto: SendFriendRequestDto) {
    // Validate that either username or userId is provided
    if (!dto.username && !dto.userId) {
      throw new BadRequestException('Either username or userId must be provided');
    }
    if (dto.username && dto.userId) {
      throw new BadRequestException('Provide either username or userId, not both');
    }

    let targetUser;

    // Find target user by username or ID
    if (dto.username) {
      // Check if user is trying to add themselves
      if (user.username === dto.username) {
        throw new BadRequestException('Cannot send friend request to yourself');
      }

      // Find user by username (slower but more secure)
      targetUser = await this.userRepository.findByUsername(dto.username);
    } else {
      // Check if user is trying to add themselves
      if (user.id.toString() === dto.userId) {
        throw new BadRequestException('Cannot send friend request to yourself');
      }

      // Find user by ID (faster)
      targetUser = await this.userRepository.findById(dto.userId!);
    }

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if friendship already exists
    const existingFriendship = await this.friendshipRepository.findBetweenUsers(
      user.id,
      BigInt(targetUser.id),
    );
    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new ConflictException('Users are already friends');
      } else if (existingFriendship.status === FriendshipStatus.PENDING) {
        // If there's a pending request from the target user to current user, accept it
        if (
          existingFriendship.user1Id === BigInt(targetUser.id) &&
          existingFriendship.user2Id === user.id
        ) {
          const acceptedFriendship =
            await this.friendshipRepository.updateStatus(
              existingFriendship.id,
              FriendshipStatus.ACCEPTED,
            );
          return {
            id: acceptedFriendship.id,
            status: acceptedFriendship.status,
            createdAt: acceptedFriendship.createdAt,
            message: 'Friend request accepted automatically',
          };
          // else if (existingFriendship.status === FriendshipStatus.PENDING) {
          //   throw new ConflictException('Friend request already pending');
          // }
        } else {
          // If there's already a pending request from current user to target user
          throw new ConflictException('Friend request already pending');
        }
      } else if (existingFriendship.status === 'BLOCKED') {
        throw new ConflictException(
          'Cannot send friend request to blocked user',
        );
      }
    }

    // Create friend request
    const friendship = await this.friendshipRepository.createFriendship({
      user1: { connect: { id: user.id } },
      user2: { connect: { id: BigInt(targetUser.id) } },
      status: FriendshipStatus.PENDING,
    });

    return {
      id: friendship.id,
      status: friendship.status,
      createdAt: friendship.createdAt,
    };
  }


  /**
   * Respond to friend request
   */
  async respondToFriendRequest(
    user: User,
    dto: RespondToFriendRequestDto,
  ) {

    // Find the friendship
    const friendship = await this.friendshipRepository.findById(dto.friendshipId);
    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }
    if (friendship.user1Id !== user.id && friendship.status !== FriendshipStatus.PENDING) {
      throw new NotFoundException('Friend request not found');
    }

    // If REJECTED, delete the friendship
    if (dto.status === 'REJECTED') {
      await this.friendshipRepository.deleteByUserIds(
        friendship.user1Id,
        friendship.user2Id,
      );
      return { message: 'Friend request rejected successfully' };
    }

    // If ACCEPTED, update status
    const acceptedFriendship = await this.friendshipRepository.updateStatus(
      friendship.id,
      FriendshipStatus.ACCEPTED,
    );
    return {
      id: acceptedFriendship.id,
      status: acceptedFriendship.status,
      createdAt: acceptedFriendship.createdAt,
      message: 'Friend request accepted successfully',
    };
  }

  /**
   * Remove friend
   */
  async removeFriend(user: User, dto: RemoveFriendDto) {
    // Check if friendship exists
    const friendship = await this.friendshipRepository.findBetweenUsers(
      user.id,
      BigInt(dto.userId),
    );
    if (!friendship || friendship.status !== FriendshipStatus.ACCEPTED) {
      throw new NotFoundException('Friendship not found');
    }

    // Privacy check: Only participants can remove friendship
    const isParticipant = friendship.user1Id === user.id || friendship.user2Id === user.id;
    if (!isParticipant) {
      throw new NotFoundException('Friendship not found');
    }

    // Delete friendship
    await this.friendshipRepository.deleteByUserIds(
      user.id,
      BigInt(dto.userId),
    );

    return { message: 'Friend removed successfully' };
  }

  /**
   * Get friends list
   */
  async getFriends(user: User, query: GetFriendsQueryDto) {
    const status = query.status || FriendshipStatus.ACCEPTED;
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const [friends, total] = await Promise.all([
      this.friendshipRepository.findByUserIdAndStatus(user.id, status),
      this.friendshipRepository.countByUserIdAndStatus(user.id, status),
    ]);

    // Format friends data - SECURITY: Don't expose sensitive info
    const formattedFriends = friends.map((friendship) => {
      const friend =
        friendship.user1Id === user.id
          ? friendship.user2
          : friendship.user1;
      return {
        id: friend.id,
        username: friend.username,
        avatar: friend.avatar,
        friendshipId: friendship.id,
        status: friendship.status,
        createdAt: friendship.createdAt,
        // SECURITY: Removed email - too sensitive for friends list
      };
    });

    return {
      friends: formattedFriends.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get friend requests (incoming)
   */
  async getIncomingRequests(user: User) {
    const requests = await this.friendshipRepository.findIncomingRequests(
      user.id,
    );

    return requests.map((request) => ({
      id: request.id,
      user: {
        id: request.user1.id,
        username: request.user1.username,
        avatar: request.user1.avatar,
        // SECURITY: Removed email - too sensitive
      },
      status: request.status,
      createdAt: request.createdAt,
    }));
  }

  /**
   * Get outgoing friend requests
   */
  async getOutgoingRequests(user: User) {
    const requests = await this.friendshipRepository.findOutgoingRequests(
      user.id,
    );

    return requests.map((request) => ({
      id: request.id,
      user: {
        id: request.user2.id,
        username: request.user2.username,
        avatar: request.user2.avatar,
        // SECURITY: Removed email - too sensitive
      },
      status: request.status,
      createdAt: request.createdAt,
    }));
  }

  /**
   * Get mutual friends
   */
  async getMutualFriends(user: User, dto: GetMutualFriendsDto) {
    // SECURITY: Check if users are friends first (privacy: only friends can see mutual friends)
    const friendship = await this.friendshipRepository.findBetweenUsers(
      user.id,
      BigInt(dto.userId),
    );
    
    // SECURITY: Don't reveal if user exists or not
    if (!friendship || friendship.status !== FriendshipStatus.ACCEPTED) {
      throw new NotFoundException('User not found');
    }

    const mutualFriends = await this.friendshipRepository.getMutualFriends(
      user.id,
      BigInt(dto.userId),
    );

    // SECURITY: Don't expose sensitive information
    return mutualFriends.map((friend) => ({
      id: friend.id,
      username: friend.username,
      avatar: friend.avatar,
      // SECURITY: Removed email - too sensitive
    }));
  }

  /**
   * Check if two users are friends
   */
  async checkFriendship(user: User, targetUserId: string) {
    // SECURITY: Don't check if user exists to prevent enumeration
    // Only check friendship status between current user and target ID
    
    const areFriends = await this.friendshipRepository.areFriends(
      user.id,
      BigInt(targetUserId),
    );
    const hasPendingRequest = await this.friendshipRepository.hasPendingRequest(
      user.id,
      BigInt(targetUserId),
    );

    // SECURITY: Always return same structure regardless of user existence
    return {
      areFriends: areFriends || false,
      hasPendingRequest: hasPendingRequest || false,
    };
  }

  // ==================== USER RELATIONS ====================

  /**
   * Create or update a user relation (block, ignore, mute)
   */
  async createUserRelation(user: User, dto: CreateUserRelationDto) {
    // Check if target user exists
    const targetUser = await this.userRepository.findById(dto.targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Prevent self-relation
    if (user.id.toString() === dto.targetUserId) {
      throw new BadRequestException('Cannot create relation with yourself');
    }

    // Create or update the relation
    const relation = await this.userRelationRepository.createOrUpdateRelation({
      sourceId: user.id,
      targetId: BigInt(dto.targetUserId),
      type: dto.type,
      note: dto.note,
    }) as any;

    return {
      id: relation.id,
      type: relation.type,
      targetUser: {
        id: relation.target.id,
        username: relation.target.username,
        globalName: relation.target.globalName,
        avatar: relation.target.avatar,
      },
      note: relation.note,
      createdAt: relation.createdAt,
      updatedAt: relation.updatedAt,
    };
  }

  /**
   * Update a user relation
   */
  async updateUserRelation(user: User, dto: UpdateUserRelationDto) {
    // Check if relation exists
    const existingRelation = await this.userRelationRepository.getRelation(
      user.id,
      BigInt(dto.targetUserId),
      dto.type,
    );

    if (!existingRelation) {
      throw new NotFoundException('Relation not found');
    }

    // Update the relation
    const relation = await this.userRelationRepository.createOrUpdateRelation({
      sourceId: user.id,
      targetId: BigInt(dto.targetUserId),
      type: dto.type,
      note: dto.note,
    }) as any;

    return {
      id: relation.id,
      type: relation.type,
      targetUser: {
        id: relation.target.id,
        username: relation.target.username,
        globalName: relation.target.globalName,
        avatar: relation.target.avatar,
      },
      note: relation.note,
      createdAt: relation.createdAt,
      updatedAt: relation.updatedAt,
    };
  }

  /**
   * Remove a user relation
   */
  async removeUserRelation(user: User, dto: RemoveUserRelationDto) {
    // Check if relation exists
    const existingRelation = await this.userRelationRepository.getRelation(
      user.id,
      BigInt(dto.targetUserId),
      dto.type,
    );

    if (!existingRelation) {
      throw new NotFoundException('Relation not found');
    }

    // Remove the relation
    await this.userRelationRepository.removeRelation(
      user.id,
      BigInt(dto.targetUserId),
      dto.type,
    );

    return { message: 'Relation removed successfully' };
  }

  /**
   * Get user relations
   */
  async getUserRelations(user: User, query: GetUserRelationsQueryDto) {
    let relations;

    if (query.type) {
      relations = await this.userRelationRepository.getSourceRelations(
        user.id,
        query.type,
      );
    } else {
      relations = await this.userRelationRepository.getSourceRelations(user.id);
    }

    return relations.map((relation) => ({
      id: relation.id,
      type: relation.type,
      targetUser: {
        id: relation.target.id,
        username: relation.target.username,
        globalName: relation.target.globalName,
        avatar: relation.target.avatar,
        status: relation.target.status,
      },
      note: relation.note,
      createdAt: relation.createdAt,
      updatedAt: relation.updatedAt,
    }));
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(user: User) {
    const blockedUsers = await this.userRelationRepository.getBlockedUsers(user.id);

    return blockedUsers.map((relation) => ({
      id: relation.id,
      targetUser: {
        id: relation.target.id,
        username: relation.target.username,
        globalName: relation.target.globalName,
        avatar: relation.target.avatar,
        status: relation.target.status,
      },
      note: relation.note,
      createdAt: relation.createdAt,
      updatedAt: relation.updatedAt,
    }));
  }

  /**
   * Get ignored users
   */
  async getIgnoredUsers(user: User) {
    const ignoredUsers = await this.userRelationRepository.getIgnoredUsers(user.id);

    return ignoredUsers.map((relation) => ({
      id: relation.id,
      targetUser: {
        id: relation.target.id,
        username: relation.target.username,
        globalName: relation.target.globalName,
        avatar: relation.target.avatar,
        status: relation.target.status,
      },
      note: relation.note,
      createdAt: relation.createdAt,
      updatedAt: relation.updatedAt,
    }));
  }

  /**
   * Get muted users
   */
  async getMutedUsers(user: User) {
    const mutedUsers = await this.userRelationRepository.getMutedUsers(user.id);

    return mutedUsers.map((relation) => ({
      id: relation.id,
      targetUser: {
        id: relation.target.id,
        username: relation.target.username,
        globalName: relation.target.globalName,
        avatar: relation.target.avatar,
        status: relation.target.status,
      },
      note: relation.note,
      createdAt: relation.createdAt,
      updatedAt: relation.updatedAt,
    }));
  }

  /**
   * Check if user has a specific relation with another user
   */
  async checkUserRelation(user: User, dto: CheckUserRelationDto) {
    const hasRelation = await this.userRelationRepository.hasRelation(
      user.id,
      BigInt(dto.targetUserId),
      dto.type,
    );

    return {
      hasRelation,
      type: dto.type,
      targetUserId: dto.targetUserId,
    };
  }

  /**
   * Update relation note
   */
  async updateRelationNote(user: User, dto: UpdateRelationNoteDto) {
    // Check if relation exists
    const existingRelation = await this.userRelationRepository.getRelation(
      user.id,
      BigInt(dto.targetUserId),
      dto.type,
    );

    if (!existingRelation) {
      throw new NotFoundException('Relation not found');
    }

    // Update the note
    const relation = await this.userRelationRepository.updateRelationNote(
      user.id,
      BigInt(dto.targetUserId),
      dto.type,
      dto.note,
    );

    return {
      id: relation.id,
      type: relation.type,
      note: relation.note,
      updatedAt: relation.updatedAt,
    };
  }

  /**
   * Get relation statistics
   */
  async getRelationStats(user: User) {
    const stats = await this.userRelationRepository.getRelationStats(user.id);

    return {
      blocked: stats.blocked,
      ignored: stats.ignored,
      muted: stats.muted,
      total: stats.total,
    };
  }
}
