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
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import PremiereHeroImage from './PremiereHeroImage';
import {IMovie} from '../../../../types';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {findMovies, getPurchasedMovies} from '../../../lib/api/movies.lib';
import {useHideBottomTabBarWhileFocused} from '../../ChatScreens/useHideBottomTabBarWhileFocused';
import styles from './styles';
import {COLORS, SIZES} from '../../../../assets/constants';
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

export default function PpvScreen({navigation}: Props) {
    useHideBottomTabBarWhileFocused(navigation);

    const listRef = useRef<FlatList<IMovie>>(null);
    const [rentableMovies, setRentableMovies] = useState<IMovie[]>([]);
    const [purchasedMovieIds, setPurchasedMovieIds] = useState<Set<string>>(() => new Set());
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoadingMovies, setIsLoadingMovies] = useState(true);

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
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
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
        <View style={styles.headerOverlay} pointerEvents="box-none">
            <View style={styles.headerRow}>
                <Text style={styles.brandTitle}>AKCRU</Text>
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    accessibilityRole="button"
                    accessibilityLabel="Skip">
                    <Text style={styles.skipLabel}>SKIP</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screenBody}>
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
        </SafeAreaView>
    );
}
