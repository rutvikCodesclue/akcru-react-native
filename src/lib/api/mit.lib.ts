import {IMITInvite} from '../../../types';
import {API} from '../../clients/api.client';

export const getMyMITs = async (): Promise<IMITInvite[] | undefined> => {
    try {
        const {data} = await API.get('/v1/mit/me');
        if (data.success === false) {
            return [];
        }
        return data.invites;
    } catch (error) {
        console.error(error);
    }
};

export const getMyMITInvites = async (params: {
    pending?: boolean;
    accepted?: boolean;
    declined?: boolean;
    me?: boolean;
}): Promise<IMITInvite[] | undefined> => {
    try {
        if (!params) {
            const {data} = await API.get('/v1/mit/invites/me');
            if (data.success === false) {
                return [];
            }
            const {invites}: {invites: IMITInvite[]} = data;

            return invites;
        }

        const {accepted, declined, pending, me} = params;

        if (pending) {
            const {data} = await API.get(`/v1/mit/invites/me?pending=${pending}`);

            return data.invites;
        }
        if (accepted) {
            if (me) {
                const {data} = await API.get(`/v1/mit/invites/me?accepted=${accepted}&me=${me}`);

                return data.invites;
            }

            const {data} = await API.get(`/v1/mit/invites/me?accepted=${accepted}`);

            return data.invites;
        }
        if (declined) {
            const {data} = await API.get(`/v1/mit/invites/me?declined=${declined}`);

            return data.invites;
        }
    } catch (error) {
        console.error(error);
    }
};

export const getMoreMITs = async (params: {count: number}): Promise<number | undefined> => {
    try {
        const {count} = params;
        const {data} = await API.post('/v1/mit/create', {count});

        if (data.success === false) {
            return undefined;
        }

        return data.updatedCount;
    } catch (error) {
        console.error(error);
    }
};

export const createAMITInvite = async (params: {
    movieId: string;
    username: string;
    startDate: string;
    timezone: string;
}): Promise<IMITInvite | undefined> => {
    try {
        const {movieId, username, startDate, timezone} = params;
        const {data} = await API.post('/v1/mit/invite/create', {movieId, username, startDate, timezone});

        return data.invite;
    } catch (error) {
        console.error(error);
    }
};

export const cancelMIT = async (mitInviteId: string): Promise<any> => {
    try {
        const {data} = await API.post('/v1/mit/cancel-mit', {mitInviteId});
        return data;
    } catch (error) {
        console.error('Error cancelling MIT:', error);
        throw error;
    }
};

export const cancelSentMIT = async (mitInviteId: string): Promise<{success: boolean; message?: string}> => {
    try {
        const {data} = await API.post('/v1/mit/cancel-sent-mit', {mitInviteId});
        return {
            success: data.success,
            message: data.message,
        };
    } catch (error) {
        console.error('Error cancelling sent MIT:', error);
        throw error;
    }
};

export const acceptAMITInvite = async (params: {inviteId: string}): Promise<IMITInvite | undefined> => {
    try {
        const {data} = await API.post('/v1/mit/invite/accept', {inviteId: params.inviteId});

        if (data.success === false) {
            return undefined;
        }

        return data.invite;
    } catch (error) {
        console.error(error);
    }
};

export const declineAMITInvite = async (params: {inviteId: string}): Promise<IMITInvite | undefined> => {
    try {
        const {data} = await API.post('/v1/mit/invite/decline', {inviteId: params.inviteId});

        if (data.success === false) {
            return undefined;
        }

        return data.invite;
    } catch (error) {
        console.error(error);
    }
};

export const getMITHostId = async (mITInviteId: string | null): Promise<string | undefined> => {
    try {
        const {data} = await API.post('/v1/mit/get-mit-host', {mITInviteId});
        if (data.success === false) {
            return undefined;
        }

        return data.hostId;
    } catch (error) {
        console.error(error);
    }
};

export const updateMITHostId = async (
    mITInviteId: string | null,
    newHostId: string | null,
): Promise<boolean | undefined> => {
    try {
        const {data} = await API.post('/v1/mit/update-mit-host', {mITInviteId, newHostId});
        if (data.success === false) {
            console.log(data.message);
            return data.success;
        }

        console.log(data.message);
        return data.success;
    } catch (error) {
        console.error(error);
    }
};
