import { IUserProfile } from "../../../types";
import { API } from "../../clients/api.client";

export const findAUser = async (params: { id?: string, username?: string, email?: string }) : Promise<IUserProfile | undefined> => {
    try {
        const { id, username, email } = params
        // GET /v1/cru/me
        const { data } = await API.post(`/v1/user/find`, {
            id: id ?? undefined,
            username: username ?? undefined,
            email: email ?? undefined
        });
    
        if (data.success === false) {
            return undefined
        }
        
        return data.user;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

export const searchForUsers = async (search: string) : Promise<IUserProfile[] | []> => {
    try {
        // GET /v1/user/search
        const { data } = await API.post(`/v1/user/search`, {
            search
        });
    
        if (data.success === false) {
            return []
        }
    
        return data.result;
    } catch (error) {
        console.error(error);
        return [];
    }
}
