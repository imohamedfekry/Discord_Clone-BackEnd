import { Injectable, Logger } from '@nestjs/common';
import { BroadcasterService } from '../presence/broadcaster.service';
import {
  SocketEventName,
  SocketEventPayload,
  SocketNotificationRequest,
  SocketEmitPayload,
  NotificationTarget,
} from '../../../../common/Types/socket.types';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly broadcaster: BroadcasterService) {}

  notify<T extends SocketEventPayload>(request: SocketNotificationRequest<T>): void {
    const { event, sourceUserId, targetUserId, notificationTarget, data, message } = request;
    const payload: SocketEmitPayload<T> = {
      code: event,
      message: message ?? event,
      data,
      timestamp: new Date(),
    };
    const recipients = this.getRecipients(notificationTarget, sourceUserId, targetUserId);
    recipients.forEach((userId) => {
      this.logger.log(`Sending [${event}] to user ${userId}`);
      this.broadcaster.sendToUser(userId, event, payload);
    });
  }

  notifyTarget<T extends SocketEventPayload>(
    event: SocketEventName,
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

  notifySource<T extends SocketEventPayload>(
    event: SocketEventName,
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

  notifyBoth<T extends SocketEventPayload>(
    event: SocketEventName,
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
        return [];
    }
  }
}
