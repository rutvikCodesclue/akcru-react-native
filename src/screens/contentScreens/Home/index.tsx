import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import BasicListCategories from '../../../components/BasicListCategories';
import LargeListCategories from '../../../components/LargeListCategories';
import FullPageCategories from '../../../components/FullPageCategories';
import {Akcru_Content} from '../../../../assets/constants/ListData';
import Header from '../../../components/header';
import CategoriesBtn from '../../../components/CategoriesBtn';
import LinearGradient from 'react-native-linear-gradient';
import AkcruButtons from '../../../components/akcruButtons';

import {COLORS, SIZES} from '../../../../assets/constants/index';
import styles from './styles';
import {CATEGORIES} from '../../../../assets/constants/Data';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { ClientStackParams } from '../../../navigation/ClientStack';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-media-console';
import { SafeAreaView } from 'react-native-safe-area-context';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {findMovies} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import { Icon } from '@rneui/base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import { fetchUnfinishedMovies } from '../../../lib/api/user.lib';
import ContinueWatchingList from '../../../components/ContinueWatchingList';

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

    const [unfinishedMovies, setUnfinishedMovies] = useState<IMovie[]>([]);

    const [elapsedTime, setElapsedTime] = useState(0);

    // Function to handle the end of the video
    const handleVideoEnd = () => {
        // Update the index to the next video in topBox
        // Generate a random index for the next video in topBox
        const randomIndex = Math.floor(Math.random() * topBox.length);
        // setTopBoxIndex(prevIndex => (prevIndex + 1) % topBox.length);

        setTopBoxIndex(randomIndex);
        setElapsedTime(0); // Reset the elapsed time for the new video
    };

    const handlePreviousVideo = () => {
        // Logic to determine the previous video index
        const previousIndex = Math.max(0, topBoxIndex - 1);
        setTopBoxIndex(previousIndex);
    };

    const handleVideoError = () => {
        // Logic for handling video errors
        const randomIndex = Math.floor(Math.random() * topBox.length);
        // setTopBoxIndex(prevIndex => (prevIndex + 1) % topBox.length);

        setTopBoxIndex(randomIndex);
    };

    const handleVideoLoad = () => {
        // Logic for when the video is loaded
        setIsVideoLoaded(true);
        // console.log(topBox.length);
        setElapsedTime(0); // Reset elapsed time when a new video is loaded
    };

    // Start a timer when the video is loaded
    useEffect(() => {
        let timer: number;

        const handleTimerTick = () => {
            // Increment the elapsed time every second
            setElapsedTime(prev => prev + 1);

            // Check if 60 seconds have passed
            if (elapsedTime >= 30) {
                // Stop the timer and trigger the transition
                clearInterval(timer);
                handleVideoEnd();
            }
        };

        // Start the timer when the video is loaded
        if (isVideoLoaded && topBoxShouldAutoplay) {
            timer = setInterval(handleTimerTick, 1000);
        }

        // Clean up the timer when the component is unmounted or the video changes
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
                        createdAt: new Date(movie.createdAt).getTime(), // Get timestamp
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

                // Sort allMovies by rating in descending order
                const sortedMovies = allMovies.sort((a, b) => b.rating - a.rating);

                // Get the top 8 highest rated movies
                const top8RatedMovies = sortedMovies.slice(0, 10);

                setTopRatedMovies(top8RatedMovies);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };

        const fetchOldYearMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

                // Sort allMovies by year in descending order
                const sortedMovies = allMovies.sort((a, b) => a.year - b.year);

                // Get the 5 oldest movies
                const Oldest5Movies = sortedMovies.slice(0, 10);

                setOlderYearMovies(Oldest5Movies);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };

        const fetchNewerYearMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

                // Sort allMovies by year in descending order
                const sortedMovies = allMovies.sort((a, b) => b.year - a.year);

                // Get the 5 oldest movies
                const Newer5Movies = sortedMovies.slice(0, 10);

                setNewerYearMovies(Newer5Movies);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };

        const fetchRandomMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

                // Get 5 random movies from the list
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
                const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

                // Sort allMovies by rating in descending order
                const sortedMovies = allMovies.sort((a, b) => b.rating - a.rating);

                // Get the top 8 highest rated movies
                const top15RatedMovies = sortedMovies.slice(0, 15);

                // Set the topBox state with the top rated movies
                setTopBox(top15RatedMovies);
                setIsMovieDataLoaded(true);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };
        fetchTopBoxMovie();
        fetchOldYearMovies();
        fetchTopRatedMovies();
        fetchNewOnAkcru();
        fetchRandomMovies();
        fetchNewerYearMovies();
    }, []);

    const handleGenrePress = (genre: string) => {
        navigation.navigate('SearchMovieResultScreen', {
            genre: genre,
        });
    };

    const handlePress = () => {
        navigation.navigate('ContentDetailScreen', {
            id: topBox[topBoxIndex]?.id, // Pass the appropriatemovie ID to the ContentDetailScreen
        });
    };

    const [isMuted, setIsMuted] = useState(true);

    // Function to toggle mute
    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            // console.log('Home Screen focused [HomeScreen]');
            setTopBoxShouldAutoplay(true);

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                // console.log('Home Screen unfocused [HomeScreen]');
                setTopBoxShouldAutoplay(false);
            };
        }, []),
    );

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUnfinishedMovies = async () => {
            const movies = await fetchUnfinishedMovies();
            setUnfinishedMovies(movies);
            setIsLoading(false);
        };

        loadUnfinishedMovies();
    }, []);

    // Function to update the list of unfinished movies
    const updateUnfinishedMovies = (updatedMovies: React.SetStateAction<IMovie[]>) => {
        setUnfinishedMovies(updatedMovies);
    };

    return (
        <TabContainer>
            <SafeAreaView>
                {isMovieDataLoaded ? (
                    <ScrollView stickyHeaderIndices={[0]}>
                        <View>
                            <Header />
                        </View>
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
                                top: '16%',
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
                                    <View style={{position: 'absolute', zIndex: 10, bottom: '50%', left: '50%'}}>
                                        {/* <ActivityIndicator size="large" color={COLORS.PURPLE} /> */}
                                    </View>
                                )}
                                {/* <VideoPlayer
                                    source={{
                                        uri: topBox[topBoxIndex]?.trailerURL,
                                    }}
                                    muted={true}
                                    tapAnywhereToPause={true}
                                    disablePlayPause
                                    disableSeekButtons
                                    disableSeekbar
                                    disableVolume
                                    disableBack
                                    disableFullscreen
                                    disableTimer
                                    paused={!topBoxShouldAutoplay}
                                    toggleResizeModeOnFullscreen={true}
                                    isFullscreen={true}
                                    posterResizeMode="cover"
                                    poster={topBox[topBoxIndex]?.portraitURL}
                                    onEnd={handleVideoEnd} // Call the function when the video ends
                                /> */}
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
                                    // Background Linear Gradient
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
                        <View style={{marginTop: 75, marginBottom: 75}}>
                            {/* TODO: remove this.  */}
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
                            {unfinishedMovies.length > 0 && (
                                <ContinueWatchingList
                                    Akcru_Content={{
                                        id: 'unfinshedMovies',
                                        title: 'Continue Watching',
                                        movies: unfinishedMovies,
                                    }}
                                    updateUnfinishedMovies={updatedMovies => setUnfinishedMovies(updatedMovies)}
                                />
                            )}
                            <BasicListCategories
                                Akcru_Content={{
                                    id: 'recommendedForYou',
                                    title: 'Recommended by Akcru',
                                    movies: randomMovies,
                                }}
                            />

                            {/* <BasicListCategories Akcru_Content={RecommendedForYou} /> */}
                            {/* <FullPageCategories Akcru_Content={allcategory} /> */}
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
