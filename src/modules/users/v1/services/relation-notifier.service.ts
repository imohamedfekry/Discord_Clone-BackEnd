import { Injectable, Logger } from '@nestjs/common';
import { User, RelationType } from '@prisma/client';
import {
  SOCKET_EVENTS,
  SocketUserInfo,
  UserBlockedPayload,
  UserUnblockedPayload,
  UserIgnoredPayload,
  UserUnignoredPayload,
} from '../../../../common/Types/socket.types';
import { NotificationService } from '../../../websocket/User/services/notification.service';

@Injectable()
export class RelationNotifierService {
  private readonly logger = new Logger(RelationNotifierService.name);

  constructor(private readonly notifier: NotificationService) {}

  notifyRelationCreated(
    sourceUser: User,
    targetUser: User,
    relation: any,
    relationType: RelationType,
  ): void {
    const sourceUserInfo: SocketUserInfo = {
      id: sourceUser.id,
      username: sourceUser.username,
      avatar: sourceUser.avatar,
    };
    const targetUserInfo: SocketUserInfo = {
      id: targetUser.id,
      username: targetUser.username,
      avatar: targetUser.avatar,
    };

    switch (relationType) {
      case RelationType.BLOCKED: {
        const blockData: UserBlockedPayload = {
          relationId: relation.id,
          blockedUser: targetUserInfo,
          blockedByUser: sourceUserInfo,
        };
        this.notifier.notifySource(
          SOCKET_EVENTS.RELATION.BLOCK.BLOCKED,
          sourceUser.id.toString(),
          targetUser.id.toString(),
          blockData,
          'User blocked',
        );
        break;
      }
      case RelationType.IGNORED: {
        const ignoreData: UserIgnoredPayload = {
          relationId: relation.id,
          ignoredUser: targetUserInfo,
          ignoredByUser: sourceUserInfo,
        };
        this.notifier.notifySource(
          SOCKET_EVENTS.RELATION.IGNORE.IGNORED,
          sourceUser.id.toString(),
          targetUser.id.toString(),
          ignoreData,
          'User ignored',
        );
        break;
      }
    }
  }

  notifyRelationRemoved(
    sourceUser: User,
    targetUser: User,
    relationType: RelationType,
  ): void {
    const sourceUserInfo: SocketUserInfo = {
      id: sourceUser.id,
      username: sourceUser.username,
      avatar: sourceUser.avatar,
    };
    const targetUserInfo: SocketUserInfo = {
      id: targetUser.id,
      username: targetUser.username,
      avatar: targetUser.avatar,
    };

    switch (relationType) {
      case RelationType.BLOCKED: {
        const unblockData: UserUnblockedPayload = {
          targetUser: targetUserInfo,
          unblockedByUser: sourceUserInfo,
        };
        this.notifier.notifySource(
          SOCKET_EVENTS.RELATION.BLOCK.UNBLOCKED,
          sourceUser.id.toString(),
          targetUser.id.toString(),
          unblockData,
          'User unblocked',
        );
        break;
      }
      case RelationType.IGNORED: {
        const unignoreData: UserUnignoredPayload = {
          targetUser: targetUserInfo,
          unignoredByUser: sourceUserInfo,
        };
        this.notifier.notifySource(
          SOCKET_EVENTS.RELATION.IGNORE.UNIGNORED,
          sourceUser.id.toString(),
          targetUser.id.toString(),
          unignoreData,
          'User unignored',
        );
        break;
      }
    }
  }
}
