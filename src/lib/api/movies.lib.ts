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
        console.log(`/v1/movies/watchlist/${userId}`);
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
        // GET /v1/movies/viewed-user-watchlist/:userId
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

export const findSponsoredMovies = async (): Promise<IMovie[] | []> => {
    // Ensure authentication is hydrated and the user is authenticated
    await useAuthStore.getState().hydrateAuth();
    try {
        // GET request to the /v1/movies/sponsored endpoint
        const response = await API.get('/v1/movies/sponsored');

        if (response.data.success) {
            // If the request is successful and movies are found, return them
            return response.data.movies;
        } else {
            // If the request is successful but no movies are found, return an empty array
            console.log(response.data.message); // Optionally log the message
            return [];
        }
    } catch (error) {
        // Log the error and return an empty array if the request fails
        console.error('Error fetching sponsored movies:', error);
        return [];
    }
};




