import { Injectable, Logger } from '@nestjs/common';
import { JwtHelper } from '../../../../common/Global/security/jwt.helper';
import { AuthenticatedSocket } from '../../../../common/Types/websocket.types';
import * as cookie from 'cookie';

/**
 * Authentication Service for WebSocket connections
 * Handles JWT verification and user authentication
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtHelper: JwtHelper) {}

  /**
   * Authenticate client using JWT token
   * @param client - Socket client
   * @returns User object if authenticated, null otherwise
   */
  async authenticateClient(client: AuthenticatedSocket): Promise<any | null> {
    const cookiesHeader = client.handshake.headers.cookie;
    if (!cookiesHeader) {
      client.disconnect();
      return;
    }
    const cookies = cookie.parse(cookiesHeader);
    const token = cookies['Authorization']; // اسم الكوكيز
    if (!token) {
      client.disconnect();
      return;
    }
    
    const user = await this.jwtHelper.VerifyAndGetUser(token);

    if (!user) {
      this.logger.warn(`Invalid token for client ${client.id}`);
      client.disconnect();
      return null;
    }

    return user;
  }

  /**
   * Setup user session after authentication
   * @param client - Socket client
   * @param user - Authenticated user
   */
  setupSession(client: AuthenticatedSocket, user: any): void {
    client.authenticated = true;
    client.userId = user.id;
    (client as any).user = user;
  }

  /**
   * Check if client is authenticated
   * @param client - Socket client
   * @returns true if authenticated, false otherwise
   */
  isAuthenticated(client: AuthenticatedSocket): boolean {
    return client.authenticated === true && !!client.userId;
  }

  /**
   * Get user from authenticated client
   * @param client - Socket client
   * @returns User object
   */
  getUserFromClient(client: AuthenticatedSocket): any {
    return (client as any).user;
  }

  /**
   * Extract connection metadata from client
   * @param client - Socket client
   * @returns Connection metadata
   */
  createConnectionMetadata(client: AuthenticatedSocket) {
    return {
      device: client.handshake.headers['user-agent'] || 'unknown',
      ip: client.handshake.address,
      connectedAt: new Date(),
      userAgent: client.handshake.headers['user-agent'],
    };
  }
}

