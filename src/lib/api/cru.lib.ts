import {IMovie, ICruView, ICru, ICruInvite, IUserProfile} from '../../../types';
import {API} from '../../clients/api.client';

interface GetMyCRUResponse {
    CRU: ICru;
    acceptedMembers: IUserProfile[];
}

export const getMyCRU = async (): Promise<GetMyCRUResponse | undefined> => {
    try {
        // GET /v1/cru/me
        const {data} = await API.get(`/v1/cru/me`);
        return data;
    } catch (error) {
        console.error(error);
    }
};

export const updateCRUInfo = async (params: {name: string}): Promise<ICru | undefined> => {
    try {
        const {name} = params;
        // PUT /v1/cru/me/update
        const {data} = await API.put(`/v1/cru/me/update`, {name});
        return data.CRU;
    } catch (error) {
        console.error(error);
    }
};

// export const removeAUserFromCRU = async (userId: string): Promise<ICru | undefined> => {
//     try {
//         // DELETE /v1/cru/me/remove
//         const {data} = await API.delete(`/v1/cru/me/remove`, {data: {userId}});
//         return data.CRU;
//     } catch (error) {
//         console.error(error);
//     }
// };

export const removeAUserFromCRU = async (userId: string, cruId: string): Promise<ICru | undefined> => {
    try {
        const response = await API.delete(`/v1/cru/${userId}/remove`, {
            data: {cruId},
        });

        if (response.data.success) {
            console.log('API Response for removeAUserFromCRU:', response.data);
            return response.data.CRU;
        } else {
            console.error('Failed to remove user from CRU:', response.data.message);
            return undefined;
        }
    } catch (error) {
        console.error('Error removing user from CRU:', error);
        return undefined;
    }
};




export const addPotentialMemberToCRU = async (userId: string): Promise<ICru | undefined> => {
    try {
        // POST /v1/cru/me/add-user
        const {data} = await API.post(`/v1/cru/me/add-user`, {userId});
        console.log('data', data);

        return data.CRU;
    } catch (error) {
        console.error(error);
    }
};

export const getMyCRUViews = async (params?: {upcoming?: boolean; past?: boolean}): Promise<ICruView[] | undefined> => {
    // GET /v1/cru/views/me
    try {
        // if params is empty return all CRUViews
        if (!params) {
            const {data} = await API.get(`/v1/cru/views/me`);
            if (data.success === false) {
                return [];
            }

            const {CRUViews}: {CRUViews: ICruView[]} = data;

            return CRUViews;
        }

        const {upcoming, past} = params;

        if (upcoming) {
            const {data} = await API.get(`/v1/cru/views/me?upcoming=${upcoming}`);

            return data.CRUViews;
        }
        if (past) {
            const {data} = await API.get(`/v1/cru/views/me?past=${past}`);

            return data.CRUViews;
        }
    } catch (error) {
        console.error(error);
    }
};

export const createACRUView = async (params: {movieId: string; startTime: string; timezone: string}) => {
    try {
        // POST /v1/cru/create-cru-view
        const {movieId, startTime, timezone} = params;
        const {data} = await API.post(`/v1/cru/create-cru-view`, {movieId, startTime, timezone});

        return data.CRUView;
    } catch (error) {
        console.error(error);
    }
};

export const cancelCRUView = async (cruViewId: string): Promise<{success: boolean; message?: string}> => {
    try {
        // Replace with the correct endpoint as per your backend setup
        const response = await API.post(`/v1/cru/cancel-cru-view`, {cruViewId});
        console.log('CRU View cancelled:', response.data);
        return response.data; // Assuming the API returns an object with a success flag and possibly a message
    } catch (error) {
        console.error('Error cancelling CRU View:', error);
        throw error; // Re-throw the error so you can handle it in the calling component
    }
};


export const createACRUInvite = async (params: {username: string; senderId: string}): Promise<ICruInvite | undefined> => {
    // POST /v1/cru/invite/create
    try {
        const {username, senderId} = params;
        const {data} = await API.post(`/v1/cru/invite/create`, {username, senderId});

        return data.invite;
    } catch (error) {
        console.error(error);
    }
};

export const getCRUInvites = async (params: {pending?: boolean; accepted?: boolean; declined?: boolean}) => {
    // GET /v1/cru/invites/me
    const {pending, accepted, declined} = params;

    if (pending) {
        const {data} = await API.get(`/v1/cru/invite/me?pending=${pending}`);
        return data.invites;
    }
    if (accepted) {
        const {data} = await API.get(`/v1/cru/invite/me?accepted=${accepted}`);
        return data.invites;
    }
    if (declined) {
        const {data} = await API.get(`/v1/cru/invite/me?declined=${declined}`);
        return data.invites;
    }

    const {data} = await API.get(`/v1/cru/invite/me`);
    return data.invites;
};

export const acceptACRUInvite = async (params: {inviteId: string}) => {
    try {
        const {data} = await API.post(`/v1/cru/invite/accept`, {inviteId: params.inviteId});
        return data;
    } catch (error) {
        console.error(error);
    }
};

export const declineACRUInvite = async (params: {inviteId: string}) => {
    try {
        const {data} = await API.post(`/v1/cru/invite/decline`, {inviteId: params.inviteId});
        return data;
    } catch (error) {
        console.error(error);
    }
};

export const getCruInviteStatus = async (viewedUserId: string) => {
    try {
        const response = await API.get(`/v1/cru/invite/status?viewedUserId=${viewedUserId}`);
        return response.data.status; // 'Pending', 'Accepted', 'Declined', or 'No Invite'
    } catch (error) {
        console.error('Error fetching CRU invite status:', error);
        return 'Error'; // Handle error state as needed
    }
};

export const checkUserMembership = async (viewedUserId: string) => {
    try {
        // Directly use `viewedUserId` as a path parameter in the URL
        const response = await API.get(`/v1/cru/check-crumembership/${viewedUserId}`);
        // Assuming the backend returns a JSON object with a boolean property `isMember`
        return response.data.isMember;
    } catch (error) {
        console.error('Error checking user membership:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
};

export const listCrusForUser = async (userId: string): Promise<ICru[] | undefined> => {
    try {
        // Replace `/v1/cru/user/:userId/crus` with the correct endpoint as per your API structure
        const {data} = await API.get(`/v1/cru/user/${userId}/crus`);

        if (data && Array.isArray(data)) {
            return data; // Assuming the backend returns an array of Crüs
        } else {
            console.error('Unexpected response format from the listCrusForUser endpoint');
            return undefined;
        }
    } catch (error) {
        console.error('Error listing Crüs for user:', error);
        return undefined;
    }
};

export const leaveCRU = async (cruId: string): Promise<void> => {
    try {
        // Make a DELETE request to the endpoint with the CRU ID
        // Note: No need to send userId in the body, assuming the backend can determine this from the session or token
        const response = await API.delete(`/v1/cru/${cruId}/leave`);

        // Check if the response is successful
        if (response.data.success) {
            console.log('Successfully left CRU:', response.data.CRU);
            // Optionally, refresh CRU data or navigate as needed
        } else {
            console.error('Failed to leave CRU:', response.data.message);
        }
    } catch (error) {
        console.error('Error leaving CRU:', error);
    }
};

