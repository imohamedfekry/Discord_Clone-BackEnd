import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepository } from '../../common/database/repositories/user.repository';
import { FriendshipRepository } from '../../common/database/repositories/friendship.repository';
import { UserProfileResponseDto } from '../../common/dto/shared-response.dto';
import { UserContext } from 'src/common/shared/types';
import {
  SendFriendRequestDto,
  RespondToFriendRequestDto,
  RemoveFriendDto,
  GetFriendsQueryDto,
  GetMutualFriendsDto,
} from './dto/friendship.dto';
import { FriendshipStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly friendshipRepository: FriendshipRepository,
  ) {}

  /**
   * Get current user profile
   */
  async getProfile(user: UserContext): Promise<UserProfileResponseDto> {
    return {
      id: user.id.toString(),
      username: user.username,
      email: user.email, // Keep email for user's own profile
      phone: user.phone,  // Keep phone for user's own profile
      avatar: user.avatar || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(user: UserContext, dto: SendFriendRequestDto) {
    // Check if user is trying to add themselves
    if (user.username === dto.username) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if target user exists by username
    const targetUser = await this.userRepository.findByUsername(dto.username);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if friendship already exists
    const existingFriendship = await this.friendshipRepository.findBetweenUsers(
      BigInt(user.id),
      BigInt(targetUser.id),
    );
    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new ConflictException('Users are already friends');
      } else if (existingFriendship.status === FriendshipStatus.PENDING) {
        // If there's a pending request from the target user to current user, accept it
        if (
          existingFriendship.user1Id === BigInt(targetUser.id) &&
          existingFriendship.user2Id === BigInt(user.id)
        ) {
          const acceptedFriendship =
            await this.friendshipRepository.updateStatus(
              existingFriendship.id,
              FriendshipStatus.ACCEPTED,
            );
          return {
            id: acceptedFriendship.id.toString(),
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
      user1: { connect: { id: BigInt(user.id) } },
      user2: { connect: { id: BigInt(targetUser.id) } },
      status: FriendshipStatus.PENDING,
    });

    return {
      id: friendship.id.toString(),
      status: friendship.status,
      createdAt: friendship.createdAt,
    };
  }

  /**
   * Respond to friend request
   */
  async respondToFriendRequest(
    user: UserContext,
    dto: RespondToFriendRequestDto,
  ) {
    const friendshipId = BigInt(dto.friendshipId);

    // Find the friendship
    const friendship = await this.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    // Privacy check: Only sender or receiver can access this friendship
    const isSender = friendship.user1Id === BigInt(user.id);
    const isReceiver = friendship.user2Id === BigInt(user.id);
    
    if (!isSender && !isReceiver) {
      // For privacy, don't reveal that the friendship exists
      throw new NotFoundException('Friend request not found');
    }

    // Check if request is still pending
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException(
        'Friend request has already been responded',
      );
    }

    // Only the receiver can respond to friend requests
    if (!isReceiver) {
      throw new BadRequestException(
        'You can only respond to friend requests sent to you',
      );
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
      friendshipId,
      FriendshipStatus.ACCEPTED,
    );
    return {
      id: acceptedFriendship.id.toString(),
      status: acceptedFriendship.status,
      createdAt: acceptedFriendship.createdAt,
      message: 'Friend request accepted successfully',
    };
  }

  /**
   * Remove friend
   */
  async removeFriend(user: UserContext, dto: RemoveFriendDto) {
    // Check if friendship exists
    const friendship = await this.friendshipRepository.findBetweenUsers(
      BigInt(user.id),
      BigInt(dto.userId),
    );
    if (!friendship || friendship.status !== FriendshipStatus.ACCEPTED) {
      throw new NotFoundException('Friendship not found');
    }

    // Privacy check: Only participants can remove friendship
    const isParticipant = friendship.user1Id === BigInt(user.id) || friendship.user2Id === BigInt(user.id);
    if (!isParticipant) {
      throw new NotFoundException('Friendship not found');
    }

    // Delete friendship
    await this.friendshipRepository.deleteByUserIds(
      BigInt(user.id),
      BigInt(dto.userId),
    );

    return { message: 'Friend removed successfully' };
  }

  /**
   * Get friends list
   */
  async getFriends(user: UserContext, query: GetFriendsQueryDto) {
    const status = query.status || FriendshipStatus.ACCEPTED;
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const [friends, total] = await Promise.all([
      this.friendshipRepository.findByUserIdAndStatus(BigInt(user.id), status),
      this.friendshipRepository.countByUserIdAndStatus(BigInt(user.id), status),
    ]);

    // Format friends data - SECURITY: Don't expose sensitive info
    const formattedFriends = friends.map((friendship) => {
      const friend =
        friendship.user1Id === BigInt(user.id)
          ? friendship.user2
          : friendship.user1;
      return {
        id: friend.id.toString(),
        username: friend.username,
        avatar: friend.avatar,
        friendshipId: friendship.id.toString(),
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
  async getIncomingRequests(user: UserContext) {
    const requests = await this.friendshipRepository.findIncomingRequests(
      BigInt(user.id),
    );

    return requests.map((request) => ({
      id: request.id.toString(),
      user: {
        id: request.user1.id.toString(),
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
  async getOutgoingRequests(user: UserContext) {
    const requests = await this.friendshipRepository.findOutgoingRequests(
      BigInt(user.id),
    );

    return requests.map((request) => ({
      id: request.id.toString(),
      user: {
        id: request.user2.id.toString(),
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
  async getMutualFriends(user: UserContext, dto: GetMutualFriendsDto) {
    // SECURITY: Check if users are friends first (privacy: only friends can see mutual friends)
    const friendship = await this.friendshipRepository.findBetweenUsers(
      BigInt(user.id),
      BigInt(dto.userId),
    );
    
    // SECURITY: Don't reveal if user exists or not
    if (!friendship || friendship.status !== FriendshipStatus.ACCEPTED) {
      throw new NotFoundException('User not found');
    }

    const mutualFriends = await this.friendshipRepository.getMutualFriends(
      BigInt(user.id),
      BigInt(dto.userId),
    );

    // SECURITY: Don't expose sensitive information
    return mutualFriends.map((friend) => ({
      id: friend.id.toString(),
      username: friend.username,
      avatar: friend.avatar,
      // SECURITY: Removed email - too sensitive
    }));
  }

  /**
   * Check if two users are friends
   */
  async checkFriendship(user: UserContext, targetUserId: string) {
    // SECURITY: Don't check if user exists to prevent enumeration
    // Only check friendship status between current user and target ID
    
    const areFriends = await this.friendshipRepository.areFriends(
      BigInt(user.id),
      BigInt(targetUserId),
    );
    const hasPendingRequest = await this.friendshipRepository.hasPendingRequest(
      BigInt(user.id),
      BigInt(targetUserId),
    );

    // SECURITY: Always return same structure regardless of user existence
    return {
      areFriends: areFriends || false,
      hasPendingRequest: hasPendingRequest || false,
    };
  }
}
