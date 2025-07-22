import {ISeries, ISeason, IEpisode} from '../../../types';
import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';

// Helper function to ensure user is authenticated
const ensureAuthenticated = async () => {
    await useAuthStore.getState().hydrateAuth();
};

export const getSeriesGenres = async () => {
    try {
        const {data} = await API.get('/v1/series/genres');
        return data.genres;
    } catch (error) {
        console.error('Error fetching genres:', error);
        return [];
    }
};

export const findSeries = async (genre?: string): Promise<ISeries[] | []> => {
    await ensureAuthenticated();
    try {
        const {data} = await API.get(`/v1/series${genre ? `?genre=${genre.toUpperCase()}` : ''}`);
        if (!data.success) {
            return [];
        }
        return data.series;
    } catch (error) {
        console.error('Error fetching series:', error);
        return [];
    }
};

export const findSeriesWithEpisodes = async (id: string): Promise<ISeries | null> => {
    await ensureAuthenticated();
    try {
        const {data} = await API.get(`/v1/series/series-with-episodes?id=${id}`);
        if (!data.success || !data.series) {
            return null;
        }
        return data.series;
    } catch (error) {
        console.error('Error fetching series with episodes:', error);
        return null;
    }
};

export const findSeriesById = async (id: string): Promise<ISeries | null> => {
    try {
        const {data} = await API.get(`/v1/series?id=${id}`);
        if (!data.success || !data.series) {
            return null;
        }
        return data.series;
    } catch (error) {
        console.error('Error fetching series by ID:', error);
        return null;
    }
};

export const getSeriesWatchlist = async (): Promise<ISeries[] | []> => {
    await ensureAuthenticated();
    try {
        const {data} = await API.get('/v1/series/watchlist');
        if (!data.success) {
            return [];
        }
        return data.watchlist;
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        return [];
    }
};

export const addToSeriesWatchlist = async (seriesId: string): Promise<boolean> => {
    await ensureAuthenticated();
    try {
        const {data} = await API.post(`/v1/series/${seriesId}/add-to-watchlist`);
        return data.success;
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        return false;
    }
};

export const removeFromSeriesWatchlist = async (seriesId: string): Promise<boolean> => {
    await ensureAuthenticated();
    try {
        const {data} = await API.post(`/v1/series/${seriesId}/remove-from-watchlist`);
        return data.success;
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        return false;
    }
};

export const getSeasonsBySeriesId = async (seriesId: string): Promise<ISeason[] | []> => {
    try {
        const {data} = await API.get(`/v1/series/${seriesId}/seasons`);
        if (!data.success) {
            return [];
        }
        return data.seasons;
    } catch (error) {
        console.error('Error fetching seasons:', error);
        return [];
    }
};

export const getEpisodesBySeasonId = async (seriesId: string, seasonId: string): Promise<IEpisode[] | []> => {
    try {
        const {data} = await API.get(`/v1/series/${seriesId}/seasons/${seasonId}/episodes`);
        if (!data.success) {
            return [];
        }
        return data.episodes;
    } catch (error) {
        console.error('Error fetching episodes:', error);
        return [];
    }
};

export const findSponsoredSeries = async (): Promise<ISeries[] | []> => {
    await ensureAuthenticated();
    try {
        const {data} = await API.get('/v1/series/sponsored');
        if (data.success) {
            return data.series;
        } else {
            console.log(data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching sponsored series:', error);
        return [];
    }
};

export const findEpisodeById = async (episodeId: string): Promise<IEpisode | null> => {
    await ensureAuthenticated();
    try {
        const {data} = await API.get(`/v1/series/episodes/${episodeId}`);
        if (!data.success || !data.episode) {
            return null;
        }
        return data.episode;
    } catch (error) {
        console.error('Error fetching episode by ID:', error);
        return null;
    }
};

/** Rent a whole season with AD */
export const rentSeason = async (seasonId: string): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.post(`/v1/series/${seasonId}/purchase-season`, {
            purchaseType: 'RENT',
        });
        return data.success;
    } catch {
        return false;
    }
};

/** Buy a whole season outright with AD */
export const buySeason = async (seasonId: string): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.post(`/v1/series/${seasonId}/purchase-season`, {
            purchaseType: 'BUY',
        });
        return data.success;
    } catch {
        return false;
    }
};

/**
 * Get whether the current user has an unexpired rental or a permanent buy
 * on this season.
 */
// export const getSeasonPurchaseStatus = async (seasonId: string): Promise<IContentPurchaseStatus> => {
//     await useAuthStore.getState().hydrateAuth();
//     const {data} = await API.get<IContentPurchaseStatus>(`/v1/series/${seasonId}/purchase-status`);
//     return data;
// };

export async function getSeasonPurchaseStatus(seasonId: string) {
    await useAuthStore.getState().hydrateAuth();
    const {data} = await API.get(`/v1/series/${seasonId}/purchase-status`);
    return data.status; // { active, purchaseType, expireAt }
}

export const getPurchasedSeries = async (): Promise<ISeries[]> => {
    await useAuthStore.getState().hydrateAuth();
    const {data} = await API.get<{success: boolean; series: ISeries[]}>('/v1/series/purchased');
    return data.success ? data.series : [];
};
