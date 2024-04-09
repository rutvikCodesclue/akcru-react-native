import { API } from "../../clients/api.client";
import useAuthStore from "../../stores/auth.store";

export const getHelpVideos = async () => {
    await useAuthStore.getState().hydrateAuth(); // Ensure the user is authenticated
    try {
        const {data} = await API.get(`/v1/helpvideo`);

        if (data.success === false) {
            console.log(data.message); // Optionally log any messages
            return [];
        }

        return data.helpVideos;
    } catch (error) {
        console.error('Error fetching help videos:', error);
        return []; // Return an empty array in case of error
    }
};
