import {Platform} from 'react-native';
import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';
import Purchases from 'react-native-purchases';

export type AdPackInfo = {
    tier: string;
    label: string;
    priceUSD: number;
    adGiven: number;
    dollarsPerAD: number;
    baselineAd: number;
    bonusAD: number;
    bonusPercent: number;
};


export async function getAdPacks(): Promise<AdPackInfo[]> {
    await useAuthStore.getState().hydrateAuth();

    try {
        const resp = await API.get<{
            success: boolean;
            data: AdPackInfo[];
        }>('/v1/ad-purchase/tiers');

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
        throw err;
    }
}


export async function purchaseAD(tier: string): Promise<string> {
    await useAuthStore.getState().hydrateAuth();

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
        return purchaseADInApp(tier).then((tx) => tx || '');
    }

    const resp = await API.post<{url: string}>('/v1/ad-checkout/create-session', {
        tier,
        platform: Platform.OS,
    });

    if (!resp.data || typeof resp.data.url !== 'string') {
        throw new Error('Unexpected response from server');
    }

    return resp.data.url;
}


export async function purchaseADInApp(tier: string): Promise<string> {
    await useAuthStore.getState().hydrateAuth();

    const PRODUCT_MAP_IOS: Record<string, string> = {
        MICRO: 'micro_pack',
        STARTER: 'starter_pack',
        BOOSTER: 'booster_pack',
        ELITE: 'elite_pack',
        WHALE: 'whale_pack',
        ULTRA: 'ultra_pack',
    };
    const PRODUCT_MAP_ANDROID: Record<string, string> = {
        MICRO: '0001',
        STARTER: '0002',
        BOOSTER: '0003',
        ELITE: '0004',
        WHALE: '0005',
        ULTRA: '0006',
    };

    const productId = Platform.OS === 'ios' ? PRODUCT_MAP_IOS[tier] : PRODUCT_MAP_ANDROID[tier];
    if (!productId) throw new Error('Unknown product for tier: ' + tier);

    try {
        const products = await Purchases.getProducts([productId], Purchases.PRODUCT_CATEGORY.NON_SUBSCRIPTION);
        await new Promise((r) => setTimeout(r, 500));
        

        const purchaseResult = await Purchases.purchaseStoreProduct(products[0]);

        const anyRes: any = purchaseResult as any;
        const transactionId = anyRes?.productIdentifier || anyRes?.transactionId || anyRes?.customerInfo?.originalAppUserId || anyRes?.customerInfo?.entitlements
            ? JSON.stringify(anyRes)
            : new Date().toISOString();

        const resp = await API.post('/v1/ad-purchase/revenuecat/ack', { tier, transactionId, platform: Platform.OS });

        if (!resp.data || !resp.data.success) {
            console.error('Server ack failed', resp.data);
            throw new Error('Server failed to acknowledge purchase');
        }

        return transactionId;
    } catch (err: any) {
        console.error('In-app purchase failed:', JSON.stringify(err));
        throw err;
    }
}


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
