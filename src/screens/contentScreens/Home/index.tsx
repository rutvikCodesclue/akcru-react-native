import {View, Text, FlatList, ScrollView, Pressable, ActivityIndicator, BackHandler, ToastAndroid} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import BasicListCategories from '../../../components/BasicListCategories';
import LargeListCategories from '../../../components/LargeListCategories';
import Header from '../../../components/header';
import CategoriesBtn from '../../../components/CategoriesBtn';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SIZES} from '../../../../assets/constants/index';
import styles from './styles';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import Video from 'react-native-video';
import {SafeAreaView} from 'react-native-safe-area-context';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {findMovies} from '../../../lib/api/movies.lib';
import {IMovie, ISeries, ITrailer} from '../../../../types';
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

const HomeScreen = () => {
    const [newOnAkcru, setNewOnAkcru] = useState<IMovie[]>([]);
    const [topRatedMovies, setTopRatedMovies] = useState<IMovie[]>([]);
    const [olderYearMovies, setOlderYearMovies] = useState<IMovie[]>([]);
    const [newerYearMovies, setNewerYearMovies] = useState<IMovie[]>([]);
    const [randomMovies, setRandomMovies] = useState<IMovie[]>([]);
    const [topBox, setTopBox] = useState<IMovie[]>([]);
    const [topBoxIndex, setTopBoxIndex] = useState(Math.floor(Math.random() * 15));
    const [topBoxShouldAutoplay, setTopBoxShouldAutoplay] = useState(true);
    const [isMovieDataLoaded, setIsMovieDataLoaded] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [originalSeries, setOriginalSeries] = useState<ISeries[]>([]);
    const [isSeriesDataLoaded, setIsSeriesDataLoaded] = useState(false);
    const [blackInTheDaysMovies, setBlackInTheDaysMovies] = useState<IMovie[]>([]);
    const [sizzles, setSizzles] = useState<ITrailer[]>([]);
    const [isSizzleDataLoaded, setIsSizzleDataLoaded] = useState(false);
    const [unfinishedMovies, setUnfinishedMovies] = useState<IMovie[]>([]);

    const [unfinishedContent, setUnfinishedContent] = useState<any[]>([]);

    const [elapsedTime, setElapsedTime] = useState(0);
    const [backPressCount, setBackPressCount] = useState(0);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (!isFocused) return;

        const backAction = () => {
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

    const handleVideoEnd = () => {
        const randomIndex = Math.floor(Math.random() * topBox.length);

        setTopBoxIndex(randomIndex);
        setElapsedTime(0);
    };

    const handlePreviousVideo = () => {
        const previousIndex = Math.max(0, topBoxIndex - 1);
        setTopBoxIndex(previousIndex);
    };

    const handleVideoError = () => {
        const randomIndex = Math.floor(Math.random() * topBox.length);

        setTopBoxIndex(randomIndex);
    };

    const handleVideoLoad = () => {
        setIsVideoLoaded(true);

        setElapsedTime(0);
    };

    useEffect(() => {
        let timer: number;

        const handleTimerTick = () => {
            setElapsedTime(prev => prev + 1);

            if (elapsedTime >= 30) {
                clearInterval(timer);
                handleVideoEnd();
            }
        };

        if (isVideoLoaded && topBoxShouldAutoplay) {
            timer = setInterval(handleTimerTick, 1000);
        }

        return () => clearInterval(timer);
    }, [isVideoLoaded, topBoxShouldAutoplay, elapsedTime]);

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
                const allMovies: IMovie[] = await findMovies();

                const sortedMovies = allMovies.sort((a, b) => b.rating - a.rating);

                const top15RatedMovies = sortedMovies.slice(0, 15);

                setTopBox(top15RatedMovies);
                setIsMovieDataLoaded(true);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
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

    const [isMuted, setIsMuted] = useState(true);

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

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
            <SafeAreaView>
                {isMovieDataLoaded ? (
                    <ScrollView stickyHeaderIndices={[0]}>
                        <View>
                            <Header />
                        </View>
                        <View>
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
                                        size={20}
                                        color={COLORS.LIGHTGREY}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View
                                style={{
                                    width: '100%',
                                    zIndex: 2,
                                    position: 'absolute',
                                    top: '65%',
                                    flexDirection: 'row-reverse',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 15,
                                }}>
                                <TouchableOpacity onPressIn={nextVideo} style={styles.heroButtons}>
                                    <Icon name="chevron-forward" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                </TouchableOpacity>
                                <TouchableOpacity onPressIn={previousVideo} style={styles.heroButtons}>
                                    <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                </TouchableOpacity>
                            </View>
                            <Pressable style={styles.videocontainer} onPress={handlePress}>
                                <View style={{height: SIZES.ScreenHeight / 1.63}}>
                                    {!isVideoLoaded && (
                                        <View style={{position: 'absolute', zIndex: 10, bottom: '50%', left: '50%'}} />
                                    )}
                                    <Video
                                        style={{width: '100%', height: '100%'}}
                                        source={{uri: topBox[topBoxIndex]?.trailerURL}}
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
                                        colors={['transparent', COLORS.AKCRUBACKGROUND]}
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
                        </View>
                        <View style={{marginTop: 75, marginBottom: 75}}>
                            <View>
                                <FlatList
                                    data={MOVIE_GENRES}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => item.id}
                                    renderItem={({item, index}) => (
                                        <CategoriesBtn
                                            category={item.genre}
                                            color={item.color}
                                            onPress={() => handleGenrePress(item.genre)}
                                        />
                                    )}
                                />
                            </View>
                            <BasicListCategories
                                Akcru_Content={{id: 'newOnAkcru', title: 'New on Akcru', movies: newOnAkcru}}
                            />
                            <BasicListCategories
                                Akcru_Content={{
                                    id: 'topRatedMovies',
                                    title: 'Top Rated on Akcru',
                                    movies: topRatedMovies,
                                }}
                            />
                            <LargeListCategories
                                Akcru_Content={{
                                    id: 'oldiesButGoodies',
                                    title: 'Oldies but Goodies',
                                    movies: olderYearMovies,
                                }}
                            />
                            {unfinishedContent.length > 0 && (
                                <ContinueWatchingList
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
                                    Akcru_Content={{
                                        id: 'blackinthedays',
                                        title: 'Black in the Days',
                                        movies: blackInTheDaysMovies,
                                    }}
                                />
                            )}
                            <BasicListCategories
                                Akcru_Content={{
                                    id: 'recommendedForYou',
                                    title: 'Recommended by Akcru',
                                    movies: randomMovies,
                                }}
                            />
                            {originalSeries.length > 0 && (
                                <BasicSeriesCarousel
                                    Akcru_Content={{
                                        id: 'OrginalSeries',
                                        title: 'Original Series',
                                        series: originalSeries,
                                    }}
                                />
                            )}
                            {sizzles.length > 0 && (
                                <BasicSizzleCarousel
                                    Akcru_Content={{
                                        id: 'ComingSoonTrailers',
                                        title: 'Coming Soon Orginals',
                                        sizzle: sizzles,
                                    }}
                                />
                            )}
                        </View>
                    </ScrollView>
                ) : (
                    <View style={styles.activitycontainer}>
                        <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                    </View>
                )}
            </SafeAreaView>
        </TabContainer>
    );
};

export default HomeScreen;
