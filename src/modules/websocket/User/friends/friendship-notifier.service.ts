import { Injectable, Logger } from '@nestjs/common';
import { BroadcasterService } from '../shared/broadcaster.service';
import { WebSocketEvents } from '../../../../common/Types/websocket.types';

/**
 * Friendship Notifier Service
 * Handles sending WebSocket notifications for friend requests
 */
@Injectable()
export class FriendshipNotifierService {
  private readonly logger = new Logger(FriendshipNotifierService.name);

  constructor(private readonly broadcaster: BroadcasterService) {}

  /**
   * Notify user that they received a friend request
   * @param recipientId - User who received the request
   * @param data - Friend request data
   */
  notifyFriendRequestReceived(recipientId: string, data: any): void {
    this.logger.log(`Notifying ${recipientId} about friend request from ${data.fromUser.username}`);
    
    this.broadcaster.sendToUser(recipientId, WebSocketEvents.FRIEND_REQUEST_RECEIVED, {
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Notify user that their friend request was accepted
   * @param userId - User who sent the request
   * @param data - Accepted friendship data
   */
  notifyFriendRequestAccepted(userId: string, data: any): void {
    this.logger.log(`Notifying ${userId} that friend request was accepted by ${data.newFriend.username}`);
    
    this.broadcaster.sendToUser(userId, WebSocketEvents.FRIEND_REQUEST_ACCEPTED, {
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Notify user that their friend request was rejected
   * @param userId - User who sent the request
   * @param data - Rejection data
   */
  notifyFriendRequestRejected(userId: string, data: any): void {
    this.logger.log(`Notifying ${userId} that friend request was rejected by ${data.byUser.username}`);
    
    this.broadcaster.sendToUser(userId, WebSocketEvents.FRIEND_REQUEST_REJECTED, {
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Notify user that their friend request was cancelled
   * @param recipientId - User who was receiving the request
   * @param data - Cancellation data
   */
  notifyFriendRequestCancelled(recipientId: string, data: any): void {
    this.logger.log(`Notifying ${recipientId} that friend request was cancelled by ${data.byUser.username}`);
    
    this.broadcaster.sendToUser(recipientId, WebSocketEvents.FRIEND_REQUEST_CANCELLED, {
      ...data,
      timestamp: new Date(),
    });
  }
}

