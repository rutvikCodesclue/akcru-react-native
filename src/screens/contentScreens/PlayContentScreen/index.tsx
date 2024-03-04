import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, View, StatusBar} from 'react-native';
import styles from './styles';
import VideoPlayer from 'react-native-media-console';
import {useRoute, useFocusEffect, useIsFocused} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {IMovie} from '../../../../types';
import {findMovieById} from '../../../lib/api/movies.lib';
import {COLORS} from '../../../../assets/constants';
import LottieView from 'lottie-react-native';
import Orientation from 'react-native-orientation-locker';
import Video from 'react-native-video';
import useWatchTimeStore from '../../../stores/watchTime.store';
import {finishUserWatching, startUserWatching, logUserMovieWatchHistory} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';

type ContentPlayerNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'ContentPlayer'>;

type ContentPlayerRouteProp = RouteProp<NoBottomTabStackParams, 'ContentPlayer'>;

type Props = {
    navigation: ContentPlayerNavigationProp;
    route: ContentPlayerRouteProp;
};

export default function ContentPlayer({navigation, route}: Props) {
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

    useEffect(() => {
        const fetchMovie = async () => {
            if (movieId) {
                const fetchedMovie = await findMovieById(movieId);
                setMovie(fetchedMovie);
            }
        };

        fetchMovie();
        Orientation.lockToLandscape();
        StatusBar.setHidden(true);

        return () => {
            Orientation.lockToPortrait();
            StatusBar.setHidden(false);
            if (hasStartedWatching && user?.id && movieId) {
                finishUserWatching(user.id, movieId).then(finishedSuccessfully => {
                    if (finishedSuccessfully) {
                        //console.log(`User finished watching movie: ${movieId}`);
                    } else {
                        //console.log(`Failed to mark movie as finished: ${movieId}`);
                    }
                });
            }
        };
    }, [movieId, user?.id, hasStartedWatching]);

    // Sync watch time on unmount and when app goes into background
    useEffect(() => {
        return () => {
            syncWatchTime();
        };
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (isMoviePlaying) {
                startTimer();
                syncWatchTime(); // Sync when navigating away from the screen
            }

            return () => {
                pauseTimer();
                if (!isFocused) {
                    resetTimer();
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

    const onProgress = data => {
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
        setIsMoviePlaying(true);
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
        if (movieId) {
            const pausedCurrentTime = currentTime;
            //console.log('Paused at:', pausedCurrentTime);
            setLastPlaybackPosition(movieId, pausedCurrentTime);
        }
    };

    // Placeholder for your video container style
    const videoContainerStyle = {
        zIndex: 100,
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {hasLottieFirstLoopCompleted ? (
                    movie && movie.movieURL ? (
                        <>
                            <VideoPlayer
                                videoRef={videoRef}
                                source={{
                                    uri: movie.movieURL,
                                }}
                                resizeMode="cover"
                                tapAnywhereToPause={false}
                                preventsDisplaySleepDuringVideoPlayback={true}
                                toggleResizeModeOnFullscreen={false}
                                containerStyle={videoContainerStyle}
                                onBack={() => navigation.pop()}
                                paused={!isMoviePlaying}
                                onLoad={onLoad}
                                onProgress={onProgress}
                                onPlay={onPlay}
                                onPause={onPause}
                            />
                        </>
                    ) : (
                        <ActivityIndicator size="large" color={COLORS.BLACK} />
                    )
                ) : (
                    <View style={styles.activitycontainer}>
                        <LottieView
                            source={require('../../../../assets/lottie/Akcruopener1.json')}
                            autoPlay
                            loop={false}
                            onAnimationFinish={() => setHasLottieFirstLoopCompleted(true)}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}
