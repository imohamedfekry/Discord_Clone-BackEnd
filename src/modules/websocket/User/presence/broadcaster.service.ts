import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

/**
 * Broadcaster Service
 * Handles broadcasting messages to rooms and users
 */
@Injectable()
export class BroadcasterService {
  private server: Server;

  /**
   * Set the server instance
   * Called by the gateway after initialization
   */
  setServer(server: Server): void {
    this.server = server;
  }

  /**
   * Broadcast message to all users in a room
   */
  broadcastToRoom(room: string, event: string, data: any): void {
    if (!this.server) {
      console.warn('Broadcaster: Server not initialized');
      return;
    }
    this.server.to(room).emit(event, data);
  }

  /**
   * Send message to specific user (all their devices)
   */
  sendToUser(userId: string, event: string, data: any): void {
    if (!this.server) {
      console.warn('Broadcaster: Server not initialized');
      return;
    }
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Standardized send: wraps payload with code/message/data/timestamp
   */
  sendToUserStd(userId: string, code: string, message: string, data?: any): void {
    console.log(" socket: ",userId,code)
    this.sendToUser(userId, code, {
      code,
      message,
      data,
      timestamp: new Date(),
    });
  }

  broadcastToRoomStd(room: string, code: string, message: string, data?: any): void {
    this.broadcastToRoom(room, code, {
      code,
      message,
      data,
      timestamp: new Date(),
    });
  }
}

