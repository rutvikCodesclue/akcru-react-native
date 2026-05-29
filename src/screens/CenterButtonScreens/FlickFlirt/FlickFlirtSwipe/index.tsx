import React, {useState, useRef, useCallback, useEffect} from 'react';
import {View, Text, SafeAreaView, ImageBackground, Image, Platform} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FLICK_FLIRT_IMAGE_OVERLAY_FULL_COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import imageindex from '../../../../../assets/images/imageindex';
import styles from './styles';
import {IMovie} from '../../../../../types';
import {findFlickFlirtMovies} from '../../../../lib/api/movies.lib';
import {submitFlickFlirtSwipeBatch} from '../../../../lib/api/flickflirt.lib';
import Swiper from 'react-native-deck-swiper';
import useAuthStore from '../../../../stores/auth.store';
import {capitalizeFirstLetterOfString} from '../../../../util/util';
import {isTablet} from '../../../../../assets/constants/theme';
import {archetypeMapping} from '../../../../../assets/constants/archetypeMapping';
import {MOVIE_GENRES} from '../../../../../assets/constants/Data';
import {AppLoadingModal} from '../../../../components/Loading';

/** Normalize API genre string to match archetypeMapping keys (e.g. "SciFi", "Drama") */
function normalizeGenre(genre: string | undefined): string | null {
    if (!genre || !genre.trim()) return null;
    const g = genre.trim();
    const found = MOVIE_GENRES.find(item => item.id !== '0' && item.genre.toLowerCase() === g.toLowerCase());
    if (found) return found.genre;
    return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
}

