import { Socket } from 'socket.io';
import { User } from '@prisma/client';

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
  CONNECTED = 'connected',
  DISCONNECT = 'disconnect',
  
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

