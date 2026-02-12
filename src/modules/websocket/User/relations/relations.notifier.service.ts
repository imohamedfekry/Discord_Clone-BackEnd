import { Injectable, Logger } from '@nestjs/common';
import { User, RelationType } from '@prisma/client';
import {NOTIFICATION_EVENTS,UserBlockedData,UserIgnoredData,UserUnblockedData,UserUnignoredData,} from '../../../../common/Types/notification.types';
import { UnifiedNotifierService } from '../services/unified-notifier.service';

@Injectable()
export class RelationNotifierService {
  private readonly logger = new Logger(RelationNotifierService.name);

  constructor(private readonly unifiedNotifier: UnifiedNotifierService) {}
  notifyRelationChange(
    sourceUser: User,
    targetUser: User,
    relationType: RelationType,
    relation?: any,
    isRemoved = false,
  ): void {
    const sourceUserInfo = {
      id: sourceUser.id,
      username: sourceUser.username,
      avatar: sourceUser.avatar,
    };

    const targetUserInfo = {
      id: targetUser.id,
      username: targetUser.username,
      avatar: targetUser.avatar,
    };

    switch (relationType) {
      case RelationType.BLOCKED:
        if (isRemoved) {
          // When unblocking, notify source user (multi-device support)
          const unblockData: UserUnblockedData = {
            targetUser: targetUserInfo,
            unblockedByUser: sourceUserInfo,
          };
          this.unifiedNotifier.notifySource(
            NOTIFICATION_EVENTS.RELATION.BLOCK.UNBLOCKED,
            sourceUser.id.toString(),
            targetUser.id.toString(),
            unblockData,
            'User unblocked',
          );
          this.logger.log(`User ${sourceUser.id} unblocked ${targetUser.id}`);
        } else if (relation) {
          // When blocking, notify source user (BOTH pattern to support multi-device)
          const blockData: UserBlockedData = {
            relationId: relation.id,
            blockedUser: targetUserInfo,
            blockedByUser: sourceUserInfo,
          };
          this.unifiedNotifier.notifySource(
            NOTIFICATION_EVENTS.RELATION.BLOCK.BLOCKED,
            sourceUser.id.toString(),
            targetUser.id.toString(),
            blockData,
            'User blocked',
          );
          this.logger.log(`User ${sourceUser.id} blocked ${targetUser.id}`);
        }
        break;

      case RelationType.IGNORED:
        if (isRemoved) {
          // When unignoring, notify source user (multi-device support)
          const unignoreData: UserUnignoredData = {
            targetUser: targetUserInfo,
            unignoredByUser: sourceUserInfo,
          };
          this.unifiedNotifier.notifySource(
            NOTIFICATION_EVENTS.RELATION.IGNORE.UNIGNORED,
            sourceUser.id.toString(),
            targetUser.id.toString(),
            unignoreData,
            'User unignored',
          );
          this.logger.log(`User ${sourceUser.id} unignored ${targetUser.id}`);
        } else if (relation) {
          // When ignoring, notify source user (multi-device support)
          const ignoreData: UserIgnoredData = {
            relationId: relation.id,
            ignoredUser: targetUserInfo,
            ignoredByUser: sourceUserInfo,
          };
          this.unifiedNotifier.notifySource(
            NOTIFICATION_EVENTS.RELATION.IGNORE.IGNORED,
            sourceUser.id.toString(),
            targetUser.id.toString(),
            ignoreData,
            'User ignored',
          );
          this.logger.log(`User ${sourceUser.id} ignored ${targetUser.id}`);
        }
        break;
    }
  }
}
