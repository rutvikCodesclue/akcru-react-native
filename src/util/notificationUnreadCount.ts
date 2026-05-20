import type {INotification} from '../../types';
import {NotificationType} from '../types/NotificationType';

/** MIT push types for center hex + MIT ticket badge, shake, and hub batch-read (excludes `MITCanceled`). */
const MIT_TYPES_FOR_HEX_BADGE: INotification['type'][] = [
    'MITReceived',
    'MITAccepted',
    'MITDeclined',
    NotificationType.MITExpiringSoon,
    NotificationType.MITExpired,
    NotificationType.MITMovieChanged,
    NotificationType.MITRescheduled,
];

function isMitHexBadgeType(type: INotification['type']): boolean {
    return (MIT_TYPES_FOR_HEX_BADGE as readonly string[]).includes(type);
}

/** Unread count for the center-menu MIT ticket only (not likes, messages, etc.). */
export function computeMitUnreadNotificationCount(notifications: INotification[] | undefined): number {
    if (!notifications?.length) {
        return 0;
    }
    return notifications.filter(n => !n.isRead && isMitHexBadgeType(n.type)).length;
}

export function getUnreadMitNotificationIds(notifications: INotification[]): string[] {
    return notifications.filter(n => !n.isRead && isMitHexBadgeType(n.type)).map(n => n.id);
}

/** Unread direct-message notifications (hex chat satellite + center dot + shake). */
export function computeMsgRcvdUnreadNotificationCount(notifications: INotification[] | undefined): number {
    if (!notifications?.length) {
        return 0;
    }
    return notifications.filter(n => !n.isRead && n.type === 'MsgRcvd').length;
}

export function getUnreadMsgRcvdNotificationIds(notifications: INotification[]): string[] {
    return notifications.filter(n => !n.isRead && n.type === 'MsgRcvd').map(n => n.id);
}

/** Types that count toward the in-app notification badge (matches Header / notification screens). */
const NOTIFICATION_TYPES_FOR_BADGE: readonly string[] = [
    'MITReceived',
    'MITAccepted',
    'MITDeclined',
    NotificationType.MITExpiringSoon,
    NotificationType.MITExpired,
    NotificationType.MITMovieChanged,
    NotificationType.MITRescheduled,
    NotificationType.MITCanceled,
    'CruViewStarted',
    'CRUViewCanceled',
    'UserLikedGallery',
    'UserLikedComment',
    'UserLikedPost',
    'UserTaggedOnPost',
    'UserCommentedOnPost',
    'UserTaggedOnComment',
    'UserFollowed',
    'CruInviteReceived',
    'CruInviteAccepted',
    'CruInviteDeclined',
    'CruViewScheduled',
    'ADReceived',
    'GroupMessageReceived',
    'MsgRcvd',
];

export function computeUnreadNotificationCount(notifications: INotification[] | undefined): number {
    if (!notifications?.length) {
        return 0;
    }
    return notifications.filter(
        n => !n.isRead && NOTIFICATION_TYPES_FOR_BADGE.includes(n.type),
    ).length;
}
