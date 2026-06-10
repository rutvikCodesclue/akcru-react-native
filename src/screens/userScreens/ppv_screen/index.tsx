import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    NativeSyntheticEvent,
    NativeScrollEvent,
    ListRenderItem,
    Pressable,
    StyleSheet,
    Modal,
    BackHandler,
} from 'react-native';
import {Icon} from '@rneui/base';
import {Snackbar} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackScreenProps} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import PremiereHeroImage from './PremiereHeroImage';
import {IMovie} from '../../../../types';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {findMovies, getPurchasedMovies} from '../../../lib/api/movies.lib';
import useAuthStore from '../../../stores/auth.store';
import ConfirmationModal from '../../../components/ConfirmationModal';
import {reset as resetNavigation} from '../../../util/RootNavigation';
import {getPostAuthResetState} from '../../../util/postAuthNavigation';
import {useHideBottomTabBarWhileFocused} from '../../ChatScreens/useHideBottomTabBarWhileFocused';
import styles from './styles';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {isTablet} from '../../../../assets/constants/theme';
import {isCurrentFlowPpv, setIsCurrentFlowPpv} from '../../../util/config';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import PremiereTitle from './PremiereTitle';
import {
    buildPurchasedMovieIdSet,
    filterRentableMovies,
    getPremiereCreatorName,
    getPremierePosterUri,
    getPremiereQuote,
    isMoviePurchased,
} from './ppvHelpers';

type Props = StackScreenProps<UserProfileStackParams, 'PpvScreen'>;

const CONTINUE_GRADIENT = [COLORS.CATREDLGT, '#8B0505'];
const AKCRU_UNLOCK_TAP_COUNT = 12;
const AKCRU_TAP_RESET_MS = 2000;
const AKCRU_UNLOCK_NAVIGATE_DELAY_MS = 1200;

