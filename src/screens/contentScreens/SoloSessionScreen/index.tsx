import React, {useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    ImageBackground,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {RouteProp, useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import Video from 'react-native-video';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import imageindex from '../../../../assets/images/imageindex';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {ClientStackParams} from '../../../navigation/ClientStack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {navigateToMITDateSchedule} from '../../../util/RootNavigation';
import {
    addToWatchlist,
    buyMovie,
    findMovies,
    getMoviePurchaseStatus,
    getWatchlist,
    removeFromWatchlist,
    rentMovie,
    type IContentPurchaseStatus,
} from '../../../lib/api/movies.lib';
import {getUserWallet} from '../../../lib/api/wallet.lib';
import {formatMovieDuration} from '../../../util/util';
import useAuthStore from '../../../stores/auth.store';
import ContentPurchaseModal from '../../../components/ContentPurchaseModal';
import ComfirmationModal from '../../../components/ConfirmationModal';
import BetterTogetherModal from '../../../components/BetterTogetherModal';
import type { IMovie } from '../../../../types';

/** Cap the deck so we don't render hundreds of items in memory. */
const TOP_RATED_LIMIT = 20;

/** Fallback poster used when a movie has no `portraitURL`. */
const FALLBACK_PORTRAIT = imageindex.JustAVibe;

type SoloSessionScreenNavigationProp = StackNavigationProp<ClientStackParams, 'SoloSessionScreen'>;
type SoloSessionScreenRouteProp = RouteProp<ClientStackParams, 'SoloSessionScreen'>;

type Props = {
    route: SoloSessionScreenRouteProp;
};

const vibeLabelMap: Record<string, string> = {
    browsing: 'Fit your vibe: just browsing',
    chill: 'Fit your vibe: chill & relax',
    vibes: 'Fit your vibe: late night vibes',
    something: 'Fit your vibe: something good',
    invite: 'Fit your vibe: might invite someone',
};

/**
 * Render a movie's duration via the shared helper so the format matches every
 * other movie card in the app. `IMovie.duration` is stored in **seconds**.
 */
const formatDurationLabel = (durationSeconds: number | null | undefined): string => {
    if (!durationSeconds || durationSeconds <= 0) {
        return '—';
    }
    const formatted = formatMovieDuration(durationSeconds).trim();
    return formatted.length > 0 ? formatted : '—';
};

const formatRating = (rating: number | null | undefined): string => {
    if (rating == null || Number.isNaN(rating)) {
        return '⭐ —';
    }
    return `⭐ ${rating.toFixed(1)}/10`;
};

const formatSecondsLabel = (seconds: number): string => {
    const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function SoloSessionScreen({route}: Props) {
    const navigation = useNavigation<SoloSessionScreenNavigationProp>();
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    /**
     * `ContentPlayer` is registered on `NoBottomTabStack`, the parent of
     * `ClientTabNavigator` → `ClientStack`. Pushing onto this navigator (rather
     * than navigating the root via a nested `navigate` call) preserves the
     * back stack, so the system back button returns the user to this screen
     * instead of dropping back to the default tab (Crummunity).
     */
    const parentNavigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const vibeId = route.params?.vibeId ?? 'browsing';
    const vibeText = vibeLabelMap[vibeId] ?? vibeLabelMap.browsing;
    const [activeIndex, setActiveIndex] = useState(0);
    const [listHeight, setListHeight] = useState(SIZES.ScreenHeight);
    const [topRatedMovies, setTopRatedMovies] = useState<IMovie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSwiping, setIsSwiping] = useState(false);
    const [isTrailerAutoplayReady, setIsTrailerAutoplayReady] = useState(false);
    const listRef = useRef<FlatList<IMovie>>(null);

    // --- Watch Solo / purchase flow (mirrors ContentDetailScreen.handlePrimary) ---
    const userId = useAuthStore(s => s.user?.id);
    const rawBalance = useAuthStore(s => s.walletBalance);
    const balance = rawBalance != null ? Number(rawBalance) : 0;
    const setWalletBalance = useAuthStore(s => s.setWalletBalance);
    const [pendingMovie, setPendingMovie] = useState<IMovie | null>(null);
    const [purchaseStatus, setPurchaseStatus] = useState<IContentPurchaseStatus>({active: false});
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showBetterTogetherModal, setShowBetterTogetherModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'rent' | 'buy' | null>(null);
    const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
    const [showTopMenu, setShowTopMenu] = useState(false);
    const [pauseTrailerForNavigation, setPauseTrailerForNavigation] = useState(false);
    const [resumeTrailerImmediately, setResumeTrailerImmediately] = useState(false);
    const [isBrowseAllResumeFlow, setIsBrowseAllResumeFlow] = useState(false);
    const [isTrailerManuallyPaused, setIsTrailerManuallyPaused] = useState(false);
    const [isTrailerHorizontal, setIsTrailerHorizontal] = useState(false);
    const ignoreTrailerToggleUntilRef = useRef(0);
    const [activeTrailerMovieId, setActiveTrailerMovieId] = useState<string | null>(null);
    const [trailerDurationSec, setTrailerDurationSec] = useState(0);
    const [trailerProgressSec, setTrailerProgressSec] = useState(0);
    const [trailerResumePositionByMovie, setTrailerResumePositionByMovie] = useState<Record<string, number>>({});
    const [startedTrailerByMovie, setStartedTrailerByMovie] = useState<Record<string, boolean>>({});
    const trailerVideoRef = useRef<Video | null>(null);

    useEffect(() => {
        getUserWallet()
            .then(b => {
                if (b !== undefined) {
                    setWalletBalance(b);
                }
            })
            .catch(error => console.error('SoloSessionScreen: wallet fetch failed', error));
    }, [setWalletBalance]);

    const pendingRentCost = pendingMovie?.rentalPrice != null ? Number(pendingMovie.rentalPrice) : 0;
    const pendingBuyCost = pendingMovie?.buyPrice != null ? Number(pendingMovie.buyPrice) : 0;
    const pendingRentalLabel =
        pendingMovie?.rentable && pendingRentCost && pendingMovie?.rentalDurationHrs
            ? `${pendingMovie.rentalDurationHrs}h rental for ${pendingRentCost} AD`
            : undefined;
    const pendingBuyLabel =
        pendingMovie?.buyable && pendingBuyCost ? `Buy for ${pendingBuyCost} AD` : undefined;
    const canRent = balance >= pendingRentCost;
    const canBuy = balance >= pendingBuyCost;

    // --- Favourite / Watchlist flow ---
    // Tap toggles the watchlist directly (no confirm/result dialogs). The icon
    // re-renders from `isInWatchlist(...)` once the API call resolves.
    const [watchlist, setWatchlist] = useState<IMovie[]>([]);
    const [pendingWatchlistMovieId, setPendingWatchlistMovieId] = useState<string | null>(null);

    /** Returns true when the given movie id is currently saved in the user's watchlist. */
    const isInWatchlist = React.useCallback(
        (movieId: string | undefined) => !!movieId && watchlist.some(movie => movie.id === movieId),
        [watchlist],
    );

    useFocusEffect(
        React.useCallback(() => {
            if (!userId) {
                return;
            }
            let isActive = true;
            (async () => {
                try {
                    const watchlistMovies = await getWatchlist(userId);
                    if (isActive) {
                        setWatchlist(watchlistMovies);
                    }
                } catch (error) {
                    console.error('SoloSessionScreen: fetch watchlist failed', error);
                }
            })();
            return () => {
                isActive = false;
            };
        }, [userId]),
    );

    const handleToggleFavourite = async (movie: IMovie) => {
        if (!movie?.id) {
            return;
        }
        // Guard against rapid double-taps on the same card.
        if (pendingWatchlistMovieId === movie.id) {
            return;
        }
        setPendingWatchlistMovieId(movie.id);
        const wasInWatchlist = isInWatchlist(movie.id);
        try {
            if (wasInWatchlist) {
                const success = await removeFromWatchlist(movie.id);
                if (success) {
                    setWatchlist(prev => prev.filter(m => m.id !== movie.id));
                }
            } else {
                const success = await addToWatchlist(movie.id);
                if (success) {
                    setWatchlist(prev => (prev.some(m => m.id === movie.id) ? prev : [...prev, movie]));
                }
            }
        } catch (error) {
            console.error('SoloSessionScreen: watchlist toggle failed', error);
        } finally {
            setPendingWatchlistMovieId(null);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadTopRated = async () => {
            try {
                // No genre filter ⇒ fetch all movies, then sort by rating desc.
                // Mirrors the convention used in `Home/index.tsx` for the Top Rated rail.
                const movies = await findMovies('');
                if (!isMounted) {
                    return;
                }
                const sorted = [...movies]
                    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                    .slice(0, TOP_RATED_LIMIT);
                setTopRatedMovies(sorted);
            } catch (error) {
                console.error('SoloSessionScreen: failed to load top rated movies', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        void loadTopRated();
        return () => {
            isMounted = false;
        };
    }, []);

    /**
     * Re-snap the FlatList to the currently active card whenever:
     *   - the deck height changes (e.g., safe-area / status-bar insets shift
     *     after returning from ContentPlayer's orientation lock), or
     *   - the screen regains focus (e.g., user pressed back from the player).
     *
     * Without this, the scroll offset (in pixels) recorded before navigation
     * away no longer aligns with the new item height, so the user lands
     * parked between two cards.
     */
    const realignToActiveCard = React.useCallback(() => {
        if (topRatedMovies.length === 0) {
            return;
        }
        const targetIndex = Math.min(activeIndex, topRatedMovies.length - 1);
        listRef.current?.scrollToIndex({index: targetIndex, animated: false});
    }, [activeIndex, topRatedMovies.length]);

    useEffect(() => {
        realignToActiveCard();
    }, [listHeight, realignToActiveCard]);

    useFocusEffect(
        React.useCallback(() => {
            // Defer one frame so the FlatList has finished its post-focus layout pass.
            const timer = setTimeout(realignToActiveCard, 0);
            return () => clearTimeout(timer);
        }, [realignToActiveCard]),
    );

    useFocusEffect(
        React.useCallback(() => {
            // Resume trailer playback after coming back from Browse All/Home.
            if (pauseTrailerForNavigation) {
                setPauseTrailerForNavigation(false);
                setResumeTrailerImmediately(isBrowseAllResumeFlow);
            }
            return () => {};
        }, [isBrowseAllResumeFlow, pauseTrailerForNavigation]),
    );

    useEffect(() => {
        if (!resumeTrailerImmediately) {
            return;
        }
        const timer = setTimeout(() => {
            setResumeTrailerImmediately(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [resumeTrailerImmediately]);

    useEffect(() => {
        const activeMovie = topRatedMovies[activeIndex];
        setActiveTrailerMovieId(activeMovie?.id ?? null);
        setTrailerProgressSec(0);
        setTrailerDurationSec(0);
        setIsTrailerManuallyPaused(false);
        setIsTrailerHorizontal(false);
        // Outside Browse All return flow, always start trailers from 0.
        if (!isBrowseAllResumeFlow) {
            setTrailerResumePositionByMovie({});
            setStartedTrailerByMovie({});
        }
    }, [activeIndex, topRatedMovies]);

    useEffect(() => {
        const activeMovie = topRatedMovies[activeIndex];
        const trailerUrl = activeMovie?.trailerURL?.trim() ?? '';
        const canPlayTrailer = trailerUrl.length > 0;
        const shouldStartNow =
            isFocused &&
            !pauseTrailerForNavigation &&
            !isSwiping &&
            (isTrailerAutoplayReady || resumeTrailerImmediately) &&
            canPlayTrailer &&
            !!activeMovie?.id;

        if (!shouldStartNow || !activeMovie?.id) {
            return;
        }
        setStartedTrailerByMovie(prev => {
            if (prev[activeMovie.id]) {
                return prev;
            }
            return {...prev, [activeMovie.id]: true};
        });
    }, [
        activeIndex,
        isFocused,
        isSwiping,
        isTrailerAutoplayReady,
        pauseTrailerForNavigation,
        resumeTrailerImmediately,
        topRatedMovies,
    ]);

    useEffect(() => {
        // Start trailer only after the user remains on the same card for 2s.
        setIsTrailerAutoplayReady(false);
        if (isSwiping || topRatedMovies.length === 0) {
            return;
        }
        const timer = setTimeout(() => {
            setIsTrailerAutoplayReady(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, [activeIndex, isSwiping, topRatedMovies.length]);

    const handlePressNext = () => {
        if (topRatedMovies.length === 0) {
            return;
        }
        const nextIndex = activeIndex + 1 >= topRatedMovies.length ? 0 : activeIndex + 1;
        setIsSwiping(true);
        listRef.current?.scrollToIndex({index: nextIndex, animated: true});

        // Programmatic scrolls don't always trigger onMomentumScrollEnd reliably.
        // We manually update the index and clear swiping state after the animation.
        setTimeout(() => {
            setActiveIndex(nextIndex);
            setIsSwiping(false);
        }, 600);
    };

    const handlePressInvite = (movie: IMovie) => {
        if (!movie?.id) {
            console.warn('SoloSessionScreen: handlePressInvite called without a valid movie');
            return;
        }
        navigateToMITDateSchedule(
            {
                id: movie.id,
                title: movie.title,
                portraitURL: movie.portraitURL,
                year: movie.year,
            },
            navigation,
        );
    };

    /**
     * Mirror of `ContentDetailScreen.playContent`. Pushes `ContentPlayer` onto
     * the parent `NoBottomTabStack` and opts into the player's `goBack` return
     * mode so the system back button returns to this screen instead of the
     * default ClientTabNavigator tab (Crummunity).
     */
    const playContent = (movie: IMovie) => {
        parentNavigation.navigate('ContentPlayer', {
            id: movie.id,
            movieURL: movie.movieURL,
            landscapeURL: movie.landscapeURL,
            title: movie.title,
            returnTo: 'goBack',
        });
    };

    /**
     * Mirror of `ContentDetailScreen.handlePrimary` (the "Play for Free" press
     * method). If the movie is paid and not yet purchased by the user, show
     * the rent/buy modal; otherwise jump straight to the player.
     */
    const handlePressWatchSolo = async (movie: IMovie) => {
        if (!movie?.id) {
            return;
        }
        setPendingMovie(movie);
        setIsTrailerManuallyPaused(true);
        setShowBetterTogetherModal(true);
    };

    const proceedToWatchSolo = async (movie: IMovie) => {
        if (!movie?.id) {
            return;
        }
        setShowBetterTogetherModal(false);

        let status: IContentPurchaseStatus = {active: false};
        try {
            status = await getMoviePurchaseStatus(movie.id);
            setPurchaseStatus(status);
        } catch (error) {
            console.error('SoloSessionScreen: getMoviePurchaseStatus failed', error);
        }

        if (!status.active && (movie.rentable || movie.buyable)) {
            setShowPurchaseModal(true);
            return;
        }
        playContent(movie);
    };

    const handleRent = () => {
        setShowPurchaseModal(false);
        setConfirmAction('rent');
    };

    const handleBuy = () => {
        setShowPurchaseModal(false);
        setConfirmAction('buy');
    };

    const runPurchase = async () => {
        if (!confirmAction || !pendingMovie?.id) {
            setConfirmAction(null);
            return;
        }
        const action = confirmAction;
        setConfirmAction(null);
        setIsProcessingPurchase(true);

        let ok = false;
        try {
            ok = action === 'rent' ? await rentMovie(pendingMovie.id) : await buyMovie(pendingMovie.id);
            if (ok) {
                setPurchaseStatus({active: true});
            }
        } catch (error) {
            console.error('SoloSessionScreen: purchase failed', error);
        } finally {
            setIsProcessingPurchase(false);
        }

        if (ok) {
            playContent(pendingMovie);
        }
    };

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.topBar}>
                <Pressable onPress={() => navigation.goBack()} style={styles.topIconButton}>
                    <Icon name="arrow-left" type="material-community" size={22} color={COLORS.WHITE} />
                </Pressable>
                <Text style={styles.topTitle}>Solo Session</Text>
                <Pressable style={styles.topIconButton} onPress={() => setShowTopMenu(true)}>
                    <Icon name="tune-variant" type="material-community" size={20} color={COLORS.WHITE} />
                </Pressable>
            </View>

            <View style={styles.deckWrap}>
                {isLoading && topRatedMovies.length === 0 ? (
                    <View style={styles.centeredState}>
                        <ActivityIndicator size="large" color={COLORS.WHITE} />
                    </View>
                ) : topRatedMovies.length === 0 ? (
                    <View style={styles.centeredState}>
                        <Text style={styles.emptyStateText}>No top-rated movies right now. Pull back later.</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={listRef}
                        data={topRatedMovies}
                        style={styles.list}
                        keyExtractor={item => item.id}
                        pagingEnabled
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        decelerationRate="fast"
                        onScrollBeginDrag={() => setIsSwiping(true)}
                        onMomentumScrollBegin={() => setIsSwiping(true)}
                        onLayout={event => {
                            const height = event.nativeEvent.layout.height;
                            if (height > 0 && height !== listHeight) {
                                setListHeight(height);
                            }
                        }}
                        getItemLayout={(_, index) => ({
                            length: listHeight,
                            offset: listHeight * index,
                            index,
                        })}
                        onMomentumScrollEnd={event => {
                            const index = Math.round(event.nativeEvent.contentOffset.y / listHeight);
                            setActiveIndex(index);
                            setIsSwiping(false);
                        }}
                        onScrollEndDrag={() => setIsSwiping(false)}
                        renderItem={({item, index}) => {
                            const portraitSource = item.portraitURL ? {uri: item.portraitURL} : FALLBACK_PORTRAIT;
                            const tags = (item.genres ?? []).slice(0, 3);
                            const trailerUrl = item.trailerURL?.trim() ?? '';
                            const canPlayTrailer = trailerUrl.length > 0;
                            const isActiveCard = index === activeIndex;
                            const shouldAutoplayTrailer =
                                isFocused &&
                                !pauseTrailerForNavigation &&
                                isActiveCard &&
                                !isSwiping &&
                                !isTrailerManuallyPaused &&
                                (isTrailerAutoplayReady || resumeTrailerImmediately) &&
                                canPlayTrailer;
                            const shouldRenderTrailerVideo =
                                isActiveCard && canPlayTrailer && (shouldAutoplayTrailer || !!startedTrailerByMovie[item.id]);
                            const showTrailerProgress = shouldAutoplayTrailer && activeTrailerMovieId === item.id;
                            const trailerProgressRatio =
                                trailerDurationSec > 0
                                    ? Math.max(0, Math.min(1, trailerProgressSec / trailerDurationSec))
                                    : 0;
                            return (
                                <View style={[styles.card, {height: listHeight}]}>
                                    <ImageBackground
                                        source={portraitSource}
                                        style={styles.backgroundImage}
                                        resizeMode="cover"
                                        blurRadius={isActiveCard && isTrailerHorizontal ? 2 : 0}>
                                        {isActiveCard && isTrailerHorizontal && (
                                            <LinearGradient
                                                colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
                                                style={StyleSheet.absoluteFillObject}
                                            />
                                        )}
                                        {shouldRenderTrailerVideo ? (
                                            <Video
                                                ref={ref => {
                                                    trailerVideoRef.current = ref;
                                                }}
                                                style={
                                                    isTrailerHorizontal
                                                        ? {
                                                              position: 'absolute',
                                                              left: 0,
                                                              right: 0,
                                                              width: '100%',
                                                              height: 200,
                                                              top: (listHeight - 200) / 2,
                                                          }
                                                        : StyleSheet.absoluteFillObject
                                                }
                                                pointerEvents="none"
                                                source={{uri: trailerUrl}}
                                                resizeMode="cover"
                                                repeat
                                                muted
                                                paused={!shouldAutoplayTrailer}
                                                onLoad={event => {
                                                    setActiveTrailerMovieId(item.id);
                                                    setTrailerDurationSec(event.duration ?? 0);
                                                    const resumeAt =
                                                        isBrowseAllResumeFlow && resumeTrailerImmediately
                                                            ? (trailerResumePositionByMovie[item.id] ?? 0)
                                                            : 0;
                                                    if (resumeAt > 0 && isBrowseAllResumeFlow) {
                                                        setTimeout(() => {
                                                            trailerVideoRef.current?.seek(resumeAt);
                                                            setTrailerProgressSec(resumeAt);
                                                        }, 0);
                                                        // Use resume once for Browse All return, then clear.
                                                        setTrailerResumePositionByMovie({});
                                                        setIsBrowseAllResumeFlow(false);
                                                    } else {
                                                        setTrailerProgressSec(0);
                                                    }
                                                }}
                                                onProgress={event => {
                                                    if (activeTrailerMovieId !== item.id) {
                                                        return;
                                                    }
                                                    setTrailerProgressSec(event.currentTime ?? 0);
                                                }}
                                            />
                                        ) : null}
                                        {shouldRenderTrailerVideo && isActiveCard && isTrailerManuallyPaused ? (
                                            <View style={styles.pausedIndicatorWrap} pointerEvents="none">
                                                <View style={styles.pausedIndicatorButton}>
                                                    <Icon name="pause" type="ionicon" color={COLORS.WHITE} size={26} />
                                                </View>
                                            </View>
                                        ) : null}
                                        <LinearGradient
                                            colors={['rgba(3,3,10,0.25)', 'rgba(8,7,20,0.78)', 'rgba(4,4,10,0.96)']}
                                            locations={[0.1, 0.58, 1]}
                                            style={styles.backgroundOverlay}>
                                            {showTrailerProgress ? (
                                                <View style={styles.trailerProgressWrap}>
                                                    <View style={styles.trailerProgressBarTrack}>
                                                        <View
                                                            style={[
                                                                styles.trailerProgressBarFill,
                                                                {width: `${trailerProgressRatio * 100}%`},
                                                            ]}
                                                        />
                                                    </View>
                                                    <View style={styles.trailerProgressTextRow}>
                                                        <Text style={styles.trailerProgressText}>
                                                            {formatSecondsLabel(trailerProgressSec)}
                                                        </Text>
                                                        <Text style={styles.trailerProgressText}>
                                                            {formatSecondsLabel(trailerDurationSec)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ) : null}
                                            <Pressable
                                                style={styles.trailerToggleZone}
                                                onPress={() => {
                                                    if (Date.now() < ignoreTrailerToggleUntilRef.current) {
                                                        return;
                                                    }
                                                    if (!isActiveCard || !canPlayTrailer) {
                                                        return;
                                                    }
                                                    setIsTrailerManuallyPaused(prev => !prev);
                                                }}
                                            />
                                                <View style={styles.bottomContentWrap}>
                                                <View style={styles.metaWrap}>
                                                    <Text style={styles.title} numberOfLines={2}>
                                                        {item.title}
                                                    </Text>
                                                    {item.year ? <Text style={styles.subtitle}>{item.year}</Text> : null}
                                                    {tags.length > 0 ? (
                                                        <View style={styles.tagRow}>
                                                            {tags.map(tag => (
                                                                <Text key={`${item.id}-${tag}`} style={styles.tag}>
                                                                    {tag}
                                                                </Text>
                                                            ))}
                                                        </View>
                                                    ) : null}
                                                    <Text style={styles.vibeText}>{vibeText}</Text>
                                                    {item.description ? (
                                                        <Text style={styles.description} numberOfLines={3}>
                                                            {item.description}
                                                        </Text>
                                                    ) : null}
                                                    <View style={styles.footerMetaRow}>
                                                        <Text style={styles.footerMeta}>{formatRating(item.rating)}</Text>
                                                        <Text style={styles.footerMeta}>{formatDurationLabel(item.duration)}</Text>
                                                        <Icon
                                                            name="film-outline"
                                                            type="ionicon"
                                                            color="rgba(255,255,255,0.72)"
                                                            size={14}
                                                        />
                                                    </View>
                                                </View>

                                                <View style={styles.rightActions}>
                                                    <View style={styles.actionItemWrap}>
                                                        <Pressable
                                                            style={styles.roundAction}
                                                            onPress={() => {
                                                                ignoreTrailerToggleUntilRef.current = Date.now() + 400;
                                                                setIsTrailerHorizontal(prev => !prev);
                                                                setIsTrailerAutoplayReady(true);
                                                                setIsTrailerManuallyPaused(false);
                                                            }}>
                                                            <Icon
                                                                name="phone-rotate-landscape"
                                                                type="material-community"
                                                                color={COLORS.WHITE}
                                                                size={22}
                                                            />
                                                        </Pressable>
                                                        <Text style={styles.actionLabel}>
                                                            {isTrailerHorizontal ? 'Vertical' : 'Horizontal'}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.actionItemWrap}>
                                                        <Pressable style={styles.roundAction} onPress={() => handlePressInvite(item)}>
                                                            <Icon name="heart" type="material-community" color="#FF5FB8" size={28} />
                                                        </Pressable>
                                                        <Text style={styles.actionLabel}>Invite</Text>
                                                    </View>
                                                    <View style={styles.actionItemWrap}>
                                                        <Pressable
                                                            style={[styles.roundAction, styles.roundActionPrimary]}
                                                            disabled={isProcessingPurchase && pendingMovie?.id === item.id}
                                                            onPress={() => handlePressWatchSolo(item)}>
                                                            {isProcessingPurchase && pendingMovie?.id === item.id ? (
                                                                <ActivityIndicator size="small" color={COLORS.WHITE} />
                                                            ) : (
                                                                <Icon name="play" type="ionicon" color={COLORS.WHITE} size={20} />
                                                            )}
                                                        </Pressable>
                                                        <Text style={styles.actionLabel}>Watch Solo</Text>
                                                    </View>
                                                    <View style={styles.actionItemWrap}>
                                                        <Pressable
                                                            style={styles.roundAction}
                                                            disabled={pendingWatchlistMovieId === item.id}
                                                            onPress={() => handleToggleFavourite(item)}>
                                                            {pendingWatchlistMovieId === item.id ? (
                                                                <ActivityIndicator size="small" color={COLORS.WHITE} />
                                                            ) : (
                                                                <Icon
                                                                    name={isInWatchlist(item.id) ? 'star' : 'star-outline'}
                                                                    type="ionicon"
                                                                    color={isInWatchlist(item.id) ? COLORS.STARGOLD : COLORS.WHITE}
                                                                    size={22}
                                                                />
                                                            )}
                                                        </Pressable>
                                                        <Text style={styles.actionLabel}>
                                                            {isInWatchlist(item.id) ? 'Unfavourite' : 'Favourite'}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.actionItemWrap}>
                                                        <Pressable style={styles.roundAction} onPress={handlePressNext}>
                                                            <Icon name="refresh" type="material-community" color={COLORS.WHITE} size={20} />
                                                        </Pressable>
                                                        <Text style={styles.actionLabel}>Next</Text>
                                                    </View>

                                                </View>
                                                </View>
                                        </LinearGradient>
                                    </ImageBackground>
                                </View>
                            );
                        }}
                    />
                )}
            </View>

            <BetterTogetherModal
                visible={showBetterTogetherModal}
                movie={pendingMovie}
                onClose={() => {
                    setShowBetterTogetherModal(false);
                    setIsTrailerManuallyPaused(false);
                }}
                onSendInvite={() => {
                    setShowBetterTogetherModal(false);
                    if (pendingMovie) handlePressInvite(pendingMovie);
                }}
                onWatchSolo={() => {
                    if (pendingMovie) proceedToWatchSolo(pendingMovie);
                }}
            />

            {pendingMovie && !purchaseStatus.active && (pendingMovie.rentable || pendingMovie.buyable) && (
                <ContentPurchaseModal
                    visible={showPurchaseModal}
                    onClose={() => setShowPurchaseModal(false)}
                    onRent={handleRent}
                    onBuy={handleBuy}
                    rentalLabel={pendingRentalLabel}
                    buyLabel={pendingBuyLabel}
                    canRent={canRent}
                    canBuy={canBuy}
                    rentalPrice={pendingRentCost}
                    buyPrice={pendingBuyCost}
                    balance={balance}
                />
            )}

            {confirmAction != null && (
                <Modal transparent animationType="fade" visible onRequestClose={() => setConfirmAction(null)}>
                    <ComfirmationModal
                        confirmationText={
                            confirmAction === 'rent'
                                ? `Rent this movie for ${pendingRentCost} AD? This cannot be undone.`
                                : `Buy this movie for ${pendingBuyCost} AD? This cannot be undone.`
                        }
                        onPressYes={runPurchase}
                        onPressNo={() => setConfirmAction(null)}
                    />
                </Modal>
            )}

            <Modal
                animationType="fade"
                transparent
                visible={showTopMenu}
                onRequestClose={() => setShowTopMenu(false)}>
                <View style={{flex: 1}}>
                    <Pressable
                        style={[StyleSheet.absoluteFillObject, {backgroundColor: 'rgba(0, 0, 0, 0.45)'}]}
                        onPress={() => setShowTopMenu(false)}
                    />
                    <View
                        style={{
                            position: 'absolute',
                            top: insets.top + 52,
                            right: 12,
                            backgroundColor: COLORS.BLACK,
                            borderRadius: 12,
                            paddingVertical: 6,
                            minWidth: 216,
                            borderWidth: 1,
                            borderColor: COLORS.LIGHTGREY,
                        }}>
                        <Pressable
                            style={{paddingHorizontal: 14, paddingVertical: 12}}
                            onPress={() => {
                                setShowTopMenu(false);
                                if (activeTrailerMovieId && trailerProgressSec > 0) {
                                    setTrailerResumePositionByMovie(prev => ({
                                        ...prev,
                                        [activeTrailerMovieId]: trailerProgressSec,
                                    }));
                                }
                                setIsBrowseAllResumeFlow(true);
                                setPauseTrailerForNavigation(true);
                                navigation.navigate('HomeScreen');
                            }}>
                            <Text style={{...FONTS.Title2, color: COLORS.WHITE}}>Browse All</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    deckWrap: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyStateText: {
        ...FONTS.paragraph4,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    topBar: {
        position: 'absolute',
        top: 4,
        left: 0,
        right: 0,
        zIndex: 20,
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
    },
    card: {
        width: SIZES.ScreenWidth,
        borderRadius: 0,
        overflow: 'hidden',
        alignSelf: 'center',
        borderWidth: 0,
    },
    backgroundImage: {
        flex: 1,
    },
    backgroundOverlay: {
        flex: 1,
        paddingHorizontal: 14,
    },
    trailerToggleZone: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 480,
        zIndex: 4,
    },
    pausedIndicatorWrap: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    pausedIndicatorButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 1.2,
        borderColor: 'rgba(255,255,255,0.7)',
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trailerProgressWrap: {
        marginTop: 52,
        marginBottom: 8,
    },
    trailerProgressBarTrack: {
        height: 4,
        width: '100%',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.35)',
        overflow: 'hidden',
    },
    trailerProgressBarFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: COLORS.AKCRUBLUE,
    },
    trailerProgressTextRow: {
        marginTop: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    trailerProgressText: {
        ...FONTS.paragraph6,
        color: COLORS.WHITE,
    },
    topIconButton: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
    },
    bottomContentWrap: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: 18,
        zIndex: 3,
    },
    rightActions: {
        justifyContent: 'flex-end',
        gap: 10,
        marginBottom: 12,
        marginLeft: 12,
        alignItems: 'center',
    },
    actionItemWrap: {
        alignItems: 'center',
    },
    roundAction: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        backgroundColor: 'rgba(15, 12, 28, 0.8)',
    },
    roundActionPrimary: {
        borderColor: 'rgba(207,162,255,0.9)',
        backgroundColor: 'rgba(124, 58, 237, 0.85)',
    },
    actionLabel: {
        ...FONTS.paragraph6,
        marginTop: 4,
        color: COLORS.WHITE,
    },
    metaWrap: {
        flex: 1,
        paddingRight: 8,
    },
    title: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
    },
    subtitle: {
        ...FONTS.paragraph4,
        color: '#B794FF',
        letterSpacing: 2,
        marginTop: 2,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 8,
    },
    tag: {
        ...FONTS.Title2Orange,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginHorizontal: 2,
        borderRadius: 4,
        textAlign: 'center',
    },
    vibeText: {
        ...FONTS.paragraph2,
        marginTop: 10,
        color: '#D6B8FF',
    },
    description: {
        ...FONTS.paragraph5,
        marginTop: 8,
        color: 'rgba(255,255,255,0.82)',
        lineHeight: 18,
        maxWidth: '90%',
    },
    footerMetaRow: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    footerMeta: {
        ...FONTS.paragraph6,
        color: 'rgba(255,255,255,0.8)',
    },
});
