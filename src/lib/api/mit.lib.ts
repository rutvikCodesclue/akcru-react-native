import { IMITInvite } from "../../../types";
import { API } from "../../clients/api.client";

export const getMyMITs = async () : Promise<IMITInvite[] | undefined> => {
    // GET /v1/mit/me
    try {
        const { data } = await API.get(`/v1/mit/me`);
        if (data.success === false) {
            return []
        }
        return data.invites;
    } catch (error) {
        console.error(error);
    }
}

export const getMyMITInvites = async (params: { pending?: boolean, accepted?: boolean, declined?: boolean }) : Promise<IMITInvite[] | undefined> => {
    // GET /v1/mit/invites/me
    try {
        // if params is empty return all MIT Invites
        if (!params) {
            const { data } = await API.get(`/v1/mit/invites/me`);
            if (data.success === false) {
                return []
            }
            const { invites }: { invites: IMITInvite[] } = data
    
            return invites;
        }
    
        const { accepted, declined, pending } = params

    
        if (pending) {
            const { data } = await API.get(`/v1/mit/invites/me?pending=${pending}`);
        
            return data.invites;
        }
        if (accepted) {
            const { data } = await API.get(`/v1/mit/invites/me?accepted=${accepted}`);
        
            return data.invites;
        }
        if (declined) {
            const { data } = await API.get(`/v1/mit/invites/me?declined=${declined}`);
        
            return data.invites;
        }
    } catch (error) {
        console.error(error);
    }
}

export const getMoreMITs = async (params: {count: number}) : Promise<number | undefined> => {
    // POST /v1/mit/create
    try {
        const { count } = params
        const { data } = await API.post(`/v1/mit/create`, 
            { count }
        );

        if (data.success === false) {
            return undefined
        }
    
        return data.updatedCount;
    } catch (error) {
        console.error(error);
    }
}

export const createAMITInvite = async (params: {movieId: string, username: string, startDate: string}) : Promise<IMITInvite | undefined> => {
    // POST /v1/mit/invite/create
    try {
        const { movieId, username, startDate } = params
        const { data } = await API.post(`/v1/mit/invite/create`, 
            {movieId, username, startDate}
        );
    
        return data.invite;
    } catch (error) {
        console.error(error);
    }
}

export const acceptAMITInvite = async (params: { inviteId: string }) : Promise<IMITInvite | undefined> => {
    // POST /v1/mit/invite/accept
    try {
        const { data } = await API.post(`/v1/mit/invite/accept`, { inviteId: params.inviteId });
        
        if (data.success === false) {
            return undefined
        }

        return data.invite;
    } catch (error) {
        console.error(error);
    }
}

export const declineAMITInvite = async (params: { inviteId: string }) : Promise<IMITInvite | undefined> => {
    // POST /v1/mit/invite/decline
    try {
        const { data } = await API.post(`/v1/mit/invite/decline`, { inviteId: params.inviteId });

        if (data.success === false) {
            return undefined
        }

        return data.invite;
    } catch (error) {
        console.error(error);
    }
}