import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, View, StatusBar, AppState, Text, TouchableOpacity, BackHandler} from 'react-native';
import styles from './styles';
import VideoPlayer from 'react-native-media-console';
import {useRoute, useFocusEffect, useIsFocused} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {IMovie} from '../../../../types';
import {findMovieById} from '../../../lib/api/movies.lib';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import LottieView from 'lottie-react-native';
import Orientation from 'react-native-orientation-locker';
import Video from 'react-native-video';
import useWatchTimeStore from '../../../stores/watchTime.store';
import {
    finishUserWatching,
    startUserWatching,
    logUserMovieWatchHistory,
    logUserContentWatchHistory,
} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';
import {updateWatchTime} from '../../../lib/api/watchtime.lib';
import AkcruOpener from '../../../components/AkcruOpener';
import { has } from 'lodash';

type ContentPlayerNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'ContentPlayer'>;

type ContentPlayerRouteProp = RouteProp<NoBottomTabStackParams, 'ContentPlayer'>;

type Props = {
    navigation: ContentPlayerNavigationProp;
    route: ContentPlayerRouteProp;
};

export default function ContentPlayer({navigation}: Props) {
    const [movie, setMovie] = useState<IMovie | null>(null);
    const [isMoviePlaying, setIsMoviePlaying] = useState<boolean>(true);
    const [hasLottieFirstLoopCompleted, setHasLottieFirstLoopCompleted] = useState(false);
    const {startTimer, pauseTimer, resetTimer, setLastPlaybackPosition, getLastPlaybackPosition, syncWatchTime} =
        useWatchTimeStore();
    const isFocused = useIsFocused();
    const videoRef = useRef<Video>(null);
    const [hasLoggedRecently, setHasLoggedRecently] = useState(false);
    const {user} = useAuthStore();
    const [hasStartedWatching, setHasStartedWatching] = useState(false);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'ContentPlayer'>>();
    const movieId = routeParams.params?.id;
    const isEpisode = routeParams.params?.isEpisode; // Add this line to get the isEpisode parameter
    let currentTime = 0;

    const [loadingError, setLoadingError] = useState<string>('');

    useEffect(() => {
        console.log('Fetching the movie');

        const fetchMovie = async () => {
            if (movieId) {
                try {
                    const fetchedMovie = await findMovieById(movieId);
                    if (fetchedMovie) {
                        setMovie(fetchedMovie);
                    } else {
                        setLoadingError('Failed to load the movie. Please try again.');
                    }
                } catch (error) {
                    console.error('Error fetching the movie:', error);
                    setLoadingError('Failed to load the movie. Please try again.');
                }
            }
        };

        fetchMovie();
        Orientation.lockToLandscape();
        StatusBar.setHidden(true);


    }, [movieId, hasStartedWatching, resetTimer, pauseTimer]);
    useEffect(() => {
        const backAction = () => {
          Orientation.lockToPortrait();  // Or use Orientation.unlockAllOrientations();
    
          if (onBack) {
            onBack();
          }
    
          return true; // Prevent default back behavior (exiting the app)
        };
    
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
        return () => backHandler.remove(); // Clean up back handler on component unmount
      }, [onBack]);

    useFocusEffect(
        React.useCallback(() => {
            hideNavigationBar();
            if (isMoviePlaying) {
                console.log('focus');
            }

            return () => {
                pauseTimer();
                showNavigationBar();

                if (!isFocused) {
                    resetTimer();
                    pauseTimer();
                }
            };
        }, [isMoviePlaying, pauseTimer, isFocused, resetTimer]),
    );

    const onLoad = () => {
        console.log('Loading last playback position');

        StatusBar.setHidden(true);
        if (movieId) {
            getLastPlaybackPosition(movieId, isEpisode).then(lastPlaybackPosition => {
                console.log('The last playback position is: ', lastPlaybackPosition);
                if (videoRef.current && lastPlaybackPosition > 0) {
                    videoRef.current.seek(lastPlaybackPosition);
                }
            });
        }

        setIsMoviePlaying(true);
    };

    const onProgress = (data: {currentTime: number}) => {
        currentTime = Math.floor(data.currentTime);
        if (currentTime) {
            if (movieId && currentTime % 10 === 0 && !hasLoggedRecently) {
                setLastPlaybackPosition(movieId, currentTime, isEpisode);
                setHasLoggedRecently(true);
            } else if (currentTime % 10 !== 0) {
                setHasLoggedRecently(false);
            }
            if (movieId && currentTime % 60 === 0 && !hasLoggedRecently) {
                console.log('Syncing watch time with backend');
                syncWatchTime();
                // Update watch time
                updateWatchTime(movieId, currentTime, isEpisode);
            }
        }
    };

    const onPlay = () => {
        setIsMoviePlaying(true);
        startTimer();
        if (user?.id && movieId && !hasStartedWatching) {
            startUserWatching(movieId, isEpisode).then(startedSuccessfully => {
                if (startedSuccessfully) {
                    setHasStartedWatching(true);
                    logUserContentWatchHistory(user.id, movieId, isEpisode);
                }
            });
        }
    };

    const onPause = () => {
        setIsMoviePlaying(false);
        pauseTimer();
        if (movieId) {
            const pausedCurrentTime = currentTime;

            setLastPlaybackPosition(movieId, pausedCurrentTime, isEpisode);
        }
    };


    const onEnd = () => {
        setIsMoviePlaying(false);
        pauseTimer();
        resetTimer();

        if (movieId) {
            finishUserWatching(movieId, isEpisode)
                .then(finishedSuccessfully => {
                    if (finishedSuccessfully) {
                        const pausedCurrentTime = currentTime;
                        setLastPlaybackPosition(movieId, pausedCurrentTime, isEpisode);
                        setHasStartedWatching(false);

                        if (user && user.id) {
                            logUserContentWatchHistory(user.id, movieId, isEpisode)
                                .then(() => {
                                    Orientation.lockToPortrait();
                                    StatusBar.setHidden(false);
                                    navigation.pop();
                                })
                                .catch(error => {
                                    console.error('Error logging user content watch history:', error);
                                });
                        } else {
                            Orientation.lockToPortrait();
                            StatusBar.setHidden(false);
                            navigation.pop();
                        }
                    } else {
                        console.error('Error finishing movie watching.');
                    }
                })
                .catch(error => {
                    console.error('Error finishing user watching:', error);
                });
        }
    };

    const onBack = () => {
        onPause();

        syncWatchTime();
        // Update watch time
        updateWatchTime(movieId, currentTime, isEpisode);
        // navigation.pop();

        Orientation.lockToPortrait();
        navigation.navigate('ClientTabNavigator', {screen: 'ClientStack'});
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {hasLottieFirstLoopCompleted ? (
                    !loadingError ? (
                        movie && movie.movieURL ? (
                            <>
                                <VideoPlayer
                                    videoRef={videoRef}
                                    source={{
                                        uri: movie.movieURL,
                                    }}
                                    resizeMode="cover"
                                    posterResizeMode="cover"
                                    tapAnywhereToPause={false}
                                    preventsDisplaySleepDuringVideoPlayback={true}
                                    toggleResizeModeOnFullscreen={false}
                                    poster={movie.landscapeURL}
                                    containerStyle={{zIndex: 100}}
                                    onBack={onBack}
                                    paused={!isMoviePlaying}
                                    onPlay={onPlay}
                                    onPause={onPause}
                                    onEnd={onEnd}
                                    onLoad={onLoad}
                                    onProgress={onProgress}
                                    onError={error => console.log('Video error:', error)}
                                />
                            </>
                        ) : (
                            <>
                                {console.log('error')}
                                <ActivityIndicator size="large" color={COLORS.BLACK} />
                            </>
                        )
                    ) : (
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{color: 'red', fontSize: 16}}>{loadingError}</Text>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
                                <Text style={{...FONTS.Title1, color: COLORS.MIDORANGE}}>Go Back</Text>
                            </TouchableOpacity>
                        </View>
                    )
                ) : (
                    <AkcruOpener
                        onAnimationFinish={() => {
                            if (!hasLottieFirstLoopCompleted) {
                                setHasLottieFirstLoopCompleted(true);
                            }
                        }}
                    />
                    // <View style={styles.activitycontainer}>
                    // <Video source={require('../../../../assets/sounds/akcrusound1.mp3')} repeat={false} />
                    // <LottieView
                    //     source={require('../../../../assets/lottie/Akcruopener1.json')}
                    //     autoPlay
                    //     loop={false}
                    //     style={{width: SIZES.ScreenHeight, height: SIZES.ScreenWidth}}
                    //     onAnimationFinish={() => {
                    //         if (!hasLottieFirstLoopCompleted) {
                    //             console.log('here');
                    //             setHasLottieFirstLoopCompleted(true);
                    //         }
                    //     }}
                    // />
                    // </View>
                )}
            </View>
        </View>
    );
}