const FlickFlirtSwipe = () => {
    const bottomHintsHeight = isTablet() ? 100 : SIZES.ScreenHeight * 0.2;
    const cardBottomGap = isTablet() ? 18 : 0;
    const cardHeight = isTablet()
        ? SIZES.ScreenHeight - bottomHintsHeight - cardBottomGap
        : SIZES.ScreenHeight * 0.8;
    const [movies, setMovies] = useState<IMovie[]>([]);
    const [swipeResult, setSwipeResult] = useState<null | 'LIKE' | 'NOPE'>(null);
    const [isLoadingMovies, setIsLoadingMovies] = useState(true);
    const [isIntroLoading, setIsIntroLoading] = useState(true);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const showLoader = isIntroLoading || isLoadingMovies;
    const rightSwipedGenreCounts = useRef<Record<string, number>>({});
    const sessionSwipesRef = useRef<{movieId: string; type: 'LIKE' | 'DISLIKE'}[]>([]);

    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {hydrateUser} = useAuthStore();

    useFocusEffect(
        useCallback(() => {
            setIsIntroLoading(true);
            setIsLoadingMovies(true);
            setCurrentCardIndex(0);
            const introTimer = setTimeout(() => setIsIntroLoading(false), 3000);
            findFlickFlirtMovies()
                .then(setMovies)
                .catch(console.error)
                .finally(() => setIsLoadingMovies(false));
            rightSwipedGenreCounts.current = {};
            sessionSwipesRef.current = [];
            return () => clearTimeout(introTimer);
        }, []),
    );

    useEffect(() => {
        if (movies.length > 0) setCurrentCardIndex(0);
    }, [movies.length]);

    useFocusEffect(
        useCallback(() => {
            hydrateUser();
            return () => {
                hydrateUser();
            };
        }, [hydrateUser]),
    );

    const handleSwipe = (movieId: string, type: 'LIKE' | 'DISLIKE', movie?: IMovie) => {
        sessionSwipesRef.current.push({movieId, type});
        if (type === 'LIKE' && movie?.genres?.length) {
            const counts = rightSwipedGenreCounts.current;
            [movie.genres[0], movie.genres[1]].forEach(g => {
                const norm = normalizeGenre(g);
                if (norm) counts[norm] = (counts[norm] ?? 0) + 1;
            });
        }
    };

    const onSwipedAll = async () => {
        try {
            if (sessionSwipesRef.current.length > 0) {
                await submitFlickFlirtSwipeBatch(sessionSwipesRef.current);
            }
        } catch (error) {
            console.error('Error submitting swipe batch:', error);
        }
        const counts = rightSwipedGenreCounts.current;
        const sorted = Object.entries(counts)
            .filter(([, c]) => c > 0)
            .sort((a, b) => b[1] - a[1]);
        const topTwo = sorted.slice(0, 2).map(([genre]) => genre);
        console.log("topTwo----",topTwo);
        if (topTwo.length >= 2) {
            const archetypeKey = [...topTwo].sort().join(', ');
            const selectedArchetype = archetypeMapping[archetypeKey];
            if (selectedArchetype) {
                console.log('[FlickFlirt Archetype]', {
                    archetypeName: selectedArchetype.name,
                    likedGenres: topTwo,
                    genreCounts: Object.fromEntries(sorted.slice(0, 2)),
                });
                navigation.navigate('FlickFlirtArchetypeResult', {
                    name: selectedArchetype.name,
                    image: selectedArchetype.image,
                    description: selectedArchetype.description,
                    genres: topTwo,
                });
                return;
            }
        }
        navigation.navigate('FlickFlirtPrefAll');
    };

    return (
        <View style={{flex: 1}}>
            <ImageBackground
                source={showLoader ? imageindex.BgImageSM : imageindex.FLickFlirt}
                resizeMode="cover"
                style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                <SafeAreaView style={{flex: 1}}>
                    <LinearGradient
                        colors={
                            showLoader
                                ? [...FLICK_FLIRT_IMAGE_OVERLAY_FULL_COLORS]
                                : [COLORS.AKCRUBACKGROUND, COLORS.TRANSPARENT, COLORS.AKCRUBACKGROUND]
                        }
                        style={{position: 'absolute', left: 0, right: 0, top: 0, height: SIZES.ScreenHeight}}
                    />

                    {!showLoader && movies.length > 0 && (
                        <View
                            pointerEvents="none"
                            style={{
                                position: 'absolute',
                                top: isTablet() ? 8 : 6,
                                left: isTablet() ? 14 : 10,
                                right: isTablet() ? 14 : 10,
                                zIndex: 60,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <View style={{flex: 1, flexDirection: 'row', marginRight: 10}}>
                                {movies.map((_, index) => (
                                    <View
                                        key={`swipe-step-${index}`}
                                        style={{
                                            flex: 1,
                                            height: 3,
                                            borderRadius: 3,
                                            marginHorizontal: 2,
                                            backgroundColor:
                                                index <= currentCardIndex ? COLORS.AKCRUBLUE : COLORS.OVERLAY_WHITE_35,
                                        }}
                                    />
                                ))}
                            </View>
                            <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>
                                {Math.min(currentCardIndex + 1, movies.length)}/{movies.length}
                            </Text>
                        </View>
                    )}
                    {!showLoader && movies.length > 0 && (
                        <View
                            pointerEvents="none"
                            style={{
                                position: 'absolute',
                                top: isTablet() ? 48 : 44,
                                left: 0,
                                right: 0,
                                alignItems: 'center',
                                zIndex: 60,
                            }}>
                            <Text style={[FONTS.HeroTitle, {color: COLORS.WHITE, fontSize: isTablet() ? 40 : 20}]}>
                                Pick what you'd watch
                            </Text>
                            <Text style={[FONTS.Title2, {color: COLORS.AKCRUBLUE}]}>Trust your instinct</Text>
                        </View>
                    )}

                    <View style={{flex: 1, paddingBottom: bottomHintsHeight + cardBottomGap}}>
                        {!showLoader && movies.length > 0 ? (
                            <Swiper
                                cards={movies}
                                renderCard={(movie: IMovie, cardIndex: number) => (
                                    <View style={[styles.card, {height: cardHeight}]}>
                                        <ImageBackground
                                            source={{uri: movie.portraitURL}}
                                            resizeMode="contain"
                                            style={styles.cardImage}>
                                            <LinearGradient
                                                colors={[COLORS.BLACK, COLORS.TRANSPARENT, COLORS.BLACK]}
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    right: 0,
                                                    top: 0,
                                                    height: '100%',
                                                }}
                                            />

                                            <View
                                                style={{
                                                    paddingHorizontal: isTablet() ? 30 : 12,
                                                    paddingTop: isTablet() ? 30 : 16,
                                                    paddingBottom: isTablet() ? 25 : 15,
                                                }}>
                                                <Text style={styles.bigTitle}>{movie.title}</Text>
                                                <View style={{flexDirection: 'row', marginVertical: 10}}>
                                                    <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                                    <Text style={styles.drawfonttag}>
                                                        {capitalizeFirstLetterOfString(movie?.genres[0])}
                                                    </Text>
                                                    <Text style={styles.drawfonttag}>
                                                        {capitalizeFirstLetterOfString(movie?.genres[1])}
                                                    </Text>
                                                    <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                                                </View>
                                                <Text style={styles.desc}>{movie.description}</Text>
                                            </View>
                                        </ImageBackground>
                                    </View>
                                )}
                                onSwipedLeft={cardIndex => {
                                    setSwipeResult('NOPE');
                                    setCurrentCardIndex(cardIndex + 1);
                                    handleSwipe(movies[cardIndex].id, 'DISLIKE', movies[cardIndex]);
                                    setTimeout(() => setSwipeResult(null), 1200);
                                }}
                                onSwipedRight={cardIndex => {
                                    setSwipeResult('LIKE');
                                    setCurrentCardIndex(cardIndex + 1);
                                    handleSwipe(movies[cardIndex].id, 'LIKE', movies[cardIndex]);
                                    setTimeout(() => setSwipeResult(null), 1200);
                                }}
                                backgroundColor={COLORS.TRANSPARENT}
                                stackSize={4}
                                cardIndex={0}
                                verticalSwipe={false}
                                cardHorizontalMargin={0}
                                cardVerticalMargin={0}
                                cardStyle={{
                                    alignSelf: 'center',
                                }}
                                onSwipedAll={onSwipedAll}
                                overlayLabels={{
                                    left: {
                                        title: 'NOPE',
                                        style: {
                                            label: {
                                                backgroundColor: COLORS.TRANSPARENT,
                                                borderColor: 'red',
                                                color: 'red',
                                                fontSize: 38,
                                                fontWeight: 'bold',
                                                borderWidth: 2,
                                                padding: 10,
                                            },
                                            wrapper: {
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                justifyContent: 'flex-start',
                                                marginTop: 30,
                                                marginLeft: isTablet() ? -330 : -30,
                                            },
                                        },
                                    },
                                    right: {
                                        title: 'LIKE',
                                        style: {
                                            label: {
                                                backgroundColor: COLORS.TRANSPARENT,
                                                borderColor: '#00BFFF',
                                                color: '#00BFFF',
                                                fontSize: 38,
                                                fontWeight: 'bold',
                                                borderWidth: 2,
                                                padding: 10,
                                            },
                                            wrapper: {
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                justifyContent: 'flex-start',
                                                marginTop: 30,
                                                marginLeft: 30,
                                            },
                                        },
                                    },
                                }}
                                animateOverlayLabelsOpacity
                            />
                        ) : !showLoader ? (
                            <Text style={[FONTS.Title3, {color: COLORS.LIGHTGREY}]}>No movies available.</Text>
                        ) : null}
                    </View>
                </SafeAreaView>

                {!showLoader && (
                    <View
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: Platform.OS === 'ios' ? 12 : 10,
                            height: bottomHintsHeight,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingHorizontal: isTablet() ? 24 : 16,
                            paddingTop: isTablet() ? 0 : 0,
                            paddingBottom: isTablet() ? 50 : 50,
                            backgroundColor: COLORS.BLACK,
                            zIndex: 999,
                            elevation: 30,
                        }}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Image
                                source={require('../../../../../assets/images/logo/akcru_logo_1024.png')}
                                style={{width: 80, height: 80}}
                                resizeMode="contain"
                            />
                            <View style={{marginLeft: 3}}>
                                <Text style={[FONTS.Title2, {color: COLORS.WHITE}]}>SKIP</Text>
                                <Text style={[FONTS.paragraph1, {color: COLORS.WHITE}]}>Pull left</Text>
                            </View>
                        </View>

                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <View style={{marginRight: 3, alignItems: 'flex-end'}}>
                                <Text style={[FONTS.Title2, {color: COLORS.WHITE}]}>WATCH</Text>
                                <Text style={[FONTS.paragraph1, {color: COLORS.WHITE}]}>Pull Right</Text>
                            </View>
                            <Image
                                source={require('../../../../../assets/images/logo/akcru_logo_1024.png')}
                                style={{width: 80, height: 80}}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                )}
            </ImageBackground>

            <AppLoadingModal visible={showLoader} message="Finding movies...." />
        </View>
    );
};

export default FlickFlirtSwipe;
