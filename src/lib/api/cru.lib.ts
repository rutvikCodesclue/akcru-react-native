import { IMovie, ICruView, ICru } from "../../../types";
import { API } from "../../clients/api.client";

export const getMyCRU = async () : Promise<ICru | undefined> => {
    try {
        // GET /v1/cru/me
        const { data } = await API.get(`/v1/cru/me`);
        return data.CRU;
    } catch (error) {
        console.error(error);
    }
}

export const getMyCRUViews = async (params?: { upcoming?: boolean, past?: boolean }) : Promise<ICruView[] | undefined> => {
    // GET /v1/cru/views/me
    try {
        // if params is empty return all CRUViews
        if (!params) {
            const { data } = await API.get(`/v1/cru/views/me`);
            if (data.success === false) {
                return []
            }
    
            const { CRUViews }: { CRUViews: ICruView[] } = data
    
            return CRUViews;
        }
    
        const { upcoming, past } = params
    
        if (upcoming) {
            const { data } = await API.get(`/v1/cru/views/me?upcoming=${upcoming}`);
        
            return data.CRUViews;
        }
        if (past) {
            const { data } = await API.get(`/v1/cru/views/me?past=${past}`);
        
            return data.CRUViews;
        }
    } catch (error) {
        console.error(error);
    }
}

export const createACRUView = async (params: {movieId: string, startTime: string, timezone: string}) => {
    try {
        // POST /v1/cru/create-cru-view
        const { movieId, startTime, timezone } = params
        const { data } = await API.post(`/v1/cru/create-cru-view`, 
            {movieId, startTime, timezone}
        );
    
        return data.CRUView;
    } catch (error) {
        console.error(error);
    }
}


export const getCRUInvites = async (params: { pending?: boolean, accepted?: boolean, declined?: boolean }) => {
    // GET /v1/cru/invites/me
    const { pending, accepted, declined } = params

    if (pending) {
        const { data } = await API.get(`/v1/cru/invite/me?pending=${pending}`);
        return data.invites;
    }
    if (accepted) {
        const { data } = await API.get(`/v1/cru/invite/me?accepted=${accepted}`);
        return data.invites;
    }
    if (declined) {
        const { data } = await API.get(`/v1/cru/invite/me?declined=${declined}`);
        return data.invites;
    }
    
    const { data } = await API.get(`/v1/cru/invite/me`);
    return data.invites;
}

export const acceptACRUInvite = async (params: { inviteId: string }) => {
    try {
        const { data } = await API.post(`/v1/cru/invite/accept`, { inviteId: params.inviteId });
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const declineACRUInvite = async (params: { inviteId: string }) => {
    try {
        const { data } = await API.post(`/v1/cru/invite/decline`, { inviteId: params.inviteId });
        return data;
    } catch (error) {
        console.error(error);
    }
}