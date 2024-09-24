import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';

// export const updateWatchTime = async (movieId: string, watchTime: number): Promise<boolean> => {
//     await useAuthStore.getState().hydrateAuth();
//     console.log('Updating watch time:', movieId, watchTime);
//     try {
//         const response = await API.put(`/v1/watchtime/${movieId}`, {watchTime});
//         return response.data.success;
//     } catch (error) {
//         console.error('Error updating watch time:', error);
//         return false;
//     }
// };

// export const fetchWatchTime = async (movieId: string): Promise<number> => {
//     await useAuthStore.getState().hydrateAuth();
//     const {data} = await API.get<{success: boolean; watchTime?: number}>(`/v1/watchtime/${movieId}`);
//     if (data.watchTime !== undefined) {
//         return data.watchTime;
//     } else {
//         return 0;
//     }
// };

export const updateWatchTime = async (id: string, watchTime: number, isEpisode: boolean = false): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    const endpoint = isEpisode ? `/v1/watchtime/episode/${id}` : `/v1/watchtime/movie/${id}`;
    try {
        const response = await API.put(endpoint, {watchTime});
        return response.data.success;
    } catch (error) {
        console.error('Error updating watch time:', error);
        return false;
    }
};

// export const fetchWatchTime = async (id: string, isEpisode: boolean = false): Promise<number> => {
//     await useAuthStore.getState().hydrateAuth();
//     const endpoint = isEpisode ? `/v1/watchtime/episode/${id}` : `/v1/watchtime/movie/${id}`;
//     try {
//         const {data} = await API.get<{success: boolean; watchTime?: number}>(endpoint);
//         if (data.watchTime !== undefined) {
//             return data.watchTime;
//         } else {
//             return 0;
//         }
//     } catch (error) {
//         console.error('Error fetching watch time:', error);
//         return 0;
//     }
// };

export const fetchWatchTime = async (id: string, isEpisode: boolean): Promise<number> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get<{success: boolean; watchTime?: number}>(
            `/v1/watchtime/${isEpisode ? 'episode' : 'movie'}/${id}`,
        );
        return data.watchTime ?? 0;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return 0; // Return 0 if watch time record is not found
        }
        console.error('Error fetching watch time:', error);
        return 0; // Default to 0 in case of any other error
    }
};

