import { Injectable } from '@nestjs/common';
import { User, UserStatus } from '@prisma/client';
import {
  SOCKET_EVENTS,
  GlobalnameUpdatedPayload,
  UsernameUpdatedPayload,
  CustomStatusUpdatedPayload,
  StatusUpdatedPayload,
  UserOnlinePayload,
} from '../../../../common/Types/socket.types';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ProfileNotifierService {
  constructor(private readonly notifier: NotificationService) {}

  notifyGlobalnameUpdated(
    user: User,
    friendIds: (string | bigint)[],
    globalname: string | null,
  ): void {
    const data: GlobalnameUpdatedPayload = { userId: user.id, globalname };
    this.notifier.notifySource(
      SOCKET_EVENTS.PROFILE.GLOBALNAME_UPDATED,
      user.id.toString(),
      user.id.toString(),
      data,
    );
    friendIds.forEach((friendId) => {
      this.notifier.notifyTarget(
        SOCKET_EVENTS.PROFILE.GLOBALNAME_UPDATED,
        user.id.toString(),
        friendId.toString(),
        data,
      );
    });
  }

  notifyUsernameUpdated(
    user: User,
    friendIds: (string | bigint)[],
    username: string,
  ): void {
    const data: UsernameUpdatedPayload = { userId: user.id, username };
    this.notifier.notifySource(
      SOCKET_EVENTS.PROFILE.USERNAME_UPDATED,
      user.id.toString(),
      user.id.toString(),
      data,
    );
    friendIds.forEach((friendId) => {
      this.notifier.notifyTarget(
        SOCKET_EVENTS.PROFILE.USERNAME_UPDATED,
        user.id.toString(),
        friendId.toString(),
        data,
      );
    });
  }

  notifyCustomStatusUpdated(
    user: User,
    friendIds: (string | bigint)[],
    payload: { text?: string; emoji?: string; expiresAt?: string },
  ): void {
    const data: CustomStatusUpdatedPayload = {
      userId: user.id,
      customStatus: {
        text: payload.text ?? null,
        emoji: payload.emoji ?? null,
        expiresAt: payload.expiresAt ?? null,
      },
    };
    this.notifier.notifySource(
      SOCKET_EVENTS.PROFILE.CUSTOM_STATUS_UPDATED,
      user.id.toString(),
      user.id.toString(),
      data,
    );
    friendIds.forEach((friendId) => {
      this.notifier.notifyTarget(
        SOCKET_EVENTS.PROFILE.CUSTOM_STATUS_UPDATED,
        user.id.toString(),
        friendId.toString(),
        data,
      );
    });
  }

  notifyStatusUpdated(
    user: User,
    friendIds: (string | bigint)[],
    status: UserStatus,
  ): void {
    const data: StatusUpdatedPayload = { userId: user.id, status };
    this.notifier.notifySource(
      SOCKET_EVENTS.PROFILE.STATUS_UPDATED,
      user.id.toString(),
      user.id.toString(),
      data,
    );
    friendIds.forEach((friendId) => {
      this.notifier.notifyTarget(
        SOCKET_EVENTS.PROFILE.STATUS_UPDATED,
        user.id.toString(),
        friendId.toString(),
        data,
      );
    });
  }

  notifyUserOnline(
    user: User,
    friendIds: (bigint | string)[],
    presenceStatus?: UserStatus,
    payload?: { emoji?: string; text?: string },
  ): void {
    const status = presenceStatus ?? UserStatus.ONLINE;
    const hasCustomStatus = !!(payload?.text || payload?.emoji);
    const data: UserOnlinePayload = {
      userId: user.id,
      status,
      ...(status !== UserStatus.INVISIBLE &&
        hasCustomStatus && {
        customStatus: {
          text: payload?.text ?? null,
          emoji: payload?.emoji ?? null,
        },
      }),
    };
    this.notifier.notifySource(
      SOCKET_EVENTS.USER_ONLINE,
      user.id.toString(),
      user.id.toString(),
      data,
    );
    friendIds.forEach((friendId) => {
      this.notifier.notifyTarget(
        SOCKET_EVENTS.USER_ONLINE,
        user.id.toString(),
        friendId.toString(),
        data,
      );
    });
  }
}
