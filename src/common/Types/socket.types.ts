import { Socket } from 'socket.io';
import { User, FriendshipStatus, UserStatus } from '@prisma/client';

// --- Socket & connection ---

export interface SocketMetadata {
  device?: string;
  connectedAt: Date;
  ip?: string;
  userAgent?: string;
  lastPing?: Date;
}

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  authenticated?: boolean;
  user?: User;
}

export interface ConnectionMetadata {
  device: string;
  ip: string;
  connectedAt: Date;
  userAgent?: string;
}

export interface StatusUpdateData {
  status: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DND';
}

// --- Client ↔ Server message names ---

export enum WebSocketMessages {
  PING = 'ping',
  STATUS_UPDATE = 'status:update',
  STATUS_GET = 'status:get',
  PRESENCE_UPDATE = 'presence:update',
}

// --- Server-emitted event names (gateway → client) ---

export enum WebSocketEvents {
  DISCONNECT = 'disconnect',
  READY = 'ready',
  PRESENCE_UPDATED = 'presence:updated',
  STATUS_UPDATED = 'status:updated',
  STATUS_CURRENT = 'status:current',
  INITIAL_PRESENCE_SYNC = 'INITIAL_PRESENCE_SYNC',
  PRESENCE_UPDATE = 'PRESENCE_UPDATE',
  FRIEND_REQUEST_RECEIVED = 'friend:request:received',
  FRIEND_REQUEST_ACCEPTED = 'friend:request:accepted',
  FRIEND_REQUEST_REJECTED = 'friend:request:rejected',
  FRIEND_REQUEST_CANCELLED = 'friend:request:cancelled',
  FRIEND_REMOVED = 'friend:removed',
  USER_BLOCKED = 'user:relation:blocked',
  USER_UNBLOCKED = 'user:relation:unblocked',
  USER_MUTED = 'user:relation:muted',
  USER_UNMUTED = 'user:relation:unmuted',
  USER_IGNORED = 'user:relation:ignored',
  USER_UNIGNORED = 'user:relation:unignored',
}

// --- Socket event names (namespaced, for connection/friend/profile) ---

export const SOCKET_EVENTS = {
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
  USER_ONLINE: 'user:online',
} as const;

type DeepValueOf<T> = T extends object
  ? { [K in keyof T]: DeepValueOf<T[K]> }[keyof T]
  : T;

export type SocketEventName = DeepValueOf<typeof SOCKET_EVENTS>;

// --- Notification / payload types ---

export enum NotificationTarget {
  SOURCE = 'source',
  TARGET = 'target',
  BOTH = 'both',
}

export interface SocketUserInfo {
  id: string | bigint;
  username: string;
  avatar: string | null;
}

export interface FriendRequestReceivedPayload {
  friendshipId: string | bigint;
  fromUser: SocketUserInfo;
  status: FriendshipStatus;
}

export interface FriendRequestSentPayload {
  friendshipId: string | bigint;
  toUser: SocketUserInfo;
  status: FriendshipStatus;
}

export interface FriendRequestAcceptedPayload {
  friendshipId: string | bigint;
  newFriend: SocketUserInfo;
  status: FriendshipStatus;
}

export interface FriendRequestRejectedPayload {
  friendshipId: string | bigint;
}

export interface FriendRequestCancelledPayload {
  friendshipId: string | bigint;
  fromUser: SocketUserInfo;
}

export interface FriendRequestCancelledBySenderPayload {
  friendshipId: string | bigint;
}

export interface FriendRemovedPayload {
  friendshipId: string | bigint;
  removedByUser?: SocketUserInfo;
}

export interface UserBlockedPayload {
  relationId: string | bigint;
  blockedUser: SocketUserInfo;
  blockedByUser: SocketUserInfo;
}

export interface UserUnblockedPayload {
  targetUser: SocketUserInfo;
  unblockedByUser: SocketUserInfo;
}

export interface UserIgnoredPayload {
  relationId: string | bigint;
  ignoredUser: SocketUserInfo;
  ignoredByUser: SocketUserInfo;
}

export interface UserUnignoredPayload {
  targetUser: SocketUserInfo;
  unignoredByUser: SocketUserInfo;
}

export interface UsernameUpdatedPayload {
  userId: string | bigint;
  username: string;
}

export interface GlobalnameUpdatedPayload {
  userId: string | bigint;
  globalname: string | null;
}

export interface CustomStatusUpdatedPayload {
  userId: string | bigint;
  customStatus: {
    text?: string | null;
    emoji?: string | null;
    expiresAt?: string | null;
  };
}

export interface StatusUpdatedPayload {
  userId: string | bigint;
  status: UserStatus;
}

export interface UserOnlinePayload {
  userId: bigint;
  status: UserStatus;
  customStatus?: {
    text: string | null;
    emoji: string | null;
  };
}

export type SocketEventPayload =
  | FriendRequestReceivedPayload
  | FriendRequestSentPayload
  | FriendRequestAcceptedPayload
  | FriendRequestRejectedPayload
  | FriendRequestCancelledPayload
  | FriendRequestCancelledBySenderPayload
  | FriendRemovedPayload
  | UserBlockedPayload
  | UserUnblockedPayload
  | UserIgnoredPayload
  | UserUnignoredPayload
  | UsernameUpdatedPayload
  | GlobalnameUpdatedPayload
  | CustomStatusUpdatedPayload
  | StatusUpdatedPayload
  | UserOnlinePayload;

export interface SocketNotificationRequest<T extends SocketEventPayload = SocketEventPayload> {
  event: SocketEventName;
  sourceUserId: string;
  targetUserId: string;
  notificationTarget: NotificationTarget;
  data: T;
  message?: string;
}

export interface SocketEmitPayload<T extends SocketEventPayload = SocketEventPayload> {
  code: string;
  message: string;
  data: T;
  timestamp: Date;
}

// --- Presence (optional enums) ---

export enum PresenceExpireDuration {
  FIFTEEN_MINUTES = '15m',
  ONE_HOUR = '1h',
  EIGHT_HOURS = '8h',
  TWENTY_FOUR_HOURS = '24h',
  THREE_DAYS = '3d',
}
