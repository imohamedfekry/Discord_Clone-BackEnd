import { Injectable, Logger } from '@nestjs/common';
import { BroadcasterService } from '../presence/broadcaster.service';
import { UserStatus } from '@prisma/client';
import { WebSocketEvents } from '../../../../common/Types/websocket.types';

/**
 * Presence event data types
 */
interface PresenceUpdatedPayload {
    userId: string;
    username: string;
    status: UserStatus;
}

interface StatusUpdatedPayload {
    userId: string;
    status: UserStatus;
}

/**
 * Presence Notifier Service
 * Handles all presence-related WebSocket notifications
 * Uses BroadcasterService directly (not UnifiedNotifierService)
 * because presence events have different patterns (broadcast to friends)
 */
@Injectable()
export class PresenceNotifierService {
    private readonly logger = new Logger(PresenceNotifierService.name);

    constructor(private readonly broadcaster: BroadcasterService) { }

    /**
     * Notify a user's friends about presence update
     * @param userId - User whose presence changed
     * @param username - User's username
     * @param friendIds - List of friend IDs to notify
     * @param status - New presence status
     */
    notifyPresenceUpdate(
        userId: string,
        username: string,
        friendIds: string[],
        status: UserStatus,
    ): void {
        if (!friendIds || friendIds.length === 0) return;

        const payload: PresenceUpdatedPayload = {
            userId,
            username,
            status,
        };

        this.logger.log(
            `Notifying ${friendIds.length} friends about ${username}'s presence update`,
        );

        // Broadcast to each friend directly using BroadcasterService
        friendIds.forEach((friendId) => {
            this.broadcaster.sendToUser(
                friendId,
                WebSocketEvents.PRESENCE_UPDATED,
                {
                    code: WebSocketEvents.PRESENCE_UPDATED,
                    message: 'Presence updated',
                    data: payload,
                    timestamp: new Date(),
                },
            );
        });
    }

    /**
     * Notify user about status update on all their devices
     * @param userId - User whose status was updated
     * @param status - New status
     */
    notifyStatusUpdate(userId: string, status: UserStatus): void {
        const payload: StatusUpdatedPayload = {
            userId,
            status,
        };

        this.logger.log(`Notifying user ${userId} about status update on all devices`);

        // Notify the user on all their devices using BroadcasterService
        this.broadcaster.sendToUser(
            userId,
            WebSocketEvents.STATUS_UPDATED,
            {
                code: WebSocketEvents.STATUS_UPDATED,
                message: 'Status updated',
                data: payload,
                timestamp: new Date(),
            },
        );
    }
}
