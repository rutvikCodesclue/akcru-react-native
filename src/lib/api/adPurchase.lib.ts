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


export type AdPurchaseServerAck = {
    success: boolean;
    message?: string;
    data?: unknown;
};

export type AdPackInAppPurchaseResult = {
    transactionId: string;
    serverAck: AdPurchaseServerAck;
};

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

function getProductIdForTier(tier: string): string {
    const productId = Platform.OS === 'ios' ? PRODUCT_MAP_IOS[tier] : PRODUCT_MAP_ANDROID[tier];
    if (!productId) {
        throw new Error('Unknown product for tier: ' + tier);
    }
    return productId;
}

function extractTransactionId(purchaseResult: unknown): string {
    const resRecord =
        purchaseResult && typeof purchaseResult === 'object'
            ? (purchaseResult as Record<string, unknown>)
            : undefined;
    const customerInfo =
        resRecord?.customerInfo && typeof resRecord.customerInfo === 'object'
            ? (resRecord.customerInfo as Record<string, unknown>)
            : undefined;

    return (
        (typeof resRecord?.productIdentifier === 'string' && resRecord.productIdentifier) ||
        (typeof resRecord?.transactionId === 'string' && resRecord.transactionId) ||
        (typeof customerInfo?.originalAppUserId === 'string' && customerInfo.originalAppUserId) ||
        (customerInfo?.entitlements ? JSON.stringify(purchaseResult) : new Date().toISOString())
    );
}

/** Runs RevenueCat in-app purchase only — does not credit AD or register a movie rental. */
export async function purchaseTierInApp(tier: string): Promise<{transactionId: string}> {
    await useAuthStore.getState().hydrateAuth();

    const productId = getProductIdForTier(tier);

    try {
        const products = await Purchases.getProducts([productId], Purchases.PRODUCT_CATEGORY.NON_SUBSCRIPTION);
        await new Promise(r => setTimeout(r, 500));

        const purchaseResult = await Purchases.purchaseStoreProduct(products[0]);
        return {transactionId: extractTransactionId(purchaseResult)};
    } catch (err: unknown) {
        console.error('In-app purchase failed:', JSON.stringify(err));
        throw err;
    }
}

export async function purchaseADInAppWithResult(tier: string): Promise<AdPackInAppPurchaseResult> {
    await useAuthStore.getState().hydrateAuth();

    try {
        const {transactionId} = await purchaseTierInApp(tier);

        const resp = await API.post<AdPurchaseServerAck>('/v1/ad-purchase/revenuecat/ack', {
            tier,
            transactionId,
            platform: Platform.OS,
        });

        if (!resp.data || !resp.data.success) {
            console.error('Server ack failed', resp.data);
            throw new Error('Server failed to acknowledge purchase');
        }

        return {
            transactionId,
            serverAck: resp.data,
        };
    } catch (err: unknown) {
        console.error('In-app purchase failed:', JSON.stringify(err));
        throw err;
    }
}

export async function purchaseADInApp(tier: string): Promise<string> {
    const result = await purchaseADInAppWithResult(tier);
    return result.transactionId;
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
