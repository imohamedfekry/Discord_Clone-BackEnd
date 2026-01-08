import { Socket } from 'socket.io';
import { User } from '@prisma/client';

/**
 * Socket metadata for tracking connections
 */
export interface SocketMetadata {
  device?: string;
  connectedAt: Date;
  ip?: string;
  userAgent?: string;
  lastPing?: Date;
}

/**
 * Authenticated Socket interface
 * Extends base Socket with authentication properties
 */
export interface AuthenticatedSocket extends Socket {
  userId?: string;
  authenticated?: boolean;
  user?: User;
}

/**
 * Connection metadata for tracking user connections
 */
export interface ConnectionMetadata {
  device: string;
  ip: string;
  connectedAt: Date;
  userAgent?: string;
}

/**
 * Status update event data
 */
export interface StatusUpdateData {
  status: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DND';
}

/**
 * WebSocket event names constants
 */
export enum WebSocketEvents {
  // Connection events
  DISCONNECT = 'disconnect',
  READY = 'ready',

  // Presence events
  PRESENCE_UPDATED = 'presence:updated',

  // Status events
  STATUS_UPDATED = 'status:updated',
  STATUS_CURRENT = 'status:current',

  // Friend request events
  FRIEND_REQUEST_RECEIVED = 'friend:request:received',
  FRIEND_REQUEST_ACCEPTED = 'friend:request:accepted',
  FRIEND_REQUEST_REJECTED = 'friend:request:rejected',
  FRIEND_REQUEST_CANCELLED = 'friend:request:cancelled',
  FRIEND_REMOVED = 'friend:removed',

  // User relation events
  USER_BLOCKED = 'user:relation:blocked',
  USER_UNBLOCKED = 'user:relation:unblocked',
  USER_MUTED = 'user:relation:muted',
  USER_UNMUTED = 'user:relation:unmuted',
  USER_IGNORED = 'user:relation:ignored',
  USER_UNIGNORED = 'user:relation:unignored',
}

/**
 * WebSocket message event names constants
 */
export enum WebSocketMessages {
  // Client to Server
  PING = 'ping',
  STATUS_UPDATE = 'status:update',
  STATUS_GET = 'status:get',

  // Deprecated (for backward compatibility)
  PRESENCE_UPDATE = 'presence:update',
}
