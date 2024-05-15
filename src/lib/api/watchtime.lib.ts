import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';

export const updateWatchTime = async (movieId: string, watchTime: number): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    console.log('Updating watch time:', movieId, watchTime);
    try {
        const response = await API.put(`/v1/watchtime/${movieId}`, {watchTime});
        return response.data.success;
    } catch (error) {
        console.error('Error updating watch time:', error);
        return false;
    }
};

export const fetchWatchTime = async (movieId: string): Promise<number> => {
    await useAuthStore.getState().hydrateAuth();
    const {data} = await API.get<{success: boolean; watchTime?: number}>(`/v1/watchtime/${movieId}`);
    if (data.watchTime !== undefined) {
        return data.watchTime;
    } else {
        return 0;
    }
};
