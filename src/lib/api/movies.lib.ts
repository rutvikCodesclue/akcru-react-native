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

    // console.log("genre passed to findMovies:", genre);
    // console.log("movies from findMovies:", data.movies);

    return data.movies;
}

export const joinRoom = async (roomId: string) => {}