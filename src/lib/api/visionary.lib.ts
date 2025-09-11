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