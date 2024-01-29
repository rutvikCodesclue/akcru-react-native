import { IMovie } from "../../../types";
import { API } from "../../clients/api.client";
import useAuthStore from "../../stores/auth.store";

export const getMovieGenres = async () => {
    try {
        // GET /v1/movies/genres
        const { data } = await API.get(`/v1/movies/genres`);
        return data.genres;
    } catch (error) {
        console.error(error);
    }
}
export const findMovies = async (genre?: string): Promise<IMovie[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        // GET /v1/movies?genre=action
        const { data } = await API.get(`/v1/movies${genre ? `?genre=${genre.toUpperCase()}` : '/'}`);
    
        if (data.success === false) {
            return [];
        }
    
        return data.movies;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export const findMovieById = async (id: string): Promise<IMovie | null> => {
    try {
        // GET /v1/movies?id=id
        const { data } = await API.get(`/v1/movies?id=${id}`);
    
        if (data.success === false) {
            return null;
        }
    
        return data.movie;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getWatchlist = async (userId: string): Promise<IMovie[] | []> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        // GET /v1/movies/watchlist/:userId
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

export const addToWatchlist = async (movieId: string): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const { data } = await API.post(`/v1/movies/${movieId}/add-to-watchlist`);
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
                // Include any necessary authorization headers
            },
        });

        return response.data.reactions;
    } catch (error) {
        console.error('Error fetching user reactions:', error);
        // Handle error appropriately
    }
};

export const postUserReaction = async (movieId: string, reactionType: any) => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const response = await API.post(`/v1/movies/${movieId}/reactions`, {
            reactionType,
        });
        return response.data; // Handle the response as needed
    } catch (error) {
        console.error('Error posting user reaction:', error);
        // Handle the error appropriately
    }
};




