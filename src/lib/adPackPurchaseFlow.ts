import {Platform} from 'react-native';
import {
    AdPackInfo,
    AdPurchaseServerAck,
    purchaseAD,
    purchaseADInAppWithResult,
    purchaseTierInApp,
} from './api/adPurchase.lib';
import {purchaseMovieViaRevenueCat} from './api/movies.lib';
import {
    clearPpvPurchaseAttributes,
    setPpvPurchaseAttributes,
} from './revenueCatPurchaseContext';

/** Standard PPV IAP price for non-VIP users. */
export const PPV_STANDARD_USD_PRICE = 9.99;

/** VIP PPV IAP price when login movie slug matches the movie slug. */
export const PPV_VIP_USD_PRICE = 4.99;

/** Default PPV IAP price when no RevenueCat tier matches the movie rent price. */
export const PPV_FALLBACK_USD_PRICE = PPV_STANDARD_USD_PRICE;

export function getPpvUsdPriceForVipStatus(vipStatus: boolean | undefined): number {
    return getPpvUsdPriceForDiscount(vipStatus === true);
}

export function getPpvUsdPriceForDiscount(hasDiscount: boolean | undefined): number {
    return hasDiscount === true ? PPV_VIP_USD_PRICE : PPV_STANDARD_USD_PRICE;
}

/** @deprecated Use findAdPackForRentPrice — kept for legacy references. */
export const PPV_AD_PACK_TIER = 'BOOSTER';

export function parseRentPriceAmount(rentPrice: string | number | null | undefined): number {
    if (rentPrice == null || rentPrice === '') {
        return 0;
    }

    const parsed = typeof rentPrice === 'number' ? rentPrice : Number(rentPrice);
    return Number.isFinite(parsed) ? parsed : 0;
}

/** Converts whole-number rent prices to App Store tiers (e.g. 9 → 9.99, 4 → 4.99). */
export function convertRentPriceToUsdDecimal(rentPrice: number): number {
    if (!Number.isFinite(rentPrice) || rentPrice <= 0) {
        return PPV_FALLBACK_USD_PRICE;
    }

    if (Number.isInteger(rentPrice)) {
        return rentPrice + 0.99;
    }

    return Math.round(rentPrice * 100) / 100;
}

export function formatUsdPrice(usdAmount: number): string {
    return `$${usdAmount.toFixed(2)}`;
}

function pricesMatchUsd(a: number, b: number): boolean {
    return Math.abs(a - b) < 0.01;
}

export function findAdPackByTier(packs: AdPackInfo[], tier: string): AdPackInfo | undefined {
    return packs.find(p => p.tier === tier);
}

export function findAdPackByUsdPrice(packs: AdPackInfo[], priceUSD: number): AdPackInfo | undefined {
    return packs.find(pack => pricesMatchUsd(pack.priceUSD, priceUSD));
}

/** Resolves the RevenueCat tier for PPV based on slug-matched discount pricing. */
export function findAdPackForPpvPricing(
    packs: AdPackInfo[],
    hasDiscount: boolean | undefined,
): AdPackInfo | undefined {
    if (!packs.length) {
        return undefined;
    }

    const targetUsd = getPpvUsdPriceForDiscount(hasDiscount);
    const matchedPack = findAdPackByUsdPrice(packs, targetUsd);
    if (matchedPack) {
        return matchedPack;
    }

    const fallbackPack = findAdPackByUsdPrice(packs, PPV_STANDARD_USD_PRICE);
    if (fallbackPack) {
        console.warn(
            `[findAdPackForPpvPricing] No pack for $${targetUsd.toFixed(2)}, using $${PPV_STANDARD_USD_PRICE.toFixed(2)} fallback`,
        );
        return fallbackPack;
    }

    console.warn('[findAdPackForPpvPricing] No $9.99 pack found, using first available tier');
    return packs[0];
}

