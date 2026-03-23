import React, {useState, useRef, useCallback} from 'react';
import {View, Text, SafeAreaView, ImageBackground, Image, Modal, ActivityIndicator} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import imageindex from '../../../../../assets/images/imageindex';
import styles from './styles';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import {API} from '../../../../clients/api.client';
import {IMovie} from '../../../../../types';
import {findFlickFlirtMovies} from '../../../../lib/api/movies.lib';
import Swiper from 'react-native-deck-swiper';
import useAuthStore from '../../../../stores/auth.store';
import {capitalizeFirstLetterOfString} from '../../../../util/util';
import {Icon} from '@rneui/base';
import {isTablet} from '../../../../../assets/constants/theme';
import {archetypeMapping} from '../../../../../assets/constants/archetypeMapping';
import {MOVIE_GENRES} from '../../../../../assets/constants/Data';

/** Normalize API genre string to match archetypeMapping keys (e.g. "SciFi", "Drama") */
function normalizeGenre(genre: string | undefined): string | null {
    if (!genre || !genre.trim()) return null;
    const g = genre.trim();
    const found = MOVIE_GENRES.find(item => item.id !== '0' && item.genre.toLowerCase() === g.toLowerCase());
    if (found) return found.genre;
    return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
}

const FlickFlirtSwipe = () => {
    const [movies, setMovies] = useState<IMovie[]>([]);
    const [swipeResult, setSwipeResult] = useState<null | 'LIKE' | 'NOPE'>(null);
    const [isLoadingMovies, setIsLoadingMovies] = useState(true);
    const [isIntroLoading, setIsIntroLoading] = useState(true);
    const showLoader = isIntroLoading || isLoadingMovies;
    const rightSwipedGenreCounts = useRef<Record<string, number>>({});

    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {hydrateUser} = useAuthStore();

    useFocusEffect(
        useCallback(() => {
            setIsIntroLoading(true);
            setIsLoadingMovies(true);
            const introTimer = setTimeout(() => setIsIntroLoading(false), 3000);
            findFlickFlirtMovies()
                .then(setMovies)
                .catch(console.error)
                .finally(() => setIsLoadingMovies(false));
            rightSwipedGenreCounts.current = {};
            return () => clearTimeout(introTimer);
        }, []),
    );

    useFocusEffect(
        useCallback(() => {
            hydrateUser();
            return () => {
                hydrateUser();
            };
        }, [hydrateUser]),
    );

    const handleSwipe = async (movieId: string, type: 'LIKE' | 'DISLIKE', movie?: IMovie) => {
        try {
            await API.post('v1/flickflirt/swipe', {movieId, type});
            if (type === 'LIKE' && movie?.genres?.length) {
                const counts = rightSwipedGenreCounts.current;
                [movie.genres[0], movie.genres[1]].forEach(g => {
                    const norm = normalizeGenre(g);
                    if (norm) counts[norm] = (counts[norm] ?? 0) + 1;
                });
            }
        } catch (error) {
            console.error('Error recording swipe:', error);
        }
    };

    const onSwipedAll = async () => {
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
        navigation.navigate('FlickFlirtPref');
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
                                ? ['rgba(5,7,35,0.7)', 'rgba(5,7,35,0.2)', 'rgba(5,7,35,0.92)']
                                : [COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]
                        }
                        style={{position: 'absolute', left: 0, right: 0, top: 0, height: SIZES.ScreenHeight}}
                    />

                    {!showLoader && (
                        <>
                            <Header />
                            <BackButton navigation={navigation} />
                        </>
                    )}

                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        {!showLoader && movies.length > 0 ? (
                            <Swiper
                                cards={movies}
                                renderCard={(movie: IMovie, cardIndex: number) => (
                                    <View style={styles.card}>
                                        <ImageBackground source={{uri: movie.portraitURL}} style={styles.cardImage}>
                                            <LinearGradient
                                                colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    right: 0,
                                                    top: 0,
                                                    height: '100%',
                                                }}
                                            />
                                            <View style={styles.cardIndexBadge} pointerEvents="none">
                                                <Text style={styles.cardIndexText}>{cardIndex + 1}</Text>
                                            </View>
                                            <View style={{padding: isTablet() ? 30 : 10}}>
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
                                    handleSwipe(movies[cardIndex].id, 'DISLIKE', movies[cardIndex]);
                                    setTimeout(() => setSwipeResult(null), 1200);
                                }}
                                onSwipedRight={cardIndex => {
                                    setSwipeResult('LIKE');
                                    handleSwipe(movies[cardIndex].id, 'LIKE', movies[cardIndex]);
                                    setTimeout(() => setSwipeResult(null), 1200);
                                }}
                                backgroundColor="transparent"
                                stackSize={4}
                                cardIndex={0}
                                verticalSwipe={false}
                                cardStyle={{
                                    marginTop: isTablet() ? 0 : '-10%',
                                    marginLeft: isTablet() ? '17%' : '3%',
                                    alignSelf: 'center',
                                }}
                                onSwipedAll={onSwipedAll}
                                overlayLabels={{
                                    left: {
                                        title: 'NOPE',
                                        style: {
                                            label: {
                                                backgroundColor: 'transparent',
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
                                                backgroundColor: 'transparent',
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

                    {!showLoader && (
                        <View style={{alignItems: 'center', marginBottom: '20%'}}>
                            <Text style={[FONTS.Title3, {color: COLORS.AKCRUPINK}]}>
                                Swipe right if you like, swipe left if you dislike
                            </Text>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '40%'}}>
                                <Icon name="sad" type="ionicon" color={COLORS.CATREDLGT} size={isTablet() ? 60 : 40} />
                                <Icon name="happy" type="ionicon" color={COLORS.AKCRUBLUE} size={isTablet() ? 60 : 40} />
                            </View>
                        </View>
                    )}
                </SafeAreaView>
            </ImageBackground>

            <Modal animationType="fade" transparent visible={showLoader}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}>
                    <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                    <Text style={{...FONTS.Title3, color: COLORS.AKCRUBLUE, marginTop: 10}}>Finding movies....</Text>
                </View>
            </Modal>
        </View>
    );
};

export default FlickFlirtSwipe;
