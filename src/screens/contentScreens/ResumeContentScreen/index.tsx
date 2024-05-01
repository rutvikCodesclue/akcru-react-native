import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, View, StatusBar, AppState, Text, TouchableOpacity} from 'react-native';
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
import {finishUserWatching, startUserWatching, logUserMovieWatchHistory} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';

type ResumePlayerNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'ContentPlayer'>;

type ResumePlayerRouteProp = RouteProp<NoBottomTabStackParams, 'ContentPlayer'>;

type Props = {
    navigation: ResumePlayerNavigationProp;
    route: ResumePlayerRouteProp;
};

export default function ResumePlayer({navigation, route}: Props) {
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
    let currentTime = 0;

    const [loadingError, setLoadingError] = useState<string>('');

    useEffect(() => {
        console.log('useEffect123');

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

        return () => {
            if (hasStartedWatching && movieId) {
                finishUserWatching(movieId).then(finishedSuccessfully => {
                    if (finishedSuccessfully) {
                        resetTimer();
                        pauseTimer();
                        Orientation.lockToPortrait();
                        StatusBar.setHidden(false);
                        //console.log(`User finished watching movie: ${movieId}`);
                    } else {
                        //console.log(`Failed to mark movie as finished: ${movieId}`);
                    }
                });
            }
        };
    }, [movieId, hasStartedWatching]);

    // useFocusEffect(
    //     React.useCallback(() => {
    //         // Logic to execute when the screen comes into focus could go here

    //         return () => {
    //     console.log("useFOcus2")

    //             // This cleanup function runs when the screen loses focus
    //             // Perform the "finished watching" logic here
    //             if (user?.id && movieId && hasStartedWatching) {
    //                 finishUserWatching(movieId).then(finishedSuccessfully => {
    //                     if (finishedSuccessfully) {
    //                         console.log(`User finished watching movie: ${movieId}`);
    //                     } else {
    //                         console.log(`Failed to mark movie as finished: ${movieId}`);
    //                     }
    //                 });
    //             }
    //         };
    //     }, [user?.id, movieId, hasStartedWatching]),
    // );

    const [appState, setAppState] = useState(AppState.currentState);

    // useEffect(() => {
    //     console.log("useEffect")
    //     const subscription = AppState.addEventListener('change', nextAppState => {

    //         if (appState.match(/inactive|background/) && nextAppState === 'active') {
    //             console.log('App has come to the foreground!');
    //             // App has come to the foreground, maybe refresh some data
    //         } else if (nextAppState.match(/inactive|background/)) {
    //             console.log('App has gone to the background');
    //             // App has gone to the background, consider pausing or finishing video playback
    //             if (user?.id && movieId && hasStartedWatching) {
    //                 finishUserWatching(movieId).then(finishedSuccessfully => {
    //                     if (finishedSuccessfully) {
    //                         console.log(`App state, User finished watching movie: ${movieId}`);
    //                     } else {
    //                         console.log(` App state,Failed to mark movie as finished: ${movieId}`);
    //                     }
    //                 });
    //             }
    //         }
    //         setAppState(nextAppState);
    //     });

    //     return () => {
    //         subscription.remove();
    //     };
    // }, [user?.id, movieId, hasStartedWatching, appState]);

    // Sync watch time on unmount and when app goes into background
    // useEffect(() => {
    //     return () => {
    //         syncWatchTime();
    //     };
    // }, []);

    useFocusEffect(
        React.useCallback(() => {
            hideNavigationBar()
            if (isMoviePlaying) {
                // startTimer();
                // syncWatchTime(); // Sync when navigating away from the screen
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
        }, [isMoviePlaying, isFocused]),
    );

    const onLoad = () => {
        setIsMoviePlaying(true);
        StatusBar.setHidden(true);
        if (movieId) {
            getLastPlaybackPosition(movieId).then(lastPlaybackPosition => {
                if (videoRef.current && lastPlaybackPosition > 0) {
                    videoRef.current.seek(lastPlaybackPosition);
                }
            });
        }
    };

    const onProgress = (data: {currentTime: number}) => {
        currentTime = Math.floor(data.currentTime);
        if (movieId && currentTime % 10 === 0 && !hasLoggedRecently) {
            setLastPlaybackPosition(movieId, currentTime);
            setHasLoggedRecently(true);
        } else if (currentTime % 10 !== 0) {
            setHasLoggedRecently(false);
        }
        if (movieId && currentTime % 60 === 0 && !hasLoggedRecently) {
            syncWatchTime();
        }
    };

    const onPlay = () => {
        console.log('onPlay');
        setIsMoviePlaying(true);
        startTimer();
        console.log(user?.id && movieId && hasStartedWatching);
        if (user?.id && movieId && !hasStartedWatching) {
            startUserWatching(user.id, movieId).then(startedSuccessfully => {
                if (startedSuccessfully) {
                    setHasStartedWatching(true);
                    logUserMovieWatchHistory(user.id, movieId);
                }
            });
        }
    };

    const onPause = () => {
        setIsMoviePlaying(false);
        pauseTimer();
        if (movieId) {
            const pausedCurrentTime = currentTime;
            //console.log('Paused at:', pausedCurrentTime);
            setLastPlaybackPosition(movieId, pausedCurrentTime);
        }
    };

    const onEnd = () => {
        setIsMoviePlaying(false);
        pauseTimer();
        resetTimer();

        if (movieId) {
            const pausedCurrentTime = currentTime;
            //console.log('Ended at:', endedCurrentTime);
            setLastPlaybackPosition(movieId, pausedCurrentTime);
            setHasStartedWatching(false);
            Orientation.lockToPortrait();
            StatusBar.setHidden(false);
            navigation.pop();
        }
    };

    const onBack = () => {
        // Navigate back to the previous screen
        navigation.pop();
        // navigation.navigate('ResumeDetailScreen');
        // Lock orientation to portrait
        // Optionally, lock orientation to portrait if leaving the player
        Orientation.lockToPortrait();
        StatusBar.setHidden(false);
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {
                    !loadingError ? (
                        movie && movie.movieURL ? (
                            <>
                                {console.log('movie url:', movie.movieURL)}
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
                            <TouchableOpacity onPress={() => navigation.navigate('ResumeDetailScreen')} style={{marginTop: 20}}>
                                <Text style={{...FONTS.Title1, color: COLORS.PINK}}>Go Back</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            </View>
        </View>
    );
}
