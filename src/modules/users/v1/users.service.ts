import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { User, UserStatusRecord, UserStatus, Prisma, RelationType } from '@prisma/client';
import {
  // Profile DTOs
  UpdatePasswordDto,
  UpdateglobalnameDto,
  UpdateCustomStatusDto,
  UpdateUsernameDto,
  UpdatePresenceStatusDto,
  // Friendship DTOs
  SendFriendRequestDto,
  RespondToFriendRequestDto,
  RemoveFriendDto,
  GetFriendsQueryDto,
  GetMutualFriendsDto,
  CheckFriendshipDto,
  CancelFriendRequestDto,
  // User Relation DTOs
  CreateUserRelationDto,
  UpdateUserRelationDto,
  RemoveUserRelationDto,
  GetUserRelationsQueryDto,
  CheckUserRelationDto,
  UpdateRelationNoteDto,
  CreateDMDto,
} from './dto/user.dto';
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
import { UnifiedNotifierService } from '../../websocket/User/services/unified-notifier.service';
import { UnifiedPresenceService } from '../../websocket/User/services/unified-presence.service';
import { FriendsCacheService } from '../../../common/Global/cache/User/friends-cache.service';
import { plainToInstance } from 'class-transformer';
import { ApiResponse } from 'src/common/shared/types';
import { RESPONSE_MESSAGES } from 'src/common/shared/response-messages';
import { success, fail } from 'src/common/utils/response.util';
import { UserProfileResponseDto, PresenceDto, UserStatusRecordDto, FriendRequestItemDto } from './dto/user-response.dto';
import { UserDto } from './dto/user-types.dto';
import ms from 'ms';
import {
  NotificationEvent,
  UserBlockedData,
  UserUnblockedData,
  UserIgnoredData,
  UserUnignoredData,
} from '../../../common/Types/notification.types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userRelationRepository: UserRelationRepository,
    private readonly presenceRepository: PresenceRepository,
    private readonly statusRecordRepository: UserStatusRecordRepository,
    @Inject(forwardRef(() => WebSocketGatewayService)) private readonly websocketGatewayService: WebSocketGatewayService,
    @Inject(forwardRef(() => FriendshipNotifierService)) private readonly friendshipNotifier: FriendshipNotifierService,
    @Inject(forwardRef(() => UnifiedNotifierService)) private readonly unifiedNotifier: UnifiedNotifierService,
    @Inject(forwardRef(() => UnifiedPresenceService)) private readonly presenceService: UnifiedPresenceService,
    @Inject(forwardRef(() => FriendsCacheService)) private readonly friendsCache: FriendsCacheService,
  ) { }

  // ==================== PROFILE MANAGEMENT ====================
  /**
   * Get current user profile
   * - isOnline: From Redis (WebSocket connection status) only
   * - status: From Presence.status in Database (Display Status)
   * - customStatus: From UserStatusRecord.text in Database
   */
  async getProfile(
    user: Prisma.UserGetPayload<{
      include: {
        presence: true;
        statusRecord: true;
      };
    }>
  ): Promise<ApiResponse<UserProfileResponseDto>> {
    // Optimized: Get isOnline from Redis (uses MGET internally for single round-trip)
    const presenceStatus = await this.presenceService.getPresenceStatus(user.id.toString());

    // Build UserDto - use plainToInstance with excludeExtraneousValues for proper transformation
    const userDto = plainToInstance(UserDto, user, { excludeExtraneousValues: true });

    // Build PresenceDto - calculate status once
    const finalStatus = presenceStatus.isOnline
      ? (presenceStatus.displayStatus || user.presence?.status || null)
      : UserStatus.INVISIBLE;

    const presenceDto: PresenceDto = {
      status: finalStatus,
    };

    // Build UserStatusRecordDto - use user.statusRecord directly
    const customStatusDto: UserStatusRecordDto = user.statusRecord
      ? {
        text: user.statusRecord.text || null,
        emoji: user.statusRecord.emoji || null,
      }
      : {
        text: null,
        emoji: null,
      };

    // Build UserProfileResponseDto - use plainToInstance for proper transformation and type safety
    const profileData = plainToInstance(UserProfileResponseDto, {
      user: userDto,
      presence: presenceDto,
      customStatus: presenceStatus.isOnline ? customStatusDto : null,
      isOnline: presenceStatus.isOnline,
    }, { excludeExtraneousValues: true });

    return success(RESPONSE_MESSAGES.USER.PROFILE_FETCHED, profileData as UserProfileResponseDto);
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
      updatedAt: updatedUser.updatedAt?.toISOString() || null,
    });
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
        globalname: dto.globalname,
        timestamp: new Date(),
      });
    });
    return success(RESPONSE_MESSAGES.USER.GLOBALNAME_UPDATED);
  }

  /**
   * Update custom status
   */
  async updateCustomStatus(user: User, dto: UpdateCustomStatusDto) {
    // Get or create status record for user
    let statusRecord = await this.statusRecordRepository.getStatusRecordByUserId(user.id);
    if (!statusRecord) {
      statusRecord = await this.statusRecordRepository.createStatusRecord({
        userId: user.id,
      });
    }

    await this.statusRecordRepository.updateStatusRecord(statusRecord.id, {
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
   * Updates the database, Redis display status, and broadcasts to WebSocket listeners
   */
  async updatePresenceStatus(user: User, dto: UpdatePresenceStatusDto) {
    // Use UnifiedPresenceService to update both DB and Redis, and broadcast to friends
    // This ensures display status is properly stored in Redis for real-time presence
    await this.presenceService.updatePresenceStatus(
      user.id.toString(),
      user.username,
      dto.status,
      true, // updateDisplayStatus = true (update Redis)
    );

    // Handle expiresAt if provided (optional feature)
    if (dto.expiresAt) {
      const expiresAt = new Date(new Date().getTime() + ms(dto.expiresAt));
      let presence = await this.presenceRepository.getPresenceByUserId(user.id);
      if (!presence) {
        presence = await this.presenceRepository.createPresence(user.id);
      }
      await this.presenceRepository.updateStatus(presence.id, dto.status, expiresAt);
    }

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
    this.friendshipNotifier.notifyFriendRequestReceived(
      targetUser.id,
      user.id.toString(),
      {
        id: targetUser.id,
        username: targetUser.username,
        avatar: targetUser.avatar,
      },
      {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      friendship.id,
      friendship.status,
    );

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
        user.id.toString(),
        {
          friendshipId: dto.friendshipId,
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
      user.id.toString(),
      recipientInfo.id.toString(),
      {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      dto.friendshipId,
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

    this.friendshipNotifier.notifyFriendRemoved(
      dto.userId,
      user.id.toString(),
      {
        friendshipId: friendship.id,
      },
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

        // Get friend's current presence status from Redis (real-time) and custom status from DB
        const [friendPresenceStatus, friendStatusRecord] = await Promise.all([
          this.presenceService.getPresenceStatus(friend.id.toString()),
          this.statusRecordRepository.getStatusRecordByUserId(friend.id),
        ]);

        return {
          id: friend.id,
          username: friend.username,
          avatar: friend.avatar,
          friendshipId: friendship.id,
          status: friendPresenceStatus.actualStatus,
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
  async getFriendRequests(user: User) {
    const all = await this.friendshipRepository.findAllPendingRequests(user.id);


    const incoming: FriendRequestItemDto[] = [];
    const outgoing: FriendRequestItemDto[] = [];

    for (const request of all) {
      const isIncoming = request.user2Id === user.id;

      const formatted = plainToInstance(FriendRequestItemDto, {
        id: request.id,
        user: {
          id: (isIncoming ? request.user1.id : request.user2.id),
          username: isIncoming ? request.user1.username : request.user2.username,
          avatar: isIncoming ? request.user1.avatar : request.user2.avatar,
        },
        status: request.status,
        createdAt: request.createdAt,
      });


      if (isIncoming) incoming.push(formatted);
      else outgoing.push(formatted);
    }

    return success(RESPONSE_MESSAGES.FRIEND.REQUESTS_FETCHED, {
      incoming,
      outgoing,
    });
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
        // Get friend's presence from Redis (real-time)
        const [friendPresenceStatus, friendStatusRecord] = await Promise.all([
          this.presenceService.getPresenceStatus(friend.id.toString()),
          this.statusRecordRepository.getStatusRecordByUserId(friend.id),
        ]);

        return {
          id: friend.id,
          username: friend.username,
          avatar: friend.avatar,
          status: friendPresenceStatus.actualStatus,
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

    // Send notifications based on relation type
    this.notifyUserRelationCreated(user, targetUser, relation, dto.type);

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

    // Get target user info for notification
    const targetUser = await this.userRepository.findById(dto.targetUserId);
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Remove the relation
    await this.userRelationRepository.removeRelation(
      user.id,
      BigInt(dto.targetUserId),
      dto.type,
    );

    // Send notifications based on relation type
    this.notifyUserRelationRemoved(user, targetUser, dto.type);

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

    return relations;
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
        // Get target user's presence from Redis (real-time)
        const [targetPresenceStatus, targetStatusRecord] = await Promise.all([
          this.presenceService.getPresenceStatus(relation.target.id.toString()),
          this.statusRecordRepository.getStatusRecordByUserId(relation.target.id),
        ]);

        return {
          id: relation.id,
          targetUser: {
            id: relation.target.id,
            username: relation.target.username,
            globalname: relation.target.globalname,
            avatar: relation.target.avatar,
            status: targetPresenceStatus.actualStatus,
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
        // Get target user's presence from Redis (real-time)
        const [targetPresenceStatus, targetStatusRecord] = await Promise.all([
          this.presenceService.getPresenceStatus(relation.target.id.toString()),
          this.statusRecordRepository.getStatusRecordByUserId(relation.target.id),
        ]);

        return {
          id: relation.id,
          targetUser: {
            id: relation.target.id,
            username: relation.target.username,
            globalname: relation.target.globalname,
            avatar: relation.target.avatar,
            status: targetPresenceStatus.actualStatus,
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
      total: stats.total,
    };
  }
  // ==================== USER DMS ====================
  async createDM(user: User, dto: CreateDMDto) {
    const dm = await this.dmRepository.createDM(user.id, dto.targetUserId);
    return dm;
  }
  // ==================== NOTIFICATION HELPERS ====================

  /**
   * Send notifications when a user relation is created
   */
  private notifyUserRelationCreated(
    sourceUser: User,
    targetUser: User,
    relation: any,
    relationType: RelationType,
  ): void {
    const sourceUserInfo = {
      id: sourceUser.id,
      username: sourceUser.username,
      avatar: sourceUser.avatar,
    };

    const targetUserInfo = {
      id: targetUser.id,
      username: targetUser.username,
      avatar: targetUser.avatar,
    };

    switch (relationType) {
      case RelationType.BLOCKED:
        // When blocking, notify source user (BOTH pattern to support multi-device)
        const blockData: UserBlockedData = {
          relationId: relation.id,
          blockedUser: targetUserInfo,
          blockedByUser: sourceUserInfo,
        };
        this.unifiedNotifier.notifySource(
          NotificationEvent.USER_BLOCKED,
          sourceUser.id.toString(),
          targetUser.id.toString(),
          blockData,
          'User blocked',
        );
        this.logger.log(`User ${sourceUser.id} blocked ${targetUser.id}`);
        break;
      case RelationType.IGNORED:
        // When ignoring, notify source user (multi-device support)
        const ignoreData: UserIgnoredData = {
          relationId: relation.id,
          ignoredUser: targetUserInfo,
          ignoredByUser: sourceUserInfo,
        };
        this.unifiedNotifier.notifySource(
          NotificationEvent.USER_IGNORED,
          sourceUser.id.toString(),
          targetUser.id.toString(),
          ignoreData,
          'User ignored',
        );
        this.logger.log(`User ${sourceUser.id} ignored ${targetUser.id}`);
        break;
    }
  }


  /**
   * Send notifications when a user relation is removed
   */
  private notifyUserRelationRemoved(
    sourceUser: User,
    targetUser: User,
    relationType: RelationType,
  ): void {
    const sourceUserInfo = {
      id: sourceUser.id,
      username: sourceUser.username,
      avatar: sourceUser.avatar,
    };

    const targetUserInfo = {
      id: targetUser.id,
      username: targetUser.username,
      avatar: targetUser.avatar,
    };

    switch (relationType) {
      case RelationType.BLOCKED:
        // When unblocking, notify source user (multi-device support)
        const unblockData: UserUnblockedData = {
          targetUser: targetUserInfo,
          unblockedByUser: sourceUserInfo,
        };
        this.unifiedNotifier.notifySource(
          NotificationEvent.USER_UNBLOCKED,
          sourceUser.id.toString(),
          targetUser.id.toString(),
          unblockData,
          'User unblocked',
        );
        this.logger.log(`User ${sourceUser.id} unblocked ${targetUser.id}`);
        break;

      case RelationType.IGNORED:
        // When unignoring, notify source user (multi-device support)
        const unignoreData: UserUnignoredData = {
          targetUser: targetUserInfo,
          unignoredByUser: sourceUserInfo,
        };
        this.unifiedNotifier.notifySource(
          NotificationEvent.USER_UNIGNORED,
          sourceUser.id.toString(),
          targetUser.id.toString(),
          unignoreData,
          'User unignored',
        );
        this.logger.log(`User ${sourceUser.id} unignored ${targetUser.id}`);
        break;
    }
  }
}
