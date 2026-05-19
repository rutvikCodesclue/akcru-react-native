import {IMovie} from '../../../types';
import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';

export const getMovieGenres = async () => {
    try {
        const {data} = await API.get('/v1/movies/genres');
        return data.genres;
    } catch (error) {
        console.error(error);
    }
};

export const findTopBoxMovies = async (): Promise<IMovie[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get('/v1/movies/topbox');

        if (data.success === false) {
            return [];
        }

        return data.movies;
    } catch (error) {
        console.error('Error fetching topbox movies:', error);
        return [];
    }
};

export const getTrendingInvites = async (): Promise<IMovie[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get('/v1/movies/trending-invites');

        if (data.success === false) {
            return [];
        }

        return Array.isArray(data.movies) ? data.movies : [];
    } catch (error) {
        console.error('Error fetching trending invites:', error);
        return [];
    }
};

export const findMovies = async (genre?: string): Promise<IMovie[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get(`/v1/movies${genre ? `?genre=${genre.toUpperCase()}` : '/'}`);

        if (data.success === false) {
            return [];
        }

        return data.movies;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const findMovieById = async (id: string): Promise<IMovie | null> => {
    try {
        const {data} = await API.get(`/v1/movies?id=${id}`);

        if (data.success === false) {
            return null;
        }

        return data.movie;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getWatchlist = async (userId: string): Promise<IMovie[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get(`/v1/movies/watchlist/${userId}`);

        if (data.success === false) {
            return [];
        }

        return data.watchlist;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getViewedUserWatchlist = async (userId: string): Promise<IMovie[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        console.log(`/v1/movies/viewed-user-watchlist/${userId}`);
        const {data} = await API.get(`/v1/movies/viewed-user-watchlist/${userId}`);

        if (data.success === false) {
            return [];
        }

        return data.watchlist;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const addToWatchlist = async (movieId: string): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.post(`/v1/movies/${movieId}/add-to-watchlist`);
        return data.success;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const removeFromWatchlist = async (movieId: string): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.post(`/v1/movies/${movieId}/remove-from-watchlist`);
        return data.success;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const getUserReactions = async () => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const response = await API.get('/v1/movies/reactionTypes', {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.reactions;
    } catch (error) {
        console.error('Error fetching user reactions:', error);
    }
};

export const postUserReaction = async (movieId: string, reactionType: any) => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const response = await API.post(`/v1/movies/${movieId}/reactions`, {
            reactionType,
        });
        return response.data;
    } catch (error) {
        console.error('Error posting user reaction:', error);
    }
};

export const findSponsoredMovies = async (): Promise<IMovie[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const response = await API.get('/v1/movies/sponsored');

        if (response.data.success) {
            return response.data.movies;
        } else {
            console.log(response.data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching sponsored movies:', error);
        return [];
    }
};

export const findFlickFlirtMovies = async (): Promise<IMovie[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const response = await API.get('/v1/movies/flick-flirt');

        if (response.data.success) {
            return response.data.movies;
        } else {
            console.log(response.data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching sponsored movies:', error);
        return [];
    }
};

export const rentMovie = async (movieId: string): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.post(`/v1/movies/${movieId}/purchase-movie`, {
            purchaseType: 'RENT', // ← directly use the string
        });
        return data.success;
    } catch {
        return false;
    }
};

export const buyMovie = async (movieId: string): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.post(`/v1/movies/${movieId}/purchase-movie`, {
            purchaseType: 'BUY', // ← directly use the string
        });
        return data.success;
    } catch {
        return false;
    }
};

export interface IContentPurchaseStatus {
    active: boolean;
    purchase?: {
        purchaseType: 'RENT' | 'BUY';
        expireAt: string | null;
    };
}

/** Get whether the current user has an unexpired rental or a buy on this movie */
export const getMoviePurchaseStatus = async (movieId: string): Promise<IContentPurchaseStatus> => {
    await useAuthStore.getState().hydrateAuth();
    const {data} = await API.get<IContentPurchaseStatus>(`/v1/movies/${movieId}/purchase-status`);
    return data;
};

export const getPurchasedMovies = async (): Promise<IMovie[]> => {
    await useAuthStore.getState().hydrateAuth();
    const {data} = await API.get<{success: boolean; movies: IMovie[]}>('/v1/movies/purchased');
    return data.success ? data.movies : [];
};
