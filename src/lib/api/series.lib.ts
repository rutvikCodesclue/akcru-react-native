import {ISeries, ISeason, IEpisode} from '../../../types';
import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';

export const getSeriesGenres = async () => {
    try {
        const {data} = await API.get('/v1/series/genres');
        return data.genres;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const findSeries = async (genre?: string): Promise<ISeries[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get(`/v1/series${genre ? `?genre=${genre.toUpperCase()}` : '/'}`);

        if (data.success === false) {
            return [];
        }

        return data.series;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const findSeriesById = async (id: string): Promise<ISeries | null> => {
    try {
        const {data} = await API.get(`/v1/series?id=${id}`);

        if (data.success === false) {
            return null;
        }

        return data.series;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getSeriesWatchlist = async (userId: string): Promise<ISeries[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get(`/v1/series/watchlist/${userId}`);

        if (data.success === false) {
            return [];
        }

        return data.watchlist;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getViewedUserSeriesWatchlist = async (userId: string): Promise<ISeries[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get(`/v1/series/viewed-user-watchlist/${userId}`);

        if (data.success === false) {
            return [];
        }

        return data.watchlist;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const addToSeriesWatchlist = async (seriesId: string): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.post(`/v1/series/${seriesId}/add-to-watchlist`);
        return data.success;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const removeFromSeriesWatchlist = async (seriesId: string): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.post(`/v1/series/${seriesId}/remove-from-watchlist`);
        return data.success;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const getSeasonsBySeriesId = async (seriesId: string): Promise<ISeason[] | []> => {
    try {
        const {data} = await API.get(`/v1/series/${seriesId}/seasons`);

        if (data.success === false) {
            return [];
        }

        return data.seasons;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getEpisodesBySeasonId = async (seriesId: string, seasonId: string): Promise<IEpisode[] | []> => {
    try {
        const {data} = await API.get(`/v1/series/${seriesId}/seasons/${seasonId}/episodes`);

        if (data.success === false) {
            return [];
        }

        return data.episodes;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const findSponsoredSeries = async (): Promise<ISeries[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const response = await API.get('/v1/series/sponsored');

        if (response.data.success) {
            return response.data.series;
        } else {
            console.log(response.data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching sponsored series:', error);
        return [];
    }
};
