import React, {useCallback, useMemo, useState} from 'react';
import {getPurchasedMovies} from '../../../lib/api/movies.lib';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {useFocusEffect} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useHideBottomTabBarWhileFocused} from '../../ChatScreens/useHideBottomTabBarWhileFocused';
import {formatMovieDuration} from '../../../util/util';
import {consumePpvThankYouPending} from '../../../lib/ppvPlaybackFlow';
import {navigateToTrailerPlayer} from '../../../util/RootNavigation';
import movieStyles from './ppvMovieStyles';
import {COLORS} from '../../../../assets/constants';
import PremiereHeroImage from './PremiereHeroImage';
import {
    buildPurchasedMovieIdSet,
    buildScreeningWindowLabel,
    formatAccessButtonLabel,
    formatScreeningEventLabel,
    getDirectorName,
    getPpvMovieHeroUri,
    getRentalDurationHrs,
    getStarringNames,
    isMoviePurchased,
} from './ppvHelpers';
import {usePpvPricing} from '../../../hooks/usePpvPricing';
import PremiereTitle from './PremiereTitle';

type Props = StackScreenProps<UserProfileStackParams, 'PpvMovieScreen'>;

export default function PpvMovieScreen({navigation, route}: Props) {
    useHideBottomTabBarWhileFocused(navigation);

    const movie = route.params.movie;
    const {hasDiscount} = usePpvPricing(movie);
    const rentalDurationHrs = useMemo(() => getRentalDurationHrs(movie), [movie]);
    const [screeningWindowLabel, setScreeningWindowLabel] = useState(() =>
        buildScreeningWindowLabel(rentalDurationHrs),
    );
    const [isPurchased, setIsPurchased] = useState(route.params.isPurchased ?? false);

    const refreshPurchaseStatus = useCallback(async () => {
        try {
            const purchasedMovies = await getPurchasedMovies();
            const purchasedIds = buildPurchasedMovieIdSet(purchasedMovies);
            setIsPurchased(isMoviePurchased(movie.id, purchasedIds));
        } catch (error) {
            console.error('[PpvMovieScreen] Failed to refresh purchased movies:', error);
        }
    }, [movie.id]);

    useFocusEffect(
        useCallback(() => {
            const thankYouMovie = consumePpvThankYouPending();
            if (thankYouMovie) {
                navigation.replace('PpvThankYouScreen', {movie: thankYouMovie});
                return;
            }

            setScreeningWindowLabel(buildScreeningWindowLabel(rentalDurationHrs));
            refreshPurchaseStatus();
        }, [navigation, refreshPurchaseStatus, rentalDurationHrs]),
    );

    const heroUri = useMemo(() => getPpvMovieHeroUri(movie), [movie]);
    const trailerURL = movie.trailerURL?.trim() ?? '';
    const movieURL = movie.movieURL?.trim() ?? '';
    const directorName = useMemo(() => getDirectorName(movie), [movie]);
    const starringNames = useMemo(() => getStarringNames(movie), [movie]);
    const accessButtonLabel = useMemo(
        () => formatAccessButtonLabel(movie, hasDiscount),
        [hasDiscount, movie],
    );

    const metaText = useMemo(() => {
        const parts = [
            movie.genres?.[0] ? movie.genres[0].toUpperCase() : null,
            movie.year ? String(movie.year) : null,
            movie.duration ? formatMovieDuration(movie.duration) : null,
            movie.rated ? movie.rated.toUpperCase() : null,
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(' | ') : 'DRAMA | 2024 | NR';
    }, [movie]);

    const handleGetAccess = () => {
        navigation.navigate('PpvPurchaseScreen', {movie, screeningWindowLabel});
    };

    const handlePlayMovie = () => {
        if (!movieURL) {
            Alert.alert('Playback unavailable', 'This title is not available to play right now.');
            return;
        }

        navigateToTrailerPlayer(
            {
                id: movie.id,
                trailerURL: movieURL,
                landscapeURL: movie.landscapeURL,
                title: movie.title,
                playFullMovie: true,
                fromPpvFlow: true,
            },
            navigation,
        );
    };

    const handleWatchTrailer = () => {
        if (!trailerURL) {
            Alert.alert('Trailer unavailable', 'No trailer is available for this title.');
            return;
        }

        navigateToTrailerPlayer(
            {
                id: movie.id,
                trailerURL,
                landscapeURL: movie.landscapeURL,
                title: movie.title,
            },
            navigation,
        );
    };

    const renderHeader = () => (
        <View style={movieStyles.headerOverlay} pointerEvents="box-none">
            <View style={movieStyles.headerRow}>
                <TouchableOpacity
                    style={movieStyles.headerIconButton}
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                    accessibilityLabel="Go back">
                    <Icon name="chevron-back" type="ionicon" size={28} color={COLORS.WHITE} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={movieStyles.safeArea}>
            <View style={movieStyles.screenBody}>
                <ScrollView
                    style={movieStyles.scrollView}
                    contentContainerStyle={movieStyles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}>
                <View style={movieStyles.heroWrap}>
                    <PremiereHeroImage uri={heroUri} />
                    <View style={movieStyles.heroTitleOverlay} pointerEvents="none">
                        <PremiereTitle title={movie.title} align="left" />
                    </View>
                </View>

                <View style={movieStyles.contentBlock}>
                    <TouchableOpacity
                        style={[
                            movieStyles.watchTrailerButton,
                            !trailerURL && movieStyles.watchTrailerButtonDisabled,
                        ]}
                        activeOpacity={0.85}
                        onPress={handleWatchTrailer}
                        disabled={!trailerURL}
                        accessibilityRole="button"
                        accessibilityLabel="Watch trailer">
                        <Icon name="play" type="ionicon" size={18} color={COLORS.WHITE} />
                        <Text style={movieStyles.watchTrailerLabel}>WATCH TRAILER</Text>
                    </TouchableOpacity>

                    <Text style={movieStyles.exclusiveLabel}>AN EXCLUSIVE DIGITAL SCREENING</Text>
                    <Text style={movieStyles.metaText}>{metaText}</Text>

                    <Text style={movieStyles.synopsis}>
                        {movie.description?.trim() ||
                            'A powerful story of love, loyalty and the choices that shape a legacy.'}
                    </Text>

                    {directorName ? (
                        <View style={movieStyles.creditBlock}>
                            <Text style={movieStyles.creditLabel}>DIRECTOR</Text>
                            <Text style={movieStyles.creditValue}>{directorName}</Text>
                        </View>
                    ) : null}

                    {starringNames ? (
                        <View style={movieStyles.creditBlock}>
                            <Text style={movieStyles.creditLabel}>STARRING</Text>
                            <Text style={movieStyles.creditValue}>{starringNames}</Text>
                        </View>
                    ) : null}
                </View>
                </ScrollView>

                <View style={movieStyles.bottomFooter}>
                    {!isPurchased ? (
                        <View style={movieStyles.screeningBox}>
                            <View style={movieStyles.screeningIconWrap}>
                                <Icon name="calendar" type="ionicon" size={20} color={COLORS.CATREDLGT} />
                            </View>
                            <View style={movieStyles.screeningCopy}>
                                <Text style={movieStyles.screeningHeading}>SCREENING WINDOW</Text>
                                <Text style={movieStyles.screeningDates}>{screeningWindowLabel}</Text>
                                <Text style={movieStyles.screeningEventLabel}>
                                    {formatScreeningEventLabel(rentalDurationHrs)}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    {isPurchased ? (
                        <TouchableOpacity
                            style={[
                                movieStyles.accessButton,
                                !movieURL && movieStyles.accessButtonDisabled,
                            ]}
                            activeOpacity={0.85}
                            onPress={handlePlayMovie}
                            disabled={!movieURL}
                            accessibilityRole="button"
                            accessibilityLabel="Play movie">
                            <Icon name="play" type="ionicon" size={18} color={COLORS.WHITE} />
                            <Text style={movieStyles.accessButtonLabel}>PLAY</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={movieStyles.accessButton}
                            activeOpacity={0.85}
                            onPress={handleGetAccess}
                            accessibilityRole="button"
                            accessibilityLabel={accessButtonLabel}>
                            <Text style={movieStyles.accessButtonLabel}>{accessButtonLabel}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {renderHeader()}
        </SafeAreaView>
    );
}
