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
                    } else {
                    }
                });
            }
        };
    }, [movieId, hasStartedWatching]);

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

            setLastPlaybackPosition(movieId, pausedCurrentTime);
        }
    };

    const onEnd = () => {
        setIsMoviePlaying(false);
        pauseTimer();
        resetTimer();

        if (movieId) {
            const pausedCurrentTime = currentTime;

            setLastPlaybackPosition(movieId, pausedCurrentTime);
            setHasStartedWatching(false);
            Orientation.lockToPortrait();
            StatusBar.setHidden(false);
            navigation.pop();
        }
    };

    const onBack = () => {
        navigation.pop();
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
                    <View style={styles.activitycontainer}>
                        <Video source={require('../../../../assets/sounds/akcrusound1.mp3')} repeat={false} />
                        <LottieView
                            source={require('../../../../assets/lottie/Akcruopener1.json')}
                            autoPlay
                            loop={false}
                            style={{width: SIZES.ScreenHeight, height: SIZES.ScreenWidth}}
                            onAnimationFinish={() => {
                                if (!hasLottieFirstLoopCompleted) {
                                    console.log('here');
                                    setHasLottieFirstLoopCompleted(true);
                                }
                            }}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}
