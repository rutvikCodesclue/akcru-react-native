import { IMovie, ICruView, ICru } from "../../../types";
import { API } from "../../clients/api.client";

export const getMyMITs = async () : Promise<ICru | undefined> => {
    // GET /v1/cru/me
    try {
        const { data } = await API.get(`/v1/cru/me`);
        return data.CRU;
    } catch (error) {
        console.error(error);
    }
}

export const getMyMITInvites = async (params?: { upcoming?: boolean, past?: boolean }) : Promise<ICruView[] | undefined> => {
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

export const createAMITInvite = async (params: {movieId: string, startTime: string, timezone: string}) => {
    // POST /v1/cru/create-cru-view
    try {
        const { movieId, startTime, timezone } = params
        const { data } = await API.post(`/v1/cru/create-cru-view`, 
            {movieId, startTime, timezone}
        );
    
        return data.CRUView;
    } catch (error) {
        console.error(error);
    }
}

export const acceptAMITInvite = async (params: { inviteId: string }) => {
    try {
        const { data } = await API.post(`/v1/mit/invite/accept`, { inviteId: params.inviteId });
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const declineAMITInvite = async (params: { inviteId: string }) => {
    try {
        const { data } = await API.post(`/v1/mit/invite/decline`, { inviteId: params.inviteId });
        return data;
    } catch (error) {
        console.error(error);
    }
}