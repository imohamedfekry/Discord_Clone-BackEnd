import { Injectable, Logger } from '@nestjs/common';
import {
  SOCKET_EVENTS,
  FriendRequestReceivedPayload,
  FriendRequestSentPayload,
  FriendRequestAcceptedPayload,
  FriendRequestRejectedPayload,
  FriendRequestCancelledPayload,
  FriendRequestCancelledBySenderPayload,
  FriendRemovedPayload,
} from '../../../../common/Types/socket.types';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class FriendshipNotifierService {
  private readonly logger = new Logger(FriendshipNotifierService.name);

  constructor(private readonly notifier: NotificationService) {}

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
    recipientInfo: {
      id: string | bigint;
      username: string;
      avatar: string | null;
    },
    senderInfo: {
      id: string | bigint;
      username: string;
      avatar: string | null;
    },
    friendshipId: string | bigint,
    status: any,
  ): void {
    this.logger.log(
      `Notifying ${recipientId} about friend request from ${senderInfo.username}`,
    );

    const receivedData: FriendRequestReceivedPayload = {
      friendshipId,
      fromUser: senderInfo,
      status,
    };
    this.notifier.notifyTarget(
      SOCKET_EVENTS.FRIEND.REQUEST.RECEIVED,
      senderId,
      recipientId,
      receivedData,
      'Friend request received',
    );

    const sentData: FriendRequestSentPayload = {
      friendshipId,
      toUser: recipientInfo,
      status,
    };
    this.notifier.notifySource(
      SOCKET_EVENTS.FRIEND.REQUEST.SENT,
      senderId,
      recipientId,
      sentData,
      'Friend request sent',
    );
  }

  notifyFriendRequestAccepted(
    userId: string,
    data: FriendRequestAcceptedPayload,
  ): void {
    this.notifier.notifySource(
      SOCKET_EVENTS.FRIEND.REQUEST.ACCEPTED,
      userId,
      data.newFriend.id.toString(),
      data,
      'Friend request accepted',
    );
  }

  notifyFriendRequestRejected(
    userId: string,
    recipientId: string,
    data: FriendRequestRejectedPayload,
  ): void {
    this.notifier.notifySource(
      SOCKET_EVENTS.FRIEND.REQUEST.REJECTED,
      userId,
      recipientId,
      data,
      'Friend request rejected',
    );
  }

  notifyFriendRequestCancelled(
    senderId: string,
    recipientId: string,
    senderInfo: { id: string | bigint; username: string; avatar: string | null },
    friendshipId: string | bigint,
  ): void {
    const cancelledData: FriendRequestCancelledPayload = {
      friendshipId,
      fromUser: senderInfo,
    };
    this.notifier.notifyTarget(
      SOCKET_EVENTS.FRIEND.REQUEST.CANCELLED,
      senderId,
      recipientId,
      cancelledData,
      'Friend request cancelled',
    );
    const cancelledBySenderData: FriendRequestCancelledBySenderPayload = {
      friendshipId,
    };
    this.notifier.notifySource(
      SOCKET_EVENTS.FRIEND.REQUEST.CANCELLED_BY_SENDER,
      senderId,
      recipientId,
      cancelledBySenderData,
      'You cancelled a friend request',
    );
  }

  notifyFriendRemoved(
    user1Id: string,
    user2Id: string,
    data: FriendRemovedPayload,
  ): void {
    this.notifier.notifyBoth(
      SOCKET_EVENTS.FRIEND.REMOVED,
      user1Id,
      user2Id,
      data,
      'Friend removed',
    );
  }
}
