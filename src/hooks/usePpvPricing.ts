import {IMovie} from '../../types';
import useAuthStore from '../stores/auth.store';
import {formatUsdPrice} from '../lib/adPackPurchaseFlow';
import {
    getPpvUsdPriceForMovie,
    getUserMovieSlugs,
    hasPpvSlugDiscount,
} from '../lib/userProfile';

export function usePpvPricing(movie?: IMovie | null) {
    const authMovieSlugs = useAuthStore(state =>
        getUserMovieSlugs(state.user, state.movieSlugs, state.movieSlug),
    );
    const hasDiscount = hasPpvSlugDiscount(authMovieSlugs, movie);
    const usdPrice = getPpvUsdPriceForMovie(authMovieSlugs, movie);

    return {
        authMovieSlugs,
        hasDiscount,
        /** @deprecated Use hasDiscount — kept for existing PPV screen call sites. */
        isVip: hasDiscount,
        usdPrice,
        priceLabel: formatUsdPrice(usdPrice),
    };
}
