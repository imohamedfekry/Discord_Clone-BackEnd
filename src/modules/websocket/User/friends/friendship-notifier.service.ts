import { Injectable, Logger } from '@nestjs/common';
import { UnifiedNotifierService } from '../services/unified-notifier.service';
import {
  NotificationEvent,
  NotificationTarget,
  FriendRequestReceivedData,
  FriendRequestAcceptedData,
  FriendRequestRejectedData,
  FriendRequestCancelledData,
  FriendRemovedData,
} from '../../../../common/Types/notification.types';

/**
 * Friendship Notifier Service
 * Handles sending WebSocket notifications for friend requests
 * 
 * @deprecated Direct usage deprecated. Use UnifiedNotifierService instead.
 * This service now acts as a wrapper for backward compatibility.
 */
@Injectable()
export class FriendshipNotifierService {
  private readonly logger = new Logger(FriendshipNotifierService.name);

  constructor(private readonly unifiedNotifier: UnifiedNotifierService) { }

  /**
   * Notify user that they received a friend request
   * @param recipientId - User who received the request
   * @param data - Friend request data
   */
  notifyFriendRequestReceived(recipientId: string, data: FriendRequestReceivedData): void {
    this.logger.log(
      `Notifying ${recipientId} about friend request from ${data.fromUser.username}`,
    );

    this.unifiedNotifier.notifyBoth(
      NotificationEvent.FRIEND_REQUEST_RECEIVED,
      data.fromUser.id.toString(),
      recipientId,
      data,
      'Friend request received',
    );
  }

  /**
   * Notify user that their friend request was accepted
   * @param userId - User who sent the request
   * @param data - Accepted friendship data
   */
  notifyFriendRequestAccepted(userId: string, data: FriendRequestAcceptedData): void {
    this.logger.log(
      `Notifying ${userId} that friend request was accepted by ${data.newFriend.username}`,
    );

    this.unifiedNotifier.notifyBoth(
      NotificationEvent.FRIEND_REQUEST_ACCEPTED,
      data.newFriend.id.toString(),
      userId,
      data,
      'Friend request accepted',
    );
  }

  /**
   * Notify user that their friend request was rejected
   * @param userId - User who sent the request
   * @param data - Rejection data
   */
  notifyFriendRequestRejected(userId: string, recipientId: string, data: FriendRequestRejectedData): void {
    this.logger.log(
      `Notifying ${userId} that friend request was rejected by ${recipientId}`,
    );

    this.unifiedNotifier.notifySource(
      NotificationEvent.FRIEND_REQUEST_REJECTED,
      userId,
      recipientId,
      data,
      'Friend request rejected',
    );
  }

  /**
   * Notify user that their friend request was cancelled
   * @param recipientId - User who was receiving the request
   * @param data - Cancellation data
   */
  notifyFriendRequestCancelled(senderId: string, recipientId: string, data: FriendRequestCancelledData): void {
    this.logger.log(
      `Notifying ${recipientId} that friend request from ${senderId} was cancelled`,
    );

    this.unifiedNotifier.notifyBoth(
      NotificationEvent.FRIEND_REQUEST_CANCELLED,
      senderId,
      recipientId,
      data,
      'Friend request cancelled',
    );
  }

  /**
   * Notify both users that friendship was removed
   * @param user1Id - First user ID
   * @param user2Id - Second user ID
   * @param data - Friend removal data
   */
  notifyFriendRemoved(user1Id: string, user2Id: string, data: FriendRemovedData): void {
    this.logger.log(`Notifying both users that friendship was removed`);

    // Notify BOTH parties - all their devices will receive updates in real-time
    this.unifiedNotifier.notifyBoth(
      NotificationEvent.FRIEND_REMOVED,
      user1Id,
      user2Id,
      data,
      'Friend removed',
    );
  }
}