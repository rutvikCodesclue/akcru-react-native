import useAuthStore from '../stores/auth.store';
import {formatUsdPrice} from '../lib/adPackPurchaseFlow';
import {getPpvUsdPriceForUser, getUserVipStatus} from '../lib/userProfile';

export function usePpvPricing() {
    const user = useAuthStore(state => state.user);
    const isVip = getUserVipStatus(user);
    const usdPrice = getPpvUsdPriceForUser(user);

    return {
        isVip,
        usdPrice,
        priceLabel: formatUsdPrice(usdPrice),
    };
}
