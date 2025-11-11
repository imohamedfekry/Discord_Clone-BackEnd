import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from 'src/common/database/repositories';
import { AuthService } from './auth.service';
import { AuthenticatedSocket } from '../../../../common/Types/websocket.types';
import { WebSocketEvents } from '../../../../common/Types/websocket.types';
import { UnifiedPresenceService } from '../services/unified-presence.service';
import { FriendsCacheService } from '../../../../common/Global/cache/User/friends-cache.service';
import { Events } from '../../../../common/constants/events.constants';

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
  ) {}

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

      // Join user-specific room (allows sending to all user's devices)
      await client.join(`user:${user.id}`);

      // Join presence room for real-time updates
      await client.join('presence:updates');

      // Mark user as online in Redis
      const metadata = this.authService.createConnectionMetadata(client);
      await this.presenceService.markOnline(user.id, client.id, metadata);

      // Send connection confirmation
      client.emit(WebSocketEvents.CONNECTED, {
        message: 'Connected successfully',
        userId: user.id,
        socketId: client.id,
      });

      // Initial presence sync for friends (single pipeline/batch)
      const friends = await this.friendsCache.getFriends(user.id);
      if (friends.length > 0) {
        const presences = await this.presenceService.getBatchPresence(friends);
        client.emit(Events.INITIAL_PRESENCE_SYNC, presences);
      }

      // Handle user online status and notify friends
      await this.presenceService.handleUserOnline(user.id, user.username);

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
      await this.presenceService.handleUserOffline(userId, user?.username || 'Unknown');
    }

    this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
  }
}

