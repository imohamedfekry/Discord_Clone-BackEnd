import { Injectable } from '@nestjs/common';
import { User, UserStatus } from '@prisma/client';
import { UnifiedNotifierService } from '../services/unified-notifier.service';
import {
  CustomStatusUpdatedData,
  GlobalnameUpdatedData,
  NOTIFICATION_EVENTS,
  StatusUpdatedData,
  UsernameUpdatedData,
} from '../../../../common/Types/notification.types';

@Injectable()
export class ProfileNotifierService {
  constructor(private readonly notifier: UnifiedNotifierService) {}

  notifyGlobalnameUpdated(
    user: User,
    friendIds: (string | bigint)[],
    globalname: string | null,
  ): void {
    const data: GlobalnameUpdatedData = {
      userId: user.id,
      globalname,
    };

    this.notifier.notifySource(
      NOTIFICATION_EVENTS.PROFILE.GLOBALNAME_UPDATED,
      user.id.toString(),
      user.id.toString(),
      data,
    );
    console.log('Notifying friends', friendIds, 'that global name was updated');
    console.log('User ID:', user.id);
    console.log('Data:', data);
    console.log('Friend IDs:', friendIds);

    friendIds.forEach((friendId) => {
      console.log('Notifying friend', friendId, 'that global name was updated');
      console.log('Data:', data);
      this.notifier.notifyTarget(
        NOTIFICATION_EVENTS.PROFILE.GLOBALNAME_UPDATED,
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
    const data: UsernameUpdatedData = {
      userId: user.id,
      username,
    };

    this.notifier.notifySource(
      NOTIFICATION_EVENTS.PROFILE.USERNAME_UPDATED,
      user.id.toString(),
      user.id.toString(),
      data,
    );

    friendIds.forEach((friendId) => {
      this.notifier.notifyTarget(
        NOTIFICATION_EVENTS.PROFILE.USERNAME_UPDATED,
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
    const data: CustomStatusUpdatedData = {
      userId: user.id,
      customStatus: {
        text: payload.text ?? null,
        emoji: payload.emoji ?? null,
        expiresAt: payload.expiresAt ?? null,
      },
    };

    this.notifier.notifySource(
      NOTIFICATION_EVENTS.PROFILE.CUSTOM_STATUS_UPDATED,
      user.id.toString(),
      user.id.toString(),
      data,
    );

    friendIds.forEach((friendId) => {
      this.notifier.notifyTarget(
        NOTIFICATION_EVENTS.PROFILE.CUSTOM_STATUS_UPDATED,
        user.id.toString(),
        friendId.toString(),
        data,
      );
    });
  }
  notifyStatusUpdated(user: User,     friendIds: (string | bigint)[], status: UserStatus): void {
    const data: StatusUpdatedData = {
      userId: user.id,
      status: status as UserStatus,
    };
    this.notifier.notifySource(
      NOTIFICATION_EVENTS.PROFILE.STATUS_UPDATED,
      user.id.toString(),
      user.id.toString(),
      data,
    );
    friendIds.forEach((friendId) => {
      this.notifier.notifyTarget(
        NOTIFICATION_EVENTS.PROFILE.STATUS_UPDATED,
        user.id.toString(),
        friendId.toString(),
        data,
      );
    });
  }

}