/** Resolves the RevenueCat tier to purchase for a PPV movie rent price. */
export function findAdPackForRentPrice(
    packs: AdPackInfo[],
    rentPrice: string | number | null | undefined,
): AdPackInfo | undefined {
    if (!packs.length) {
        return undefined;
    }

    const rawAmount = parseRentPriceAmount(rentPrice);
    const targetUsd =
        rawAmount > 0 ? convertRentPriceToUsdDecimal(rawAmount) : PPV_FALLBACK_USD_PRICE;

    const matchedPack = findAdPackByUsdPrice(packs, targetUsd);
    if (matchedPack) {
        return matchedPack;
    }

    const fallbackPack = findAdPackByUsdPrice(packs, PPV_FALLBACK_USD_PRICE);
    if (fallbackPack) {
        console.warn(
            `[findAdPackForRentPrice] No pack for $${targetUsd.toFixed(2)}, using $${PPV_FALLBACK_USD_PRICE.toFixed(2)} fallback`,
        );
        return fallbackPack;
    }

    console.warn('[findAdPackForRentPrice] No $9.99 pack found, using first available tier');
    return packs[0];
}

/** Purchase outcome returned to PPV and other callers after confirm flow. */
export type AdPackPurchaseResponse = {
    status: 'success' | 'failed';
    tier: string;
    pack: AdPackInfo;
    transactionId?: string;
    checkoutUrl?: string;
    serverAck?: AdPurchaseServerAck;
    errorMessage?: string;
    rawError?: unknown;
};

/** Same behavior as PurchaseAD `onPackPurchasePress`: select tier and open confirm. */
export function onPackPurchasePress(
    tier: AdPackInfo,
    callbacks: {
        selectTier: (pack: AdPackInfo) => void;
        showConfirm: () => void;
    },
): void {
    callbacks.selectTier(tier);
    callbacks.showConfirm();
}

export type AdPackPurchaseConfirmOptions = {
    hydrateUser: () => Promise<void>;
    navigate?: (screen: string, params: {checkoutUrl: string}) => void;
};

/** PPV rental via RevenueCat — IAP then `purchase/revenuecat`, not AD wallet credit. */
export async function confirmPpvMoviePurchase(
    pack: AdPackInfo,
    movieId: string,
    options: AdPackPurchaseConfirmOptions,
): Promise<AdPackPurchaseResponse> {
    const base = {tier: pack.tier, pack};

    try {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
                await setPpvPurchaseAttributes({
                    movieId,
                    purchaseType: 'RENT',
                });

                // static transactionId
                //const transactionId = 'rc_txn_123456987';
                const transactionId = (await purchaseTierInApp(pack.tier)).transactionId;
                const rented = await purchaseMovieViaRevenueCat(movieId, {
                    purchaseType: 'RENT',
                    transactionId,
                    paymentProvider: 'REVENUECAT',
                });

                if (!rented) {
                    return {
                        ...base,
                        status: 'failed',
                        transactionId,
                        errorMessage:
                            'Payment was received but rental could not be completed. Please contact support.',
                    };
                }

                await options.hydrateUser();
                return {
                    ...base,
                    status: 'success',
                    transactionId,
                };
            } finally {
                await clearPpvPurchaseAttributes();
            }
        }

        const checkoutUrl = await purchaseAD(pack.tier);
        options.navigate?.('StripeWebCheckout', {checkoutUrl});
        return {
            ...base,
            status: 'success',
            checkoutUrl,
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
        return {
            ...base,
            status: 'failed',
            errorMessage,
            rawError: error,
        };
    }
}

/** Mirrors PurchaseAD `confirmPurchase` — runs IAP / Stripe and returns a response model. */
export async function confirmAdPackPurchase(
    pack: AdPackInfo,
    options: AdPackPurchaseConfirmOptions,
): Promise<AdPackPurchaseResponse> {
    const base = {tier: pack.tier, pack};

    try {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            const result = await purchaseADInAppWithResult(pack.tier);
            await options.hydrateUser();
            return {
                ...base,
                status: 'success',
                transactionId: result.transactionId,
                serverAck: result.serverAck,
            };
        }

        const checkoutUrl = await purchaseAD(pack.tier);
        options.navigate?.('StripeWebCheckout', {checkoutUrl});
        return {
            ...base,
            status: 'success',
            checkoutUrl,
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
        return {
            ...base,
            status: 'failed',
            errorMessage,
            rawError: error,
        };
    }
}