export default function PpvScreen({navigation, route}: Props) {
    useHideBottomTabBarWhileFocused(navigation);

    const [isPpvFlowEnabled, setIsPpvFlowEnabled] = useState(isCurrentFlowPpv);
    const isPpvFlowLocked = isPpvFlowEnabled && route.params?.fromPostAuth === true;
    const logout = useAuthStore(state => state.logout);
    const listRef = useRef<FlatList<IMovie>>(null);
    const akcruTapCountRef = useRef(0);
    const akcruTapResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigateOutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [rentableMovies, setRentableMovies] = useState<IMovie[]>([]);
    const [purchasedMovieIds, setPurchasedMovieIds] = useState<Set<string>>(() => new Set());
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoadingMovies, setIsLoadingMovies] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [showSignOutConfirmation, setShowSignOutConfirmation] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [unlockSnackbarVisible, setUnlockSnackbarVisible] = useState(false);

    useEffect(() => {
        const loadRentableMovies = async () => {
            setIsLoadingMovies(true);
            try {
                const [movies, purchasedMovies] = await Promise.all([
                    findMovies(),
                    getPurchasedMovies().catch(error => {
                        console.error('[PpvScreen] Failed to load purchased movies:', error);
                        return [] as IMovie[];
                    }),
                ]);
                const rentable = filterRentableMovies(Array.isArray(movies) ? movies : []);
                setRentableMovies(rentable);
                setPurchasedMovieIds(buildPurchasedMovieIdSet(purchasedMovies));
                setActiveIndex(0);
            } catch (error) {
                console.error('[PpvScreen] Failed to load rentable movies:', error);
                setRentableMovies([]);
                setPurchasedMovieIds(new Set());
                setActiveIndex(0);
            } finally {
                setIsLoadingMovies(false);
            }
        };

        loadRentableMovies();
    }, []);

    useEffect(() => {
        return () => {
            if (akcruTapResetTimeoutRef.current) {
                clearTimeout(akcruTapResetTimeoutRef.current);
            }
            if (navigateOutTimeoutRef.current) {
                clearTimeout(navigateOutTimeoutRef.current);
            }
        };
    }, []);

    const handleAkcruTap = () => {
        if (akcruTapResetTimeoutRef.current) {
            clearTimeout(akcruTapResetTimeoutRef.current);
        }

        akcruTapCountRef.current += 1;

        if (akcruTapCountRef.current >= AKCRU_UNLOCK_TAP_COUNT) {
            akcruTapCountRef.current = 0;
            setIsCurrentFlowPpv(false);
            setUnlockSnackbarVisible(true);
            navigateOutTimeoutRef.current = setTimeout(() => {
                resetNavigation(getPostAuthResetState('returning'));
            }, AKCRU_UNLOCK_NAVIGATE_DELAY_MS);
            return;
        }

        akcruTapResetTimeoutRef.current = setTimeout(() => {
            akcruTapCountRef.current = 0;
        }, AKCRU_TAP_RESET_MS);
    };

    useEffect(() => {
        if (!isPpvFlowLocked) {
            return;
        }

        const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
        const unsubscribe = navigation.addListener('beforeRemove', e => {
            const actionType = e.data.action.type;
            if (actionType === 'RESET' || actionType === 'REPLACE' || actionType === 'NAVIGATE') {
                return;
            }

            e.preventDefault();
        });

        return () => {
            subscription.remove();
            unsubscribe();
        };
    }, [isPpvFlowLocked, navigation]);

    const selectedMovie = rentableMovies[activeIndex] ?? null;

    const handleContinue = () => {
        if (!selectedMovie) {
            return;
        }
        navigation.navigate('PpvMovieScreen', {
            movie: selectedMovie,
            isPurchased: isMoviePurchased(selectedMovie.id, purchasedMovieIds),
        });
    };

    const handleSkip = () => {
        setMenuVisible(false);
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('access_token');
        await logout();
    };

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const nextIndex = Math.round(offsetX / SIZES.ScreenWidth);
        if (nextIndex >= 0 && nextIndex < rentableMovies.length) {
            setActiveIndex(nextIndex);
        }
    };

    const renderMoviePage: ListRenderItem<IMovie> = ({item}) => {
        const posterUri = getPremierePosterUri(item);
        const creatorName = getPremiereCreatorName(item);
        const quote = getPremiereQuote(item);

        return (
            <View style={styles.page}>
                <PremiereHeroImage uri={posterUri} />

                <View style={styles.pageSpacer} />

                <View style={styles.contentBlock}>
                    <PremiereTitle title={item.title} />
                    <Text style={styles.quoteText}>{quote}</Text>
                </View>
            </View>
        );
    };

    const renderHeader = () => (
        <View
            style={[styles.headerOverlay, menuVisible && styles.headerOverlayRaised]}
            pointerEvents="box-none">
            <View style={styles.headerRow}>
                <Pressable onPress={handleAkcruTap} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Text style={styles.brandTitle}>AKCRU</Text>
                </Pressable>
                <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    accessibilityRole="button"
                    accessibilityLabel="Open menu"
                    style={styles.menuButton}>
                    <CustomIcon
                        name="ellipsis-vertical"
                        type="ionicon"
                        color={COLORS.WHITE}
                        baseSize={isTablet() ? 22 : 18}
                    />
                </TouchableOpacity>
            </View>
            {menuVisible ? (
                <View style={styles.menuPopup}>
                    {!isPpvFlowLocked ? (
                        <>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleSkip}
                                accessibilityRole="button"
                                accessibilityLabel="Skip">
                                <Text style={styles.skipLabel}>SKIP</Text>
                            </TouchableOpacity>
                            <View style={styles.menuSeparator} />
                        </>
                    ) : null}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            setMenuVisible(false);
                            setShowSignOutConfirmation(true);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Sign out">
                        <View style={styles.menuItemRow}>
                            <Icon name="logout" type="material-community" color="#FF4D4F" size={20} />
                            <Text style={styles.signOutLabel}>Sign Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screenBody}>
                {menuVisible ? (
                    <Pressable
                        style={[StyleSheet.absoluteFillObject, styles.menuBackdrop]}
                        onPress={() => setMenuVisible(false)}
                    />
                ) : null}
                {isLoadingMovies ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.CATREDLGT} />
                    </View>
                ) : rentableMovies.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.emptyText}>No screenings are available right now.</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            ref={listRef}
                            style={styles.pager}
                            contentContainerStyle={styles.pagerContent}
                            data={rentableMovies}
                            keyExtractor={item => item.id}
                            renderItem={renderMoviePage}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            bounces={false}
                            onMomentumScrollEnd={handleMomentumScrollEnd}
                            getItemLayout={(_, index) => ({
                                length: SIZES.ScreenWidth,
                                offset: SIZES.ScreenWidth * index,
                                index,
                            })}
                        />

                        <View style={styles.footer}>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={handleContinue}
                                disabled={!selectedMovie}
                                accessibilityRole="button"
                                accessibilityLabel="Continue">
                                <LinearGradient
                                    colors={CONTINUE_GRADIENT}
                                    start={{x: 0, y: 0.5}}
                                    end={{x: 1, y: 0.5}}
                                    style={[
                                        styles.continueButton,
                                        !selectedMovie && styles.continueButtonDisabled,
                                    ]}>
                                    <Text style={styles.continueLabel}>CONTINUE</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.paginationRow}>
                                {rentableMovies.map((movie, index) => (
                                    <View
                                        key={movie.id}
                                        style={[
                                            styles.paginationDot,
                                            index === activeIndex
                                                ? styles.paginationDotActive
                                                : styles.paginationDotInactive,
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    </>
                )}

                {renderHeader()}
            </View>

            <Modal animationType="fade" transparent visible={showSignOutConfirmation}>
                <ConfirmationModal
                    onPressYes={async () => {
                        setShowSignOutConfirmation(false);
                        setIsLoggingOut(true);
                        try {
                            await handleLogout();
                            resetNavigation({
                                index: 0,
                                routes: [{name: 'Welcome', params: {fromLogout: true}}],
                            });
                        } catch (error) {
                            console.error('[PpvScreen] Failed to sign out:', error);
                        } finally {
                            setIsLoggingOut(false);
                        }
                    }}
                    onPressNo={() => setShowSignOutConfirmation(false)}
                    variant="continueWatching"
                    yesLabel="Sign Out"
                    noLabel="Cancel"
                    confirmationText="Are you sure you want to sign out?"
                />
            </Modal>

            <Modal animationType="fade" transparent visible={isLoggingOut}>
                <View style={styles.signOutLoaderOverlay}>
                    <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                    <Text style={styles.signOutLoaderText}>Signing out...</Text>
                </View>
            </Modal>

            <Snackbar
                visible={unlockSnackbarVisible}
                onDismiss={() => setUnlockSnackbarVisible(false)}
                duration={3000}>
                PPV flow unlocked
            </Snackbar>
        </SafeAreaView>
    );
}
