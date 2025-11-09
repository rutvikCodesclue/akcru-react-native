// src/lib/api/adPurchase.lib.ts

import {Platform} from 'react-native';
import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';
import Purchases from 'react-native-purchases';

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

    // For native platforms use in-app purchases via RevenueCat (react-native-purchases)
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // prefer explicit in-app flow
        return purchaseADInApp(tier).then((tx) => tx || '');
    }

    // Fallback / web path: create a Stripe checkout session
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
 * Perform an in-app purchase using react-native-purchases (RevenueCat).
 * On success POST to the server to create/ack the purchase.
 * Returns the transaction id (or empty string) on success.
 */
export async function purchaseADInApp(tier: string): Promise<string> {
    await useAuthStore.getState().hydrateAuth();

    // Map tiers to RevenueCat product identifiers.
    // TODO: Replace these placeholders with the real product ids from App Store / Play Console
    const PRODUCT_MAP: Record<string, string> = {
        MICRO: 'micro_pack',
        STARTER: 'akcru_dollars_2akd',
        BOOSTER: 'akcru_dollars_2akd',
        ELITE: 'akcru_dollars_2akd',
        WHALE: 'akcru_dollars_2akd',
        ULTRA: 'akcru_dollars_2akd',
    };

    const productId = PRODUCT_MAP[tier];
    if (!productId) throw new Error('Unknown product for tier: ' + tier);

    try {
        console.log('Attempting Purchases.purchaseStoreProduct for', productId);
        const products = await Purchases.getProducts([productId]);
        console.log('Products fetched for purchase:', products);
        await new Promise((r) => setTimeout(r, 500));
        

        const purchaseResult = await Purchases.purchaseStoreProduct(products[0]);
        console.log('Purchases.purchaseProduct result ->', purchaseResult);

        // purchaseResult shape may vary between platforms / SDK versions; be defensive
        const anyRes: any = purchaseResult as any;
        const transactionId = anyRes?.productIdentifier || anyRes?.transactionId || anyRes?.customerInfo?.originalAppUserId || anyRes?.customerInfo?.entitlements
            ? JSON.stringify(anyRes)
            : new Date().toISOString();

        // Notify our backend to create/ack the AD purchase
        const resp = await API.post('/v1/ad-purchase/revenuecat/ack', { tier, transactionId, platform: Platform.OS });

        if (!resp.data || !resp.data.success) {
            console.error('Server ack failed', resp.data);
            throw new Error('Server failed to acknowledge purchase');
        }

        return transactionId;
    } catch (err: any) {
        console.error('In-app purchase failed:', err);
        // Re-throw so caller can show UI
        throw err;
    }
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
