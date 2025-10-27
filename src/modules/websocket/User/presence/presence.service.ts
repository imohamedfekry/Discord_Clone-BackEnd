import { Injectable, Logger } from '@nestjs/common';
import { PresenceStatusService } from '../services/presence-status.service';
import { PresenceService as CommonPresenceService } from '../../../../common/presence/presence.service';
import { UserRepository } from '../../../../common/database/repositories/user.repository';
import { AuthService } from '../auth/auth.service';
import { AuthenticatedSocket, StatusUpdateData, WebSocketEvents } from '../../../../common/Types/websocket.types';

/**
 * Presence Service
 * Business logic for presence and status updates
 */
@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly presenceStatusService: PresenceStatusService,
    private readonly presenceService: CommonPresenceService,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Handle status update
   */
  async handleStatusUpdate(client: AuthenticatedSocket, data: StatusUpdateData): Promise<void> {
    const user = this.authService.getUserFromClient(client);
    if (!user) return;

    const { status } = data;

    await this.presenceStatusService.setDisplayStatus(user.id, status);
    await this.userRepository.updateStatus(user.id, status);

    this.logger.log(`User ${user.id} set display status to ${status}`);
  }

  /**
   * Handle get status
   */
  async handleGetStatus(client: AuthenticatedSocket): Promise<void> {
    const user = this.authService.getUserFromClient(client);
    if (!user) return;

    const displayStatus = await this.presenceStatusService.getDisplayStatus(user.id);
    const isOnline = await this.presenceService.isOnline(user.id);

    client.emit(WebSocketEvents.STATUS_CURRENT, {
      displayStatus: displayStatus || 'ONLINE',
      actualStatus: isOnline ? 'ONLINE' : 'OFFLINE',
    });
  }

  /**
   * Handle deprecated presence update
   */
  async handlePresenceUpdate(client: AuthenticatedSocket, data: StatusUpdateData): Promise<void> {
    const user = this.authService.getUserFromClient(client);
    if (!user) return;

    const { status } = data;
    await this.userRepository.updateStatus(user.id, status);

    this.logger.warn(`User ${user.id} used deprecated presence:update event`);
  }
}

