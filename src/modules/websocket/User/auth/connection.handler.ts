import { Injectable, Logger } from '@nestjs/common';
import { PresenceService } from '../../../../common/presence/presence.service';
import { UserRepository } from '../../../../common/database/repositories/user.repository';
import { AuthService } from './auth.service';
import { AuthenticatedSocket } from '../../../../common/Types/websocket.types';
import { WebSocketEvents } from '../../../../common/Types/websocket.types';

/**
 * Connection Handler Service
 * Handles WebSocket connection and disconnection logic
 */
@Injectable()
export class ConnectionHandlerService {
  private readonly logger = new Logger(ConnectionHandlerService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly presenceService: PresenceService,
    private readonly userRepository: UserRepository,
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
      const metadata = this.authService.extractConnectionMetadata(client);
      await this.presenceService.markOnline(user.id, client.id, metadata);

      // Update database status
      await this.userRepository.updateStatus(user.id, 'ONLINE');

      // Send connection confirmation
      client.emit(WebSocketEvents.CONNECTED, {
        message: 'Connected successfully',
        userId: user.id,
        socketId: client.id,
      });

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

    // Mark socket as offline in Redis
    await this.presenceService.markOffline(userId, client.id);

    // Check if user has any remaining connections
    const socketCount = await this.presenceService.getSocketCount(userId);

    if (socketCount === 0) {
      // Update database status to offline
      await this.userRepository.updateStatus(userId, 'OFFLINE');
    }

    this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
  }
}

