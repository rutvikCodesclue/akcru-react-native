import { API } from "../clients/api.client";

export const getMyRoom = async () => {
    // GET /v1/rooms/me
    const { data } = await API.get(`/v1/rooms/me`, {});
    return data;
}
export const joinMyRoom = async () => {
    // POST /v1/rooms/join/me
    const { data } = await API.post(`/v1/rooms/join/me`);
    return data;
}

export const joinRoom = async (roomId: string) => {}