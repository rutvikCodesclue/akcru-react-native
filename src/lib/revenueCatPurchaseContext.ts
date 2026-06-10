import {Platform} from 'react-native';
import Purchases from 'react-native-purchases';
import useAuthStore from '../stores/auth.store';

export type PpvPurchaseAttributeContext = {
    movieId: string;
    purchaseType: 'RENT' | 'BUY';
    userId?: string;
    username?: string;
};

function isRevenueCatPlatform(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
}

/** Sets subscriber attributes on the RevenueCat customer before IAP so webhooks include PPV context. */
export async function setPpvPurchaseAttributes(
    context: PpvPurchaseAttributeContext,
): Promise<void> {
    if (!isRevenueCatPlatform()) {
        return;
    }

    const user = useAuthStore.getState().user;

    try {
        await Purchases.setAttributes({
            movie_id: context.movieId,
            purchase_type: context.purchaseType,
            user_id: context.userId ?? user?.id ?? '',
            username: context.username ?? user?.username ?? '',
        });
    } catch (error) {
        console.warn('[RevenueCat] Failed to set PPV purchase attributes:', error);
    }
}

/** Clears movie-specific attributes after purchase completes or is cancelled. */
export async function clearPpvPurchaseAttributes(): Promise<void> {
    if (!isRevenueCatPlatform()) {
        return;
    }

    try {
        await Purchases.setAttributes({
            movie_id: '',
            purchase_type: '',
            user_id: '',
            username: '',
        });
    } catch (error) {
        console.warn('[RevenueCat] Failed to clear PPV purchase attributes:', error);
    }
}

/** Links the RevenueCat customer to the authenticated app user (`app_user_id` in webhooks). */
export async function syncRevenueCatAppUserId(
    userId: string | null | undefined,
): Promise<void> {
    if (!isRevenueCatPlatform()) {
        return;
    }

    try {
        if (userId) {
            await Purchases.logIn(userId);
        } else {
            await Purchases.logOut();
        }
    } catch (error) {
        console.warn('[RevenueCat] Failed to sync app user id:', error);
    }
}
