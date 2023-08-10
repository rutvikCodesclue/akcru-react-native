import { API } from "../../clients/api.client";

export const getMovieGenres = async () => {
    // GET /v1/movies/genres
    const { data } = await API.get(`/v1/movies/genres`);
    return data.genres;
}
export const joinMyRoom = async () => {
    // POST /v1/rooms/join/me
    const { data } = await API.post(`/v1/rooms/join/me`);
    return data;
}

export const joinRoom = async (roomId: string) => {}