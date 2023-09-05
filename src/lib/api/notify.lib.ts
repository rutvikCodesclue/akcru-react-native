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

export const markNotificationRead = async (params: { id: string }): Promise<INotification | undefined> => {
    try {
        // GET /v1/notify/read
        const { id } = params
        const { data } = await API.post(`/v1/notify/read`, {
            id
        });
        if (data.success === false) {
            return undefined
        }

        return data.updatedNotification;
    } catch (error) {
        console.error(error);
    }
}
