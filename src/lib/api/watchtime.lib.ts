import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';

export const PLAYBACK_EVENT = {
    STARTED: 'PLAYBACK_STARTED',
    PROGRESS: 'PLAYBACK_PROGRESS',
    PAUSED: 'PLAYBACK_PAUSED',
    RESUMED: 'PLAYBACK_RESUMED',
    COMPLETED: 'PLAYBACK_COMPLETED',
    EXITED: 'PLAYBACK_EXITED',
} as const;

export type PlaybackEventValue = (typeof PLAYBACK_EVENT)[keyof typeof PLAYBACK_EVENT];

export const updateWatchTime = async (
    id: string,
    watchTime: number,
    isEpisode: boolean = false,
    eventType: PlaybackEventValue = PLAYBACK_EVENT.PROGRESS,
): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    const endpoint = isEpisode ? `/v1/watchtime/episode/${id}` : `/v1/watchtime/movie/${id}`;
    try {
        const response = await API.put(endpoint, {watchTime, eventType});
        return response.data.success;
    } catch (error) {
        console.error('Error updating watch time:', error);
        return false;
    }
};

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

/**
 * Award 1 AD to the user (debited from the System wallet).
 * Hits your updateAUsersWatchTimeHandler endpoint.
 */
export const awardAD = async (): Promise<boolean> => {
    // ensure auth token is fresh
    await useAuthStore.getState().hydrateAuth();

    try {
        // no params—just call the AD awarding endpoint
        const response = await API.put('/v1/watchtime/award');
        return response.data.success;
    } catch (error) {
        console.error('Error awarding AD:', error);
        return false;
    }
};

export const fetchRewardInterval = async (): Promise<number> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get<{success: boolean; rewardIntervalSeconds: number}>('/v1/watchtime/config');
        if (!data ) {
            return 216;
        }
        return data.rewardIntervalSeconds;
    } catch (err) {
        console.error('Error fetching reward interval:', err);
        // fallback to 216 if the call fails
        return 216;
    }
};
