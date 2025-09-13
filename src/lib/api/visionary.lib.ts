import { IUserProfile } from "../../../types"
import { API } from "../../clients/api.client"

export const createVisionaryRoom = async (movieId: string, startDate: string, timezone: string, invitees: IUserProfile[]) => {
    try {
        const dateObject = new Date(startDate);
        const now = new Date();

        if (dateObject.getTime() <= now.getTime()) {
            dateObject.setHours(now.getHours() + 1);
        }

        const formattedStartDate = dateObject.toISOString()

        const {data} = await API.post('v1/visionaryRoom/createVisionaryRoom', {
            movieId, startDate: formattedStartDate, timezone, invitees
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

export const requestDecision = async (creatorId: string, roomId: string, decision: 'ACCEPTED' | 'DECLINED') => {
    try {
        const {data} = await API.post(`v1/visionaryRoom/requestDecision`, {requesterId: creatorId, visionaryRoomId: roomId, decision})
        console.log('data api: ', data)
        return data
    } catch (error) {
        console.error('Something went wrong with sending decision: ', error)
    }
}