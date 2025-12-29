import { Injectable, Logger } from '@nestjs/common';
import { BroadcasterService } from '../presence/broadcaster.service';
import {
    NotificationEvent,
    NotificationRequest,
    NotificationTarget,
    NotificationData,
    WebSocketNotificationPayload,
} from '../../../../common/Types/notification.types';

/**
 * Unified Notifier Service
 * Centralized service for sending typed WebSocket notifications
 * Supports notifying source, target, or both parties
 */
@Injectable()
export class UnifiedNotifierService {
    private readonly logger = new Logger(UnifiedNotifierService.name);

    constructor(private readonly broadcaster: BroadcasterService) { }

    /**
     * Send a typed notification to the configured recipients
     * @param request - Notification request with event, users, target config, and typed data
     */
    notify<T extends NotificationData>(request: NotificationRequest<T>): void {
        const {
            event,
            sourceUserId,
            targetUserId,
            notificationTarget,
            data,
            message,
        } = request;

        // Generate default message if not provided
        const notificationMessage = message || this.getDefaultMessage(event);

        // Build standardized WebSocket payload
        const payload: WebSocketNotificationPayload<T> = {
            code: event,
            message: notificationMessage,
            data,
            timestamp: new Date(),
        };

        // Determine recipients based on notification target
        const recipients = this.getRecipients(
            notificationTarget,
            sourceUserId,
            targetUserId,
        );

        // Send notification to all recipients
        recipients.forEach((userId) => {
            this.logger.log(
                `Sending notification [${event}] to user ${userId}`,
            );
            this.broadcaster.sendToUser(userId, event, payload);
        });
    }

    /**
     * Helper: Notify only the target user
     */
    notifyTarget<T extends NotificationData>(
        event: NotificationEvent,
        sourceUserId: string,
        targetUserId: string,
        data: T,
        message?: string,
    ): void {
        this.notify({
            event,
            sourceUserId,
            targetUserId,
            notificationTarget: NotificationTarget.TARGET,
            data,
            message,
        });
    }

    /**
     * Helper: Notify only the source user
     */
    notifySource<T extends NotificationData>(
        event: NotificationEvent,
        sourceUserId: string,
        targetUserId: string,
        data: T,
        message?: string,
    ): void {
        this.notify({
            event,
            sourceUserId,
            targetUserId,
            notificationTarget: NotificationTarget.SOURCE,
            data,
            message,
        });
    }

    /**
     * Helper: Notify both source and target users (all their devices)
     */
    notifyBoth<T extends NotificationData>(
        event: NotificationEvent,
        sourceUserId: string,
        targetUserId: string,
        data: T,
        message?: string,
    ): void {
        this.notify({
            event,
            sourceUserId,
            targetUserId,
            notificationTarget: NotificationTarget.BOTH,
            data,
            message,
        });
    }

    /**
     * Determine which users should receive the notification
     */
    private getRecipients(
        target: NotificationTarget,
        sourceUserId: string,
        targetUserId: string,
    ): string[] {
        switch (target) {
            case NotificationTarget.SOURCE:
                return [sourceUserId];
            case NotificationTarget.TARGET:
                return [targetUserId];
            case NotificationTarget.BOTH:
                return [sourceUserId, targetUserId];
            default:
                this.logger.warn(`Unknown notification target: ${target}`);
                return [];
        }
    }

    /**
     * Get default human-readable message for notification event
     */
    private getDefaultMessage(event: NotificationEvent): string {
        const messages: Record<NotificationEvent, string> = {
            [NotificationEvent.FRIEND_REQUEST_RECEIVED]: 'Friend request received',
            [NotificationEvent.FRIEND_REQUEST_SENT]: 'Friend request sent',
            [NotificationEvent.FRIEND_REQUEST_ACCEPTED]: 'Friend request accepted',
            [NotificationEvent.FRIEND_REQUEST_REJECTED]: 'Friend request rejected',
            [NotificationEvent.FRIEND_REQUEST_CANCELLED]: 'Friend request cancelled',
            [NotificationEvent.FRIEND_REQUEST_CANCELLED_BY_SENDER]: 'You cancelled a friend request',
            [NotificationEvent.FRIEND_REMOVED]: 'Friend removed',
            [NotificationEvent.USER_BLOCKED]: 'User blocked',
            [NotificationEvent.USER_UNBLOCKED]: 'User unblocked',
            [NotificationEvent.USER_MUTED]: 'User muted',
            [NotificationEvent.USER_UNMUTED]: 'User unmuted',
            [NotificationEvent.USER_IGNORED]: 'User ignored',
            [NotificationEvent.USER_UNIGNORED]: 'User unignored',
        };

        return messages[event] || 'Notification';
    }
}
