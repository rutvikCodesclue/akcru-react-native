import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';

export const getHelpVideos = async () => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get('/v1/helpvideo');

        if (data.success === false) {
            console.log(data.message);
            return [];
        }

        return data.helpVideos;
    } catch (error) {
        console.error('Error fetching help videos:', error);
        return [];
    }
};

export const getHelpVideoById = async (id: string) => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get(`/v1/helpvideo/helpVideos/${id}`);

        if (data.success === false) {
            console.log(data.message);
            return null;
        }

        return data.helpVideo;
    } catch (error) {
        console.error('Error fetching help video:', error);
        return null;
    }
};
