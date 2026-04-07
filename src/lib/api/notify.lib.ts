import {API} from '../../clients/api.client';
import {INotification} from '../../../types';

/** Extra UI hints from GET /v1/notify/me (e.g. center hex shake). */
export type NotifyMeIndicator = {
    shouldShake?: boolean;
    hasConversationUpdate?: boolean;
    hasNewMessage?: boolean;
    hasNewMovieInviteTicket?: boolean;
    counts?: Record<string, unknown>;
};

export type NotifyMePayload = {
    notifications: INotification[];
    indicator?: NotifyMeIndicator;
};

export async function getNotifyMePayload(): Promise<NotifyMePayload | undefined> {
    try {
        const {data} = await API.get('/v1/notify/me');
        if (data.success === false) {
            return {notifications: [], indicator: undefined};
        }

        return {
            notifications: Array.isArray(data.notifications) ? data.notifications : [],
            indicator: data.indicator,
        };
    } catch (error) {
        console.error(error);
    }
}

/** Function declaration avoids TDZ / missing export with circular module loads (Hermes). */
export async function getMyNotifications(): Promise<INotification[] | undefined> {
    const payload = await getNotifyMePayload();
    return payload?.notifications;
}

export const markNotificationRead = async (params: {id: string}): Promise<INotification | undefined> => {
    try {
        console.log('Notification ID to mark as read:', params.id);

        const {id} = params;
        const {data} = await API.put('/v1/notify/read', {
            id,
        });
        console.log('API Response:', data);

        if (data.success === false) {
            return undefined;
        }

        return data.updatedNotification;
    } catch (error) {
        console.error(error);
    }
};

// export const sendTagNotification = async (
//     tagUserId: any,
//     notificationType: any,
//     contentId: any,
//     followersTag?: string,
// ): Promise<boolean> => {
//     try {
//         const {data} = await API.post('/v1/notify/sentTagNotification', {
//             tagUserId,
//             notificationType,
//             contentId,
//             followersTag,
//         });

//         return data.success;
//     } catch (error) {
//         console.error('Error sending tag notification:', error);
//         return false;
//     }
// };

export const sendTagNotification = async (
    tagUserId: any,
    notificationType: any,
    contentId: any,
    followersTag = null,
) => {
    try {
        const payload = followersTag
            ? {tagUserId, notificationType, contentId, followersTag}
            : {tagUserId, notificationType, contentId};

        const {data} = await API.post('/v1/notify/sentTagNotification', payload);

        return data.success;
    } catch (error) {
        console.error('Error sending tag notification:', error);
        return false;
    }
};


export const batchMarkNotificationsRead = async (
    notificationIds: string[],
): Promise<{success: boolean; message?: string}> => {
    try {
        const response = await API.put('/v1/notify/batchMarkRead', {notificationIds});
        if (response.data.success) {
            console.log('Batch mark notifications read response:', response.data);
            return {success: true, message: 'Notifications marked as read successfully.'};
        } else {
            console.error('Failed to batch mark notifications as read:', response.data.message);
            return {success: false, message: response.data.message};
        }
    } catch (error) {
        console.error('Error in batch marking notifications as read:', error);
        return {success: false, message: 'An error occurred while marking notifications as read.'};
    }
};

export const deleteAllReadNotifications = async (): Promise<{success: boolean; message: string}> => {
    try {
        const {data} = await API.delete('/v1/notify/read/all');
        console.log('Delete all read notifications response:', data);

        if (data.success) {
            return {success: true, message: 'All read notifications have been successfully deleted.'};
        } else {
            console.error('Failed to delete all read notifications:', data.message);
            return {success: false, message: data.message || 'Failed to delete read notifications.'};
        }
    } catch (error) {
        console.error('Error deleting all read notifications:', error);
        return {success: false, message: 'An error occurred while deleting read notifications.'};
    }
};

export const deleteNotification = async (notificationId: string) => {
    const {default: useAuthStore} = await import('../../stores/auth.store');
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.delete(`/v1/notify/deleteNotification/${notificationId}`);

        if (data.success === false) {
            console.log(data.message);
            return {success: false, message: data.message};
        }

        return {success: true, message: 'Notification deleted successfully'};
    } catch (error) {
        console.error('Error deleting notification:', error);
        return {success: false, message: 'An error occurred while deleting the notification.'};
    }
};

export const deleteReadNotification = async (notificationId: string): Promise<{success: boolean; message: string}> => {
    try {
        const {data} = await API.delete(`/v1/notify/read/${notificationId}`);
        console.log('Delete read notification response:', data);

        if (data.success) {
            return {success: true, message: 'Read notification has been successfully deleted.'};
        } else {
            console.error('Failed to delete read notification:', data.message);
            return {success: false, message: data.message || 'Failed to delete read notification.'};
        }
    } catch (error) {
        console.error('Error deleting read notification:', error);
        return {success: false, message: 'An error occurred while deleting the read notification.'};
    }
};
