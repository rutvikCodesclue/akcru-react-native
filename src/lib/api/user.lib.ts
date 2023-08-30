import { IUserProfile } from "../../../types";
import { API } from "../../clients/api.client";

export const findAUser = async (params: { id?: string, username?: string, email?: string }) : Promise<IUserProfile | undefined> => {
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
}

export const searchForUsers = async (search: string) : Promise<IUserProfile[] | []> => {
    // GET /v1/user/search
    const { data } = await API.post(`/v1/user/search`, {
        search
    });

    if (data.success === false) {
        return []
    }

    return data.result;
}
