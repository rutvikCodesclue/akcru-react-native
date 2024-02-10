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

export const sendTagNotification = async (tagUserId: any, notificationType: any, contentId: any) => {
    try {
        const {data} = await API.post('/v1/notify/sentTagNotification', {
            tagUserId,
            notificationType,
            contentId,
        });

        return data.success;
    } catch (error) {
        console.error('Error sending tag notification:', error);
        return false;
    }
};
