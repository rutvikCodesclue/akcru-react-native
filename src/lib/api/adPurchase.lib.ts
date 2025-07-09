// src/lib/api/adPurchase.lib.ts

import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';

export type AdPackInfo = {
    tier: string; // e.g. "MICRO", "STARTER", …
    label: string; // "Micro Pack", …
    priceUSD: number; // e.g. 1.99
    adGiven: number; // e.g. 1000
    dollarsPerAD: number; // e.g. 0.00199
    baselineAd: number; // e.g. 1000
    bonusAD: number; // e.g. 0
    bonusPercent: number; // e.g. 0.0
};

/**
 * Fetch all AD-pack tiers from the server.
 */
export async function getAdPacks(): Promise<AdPackInfo[]> {
    await useAuthStore.getState().hydrateAuth();

    try {
        // don’t destructure immediately—grab the full response
        const resp = await API.get<{
            success: boolean;
            data: AdPackInfo[];
        }>('/v1/ad-purchase/tiers');

        // axios responses put the payload on resp.data
        const body = resp.data;
        if (!body) {
            console.error('getAdPacks: no response body', resp);
            throw new Error('No response from server');
        }

        if (!body.success) {
            console.error('getAdPacks: server responded unsuccessfully', body);
            throw new Error('Server returned failure');
        }

        if (!Array.isArray(body.data)) {
            console.error('getAdPacks: bad data shape', body);
            throw new Error('Invalid data format');
        }

        return body.data;
    } catch (err: any) {
        console.error('getAdPacks error:', err);
        // re-throw so your component’s .catch can show an alert
        throw err;
    }
}

/**
 * Kick off a Stripe Checkout session for the chosen tier.
 * Returns the hosted Checkout URL.
 */
export async function purchaseAD(tier: string): Promise<{url: string}> {
    await useAuthStore.getState().hydrateAuth();
    const {data} = await API.post<{url: string}>('/v1/ad-purchase', {tier});
    return data;
}
