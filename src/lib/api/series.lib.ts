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
