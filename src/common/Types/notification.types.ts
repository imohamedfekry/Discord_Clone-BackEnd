import { FriendshipStatus, RelationType, UserStatus } from '@prisma/client';

/**
 * Notification Event Types
 * All possible notification events in the system
 */
export enum NotificationEvent {
    // Friend Request Events
    FRIEND_REQUEST_RECEIVED = 'friend:request:received',
    FRIEND_REQUEST_ACCEPTED = 'friend:request:accepted',
    FRIEND_REQUEST_REJECTED = 'friend:request:rejected',
    FRIEND_REQUEST_CANCELLED = 'friend:request:cancelled',
    FRIEND_REMOVED = 'friend:removed',

    // User Relation Events
    USER_BLOCKED = 'user:relation:blocked',
    USER_UNBLOCKED = 'user:relation:unblocked',
    USER_MUTED = 'user:relation:muted',
    USER_UNMUTED = 'user:relation:unmuted',
    USER_IGNORED = 'user:relation:ignored',
    USER_UNIGNORED = 'user:relation:unignored',
}

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

export interface UserMutedData {
    relationId: string | bigint;
    mutedUser: NotificationUserInfo;
    mutedByUser: NotificationUserInfo;
}

export interface UserUnmutedData {
    targetUser: NotificationUserInfo;
    unmutedByUser: NotificationUserInfo;
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


// ==================== UNION TYPE ====================

export type NotificationData =
    | FriendRequestReceivedData
    | FriendRequestAcceptedData
    | FriendRequestRejectedData
    | FriendRequestCancelledData
    | FriendRemovedData
    | UserBlockedData
    | UserUnblockedData
    | UserMutedData
    | UserUnmutedData
    | UserIgnoredData
    | UserUnignoredData;

// ==================== REQUEST/RESPONSE TYPES ====================

/**
 * Notification Request Configuration
 */
export interface NotificationRequest<T extends NotificationData = NotificationData> {
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
export interface WebSocketNotificationPayload<T extends NotificationData = NotificationData> {
    code: string;
    message: string;
    data: T;
    timestamp: Date;
}
