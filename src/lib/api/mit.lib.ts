import axios from 'axios';
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

export const getMyMITInvites = async (params?: {
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

        const dateObject = new Date(startDate);
        const now = new Date();

        if (dateObject.getTime() <= now.getTime()) {
            dateObject.setHours(now.getHours() + 1);
        }

        const formattedStartDate = dateObject.toISOString();

        // Make the API call
        const {data} = await API.post('/v1/mit/invite/create', {
            movieId,
            username,
            startDate: formattedStartDate,
            timezone,
        });

        return data.invite;
    } catch (error: any) {
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

export type CancelSentMitResult = {
    success: boolean;
    message?: string;
    code?: string;
};

type CancelSentMitBody = {
    success?: boolean;
    message?: string;
    code?: string;
};

/** Parses API body whether the server returns 2xx or 4xx with `{ success, message, code }`. */
export const cancelSentMIT = async (mitInviteId: string): Promise<CancelSentMitResult> => {
    try {
        const {data} = await API.post<CancelSentMitBody>(
            '/v1/mit/cancel-sent-mit',
            {mitInviteId},
            {validateStatus: () => true},
        );

        if (data?.success === true) {
            return {success: true, message: data.message, code: data.code};
        }

        const message =
            typeof data?.message === 'string' && data.message.trim() !== ''
                ? data.message.trim()
                : 'Could not cancel this Movie Invite.';
        return {
            success: false,
            message,
            code: typeof data?.code === 'string' ? data.code : undefined,
        };
    } catch (error) {
        console.error('Error cancelling sent MIT:', error);
        if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object') {
            const d = error.response.data as CancelSentMitBody;
            const message =
                typeof d.message === 'string' && d.message.trim() !== ''
                    ? d.message.trim()
                    : 'Could not cancel this Movie Invite.';
            return {
                success: false,
                message,
                code: typeof d.code === 'string' ? d.code : undefined,
            };
        }
        return {
            success: false,
            message: 'Network error. Please try again.',
        };
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

/** A single MIT bundle option */
export interface MitTier {
    quantity: number;
    cost: number;
}

/** Response for fetching tiers */
export interface GetMitTiersResponse {
    success: boolean;
    tiers: MitTier[];
    message?: string;
}

/** Purchase response */
export interface PurchaseMitResponse {
    success: boolean;
    message?: string;
}

/**
 * 1) Fetch all available MIT bundles
 */
export const getMitTiers = async (): Promise<MitTier[]> => {
    try {
        const {data} = await API.get<GetMitTiersResponse>('/v1/mit/tiers');
        return data.success ? data.tiers : [];
    } catch (err) {
        console.error('[wallet.lib] getMitTiers', err);
        return [];
    }
};

/**
 * 2) Purchase a given quantity of MITs
 *    handles both 400 (invalid tier) and 402 (insufficient AD)
 */
export const purchaseMIT = async (quantity: number): Promise<PurchaseMitResponse> => {
    try {
        const {data, status} = await API.post<PurchaseMitResponse>(
            '/v1/mit/purchase',
            {
                amount: quantity,
            },
            {
                // allow 402 so we can read data.message
                validateStatus: () => true,
            },
        );

        if (status === 402) {
            return {success: false, message: data.message || 'Not enough AD'};
        }

        if (!data.success) {
            return {success: false, message: data.message || 'Could not purchase'};
        }

        return {success: true};
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return {
                success: false,
                message: err.response.data?.message || 'Network error',
            };
        }
        console.error('[wallet.lib] purchaseMIT', err);
        return {success: false, message: 'Unexpected error'};
    }
};
