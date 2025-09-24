import { IUserProfile } from "../../../types"
import { API } from "../../clients/api.client"

export const createVisionaryRoom = async (movieId: string, startDate: string, timezone: string) => {
    try {
        const dateObject = new Date(startDate);
        const now = new Date();

        if (dateObject.getTime() <= now.getTime()) {
            dateObject.setHours(now.getHours() + 1);
        }

        const formattedStartDate = dateObject.toISOString()

        const {data} = await API.post('v1/visionaryRoom/createVisionaryRoom', {
            movieId, startDate: formattedStartDate, timezone,
        })

        return data
    } catch (error) {
        console.error('Something went wrong with creating the room: ', error)
    }
}

export const getVisionaryRoom = async (roomId: string) => {
    try {
        const {data} = await API.get(`v1/visionaryRoom/getVisionaryRoomById/${roomId}`)

        return data
    } catch (error) {
        console.error('Something went wrong with fetching the visionary room: ', error)
    }
}

export const getMyVisionaryRooms = async (userId: string) => {
    try {
        const {data} = await API.get(`v1/visionaryRoom/getMyVisionaryRooms/${userId}`)

        if (data) {
            return data.visionaryRooms
        } else {
            return []
        }
    } catch (error) {
        console.error('Something went wrong with fetching the visionary rooms: ', error)
    }
}

export const requestDecision = async (creatorId: string, roomId: string, decision: 'ACCEPTED' | 'DECLINED') => {
    try {
        const {data} = await API.post(`v1/visionaryRoom/requestDecision`, {requesterId: creatorId, visionaryRoomId: roomId, decision})
        return data
    } catch (error) {
        console.error('Something went wrong with sending decision: ', error)
    }
}

export const getVisionaryRoomHost = async (roomId: string) => {
    try {
        const {data} = await API.get(`v1/visionaryRoom/getVisionaryRoomHost/${roomId}`)

        return data.hostId
    } catch (error) {
        console.error('Something went wrong with getting the room host: ', error)
    }
}

export const updateVisionaryRoomHost = async (roomId: string, newHostId: string) => {
    try {
        const {data} = await API.post('v1/visionaryRoom/updateVisionaryRoomHost', {roomId, newHostId})

        return data.success
    } catch (error) {
        console.error('Something went wrong with updating the room host: ', error)
    }
}

export const checkMoviePurchase = async (movieId: string) => {
    try {
        const {data} = await API.get(`v1/visionaryRoom/checkMoviePurchase/${movieId}`)

        return data
    } catch (error) {
        console.error('There was an error in checking the movie purchase: ', error)
    }
}

export const cancelVisionaryRoom = async (roomId: string) => {
    try {
        const {data} = await API.delete(`v1/visionaryRoom/cancelVisionaryRoom/${roomId}`)

        return data
    } catch (error) {
        console.error('There was an error cancelling the visionary room: ', error)
    }
}

export const getPendingResponseRooms = async () => {
    try {
        const response = await API.get('v1/visionaryRoom/pendingResponseVisionaryRooms')

        return response
    } catch (error) {
        console.error('There was an error fetching pending response rooms: ', error)
    }
}

export const getPendingRooms = async () => {
    try {
        const response = await API.get('v1/visionaryRoom/pendingVisionaryRooms')

        return response
    } catch (error) {
        console.error('There was an error fetching pending response rooms: ', error)
    }
}

export const rsvpVisionaryRoom = async (roomId: string, status: "ACCEPTED" | "DECLINED") => {
    try {
        const response = await API.post("v1/visionaryRoom/rsvpVisionaryRoom", {
            roomId,
            status,
        });

        return response
    } catch (error) {
        console.error('There was an error RSVPing to the room: ', error)
    }
}

export const getAttendingRooms = async () => {
    try {
        const response = await API.get('v1/visionaryRoom/attendingVisionaryRooms')
        console.log('response att: ', response.data.rooms)
        return response.data.rooms
    } catch (error) {
        console.error('There was an error RSVPing to the room: ', error)
    }
}