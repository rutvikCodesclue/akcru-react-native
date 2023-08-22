import { API } from "../../clients/api.client";

export const getMyRoom = async () => {
    // GET /v1/rooms/me
    const { data } = await API.get(`/v1/rooms/me`, {});
    return data;
}

export const createRoom = async () => {
    // GET /v1/rooms/create
    const { data } = await API.post(`/v1/rooms/create`, {});
    return data;
}

export const joinMyRoom = async () => {
    // POST /v1/rooms/join/me
    const { data } = await API.post(`/v1/rooms/join/me`);
    // return the room auth token to be used for joining the room
    return data.roomAuthToken.token;
}

export const joinRoom = async (roomId: string) => {
    // TODO: same as joinMyRoom, but with specific prisma roomId
}