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
    const res = await API.get<MatchesResponse>('/v1/flickflirt/matches');
    return res.data;
};

// unlock for a given duration
export const unlockMatches = async (durationDays: number): Promise<MatchesResponse> => {
    const res = await API.get<MatchesResponse>('/v1/flickflirt/matches', {
        params: {unlock: true, durationDays},
        validateStatus: () => true,
    });
    return res.data;
};
