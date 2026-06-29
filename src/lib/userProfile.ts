import {IMovie, IUserProfile} from '../../types';
import {
    getPpvUsdPriceForDiscount,
    PPV_STANDARD_USD_PRICE,
    PPV_VIP_USD_PRICE,
} from './adPackPurchaseFlow';

export function normalizeMovieSlug(slug: string | null | undefined): string {
    return slug?.trim().toLowerCase() ?? '';
}

export function resolveUserMovieSlugs(
    movieSlugs: string[] | null | undefined,
    fallbackMovieSlug?: string | null,
): string[] {
    const normalizedFromArray = (movieSlugs ?? [])
        .map(normalizeMovieSlug)
        .filter(slug => slug.length > 0);

    if (normalizedFromArray.length > 0) {
        return [...new Set(normalizedFromArray)];
    }

    const fallback = normalizeMovieSlug(fallbackMovieSlug);
    return fallback ? [fallback] : [];
}

export function resolveAuthMovieSlugState(
    movieSlug: string | null | undefined,
    movieSlugs: string[] | null | undefined,
    currentMovieSlug?: string | null,
    currentMovieSlugs?: string[] | null,
): {movieSlug: string | null; movieSlugs: string[]} {
    const resolvedMovieSlug = movieSlug?.trim() || currentMovieSlug?.trim() || null;
    const resolvedMovieSlugs = resolveUserMovieSlugs(
        movieSlugs ?? currentMovieSlugs,
        resolvedMovieSlug,
    );

    return {movieSlug: resolvedMovieSlug, movieSlugs: resolvedMovieSlugs};
}

export function getUserMovieSlug(
    user: IUserProfile | null | undefined,
    storedMovieSlug?: string | null,
): string | null {
    const resolvedSlug = storedMovieSlug ?? user?.movieSlug;
    const normalizedSlug = normalizeMovieSlug(resolvedSlug);
    return normalizedSlug || null;
}

export function getUserMovieSlugs(
    user: IUserProfile | null | undefined,
    storedMovieSlugs?: string[] | null,
    storedMovieSlug?: string | null,
): string[] {
    return resolveUserMovieSlugs(
        storedMovieSlugs ?? user?.movieSlugs,
        storedMovieSlug ?? user?.movieSlug,
    );
}

export function hasPpvSlugDiscount(
    authMovieSlugs: string[] | null | undefined,
    movie: IMovie | null | undefined,
): boolean {
    const normalizedMovieSlug = normalizeMovieSlug(movie?.slug);
    if (!normalizedMovieSlug) {
        return false;
    }

    const slugs = resolveUserMovieSlugs(authMovieSlugs);
    return slugs.includes(normalizedMovieSlug);
}

export function getPpvUsdPriceForMovie(
    authMovieSlugs: string[] | null | undefined,
    movie: IMovie | null | undefined,
): number {
    return getPpvUsdPriceForDiscount(hasPpvSlugDiscount(authMovieSlugs, movie));
}

/** @deprecated Use hasPpvSlugDiscount for movie-specific pricing. */
export function getUserVipStatus(user: IUserProfile | null | undefined): boolean {
    return user?.vipStatus === true;
}

/** @deprecated Use getPpvUsdPriceForMovie for movie-specific pricing. */
export function getPpvUsdPriceForUser(user: IUserProfile | null | undefined): number {
    return getUserVipStatus(user) ? PPV_VIP_USD_PRICE : PPV_STANDARD_USD_PRICE;
}
