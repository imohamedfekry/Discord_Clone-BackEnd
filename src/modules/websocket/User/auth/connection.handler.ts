import { Injectable, Logger } from '@nestjs/common';
import { FriendshipRepository } from 'src/common/database/repositories';
import { FriendshipStatus, UserStatus } from '@prisma/client';
import { AuthenticatedSocket, SOCKET_EVENTS, WebSocketEvents } from '../../../../common/Types/socket.types';
import { AuthService } from './auth.service';
import { PresenceService } from '../services/presence.service';
import { FriendsCacheService } from '../../../../common/Global/cache/User/friends-cache.service';
import { ReadyService } from '../../Ready/ready.service';
import { ProfileNotifierService } from '../profile/profile.notifier.service';

@Injectable()
export class ConnectionHandlerService {
  private readonly logger = new Logger(ConnectionHandlerService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly presenceService: PresenceService,
    private readonly friendsCache: FriendsCacheService,
    private readonly readyService: ReadyService,
    private readonly friendshipRepository: FriendshipRepository,
    private readonly profileNotifier: ProfileNotifierService,
    
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const user = await this.authService.authenticateClient(client);
      if (!user) return;

      this.authService.setupSession(client, user);
      client.join(`user:${user.id.toString()}`);

      const userIdStr = user.id.toString();
      const metadata = this.authService.createConnectionMetadata(client);
      const { displayStatus } = await this.presenceService.markOnline(
        userIdStr,
        client.id,
        metadata,
      );

      const friends = await this.friendshipRepository.findByUserIdAndStatus(
        user.id,
        FriendshipStatus.ACCEPTED,
      );
      const friendIds = friends.map((f) =>
        f.user1Id === user.id ? f.user2Id.toString() : f.user1Id.toString(),
      );
      for (const friendId of friendIds) {
        await this.friendsCache.addFriend(userIdStr, friendId);
      }
      if (friendIds.length > 0) {
        client.emit(
          WebSocketEvents.INITIAL_PRESENCE_SYNC,
          await this.presenceService.getBatchPresence(friendIds),
        );
      }
      console.log(displayStatus)
      this.logger.warn("displayStatus",displayStatus)
      if (displayStatus !== UserStatus.INVISIBLE) {
        this.profileNotifier.notifyStatusUpdated(user, friendIds, displayStatus);
      }

      client.emit(
        SOCKET_EVENTS.CONNECTION.CONNECTED,
        await this.readyService.prepareUserData(user),
      );

      this.logger.log(`User ${user.id} connected via socket ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    if (!this.authService.isAuthenticated(client)) {
      return;
    }

    const userId = client.userId!;
    const user = this.authService.getUserFromClient(client);

    await this.presenceService.markOffline(userId, client.id);
    const socketCount = await this.presenceService.getSocketCount(userId);

    if (socketCount === 0) {
      const friendIds = await this.friendsCache.getFriends(userId);
      console.log(friendIds);
      
      this.profileNotifier.notifyStatusUpdated(
        user,
        friendIds,
        UserStatus.INVISIBLE,
      );
      
      await this.presenceService.handleUserOffline(
        userId,
        user?.username ?? 'Unknown',
        user
      );

      
    }

    this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
  }
}
