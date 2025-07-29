// src/lib/api/adPurchase.lib.ts

import {Platform} from 'react-native';
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
export async function purchaseAD(tier: string): Promise<string> {
    // ensure we’re logged in
    await useAuthStore.getState().hydrateAuth();

    const resp = await API.post<{url: string}>('/v1/ad-checkout/create-session', {
        tier,
        platform: Platform.OS, // 👈 send 'android' or 'ios'
    });

    if (!resp.data || typeof resp.data.url !== 'string') {
        throw new Error('Unexpected response from server');
    }

    return resp.data.url;
}

/**
 * Confirm a completed Stripe session via session_id.
 * Returns `true` on success, throws on failure.
 */
export async function verifyAdPurchaseSession(sessionId: string): Promise<boolean> {
    await useAuthStore.getState().hydrateAuth();

    try {
        const resp = await API.get<{success: boolean; data?: any}>('/v1/ad-purchase/verify-session', {
            params: {session_id: sessionId},
        });

        if (!resp.data || !resp.data.success) {
            console.error('verifyAdPurchaseSession: failed response', resp.data);
            throw new Error('Unable to verify session');
        }

        return true;
    } catch (err) {
        console.error('verifyAdPurchaseSession error:', err);
        throw err;
    }
}
