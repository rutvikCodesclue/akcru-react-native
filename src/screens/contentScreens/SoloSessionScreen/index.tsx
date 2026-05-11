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
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';

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
import type {IMovie} from '../../../../types';

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

export default function SoloSessionScreen({route}: Props) {
    const navigation = useNavigation<SoloSessionScreenNavigationProp>();
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
    const listRef = useRef<FlatList<IMovie>>(null);

    // --- Watch Solo / purchase flow (mirrors ContentDetailScreen.handlePrimary) ---
    const userId = useAuthStore(s => s.user?.id);
    const rawBalance = useAuthStore(s => s.walletBalance);
    const balance = rawBalance != null ? Number(rawBalance) : 0;
    const setWalletBalance = useAuthStore(s => s.setWalletBalance);
    const [pendingMovie, setPendingMovie] = useState<IMovie | null>(null);
    const [purchaseStatus, setPurchaseStatus] = useState<IContentPurchaseStatus>({active: false});
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'rent' | 'buy' | null>(null);
    const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

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

    const handlePressNext = () => {
        if (topRatedMovies.length === 0) {
            return;
        }
        const nextIndex = activeIndex + 1 >= topRatedMovies.length ? 0 : activeIndex + 1;
        listRef.current?.scrollToIndex({index: nextIndex, animated: true});
        setActiveIndex(nextIndex);
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
                <Pressable style={styles.topIconButton}>
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
                        }}
                        renderItem={({item}) => {
                            const portraitSource = item.portraitURL ? {uri: item.portraitURL} : FALLBACK_PORTRAIT;
                            const tags = (item.genres ?? []).slice(0, 3);
                            return (
                                <View style={[styles.card, {height: listHeight}]}>
                                    <ImageBackground source={portraitSource} style={styles.backgroundImage} resizeMode="cover">
                                        <LinearGradient
                                            colors={['rgba(3,3,10,0.25)', 'rgba(8,7,20,0.78)', 'rgba(4,4,10,0.96)']}
                                            locations={[0.1, 0.58, 1]}
                                            style={styles.backgroundOverlay}>
                                            <View style={styles.centerPlayWrap}>
                                                <Pressable style={styles.playButton}>
                                                    <Icon name="play" type="ionicon" color={COLORS.WHITE} size={34} />
                                                </Pressable>
                                            </View>

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
                                                        <Icon name="film-outline" type="ionicon" color="rgba(255,255,255,0.72)" size={14} />
                                                    </View>
                                                </View>

                                                <View style={styles.rightActions}>
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
    centerPlayWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 74,
        height: 74,
        borderRadius: 37,
        borderWidth: 1.2,
        borderColor: 'rgba(255,255,255,0.6)',
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContentWrap: {
        minHeight: SIZES.ScreenHeight * 0.34,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: 18,
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
