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