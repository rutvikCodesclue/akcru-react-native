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
