import {Alert, Platform, ToastAndroid} from 'react-native';
import {AxiosError} from 'axios';
import moment from 'moment';
import {IMovie} from '../../../../types';
import {API} from '../../../clients/api.client';
import {
    convertRentPriceToUsdDecimal,
    formatUsdPrice,
    PPV_FALLBACK_USD_PRICE,
} from '../../../lib/adPackPurchaseFlow';
import {PPV_AKCRU_FOLLOW_USER_ID} from './ppvConstants';

const SCREENING_DATE_FORMAT = 'MMMM D, YYYY h:mmA';
const DEFAULT_RENTAL_DURATION_HRS = 48;
const DEFAULT_USD_PRICE_LABEL = formatUsdPrice(PPV_FALLBACK_USD_PRICE);

function isMoviePurchaseAd(movie: IMovie): boolean {
    return movie.isPurchaseAd === true;
}

function formatPpvPriceAmount(movie: IMovie, amount: number): string {
    if (isMoviePurchaseAd(movie)) {
        return `${amount} AD`;
    }
    return formatUsdPrice(convertRentPriceToUsdDecimal(amount));
}

export function getPpvDefaultPriceLabel(movie: IMovie): string {
    return isMoviePurchaseAd(movie) ? '0 AD' : DEFAULT_USD_PRICE_LABEL;
}

export function getRentalDurationHrs(movie: IMovie): number {
    const hours = movie.rentalDurationHrs;
    if (hours != null && hours > 0) {
        return hours;
    }
    return DEFAULT_RENTAL_DURATION_HRS;
}

export function buildScreeningWindowLabel(rentalDurationHrs?: number | null): string {
    const durationHrs =
        rentalDurationHrs != null && rentalDurationHrs > 0 ? rentalDurationHrs : DEFAULT_RENTAL_DURATION_HRS;
    const windowStart = moment();
    const windowEnd = windowStart.clone().add(durationHrs, 'hours');
    return `${windowStart.format(SCREENING_DATE_FORMAT)} – ${windowEnd.format(SCREENING_DATE_FORMAT)}`;
}

export function formatScreeningEventLabel(rentalDurationHrs?: number | null): string {
    const durationHrs =
        rentalDurationHrs != null && rentalDurationHrs > 0 ? rentalDurationHrs : DEFAULT_RENTAL_DURATION_HRS;
    return `${durationHrs} HOUR EVENT`;
}

export function formatScreeningAccessHeading(rentalDurationHrs?: number | null): string {
    const durationHrs =
        rentalDurationHrs != null && rentalDurationHrs > 0 ? rentalDurationHrs : DEFAULT_RENTAL_DURATION_HRS;
    return `${durationHrs}-HOUR`;
}

export function getPpvPriceDisplay(movie: IMovie): string {
    const rentCost = movie.rentalPrice != null ? Number(movie.rentalPrice) : 0;
    const price = movie.price ?? 0;

    if (rentCost > 0) {
        return formatPpvPriceAmount(movie, rentCost);
    }

    if (price > 0) {
        return formatPpvPriceAmount(movie, price);
    }

    return getPpvDefaultPriceLabel(movie);
}

export function getPpvRentalPriceDisplay(movie: IMovie): string {
    const rentCost = movie.rentalPrice != null ? Number(movie.rentalPrice) : 0;
    if (rentCost > 0) {
        return formatPpvPriceAmount(movie, rentCost);
    }
    return getPpvPriceDisplay(movie);
}

export function formatPpvRentConfirmationText(movie: IMovie): string {
    const rentalDurationHrs = getRentalDurationHrs(movie);
    const rentalPrice = getPpvRentalPriceDisplay(movie);
    const hourLabel = rentalDurationHrs === 1 ? 'hour' : 'hours';
    return `Are you sure you want to rent this movie for ${rentalDurationHrs} ${hourLabel} for ${rentalPrice}? (All sales are final - no refunds)`;
}

export function formatAccessLabel(movie: IMovie | null): string {
    if (!movie) {
        return 'GET ACCESS';
    }

    const priceLabel = getPpvPriceDisplay(movie);
    if (
        priceLabel === getPpvDefaultPriceLabel(movie) &&
        movie.price == null &&
        movie.rentalPrice == null
    ) {
        return 'GET ACCESS';
    }

    return `GET ACCESS – ${priceLabel}`;
}

export function formatAccessButtonLabel(movie: IMovie | null): string {
    return formatAccessLabel(movie);
}

