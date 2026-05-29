import {View, Text, FlatList, ScrollView, Pressable, ActivityIndicator, BackHandler, ToastAndroid} from 'react-native';
import React, {useEffect, useState} from 'react';
import {CommonActions, useIsFocused} from '@react-navigation/native';
import BasicListCategories from '../../../components/BasicListCategories';
import LargeListCategories from '../../../components/LargeListCategories';
import Header from '../../../components/header';
import PreferenceChip from '../../../components/PreferenceChip';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SIZES} from '../../../../assets/constants/index';
import styles from './styles';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import Video from 'react-native-video';
import {SafeAreaView} from 'react-native-safe-area-context';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {findMovies, findTopBoxMovies} from '../../../lib/api/movies.lib';
import {IAd, IMovie, ISeries, ITrailer} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {Icon} from '@rneui/base';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {fetchUnfinishedContent} from '../../../lib/api/user.lib';
import ContinueWatchingList from '../../../components/ContinueWatchingList';
import BasicSeriesCarousel from '../../../components/BasicSeriesCarousel';
import {findSeries} from '../../../lib/api/series.lib';
import {getTrailers} from '../../../lib/api/sizzles.lib';
import BasicSizzleCarousel from '../../../components/BasicSizzleCarousel';
import { isTablet } from '../../../../assets/constants/theme';
import RotatingAd from '../../../components/Ads/RotatingAd';
import { getAds, trackAdClick, trackAdEvent, trackAdImpression } from '../../../lib/api/ads.lib';

const HOME_SECTION_ICON_URLS: Record<string, string> = {
    'New on Akcru': 'https://img.icons8.com/fluency/96/new.png',
    'Top Rated on Akcru': 'https://img.icons8.com/fluency/96/star.png',
    'Oldies but Goodies': 'https://img.icons8.com/fluency/96/retro-tv.png',
    'Continue Watching': 'https://img.icons8.com/fluency/96/time-machine.png',
    'Black in the Days': 'https://img.icons8.com/fluency/96/clapperboard.png',
    'Recommended by Akcru': 'https://img.icons8.com/fluency/96/artificial-intelligence.png',
    'Original Series': 'https://img.icons8.com/fluency/96/tv-show.png',
    'Coming Soon Orginals': 'https://img.icons8.com/fluency/96/alarm.png',
};

