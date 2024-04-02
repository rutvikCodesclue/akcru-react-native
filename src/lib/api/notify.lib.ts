import { API } from "../../clients/api.client";
import { INotification } from "../../../types";

export const getMyNotifications = async (): Promise<INotification[] | undefined> => {
    try {
        // GET /v1/notify/me
        const { data } = await API.get(`/v1/notify/me`);
        if (data.success === false) {
            return []
        }

        return data.notifications;
    } catch (error) {
        console.error(error);
    }
}

export const markNotificationRead = async (params: {id: string}): Promise<INotification | undefined> => {
    try {
        // Log the `id` parameter before making the API call
        console.log('Notification ID to mark as read:', params.id);

        // GET /v1/notify/read
        const {id} = params;
        const {data} = await API.put(`/v1/notify/read`, {
            id,
        });
        console.log('API Response:', data); // Log the API response

        if (data.success === false) {
            return undefined;
        }

        return data.updatedNotification;
    } catch (error) {
        console.error(error);
    }
};

export const sendTagNotification = async (tagUserId: any, notificationType: any, contentId: any, postId: any): Promise<boolean> => {
    try {
        const {data} = await API.post('/v1/notify/sentTagNotification', {
            tagUserId,
            notificationType,
            contentId,
            postId
            
        });

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
        // PUT /v1/notify/batch-read - Batch mark notifications as read
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
        // DELETE /v1/notify/read/all
        const {data} = await API.delete(`/v1/notify/read/all`);
        console.log('Delete all read notifications response:', data); // Optionally log the response for debugging

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


