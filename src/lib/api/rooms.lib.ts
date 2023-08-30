import { API } from "../../clients/api.client";

export const getMyRoom = async () => {
    try {
        // GET /v1/rooms/me
        const { data } = await API.get(`/v1/rooms/me`, {});
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const createRoom = async () => {
    try {
        // GET /v1/rooms/create
        const { data } = await API.post(`/v1/rooms/create`, {});
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const joinMyRoom = async () => {
    try {
        // POST /v1/rooms/join/me
        const { data } = await API.post(`/v1/rooms/join/me`);
        // return the room auth token to be used for joining the room (as a HOST)
        return data.roomAuthToken.token;
    } catch (error) {
        console.error(error);
    }
}

export const joinARoom = async (cruId: string) => {
    try {
        // POST /v1/rooms/join
        // same as joinMyRoom, but with specific prisma cruId
        const { data } = await API.post(`/v1/rooms/join`, { cruId });
        // return the room auth token to be used for joining the room (as a MEMBER)
        return data.roomAuthToken.token;
    } catch (error) {
        console.error(error);
    }
}