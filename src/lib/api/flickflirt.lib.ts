// src/lib/api/flickflirt.lib.ts

import {IUserProfile} from '../../../types';
import {API} from '../../clients/api.client';

export interface UnlockOption {
    durationDays: number;
    cost: number;
}

export interface MatchesResponse {
    success: boolean;
    message?: string;
    matches: IUserProfile[];
    unlocked: boolean;
    hiddenCount: number;
    expiresAt?: string;
    unlockOptions: UnlockOption[];
}

// fetch matches (limited or full depending on unlock state)
export const getMatches = async (): Promise<MatchesResponse> => {
    const res = await API.get<MatchesResponse>('/v1/flickflirt/matches', {validateStatus: () => true});
    if (res.status !== 200 || !res.data?.success) {
        return {
            success: false,
            matches: [],
            hiddenCount: 0,
            unlocked: false,
            unlockOptions: [],
            message: res.data?.message ?? 'Server error',
        };
    }
    return res.data;
};


// unlock for a given duration
// export const unlockMatches = async (durationDays: number): Promise<MatchesResponse> => {
//     const res = await API.get<MatchesResponse>('/v1/flickflirt/matches', {
//         params: {unlock: true, durationDays},
//         validateStatus: () => true,
//     });
//     return res.data;
// };

export async function unlockMatches(durationDays: number): Promise<MatchesResponse> {
    const res = await API.get<MatchesResponse>('/v1/flickflirt/matches', {
        params: {unlock: true, durationDays},
        // allow 402 through so we can handle it below
        validateStatus: () => true,
    });

    // 402: insufficient funds
    if (res.status === 402) {
        return {
            success: false,
            matches: [],
            hiddenCount: 0,
            unlocked: false,
            unlockOptions: res.data?.unlockOptions ?? [],
            message: res.data?.message ?? 'Need AD to unlock',
        };
    }

    // any other non-200 → error
    if (res.status !== 200 || !res.data.success) {
        return {
            success: false,
            matches: [],
            hiddenCount: 0,
            unlocked: false,
            unlockOptions: res.data?.unlockOptions ?? [],
            message: res.data?.message ?? 'Unable to unlock matches',
        };
    }

    // 200 + success
    return res.data;
}

export async function newVisitFlick() {
    try {
        const response = await API.post('/v1/flickflirt/isNewFlickUser');
        if (response) {
            return response.data.isNewVisitFlick;
        }
    } catch (error) {
        throw new Error('Error thrown while calling newVisitFlick');
    }
}
export async function newFlickUserUpdate() {
    const response = await API.post('/v1/flickflirt/newFlickUserUpdate');

    if (response) {
        console.log('data come update successfully', response.data);
        return response.data;
    }
}

export type FlickFlirtSwipeBatchType = 'LIKE' | 'DISLIKE';

export interface FlickFlirtSwipeBatchItem {
    movieId: string;
    type: FlickFlirtSwipeBatchType;
}

/** POST /v1/flickflirt/swipe/batch — send all swipes from a session in one request */
export async function submitFlickFlirtSwipeBatch(swipes: FlickFlirtSwipeBatchItem[]) {
    const res = await API.post('v1/flickflirt/swipe/batch', {swipes});
    return res.data;
}
