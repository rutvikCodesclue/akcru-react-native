import { IMovie } from "../../../types";
import { API } from "../../clients/api.client";

export const getMovieGenres = async () => {
    // GET /v1/movies/genres
    const { data } = await API.get(`/v1/movies/genres`);
    return data.genres;
}
export const findMovies = async (genre?: string): Promise<IMovie[] | []> => {
    // GET /v1/movies?genre=action
    const { data } = await API.get(`/v1/movies${genre ? `?genre=${genre.toUpperCase()}` : '/'}`);

    if (data.success === false) {
        return [];
    }

    return data.movies;
}

export const findMovieById = async (id: string): Promise<IMovie | null> => {
    // GET /v1/movies?id=id
    const { data } = await API.get(`/v1/movies?id=${id}`);
    console.log("made request to", `/v1/movies?id=${id}`);
    

    if (data.success === false) {
        return null;
    }

    return data.movie;
}