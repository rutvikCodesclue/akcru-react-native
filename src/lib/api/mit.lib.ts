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

// export const createAMITInvite = async (params: {
//     movieId: string;
//     username: string;
//     startDate: string;
//     timezone: string;
// }): Promise<IMITInvite | undefined> => {
//     try {
//         const {movieId, username, startDate, timezone} = params;
//         const {data} = await API.post('/v1/mit/invite/create', {movieId, username, startDate, timezone});
//         console.log('data', data);

//         return data.invite;
//     } catch (error) {
//         console.error(error);
//     }
// };

export const createAMITInvite = async (params: {
    movieId: string;
    username: string;
    startDate: string;
    timezone: string;
}): Promise<IMITInvite | undefined> => {
    try {
        const {movieId, username, startDate, timezone} = params;

        // Log the request payload for debugging purposes
        console.log('Request Payload:', {movieId, username, startDate, timezone});

        // Convert startDate to a Date object and check if it's in the future
        const dateObject = new Date(startDate);
        const now = new Date();

        if (dateObject.getTime() <= now.getTime()) {
            // If the startDate is not in the future, set it to one hour in the future for testing
            dateObject.setHours(now.getHours() + 1);
        }

        const formattedStartDate = dateObject.toISOString(); // Ensure ISO format
        console.log('Formatted Start Date (Adjusted if necessary):', formattedStartDate);

        // Make the API call
        const {data} = await API.post('/v1/mit/invite/create', {
            movieId,
            username,
            startDate: formattedStartDate, // Use the future start date
            timezone,
        });

        // Log the API response for debugging purposes
        console.log('API Response:', data);

        return data.invite;
    } catch (error: any) {
        // Enhanced error handling
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        } else if (error.request) {
            console.error('Request error:', error.request);
        } else {
            console.error('Error:', error.message);
        }
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
    newHostId: string | undefined,
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
