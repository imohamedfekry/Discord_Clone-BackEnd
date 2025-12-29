import { Injectable, Logger } from '@nestjs/common';
import { UnifiedNotifierService } from '../services/unified-notifier.service';
import {
  NotificationEvent,
  NotificationTarget,
  FriendRequestReceivedData,
  FriendRequestSentData,
  FriendRequestAcceptedData,
  FriendRequestRejectedData,
  FriendRequestCancelledData,
  FriendRequestCancelledBySenderData,
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
   * Also notifies sender that their request was sent
   * @param recipientId - User who received the request
   * @param senderId - User who sent the request
   * @param recipientInfo - Recipient user info
   * @param senderInfo - Sender user info
   * @param friendshipId - Friendship ID
   * @param status - Friendship status
   */
  notifyFriendRequestReceived(
    recipientId: string,
    senderId: string,
    recipientInfo: { id: string | bigint; username: string; avatar: string | null },
    senderInfo: { id: string | bigint; username: string; avatar: string | null },
    friendshipId: string | bigint,
    status: any
  ): void {
    this.logger.log(
      `Notifying ${recipientId} about friend request from ${senderInfo.username}`,
    );

    // Notify TARGET (recipient) - they received a friend request
    const receivedData: FriendRequestReceivedData = {
      friendshipId,
      fromUser: senderInfo,
      status,
    };
    this.unifiedNotifier.notifyTarget(
      NotificationEvent.FRIEND_REQUEST_RECEIVED,
      senderId,
      recipientId,
      receivedData,
      'Friend request received',
    );

    // Notify SOURCE (sender) - they sent a friend request
    const sentData: FriendRequestSentData = {
      friendshipId,
      toUser: recipientInfo,
      status,
    };
    this.unifiedNotifier.notifySource(
      NotificationEvent.FRIEND_REQUEST_SENT,
      senderId,
      recipientId,
      sentData,
      'Friend request sent',
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
   * Notify that a friend request was cancelled
   * Notifies the recipient that request was cancelled
   * Notifies the sender as confirmation
   * @param senderId - User who cancelled the request
   * @param recipientId - User who was receiving the request
   * @param senderInfo - Sender user info
   * @param friendshipId - Friendship ID
   */
  notifyFriendRequestCancelled(
    senderId: string,
    recipientId: string,
    senderInfo: { id: string | bigint; username: string; avatar: string | null },
    friendshipId: string | bigint
  ): void {
    this.logger.log(
      `Notifying ${recipientId} that friend request from ${senderInfo.username} was cancelled`,
    );

    // Notify TARGET (recipient) - request from sender was cancelled
    const cancelledData: FriendRequestCancelledData = {
      friendshipId,
      fromUser: senderInfo,
    };
    this.unifiedNotifier.notifyTarget(
      NotificationEvent.FRIEND_REQUEST_CANCELLED,
      senderId,
      recipientId,
      cancelledData,
      'Friend request cancelled',
    );

    // Notify SOURCE (sender) - confirmation that they cancelled
    const cancelledBySenderData: FriendRequestCancelledBySenderData = {
      friendshipId,
    };
    this.unifiedNotifier.notifySource(
      NotificationEvent.FRIEND_REQUEST_CANCELLED_BY_SENDER,
      senderId,
      recipientId,
      cancelledBySenderData,
      'You cancelled a friend request',
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