export function getPremiereCreatorName(movie: IMovie): string {
    const director = movie.director?.[0] as {name?: string} | undefined;
    if (director?.name?.trim()) {
        return director.name.trim().toUpperCase();
    }

    const actor = movie.actors?.[0] as {name?: string} | undefined;
    if (actor?.name?.trim()) {
        return actor.name.trim().toUpperCase();
    }

    return 'AKCRU';
}

export function getPremierePosterUri(movie: IMovie): string | undefined {
    return movie.portraitURL?.trim() || undefined;
}

export function getPpvMovieHeroUri(movie: IMovie): string | undefined {
    return movie.portraitURL?.trim() || movie.image?.trim() || undefined;
}

export function getDirectorName(movie: IMovie): string {
    const director = movie.director?.[0] as {name?: string} | undefined;
    return director?.name?.trim() ?? '';
}

export function getStarringNames(movie: IMovie): string {
    if (!movie.actors?.length) {
        return '';
    }

    return movie.actors
        .map(actor => (actor as {name?: string}).name)
        .filter((name): name is string => Boolean(name?.trim()))
        .join(', ');
}

export function getPremiereQuote(movie: IMovie): string {
    const creator = getPremiereCreatorName(movie);
    const title = movie.title?.trim() || 'this film';
    const description = movie.description?.trim();

    if (description) {
        return description;
    }

    return `Hey everyone, it's ${creator}. Thank you for supporting independent film. I can't wait for you to see ${title}.`;
}

export function filterRentableMovies(movies: IMovie[]): IMovie[] {
    return movies.filter(movie => movie.rentable === true);
}

export function buildPurchasedMovieIdSet(movies: IMovie[]): Set<string> {
    return new Set(movies.map(movie => movie.id).filter(Boolean));
}

export function isMoviePurchased(movieId: string, purchasedMovieIds: Set<string>): boolean {
    return purchasedMovieIds.has(movieId);
}

export type PpvCastMember = {
    id?: string;
    name: string;
    avatarUri?: string;
};

type RawCastMember = {
    id?: string;
    userId?: string;
    name?: string;
    profilePicture?: string;
    imageURL?: string;
    portraitURL?: string;
};

function parseCastMember(raw: unknown): PpvCastMember | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const member = raw as RawCastMember;
    const name = member.name?.trim();
    if (!name) {
        return null;
    }

    const avatarUri =
        member.profilePicture?.trim() ||
        member.imageURL?.trim() ||
        member.portraitURL?.trim() ||
        undefined;

    return {
        id: member.id?.trim() || member.userId?.trim() || undefined,
        name,
        avatarUri,
    };
}

export function getPpvCreatorSubtitle(movie: IMovie): string {
    const director = movie.director?.[0] as {title?: string; role?: string} | undefined;
    const customRole = director?.title?.trim() || director?.role?.trim();
    if (customRole) {
        return customRole;
    }
    return 'Writer. Director. Storyteller.';
}

function mapCastMembers(rawMembers: unknown[] | undefined): PpvCastMember[] {
    if (!rawMembers?.length) {
        return [];
    }

    const seenNames = new Set<string>();

    return rawMembers.reduce<PpvCastMember[]>((members, raw) => {
        const parsed = parseCastMember(raw);
        if (!parsed) {
            return members;
        }

        const normalizedName = parsed.name.toLowerCase();
        if (seenNames.has(normalizedName)) {
            return members;
        }

        seenNames.add(normalizedName);
        members.push(parsed);
        return members;
    }, []);
}

export function getPpvThankYouDirectors(movie: IMovie): PpvCastMember[] {
    return mapCastMembers(movie.director);
}

export function getPpvThankYouActors(movie: IMovie): PpvCastMember[] {
    return mapCastMembers(movie.actors);
}

export function showPpvToast(message: string): void {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
        return;
    }

    Alert.alert('', message);
}

export type FollowPpvAkruResult = {
    success: boolean;
    message: string;
};

export async function followPpvAkruUser(): Promise<FollowPpvAkruResult> {
    const defaultSuccessMessage = 'Follow successful';
    const defaultErrorMessage = 'Could not follow AKCRU right now. Please try again.';

    try {
        const {data} = await API.post<{success?: boolean; message?: string}>('/v1/user/follow', {
            id: PPV_AKCRU_FOLLOW_USER_ID,
        });

        if (data.success === false) {
            return {
                success: false,
                message: data.message?.trim() || defaultErrorMessage,
            };
        }

        return {success: true, message: defaultSuccessMessage};
    } catch (error) {
        const axiosError = error as AxiosError<{message?: string; success?: boolean}>;
        const message = axiosError.response?.data?.message;

        console.error('[followPpvAkruUser] Failed to follow AKCRU user:', error);
        return {
            success: false,
            message: message?.trim() || defaultErrorMessage,
        };
    }
}