const HomeScreen = () => {
    const SHOW_HOME_HERO = false; // temporary: hide top trailer/details section

    const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
    const [newOnAkcru, setNewOnAkcru] = useState<IMovie[]>([]);
    const [topRatedMovies, setTopRatedMovies] = useState<IMovie[]>([]);
    const [olderYearMovies, setOlderYearMovies] = useState<IMovie[]>([]);
    const [newerYearMovies, setNewerYearMovies] = useState<IMovie[]>([]);
    const [randomMovies, setRandomMovies] = useState<IMovie[]>([]);
    const [topBox, setTopBox] = useState<IMovie[]>([]);
    //const [topBoxIndex, setTopBoxIndex] = useState(Math.floor(Math.random() * 15));
    const [topBoxIndex, setTopBoxIndex] = useState(0);
    const [topBoxShouldAutoplay, setTopBoxShouldAutoplay] = useState(true);
    const [isMovieDataLoaded, setIsMovieDataLoaded] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [originalSeries, setOriginalSeries] = useState<ISeries[]>([]);
    const [isSeriesDataLoaded, setIsSeriesDataLoaded] = useState(false);
    const [blackInTheDaysMovies, setBlackInTheDaysMovies] = useState<IMovie[]>([]);
    const [sizzles, setSizzles] = useState<ITrailer[]>([]);
    const [isSizzleDataLoaded, setIsSizzleDataLoaded] = useState(false);

    const [unfinishedContent, setUnfinishedContent] = useState<any[]>([]);

    const [elapsedTime, setElapsedTime] = useState(0);
    const [backPressCount, setBackPressCount] = useState(0);
    const isFocused = useIsFocused();

    const [homeAds, setHomeAds] = useState<IAd[]>([]);
    // const AD_HEIGHT = isTablet() ? Math.round((SIZES.ScreenWidth * 9) / 16) : Math.round((SIZES.ScreenWidth * 9) / 16);
    const AD_HEIGHT = SIZES.ScreenWidth / 2.4;

    useEffect(() => {
        (async () => {
            try {
                const res = await getAds('HOME_BETWEEN_CAROUSELS'); // { ads: IAd[] }

                // ✅ filter by start/end dates + active flag (client-side guard)
                const now = Date.now();
                const filtered = (res.ads ?? []).filter(a => {
                    const s = a.startAt ? Date.parse(a.startAt) : -Infinity;
                    const e = a.endAt ? Date.parse(a.endAt) : Infinity;
                    return s <= now && now <= e && a.isActive;
                });

                setHomeAds(filtered);
            } catch (e) {
                console.log('Failed to load ads', e);
                setHomeAds([]); // safe fallback
            }
        })();
    }, []);

    useEffect(() => {
        if (!isFocused) return;

        const backAction = () => {
            if (navigation.canGoBack()) {
                navigation.goBack();
                return true;
            }
            const parentNavigation = navigation.getParent();
            if (parentNavigation?.canGoBack()) {
                parentNavigation.goBack();
                return true;
            }
            if (backPressCount === 1) {
                BackHandler.exitApp();
            } else {
                setBackPressCount(1);
                ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);

                setTimeout(() => setBackPressCount(0), 2000);
            }
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [backPressCount, isFocused]);

    const current = topBox[topBoxIndex];
    const trailerUrl = current?.trailerURL ?? '';
    const canPlay = trailerUrl.trim().length > 0;

    const len = topBox.length;

    const handleVideoEnd = () => {
        if (len <= 1) {
            setElapsedTime(0);
            return; // nothing to advance to
        }
        const next = (topBoxIndex + 1) % len;
        setTopBoxIndex(next);
        setElapsedTime(0);
    };

    const handlePreviousVideo = () => {
        if (len <= 1) return; // nothing to go back to
        const prev = (topBoxIndex - 1 + len) % len;
        setTopBoxIndex(prev);
    };

    const handleVideoError = () => {
        if (len <= 1) return; // avoid random/index issues
        // skip to the next item on error (deterministic)
        const next = (topBoxIndex + 1) % len;
        setTopBoxIndex(next);
    };

    const handleVideoLoad = () => {
        setIsVideoLoaded(true);

        setElapsedTime(0);
    };

    useEffect(() => {
        setIsVideoLoaded(false);
        setElapsedTime(0);
    }, [topBoxIndex]);

    useEffect(() => {
        if (!isVideoLoaded || !topBoxShouldAutoplay) return;

        setElapsedTime(0);
        const timer = setInterval(() => {
            setElapsedTime(prev => {
                if (prev + 1 >= 30) {
                    clearInterval(timer);
                    handleVideoEnd(); // will wrap: (index + 1) % len
                }
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isVideoLoaded, topBoxShouldAutoplay, topBoxIndex]);

    const nextVideo = () => {
        handleVideoEnd();
    };

    const previousVideo = () => {
        handlePreviousVideo();
    };

    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    useEffect(() => {
        const fetchNewOnAkcru = async () => {
            try {
                const allMovies: IMovie[] = await findMovies('');

                const newUploads = allMovies
                    .map(movie => ({
                        ...movie,
                        createdAt: new Date(movie.createdAt).getTime(),
                    }))
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 10);

                setNewOnAkcru(newUploads);
            } catch (error) {
                console.error('Error fetching new uploads:', error);
            }
        };

        const fetchTopRatedMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies('');

                const sortedMovies = allMovies.sort((a, b) => b.rating - a.rating);

                const top8RatedMovies = sortedMovies.slice(0, 10);

                setTopRatedMovies(top8RatedMovies);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };

        const fetchOldYearMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies();

                const sortedMovies = allMovies.sort((a, b) => a.year - b.year);

                const Oldest5Movies = sortedMovies.slice(0, 10);

                setOlderYearMovies(Oldest5Movies);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };

        const fetchNewerYearMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies();

                const sortedMovies = allMovies.sort((a, b) => b.year - a.year);

                const Newer5Movies = sortedMovies.slice(0, 10);

                setNewerYearMovies(Newer5Movies);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };

        const fetchRandomMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies();

                const randomMovies: IMovie[] = [];
                while (randomMovies.length < 5) {
                    const randomIndex = Math.floor(Math.random() * allMovies.length);
                    const randomMovie = allMovies[randomIndex];
                    if (!randomMovies.includes(randomMovie)) {
                        randomMovies.push(randomMovie);
                    }
                }

                setRandomMovies(randomMovies);
            } catch (error) {
                console.error('Error fetching random movies:', error);
            }
        };

        const fetchTopBoxMovie = async () => {
            try {
                const topBoxMovies: IMovie[] = await findTopBoxMovies();
                // console.log(
                //     'TopBox size:',
                //     topBoxMovies.length,
                //     topBoxMovies.map(m => ({id: m.id, title: m.title, trailer: m.trailerURL})),
                // );
                setTopBox(topBoxMovies);
                setIsMovieDataLoaded(true);
            } catch (error) {
                console.error('Error fetching topbox movies:', error);
                setIsMovieDataLoaded(true);
            }
        };

        const fetchOriginalSeries = async () => {
            try {
                const series: ISeries[] = await findSeries();
                setOriginalSeries(series);
                setIsSeriesDataLoaded(true);
            } catch (error) {
                console.error('Error fetching original series:', error);
            }
        };

        const fetchBlackInTheDaysMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies();
                const blackInTheDaysMovies = allMovies
                    .filter(movie => movie.blackInTheDays)
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 10); // Limit to 10 movies
                setBlackInTheDaysMovies(blackInTheDaysMovies);
            } catch (error) {
                console.error('Error fetching Black in the Days movies:', error);
            }
        };

        const fetchSizzles = async () => {
            try {
                const sizzles: ITrailer[] = await getTrailers();
                setSizzles(sizzles);
                setIsSizzleDataLoaded(true);
            } catch (error) {
                console.error('Error fetching Sizzles:', error);
            }
        };

        fetchOriginalSeries();
        fetchTopBoxMovie();
        fetchOldYearMovies();
        fetchTopRatedMovies();
        fetchNewOnAkcru();
        fetchRandomMovies();
        fetchNewerYearMovies();
        fetchBlackInTheDaysMovies();
        fetchSizzles();
    }, []);

    const handleGenrePress = (genre: string) => {
        navigation.navigate('SearchMovieResultScreen', {
            genre: genre,
        });
    };

    const handlePress = () => {
        navigation.navigate('ContentDetailScreen', {
            id: topBox[topBoxIndex]?.id,
        });
    };

    const handleSearchNavigation = () => {
        const navAny = navigation as any;
        const navigators = [navAny, navAny?.getParent?.(), navAny?.getParent?.()?.getParent?.()].filter(Boolean);

        for (const nav of navigators) {
            const state = nav?.getState?.();
            const routeNames: string[] = state?.routeNames ?? [];
            if (!routeNames.includes('SearchMovieScreen')) {
                continue;
            }
            nav.dispatch({
                ...CommonActions.navigate('SearchMovieScreen'),
                target: state.key,
            });
            return;
        }
    };


    const [isMuted, setIsMuted] = useState(true);

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    useFocusEffect(
        React.useCallback(() => {
            // Reset selected chip when returning to Home
            setSelectedGenreId(null);
        }, []),
    );

    useFocusEffect(
        React.useCallback(() => {
            setTopBoxShouldAutoplay(true);

            return () => {
                setTopBoxShouldAutoplay(false);
            };
        }, []),
    );

    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {

            const loadUnfinishedContent = async () => {
                const content = await fetchUnfinishedContent();
                setUnfinishedContent(content);
                setIsLoading(false);
            };

            loadUnfinishedContent();
        }, []),
    );

    const updateUnfinishedContent = (updatedContent: (IMovie | ISeries)[]) => {
        setUnfinishedContent(updatedContent);
    };

    return (
        <TabContainer>
            <LinearGradient
               colors={['#0D2E6D', '#071325', COLORS.BLACK]}
//                 colors={[COLORS.BLACK, '#060606', COLORS.BLACK]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{flex: 1}}>
                {isMovieDataLoaded ? (
                    <View style={{flex: 1, paddingTop: isTablet() ? 14 : 10}}>
                        <TouchableOpacity
                            onPress={handleSearchNavigation}
                            style={{
                                width: '92%',
                                alignSelf: 'center',
                                height: isTablet() ? 48 : 40,
                                borderRadius: 20,
                                paddingLeft: 14,
                                paddingRight: 14,
                                marginBottom: isTablet() ? 18 : 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: 'rgba(10, 28, 64, 0.9)',
                                borderWidth: 1,
                                borderColor: 'rgba(149, 189, 255, 0.35)',
                            }}>
                            <Icon
                                name="search-outline"
                                type="ionicon"
                                size={isTablet() ? 22 : 18}
                                color={COLORS.LIGHTGREY}
                            />
                            <Text
                                style={{
                                    marginLeft: 8,
                                    color: COLORS.OVERLAY_WHITE_80,
                                    fontSize: isTablet() ? 16 : 13,
                                    fontWeight: '500',
                                }}>
                                Search movies
                            </Text>
                        </TouchableOpacity>
                        <View style={{paddingBottom: isTablet() ? 16 : 12}}>
                            <FlatList
                                data={MOVIE_GENRES}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item => item.id}
                                contentContainerStyle={{
                                    paddingHorizontal: '4%',
                                    gap: 10,
                                    alignItems: 'center',
                                }}
                                renderItem={({item}) => (
                                    <PreferenceChip
                                        selected={selectedGenreId === item.id}
                                        label={item.genre}
                                        onPress={() => {
                                            setSelectedGenreId(item.id);
                                            handleGenrePress(item.genre);
                                        }}
                                    />
                                )}
                            />
                        </View>
                        <ScrollView contentContainerStyle={{paddingBottom: isTablet() ? 80 : 75}}>
                            {SHOW_HOME_HERO && <View>
                                <Header />
                            </View>}
                            {SHOW_HOME_HERO && <View>
                                <View
                                    style={{
                                        width: '100%',
                                        zIndex: 3,
                                        position: 'absolute',
                                        top: '5%',
                                        paddingHorizontal: 15,
                                        alignItems: 'flex-end',
                                    }}>
                                    <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
                                        <Icon
                                            name={isMuted ? 'volume-mute' : 'volume-high'}
                                            type="ionicon"
                                            size={isTablet() ? 30 : 20}
                                            color={COLORS.LIGHTGREY}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View
                                    style={{
                                        width: '100%',
                                        zIndex: 2,
                                        position: 'absolute',
                                        top: '55%',
                                        flexDirection: 'row-reverse',
                                        justifyContent: 'space-between',
                                        paddingHorizontal: 15,
                                    }}>
                                    <TouchableOpacity onPressIn={nextVideo} style={styles.heroButtons}>
                                        <Icon
                                            name="chevron-forward"
                                            type="ionicon"
                                            size={isTablet() ? 30 : 20}
                                            color={COLORS.LIGHTGREY}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPressIn={previousVideo} style={styles.heroButtons}>
                                        <Icon
                                            name="chevron-back"
                                            type="ionicon"
                                            size={isTablet() ? 30 : 20}
                                            color={COLORS.LIGHTGREY}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Pressable style={styles.videocontainer} onPress={handlePress}>
                                    <View style={{height: SIZES.ScreenHeight / 1.63}}>
                                        {!isVideoLoaded && (
                                            <View style={{position: 'absolute', zIndex: 10, bottom: '50%', left: '50%'}} />
                                        )}
                                        <Video
                                            key={current?.id}
                                            style={{width: '100%', height: '100%'}}
                                            source={canPlay ? {uri: trailerUrl} : undefined}
                                            resizeMode="cover"
                                            onEnd={handleVideoEnd}
                                            repeat={false}
                                            onError={handleVideoError}
                                            posterResizeMode="cover"
                                            poster={topBox[topBoxIndex]?.portraitURL}
                                            onLoad={handleVideoLoad}
                                            paused={!topBoxShouldAutoplay}
                                            muted={isMuted}
                                        />
                                    </View>
                                    <View>
                                        <LinearGradient
                                            colors={[COLORS.TRANSPARENT, COLORS.AKCRUBACKGROUND]}
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                height: 200,
                                            }}
                                        />
                                        <View
                                            style={{
                                                marginHorizontal: '2%',
                                                marginBottom: 20,
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                left: 0,
                                            }}>
                                            <View>
                                                <Text style={styles.bigTitle}>{topBox[topBoxIndex]?.title}</Text>
                                                <View style={{flexDirection: 'row', marginVertical: 10}}>
                                                    <Text style={styles.drawfonttag}>{topBox[topBoxIndex]?.rated}</Text>
                                                    <Text style={styles.drawfonttag}>
                                                        {capitalizeFirstLetterOfString(topBox[topBoxIndex]?.genres[0])}
                                                    </Text>
                                                    <Text style={styles.drawfonttag}>
                                                        {capitalizeFirstLetterOfString(topBox[topBoxIndex]?.genres[1])}
                                                    </Text>
                                                    <Text style={styles.drawfonttag}>{topBox[topBoxIndex]?.rating}/10</Text>
                                                </View>
                                                <Text style={styles.desc}>{topBox[topBoxIndex]?.description}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            </View>}
                            <BasicListCategories
                                variant="featured"
                                showTitleIcon
                                titleIconUri={HOME_SECTION_ICON_URLS['New on Akcru']}
                                Akcru_Content={{id: 'newOnAkcru', title: 'New on Akcru', movies: newOnAkcru}}
                            />
                            <BasicListCategories
                                variant="highlight"
                                showTitleIcon
                                titleIconUri={HOME_SECTION_ICON_URLS['Top Rated on Akcru']}
                                Akcru_Content={{
                                    id: 'topRatedMovies',
                                    title: 'Top Rated on Akcru',
                                    movies: topRatedMovies,
                                }}
                            />

                            {!!homeAds.length && (
                                <View style={{marginTop: isTablet() ? 24 : 16, paddingHorizontal: '2%'}}>
                                    <RotatingAd
                                        ads={homeAds}
                                        height={AD_HEIGHT}
                                        pause={!isFocused}
                                        onImpression={id => trackAdEvent(id, 'IMPRESSION')}
                                        onClick={id => trackAdEvent(id, 'CLICK')}
                                    />
                                </View>
                            )}

                            <BasicListCategories
                                variant="featured"
                                featuredCardPreset="wideLandscape"
                                showTitleIcon
                                titleIconUri={HOME_SECTION_ICON_URLS['Oldies but Goodies']}
                                Akcru_Content={{
                                    id: 'oldiesButGoodies',
                                    title: 'Oldies but Goodies',
                                    movies: olderYearMovies,
                                }}
                            />
                            {unfinishedContent.length > 0 && (
                                <ContinueWatchingList
                                    showTitleIcon
                                    titleIconUri={HOME_SECTION_ICON_URLS['Continue Watching']}
                                    Akcru_Content={{
                                        id: 'unfinshedContent',
                                        title: 'Continue Watching',
                                        content: unfinishedContent,
                                    }}
                                    updateUnfinishedContent={updateUnfinishedContent}
                                />
                            )}
                            {blackInTheDaysMovies.length > 0 && (
                                <LargeListCategories
                                    showTitleIcon
                                    titleIconUri={HOME_SECTION_ICON_URLS['Black in the Days']}
                                    Akcru_Content={{
                                        id: 'blackinthedays',
                                        title: 'Black in the Days',
                                        movies: blackInTheDaysMovies,
                                    }}
                                />
                            )}
                            <BasicListCategories
                                variant="highlight"
                                showTitleIcon
                                titleIconUri={HOME_SECTION_ICON_URLS['Recommended by Akcru']}
                                Akcru_Content={{
                                    id: 'recommendedForYou',
                                    title: 'Recommended by Akcru',
                                    movies: randomMovies,
                                }}
                            />
                            {originalSeries.length > 0 && (
                                <BasicSeriesCarousel
                                    showTitleIcon
                                    titleIconUri={HOME_SECTION_ICON_URLS['Original Series']}
                                    Akcru_Content={{
                                        id: 'OrginalSeries',
                                        title: 'Original Series',
                                        series: originalSeries,
                                    }}
                                />
                            )}
                            {sizzles.length > 0 && (
                                <BasicSizzleCarousel
                                    showTitleIcon
                                    titleIconUri={HOME_SECTION_ICON_URLS['Coming Soon Orginals']}
                                    Akcru_Content={{
                                        id: 'ComingSoonTrailers',
                                        title: 'Coming Soon Orginals',
                                        sizzle: sizzles,
                                    }}
                                />
                            )}
                        </ScrollView>
                    </View>
                ) : (
                    <View style={styles.activitycontainer}>
                        <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                    </View>
                )}
            </LinearGradient>
        </TabContainer>
    );
};

export default HomeScreen;
