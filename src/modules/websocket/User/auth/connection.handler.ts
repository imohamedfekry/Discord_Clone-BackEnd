import { Injectable, Logger } from '@nestjs/common';
import { FriendshipRepository, UserRepository } from 'src/common/database/repositories';
import { AuthService } from './auth.service';
import { AuthenticatedSocket } from '../../../../common/Types/websocket.types';
import { WebSocketEvents } from '../../../../common/Types/websocket.types';
import { UnifiedPresenceService } from '../services/unified-presence.service';
import { FriendsCacheService } from '../../../../common/Global/cache/User/friends-cache.service';
import { Events } from '../../../../common/constants/events.constants';
import { ReadyService } from '../../Ready/ready.service';
import { NOTIFICATION_EVENTS } from 'src/common/Types/notification.types';
import { FriendshipStatus, UserStatus } from '@prisma/client';
import { ProfileNotifierService } from '../profile/profile.notifier.service';

/**
 * Connection Handler Service
 * Handles WebSocket connection and disconnection logic
 */
@Injectable()
export class ConnectionHandlerService {
  private readonly logger = new Logger(ConnectionHandlerService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
    private readonly presenceService: UnifiedPresenceService,
    private readonly friendsCache: FriendsCacheService,
    private readonly readyService: ReadyService,
    private readonly friendshipRepository: FriendshipRepository,
    private readonly profileNotifier: ProfileNotifierService,
  ) { }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      // Authenticate user
      const user = await this.authService.authenticateClient(client);
      if (!user) {
        return;
      }

      // Setup session
      this.authService.setupSession(client, user);

      // Join user-specific room so we can target this user by ID
      // BroadcasterService.sendToUser(userId, ...) emits to `user:${userId}`
      client.join(`user:${user.id.toString()}`);

      // Mark user as online in Redis
      const metadata = this.authService.createConnectionMetadata(client);
      await this.presenceService.markOnline(user.id, client.id, metadata);

      // Initial presence sync for friends (single pipeline/batch)
      // get friends from DB AND PUSH INTO REDIS
      const friends = await this.friendshipRepository.findByUserIdAndStatus(user.id, FriendshipStatus.ACCEPTED);
      const friendIds = friends.map((friend) => {
        if (friend.user1Id === user.id) {
          return friend.user2Id.toString();
        } else {
          return friend.user1Id.toString();
        }
      });
      for (const friendId of friendIds) {
        await this.friendsCache.addFriend(user.id.toString(), friendId);
      }
      if (friends.length > 0) {
        const presences = await this.presenceService.getBatchPresence(friendIds);
        client.emit(Events.INITIAL_PRESENCE_SYNC, presences);
      }
      this.profileNotifier.notifyStatusUpdated(user, friendIds, UserStatus.ONLINE);
      // Handle user online status and notify friends
      this.logger.log(`User ${user.id} connected via socket ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack);
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    if (!this.authService.isAuthenticated(client)) {
      return;
    }

    const userId = client.userId!;
    const user = this.authService.getUserFromClient(client);

    // Mark socket as offline in Redis
    await this.presenceService.markOffline(userId, client.id);

    // Check if user has any remaining connections
    const socketCount = await this.presenceService.getSocketCount(userId);

    if (socketCount === 0) {
      // Handle user offline status and notify friends
      await this.presenceService.handleUserOffline(
        userId,
        user?.username || 'Unknown',
      );
    }

    this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
  }
}
