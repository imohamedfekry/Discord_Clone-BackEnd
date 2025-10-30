import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserDto } from '../../../common/dto/shared-response.dto';
import { User, UserStatusRecord } from '@prisma/client';
import {
  SendFriendRequestDto,
  RespondToFriendRequestDto,
  RemoveFriendDto,
  GetFriendsQueryDto,
  GetMutualFriendsDto,
  CancelFriendRequestDto,
} from './dto/friendship.dto';
import {
  UpdatePasswordDto,
  UpdateglobalnameDto,
  UpdateCustomStatusDto,
  UpdateUsernameDto,
  UpdatePresenceStatusDto,
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
import {
  FriendshipRepository,
  UserRelationRepository,
  UserRepository,
  PresenceRepository,
  UserStatusRecordRepository,
} from 'src/common/database/repositories/User';
import { verifyHash } from 'src/common/Global/security/hash.helper';
import { WebSocketGatewayService } from '../../websocket/User/websocket.gateway';
import { FriendshipNotifierService } from '../../websocket/User/friends/friendship-notifier.service';
import { UnifiedPresenceService } from '../../websocket/User/services/unified-presence.service';
import { FriendsCacheService } from '../../../common/Global/cache/User/friends-cache.service';
import { plainToInstance } from 'class-transformer';
import { ApiResponse } from 'src/common/shared/types';
import { RESPONSE_MESSAGES } from 'src/common/shared/response-messages';
import { success, fail } from 'src/common/utils/response.util';
import ms from 'ms';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userRelationRepository: UserRelationRepository,
    private readonly presenceRepository: PresenceRepository,
    private readonly statusRecordRepository: UserStatusRecordRepository,
    private readonly websocketGatewayService: WebSocketGatewayService,
    private readonly friendshipNotifier: FriendshipNotifierService,
    private readonly presenceService: UnifiedPresenceService,
    private readonly friendsCache: FriendsCacheService,
  ) {}

  // ==================== PROFILE MANAGEMENT ====================
  /**
   * Get current user profile
   */
  async getProfile(user: User): Promise<ApiResponse<UserDto>> {
    return success(
      RESPONSE_MESSAGES.USER.PROFILE_FETCHED,
      plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
    );
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
    const isCurrentPasswordValid: boolean = await verifyHash(
      dto.currentPassword,
      currentUser.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    // Update password
    const updatedUser = await this.userRepository.update(user.id.toString(), {
      password: dto.newPassword,
    });

    return success(RESPONSE_MESSAGES.USER.PASSWORD_UPDATED, {
      updatedAt: updatedUser.updatedAt,
    } as any);
  }

  /**
   * Update global name
   */
  async updateglobalname(user: User, dto: UpdateglobalnameDto) {
    await this.userRepository.update(user.id.toString(), {
      globalname: dto.globalname || null,
    });

    // broadcast to all friends
    const friends = await this.friendsCache.getFriends(user.id.toString());
    friends.forEach(friend => {
      this.websocketGatewayService.sendToUser(friend, 'user:globalname:updated', {
        userId: user.id.toString(),
        globalname: dto.globalname ,
        timestamp: new Date(),
      });
    });
    return success(RESPONSE_MESSAGES.USER.GLOBALNAME_UPDATED);
  }
  
  /**
   * Update custom status
   */
  async updateCustomStatus(user: User, dto: UpdateCustomStatusDto) {
    await this.statusRecordRepository.updateStatusRecord(user.id, {
      text: dto.text,
      emoji: dto.emoji,
      expiresAt: dto.expiresAt
      ? new Date(new Date().getTime() + ms(dto.expiresAt))
      : undefined,
    });

    // broadcast to all friends
    const friends = await this.friendsCache.getFriends(user.id.toString());
    friends.forEach(friend => {
      this.websocketGatewayService.sendToUser(friend, 'user:customstatus:updated', {
        userId: user.id.toString(),
        customstatus: {
          text: dto.text,
          emoji: dto.emoji,
          expiresAt: dto.expiresAt,
        },
        timestamp: new Date(),
      });
    });
    return success(RESPONSE_MESSAGES.USER.CUSTOM_STATUS_UPDATED);
  }

  /**
   * Update username
   */
  async updateUsername(user: User, dto: UpdateUsernameDto) {
    // Check if username is already taken
    const existingUser = await this.userRepository.findByUsername(dto.username);
    if (existingUser && existingUser.id !== user.id) {
      throw new ConflictException('Username is already taken');
    }

    await this.userRepository.update(user.id.toString(), {
      username: dto.username,
    });

    // broadcast to all friends
    const friends = await this.friendsCache.getFriends(user.id.toString());
    friends.forEach(friend => {
      this.websocketGatewayService.sendToUser(friend, 'user:username:updated', {
        userId: user.id.toString(),
        username: dto.username,
        timestamp: new Date(),
      });
    });
    return success(RESPONSE_MESSAGES.USER.USERNAME_UPDATED);
  }

  /**
   * Update presence status
   * Updates the database and broadcasts to WebSocket listeners
   */
  async updatePresenceStatus(user: User, dto: UpdatePresenceStatusDto) {
    const expiresAt = dto.expiresAt
      ? new Date(new Date().getTime() + ms(dto.expiresAt))
      : undefined;
    await this.presenceRepository.updateStatus(user.id, dto.status, expiresAt);
    // broadcast to all friends
    const friends = await this.friendsCache.getFriends(user.id.toString());
    friends.forEach(friend => {
      this.websocketGatewayService.sendToUser(friend, 'user:presence:updated', {
        userId: user.id.toString(),
        status: dto.status,
        timestamp: new Date(),
      });
    });
    return success(RESPONSE_MESSAGES.PRESENCE.STATUS_UPDATED);
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
      throw new BadRequestException(
        'Either username or userId must be provided',
      );
    }
    if (dto.username && dto.userId) {
      throw new BadRequestException(
        'Provide either username or userId, not both',
      );
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
          return success(RESPONSE_MESSAGES.FRIEND.REQUEST_ACCEPTED, {
            id: acceptedFriendship.id,
            status: acceptedFriendship.status,
            createdAt: acceptedFriendship.createdAt,
          });
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

    // Notify target user via WebSocket
    this.friendshipNotifier.notifyFriendRequestReceived(targetUser.id, {
      friendshipId: friendship.id,
      fromUser: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      status: friendship.status,
    });

    return success(RESPONSE_MESSAGES.FRIEND.REQUEST_SENT, {
      id: friendship.id,
      status: friendship.status,
      createdAt: friendship.createdAt,
    });
  }

  /**
   * Respond to friend request
   */
  async respondToFriendRequest(user: User, dto: RespondToFriendRequestDto) {
    // Find the friendship
    const friendship = await this.friendshipRepository.findById(
      dto.friendshipId,
    );
    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    // Validate that current user is the recipient and status is PENDING
    if (
      friendship.user2Id !== user.id ||
      friendship.status !== FriendshipStatus.PENDING
    ) {
      throw new NotFoundException('Friend request not found');
    }

    // Get sender info for notifications
    const senderId = friendship.user1Id;
    const senderInfo = await this.userRepository.findById(senderId.toString());

    if (!senderInfo) {
      throw new NotFoundException('Sender not found');
    }

    // If REJECTED, delete the friendship
    if (dto.status === 'REJECTED') {
      await this.friendshipRepository.deleteByUserIds(
        friendship.user1Id,
        friendship.user2Id,
      );

      // Notify the sender that request was rejected
      this.friendshipNotifier.notifyFriendRequestRejected(
        friendship.user1Id.toString(),
        {
          friendshipId: dto.friendshipId,
          byUser: {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
          },
        },
      );

      return success(RESPONSE_MESSAGES.FRIEND.REQUEST_REJECTED);
    }

    // If ACCEPTED, update status
    const acceptedFriendship = await this.friendshipRepository.updateStatus(
      friendship.id,
      FriendshipStatus.ACCEPTED,
    );

    // Update Redis cache - add each other as friends
    await this.friendsCache.addFriend(
      user.id.toString(),
      senderInfo.id.toString(),
    );

    // Notify both users that friendship was accepted
    this.friendshipNotifier.notifyFriendRequestAccepted(
      friendship.user1Id.toString(),
      {
        friendshipId: acceptedFriendship.id,
        newFriend: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        },
        status: acceptedFriendship.status,
      },
    );

    this.friendshipNotifier.notifyFriendRequestAccepted(user.id.toString(), {
      friendshipId: acceptedFriendship.id,
      newFriend: {
        id: senderInfo.id,
        username: senderInfo.username,
        avatar: senderInfo.avatar,
      },
      status: acceptedFriendship.status,
    });

    return success(RESPONSE_MESSAGES.FRIEND.REQUEST_ACCEPTED, {
      id: acceptedFriendship.id,
      status: acceptedFriendship.status,
      createdAt: acceptedFriendship.createdAt,
    });
  }

  /**
   * Cancel friend request (before it's responded to)
   * Only the sender can cancel their outgoing friend request
   */
  async cancelFriendRequest(user: User, dto: CancelFriendRequestDto) {
    // Find the friendship
    const friendship = await this.friendshipRepository.findById(
      dto.friendshipId,
    );
    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    // Validate that current user is the sender and status is PENDING
    if (
      friendship.user1Id !== user.id ||
      friendship.status !== FriendshipStatus.PENDING
    ) {
      throw new NotFoundException(
        'Friend request not found or cannot be cancelled',
      );
    }

    // Get recipient info for notification
    const recipientInfo = await this.userRepository.findById(
      friendship.user2Id.toString(),
    );

    if (!recipientInfo) {
      throw new NotFoundException('Recipient not found');
    }

    // Delete the friend request
    await this.friendshipRepository.deleteByUserIds(
      friendship.user1Id,
      friendship.user2Id,
    );

    // Notify the recipient that request was cancelled
    this.friendshipNotifier.notifyFriendRequestCancelled(
      recipientInfo.id.toString(),
      {
        friendshipId: dto.friendshipId,
        byUser: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        },
      },
    );

    return success(RESPONSE_MESSAGES.FRIEND.REQUEST_CANCELLED, {
      friendshipId: dto.friendshipId,
    });
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
    const isParticipant =
      friendship.user1Id === user.id || friendship.user2Id === user.id;
    if (!isParticipant) {
      throw new NotFoundException('Friendship not found');
    }

    // Delete friendship
    await this.friendshipRepository.deleteByUserIds(
      user.id,
      BigInt(dto.userId),
    );

    // Update Redis cache - remove from each other's friends list
    await this.friendsCache.removeFriend(user.id.toString(), dto.userId);

    return success(RESPONSE_MESSAGES.FRIEND.REMOVED);
  }

  /**
   * Get friends list
   * Uses cache-first strategy: check Redis cache first, then database
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
    const formattedFriends = await Promise.all(
      friends.map(async (friendship: any) => {
        const friend =
          friendship.user1Id === user.id ? friendship.user2 : friendship.user1;

        // Get friend's current presence status and custom status
        const friendPresence =
          await this.presenceRepository.getPresenceWithCurrentStatus(friend.id);
        const friendStatusRecord =
          await this.statusRecordRepository.getStatusRecordByUserId(friend.id);

        return {
          id: friend.id,
          username: friend.username,
          avatar: friend.avatar,
          friendshipId: friendship.id,
          status: friendPresence?.status,
          customStatus: friendStatusRecord?.text || undefined,
          createdAt: friendship.createdAt,
          // SECURITY: Removed email - too sensitive for friends list
        };
      }),
    );

    return success(RESPONSE_MESSAGES.FRIEND.LIST_FETCHED, {
      friends: formattedFriends.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  /**
   * Get friend requests (incoming)
   */
  async getIncomingRequests(user: User) {
    const requests = await this.friendshipRepository.findIncomingRequests(
      user.id,
    );

    return success(RESPONSE_MESSAGES.FRIEND.INCOMING_FETCHED, 
      requests.map((request: any) => ({
        id: request.id,
        user: {
          id: request.user1.id,
          username: request.user1.username,
          avatar: request.user1.avatar,
          // SECURITY: Removed email - too sensitive
        },
        status: request.status,
        createdAt: request.createdAt,
      })));
  }

  /**
   * Get outgoing friend requests
   */
  async getOutgoingRequests(user: User) {
    const requests = await this.friendshipRepository.findOutgoingRequests(
      user.id,
    );

    return success(RESPONSE_MESSAGES.FRIEND.OUTGOING_FETCHED,
      requests.map((request: any) => ({
        id: request.id,
        user: {
          id: request.user2.id,
          username: request.user2.username,
          avatar: request.user2.avatar,
          // SECURITY: Removed email - too sensitive
        },
        status: request.status,
        createdAt: request.createdAt,
      })));
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
    const mutualFriendsList = await Promise.all(
      mutualFriends.map(async (friend) => {
        const friendPresence =
          await this.presenceRepository.getPresenceWithCurrentStatus(friend.id);
        const friendStatusRecord =
          await this.statusRecordRepository.getStatusRecordByUserId(friend.id);

        return {
          id: friend.id,
          username: friend.username,
          avatar: friend.avatar,
          status: friendPresence?.status,
          customStatus: friendStatusRecord?.text || undefined,
          // SECURITY: Removed email - too sensitive
        };
      }),
    );

    return success(RESPONSE_MESSAGES.FRIEND.MUTUAL_FETCHED, mutualFriendsList);
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
    const relation = (await this.userRelationRepository.createOrUpdateRelation({
      sourceId: user.id,
      targetId: BigInt(dto.targetUserId),
      type: dto.type,
      note: dto.note,
    })) as any;

    return {
      id: relation.id,
      type: relation.type,
      targetUser: {
        id: relation.target.id,
        username: relation.target.username,
        globalname: relation.target.globalname,
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
    const relation = (await this.userRelationRepository.createOrUpdateRelation({
      sourceId: user.id,
      targetId: BigInt(dto.targetUserId),
      type: dto.type,
      note: dto.note,
    })) as any;

    return {
      id: relation.id,
      type: relation.type,
      targetUser: {
        id: relation.target.id,
        username: relation.target.username,
        globalname: relation.target.globalname,
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

    const formattedRelations = await Promise.all(
      relations.map(async (relation) => {
        // Get target user's current presence status and custom status
        const targetPresence =
          await this.presenceRepository.getPresenceWithCurrentStatus(
            relation.target.id,
          );
        const targetStatusRecord =
          await this.statusRecordRepository.getStatusRecordByUserId(
            relation.target.id,
          );

        return {
          id: relation.id,
          type: relation.type,
          targetUser: {
            id: relation.target.id,
            username: relation.target.username,
            globalname: relation.target.globalname,
            avatar: relation.target.avatar,
            status: targetPresence?.status,
            customStatus: targetStatusRecord?.text || undefined,
          },
          note: relation.note,
          createdAt: relation.createdAt,
          updatedAt: relation.updatedAt,
        };
      }),
    );

    return formattedRelations;
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(user: User) {
    const blockedUsers = await this.userRelationRepository.getBlockedUsers(
      user.id,
    );

    const formattedBlockedUsers = await Promise.all(
      blockedUsers.map(async (relation: any) => {
        // Get target user's current presence status and custom status
        const targetPresence =
          await this.presenceRepository.getPresenceWithCurrentStatus(
            relation.target.id,
          );
        const targetStatusRecord =
          await this.statusRecordRepository.getStatusRecordByUserId(
            relation.target.id,
          );

        return {
          id: relation.id,
          targetUser: {
            id: relation.target.id,
            username: relation.target.username,
            globalname: relation.target.globalname,
            avatar: relation.target.avatar,
            status: targetPresence?.status,
            customStatus: targetStatusRecord?.text || undefined,
          },
          note: relation.note,
          createdAt: relation.createdAt,
          updatedAt: relation.updatedAt,
        };
      }),
    );

    return formattedBlockedUsers;
  }

  /**
   * Get ignored users
   */
  async getIgnoredUsers(user: User) {
    const ignoredUsers = await this.userRelationRepository.getIgnoredUsers(
      user.id,
    );

    const formattedIgnoredUsers = await Promise.all(
      ignoredUsers.map(async (relation: any) => {
        // Get target user's current presence status and custom status
        const targetPresence =
          await this.presenceRepository.getPresenceWithCurrentStatus(
            relation.target.id,
          );
        const targetStatusRecord =
          await this.statusRecordRepository.getStatusRecordByUserId(
            relation.target.id,
          );

        return {
          id: relation.id,
          targetUser: {
            id: relation.target.id,
            username: relation.target.username,
            globalname: relation.target.globalname,
            avatar: relation.target.avatar,
            status: targetPresence?.status,
            customStatus: targetStatusRecord?.text || undefined,
          },
          note: relation.note,
          createdAt: relation.createdAt,
          updatedAt: relation.updatedAt,
        };
      }),
    );

    return formattedIgnoredUsers;
  }

  /**
   * Get muted users
   */
  async getMutedUsers(user: User) {
    const mutedUsers = await this.userRelationRepository.getMutedUsers(user.id);

    const formattedMutedUsers = await Promise.all(
      mutedUsers.map(async (relation: any) => {
        // Get target user's current presence status and custom status
        const targetPresence =
          await this.presenceRepository.getPresenceWithCurrentStatus(
            relation.target.id,
          );
        const targetStatusRecord =
          await this.statusRecordRepository.getStatusRecordByUserId(
            relation.target.id,
          );

        return {
          id: relation.id,
          targetUser: {
            id: relation.target.id,
            username: relation.target.username,
            globalname: relation.target.globalname,
            avatar: relation.target.avatar,
            status: targetPresence?.status,
            customStatus: targetStatusRecord?.text || undefined,
          },
          note: relation.note,
          createdAt: relation.createdAt,
          updatedAt: relation.updatedAt,
        };
      }),
    );

    return formattedMutedUsers;
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
