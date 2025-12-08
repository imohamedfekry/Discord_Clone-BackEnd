import { Injectable, Logger } from '@nestjs/common';
import { User, RelationType } from '@prisma/client';
import { UnifiedNotifierService } from '../../../websocket/User/services/unified-notifier.service';
import {
    NotificationEvent,
    NotificationTarget,
    NotificationUserInfo,
    UserBlockedData,
    UserUnblockedData,
    UserMutedData,
    UserUnmutedData,
    UserIgnoredData,
    UserUnignoredData,
} from '../../../../common/Types/notification.types';

/**
 * Relation Notifier Service
 * Handles all user relation-related WebSocket notifications
 * Extracted from users.service.ts for better separation of concerns
 */
@Injectable()
export class RelationNotifierService {
    private readonly logger = new Logger(RelationNotifierService.name);

    constructor(private readonly unifiedNotifier: UnifiedNotifierService) { }

    /**
     * Notify when a user relation is created
     */
    notifyRelationCreated(
        sourceUser: User,
        targetUser: User,
        relation: any,
        relationType: RelationType,
    ): void {
        const sourceUserInfo: NotificationUserInfo = {
            id: sourceUser.id,
            username: sourceUser.username,
            avatar: sourceUser.avatar,
        };

        const targetUserInfo: NotificationUserInfo = {
            id: targetUser.id,
            username: targetUser.username,
            avatar: targetUser.avatar,
        };

        switch (relationType) {
            case RelationType.BLOCKED:
                const blockData: UserBlockedData = {
                    relationId: relation.id,
                    blockedUser: targetUserInfo,
                    blockedByUser: sourceUserInfo,
                };
                this.unifiedNotifier.notifySource(
                    NotificationEvent.USER_BLOCKED,
                    sourceUser.id.toString(),
                    targetUser.id.toString(),
                    blockData,
                    'User blocked',
                );
                this.logger.log(`User ${sourceUser.id} blocked ${targetUser.id}`);
                break;

            case RelationType.MUTED:
                const muteData: UserMutedData = {
                    relationId: relation.id,
                    mutedUser: targetUserInfo,
                    mutedByUser: sourceUserInfo,
                };
                this.unifiedNotifier.notifySource(
                    NotificationEvent.USER_MUTED,
                    sourceUser.id.toString(),
                    targetUser.id.toString(),
                    muteData,
                    'User muted',
                );
                this.logger.log(`User ${sourceUser.id} muted ${targetUser.id}`);
                break;

            case RelationType.IGNORED:
                const ignoreData: UserIgnoredData = {
                    relationId: relation.id,
                    ignoredUser: targetUserInfo,
                    ignoredByUser: sourceUserInfo,
                };
                this.unifiedNotifier.notifySource(
                    NotificationEvent.USER_IGNORED,
                    sourceUser.id.toString(),
                    targetUser.id.toString(),
                    ignoreData,
                    'User ignored',
                );
                this.logger.log(`User ${sourceUser.id} ignored ${targetUser.id}`);
                break;
        }
    }

    /**
     * Notify when a user relation is removed
     */
    notifyRelationRemoved(
        sourceUser: User,
        targetUser: User,
        relationType: RelationType,
    ): void {
        const sourceUserInfo: NotificationUserInfo = {
            id: sourceUser.id,
            username: sourceUser.username,
            avatar: sourceUser.avatar,
        };

        const targetUserInfo: NotificationUserInfo = {
            id: targetUser.id,
            username: targetUser.username,
            avatar: targetUser.avatar,
        };

        switch (relationType) {
            case RelationType.BLOCKED:
                const unblockData: UserUnblockedData = {
                    targetUser: targetUserInfo,
                    unblockedByUser: sourceUserInfo,
                };
                this.unifiedNotifier.notifySource(
                    NotificationEvent.USER_UNBLOCKED,
                    sourceUser.id.toString(),
                    targetUser.id.toString(),
                    unblockData,
                    'User unblocked',
                );
                this.logger.log(`User ${sourceUser.id} unblocked ${targetUser.id}`);
                break;

            case RelationType.MUTED:
                const unmuteData: UserUnmutedData = {
                    targetUser: targetUserInfo,
                    unmutedByUser: sourceUserInfo,
                };
                this.unifiedNotifier.notifySource(
                    NotificationEvent.USER_UNMUTED,
                    sourceUser.id.toString(),
                    targetUser.id.toString(),
                    unmuteData,
                    'User unmuted',
                );
                this.logger.log(`User ${sourceUser.id} unmuted ${targetUser.id}`);
                break;

            case RelationType.IGNORED:
                const unignoreData: UserUnignoredData = {
                    targetUser: targetUserInfo,
                    unignoredByUser: sourceUserInfo,
                };
                this.unifiedNotifier.notifySource(
                    NotificationEvent.USER_UNIGNORED,
                    sourceUser.id.toString(),
                    targetUser.id.toString(),
                    unignoreData,
                    'User unignored',
                );
                this.logger.log(`User ${sourceUser.id} unignored ${targetUser.id}`);
                break;
        }
    }
}
