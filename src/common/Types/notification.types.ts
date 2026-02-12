import { FriendshipStatus, UserStatus } from '@prisma/client';

export const NOTIFICATION_EVENTS = {
  CONNECTION: {
    CONNECTED: 'connection:connected',
    DISCONNECTED: 'connection:disconnected',
  },
  FRIEND: {
    REQUEST: {
      RECEIVED: 'friend:request:received',
      SENT: 'friend:request:sent',
      ACCEPTED: 'friend:request:accepted',
      REJECTED: 'friend:request:rejected',
      CANCELLED: 'friend:request:cancelled',
      CANCELLED_BY_SENDER: 'friend:request:cancelled:sender',
    },
    REMOVED: 'friend:removed',
  },
  RELATION: {
    BLOCK: {
      BLOCKED: 'user:relation:blocked',
      UNBLOCKED: 'user:relation:unblocked',
    },
    IGNORE: {
      IGNORED: 'user:relation:ignored',
      UNIGNORED: 'user:relation:unignored',
    },
  },
  PROFILE: {
    GLOBALNAME_UPDATED: 'user:globalname:updated',
    USERNAME_UPDATED: 'user:username:updated',
    CUSTOM_STATUS_UPDATED: 'user:customstatus:updated',
    STATUS_UPDATED: 'user:status:updated',
  },
} as const;

/**
 * All notification event string literals (derived from NOTIFICATION_EVENTS)
 */
type DeepValueOf<T> = T extends object
  ? { [K in keyof T]: DeepValueOf<T[K]> }[keyof T]
  : T;

export type NotificationEvent = DeepValueOf<typeof NOTIFICATION_EVENTS>;
/**
 * Notification Target Configuration
 */
export enum NotificationTarget {
  /** Only notify the user who initiated the action */
  SOURCE = 'source',
  /** Only notify the user who is the target of the action */
  TARGET = 'target',
  /** Notify both the source and target users (all their devices) */
  BOTH = 'both',
}

/**
 * Base User Info for notifications
 */
export interface NotificationUserInfo {
  id: string | bigint;
  username: string;
  avatar: string | null;
}

// ==================== FRIENDSHIP PAYLOADS ====================

export interface FriendRequestReceivedData {
  friendshipId: string | bigint;
  fromUser: NotificationUserInfo;
  status: FriendshipStatus;
}

export interface FriendRequestSentData {
  friendshipId: string | bigint;
  toUser: NotificationUserInfo;
  status: FriendshipStatus;
}

export interface FriendRequestAcceptedData {
  friendshipId: string | bigint;
  newFriend: NotificationUserInfo;
  status: FriendshipStatus;
}

export interface FriendRequestRejectedData {
  friendshipId: string | bigint;
}

export interface FriendRequestCancelledData {
  friendshipId: string | bigint;
  fromUser: NotificationUserInfo;
}

export interface FriendRequestCancelledBySenderData {
  friendshipId: string | bigint;
}

export interface FriendRemovedData {
  friendshipId: string | bigint;
  removedByUser?: NotificationUserInfo;
}

// ==================== USER RELATION PAYLOADS ====================

export interface UserBlockedData {
  relationId: string | bigint;
  blockedUser: NotificationUserInfo;
  blockedByUser: NotificationUserInfo;
}

export interface UserUnblockedData {
  targetUser: NotificationUserInfo;
  unblockedByUser: NotificationUserInfo;
}

export interface UserIgnoredData {
  relationId: string | bigint;
  ignoredUser: NotificationUserInfo;
  ignoredByUser: NotificationUserInfo;
}

export interface UserUnignoredData {
  targetUser: NotificationUserInfo;
  unignoredByUser: NotificationUserInfo;
}

// ==================== PROFILE PAYLOADS ====================

export interface UsernameUpdatedData {
  userId: string | bigint;
  username: string;
}

export interface GlobalnameUpdatedData {
  userId: string | bigint;
  globalname: string | null;
}

export interface CustomStatusUpdatedData {
  userId: string | bigint;
  customStatus: {
    text?: string | null;
    emoji?: string | null;
    expiresAt?: string | null;
  };
}
export interface StatusUpdatedData {
  userId: string | bigint;
  status: UserStatus;
}
// ==================== UNION TYPE ====================

export type NotificationData =
  | FriendRequestReceivedData
  | FriendRequestSentData
  | FriendRequestAcceptedData
  | FriendRequestRejectedData
  | FriendRequestCancelledData
  | FriendRequestCancelledBySenderData
  | FriendRemovedData
  | UserBlockedData
  | UserUnblockedData
  | UserIgnoredData
  | UserUnignoredData
  | UsernameUpdatedData
  | GlobalnameUpdatedData
  | CustomStatusUpdatedData
  | StatusUpdatedData;

// ==================== REQUEST/RESPONSE TYPES ====================

/**
 * Notification Request Configuration
 */
export interface NotificationRequest<
  T extends NotificationData = NotificationData,
> {
  event: NotificationEvent;
  sourceUserId: string;
  targetUserId: string;
  notificationTarget: NotificationTarget;
  data: T;
  message?: string;
}

/**
 * Standardized WebSocket Notification Payload
 */
export interface WebSocketNotificationPayload<
  T extends NotificationData = NotificationData,
> {
  code: string;
  message: string;
  data: T;
  timestamp: Date;
}
