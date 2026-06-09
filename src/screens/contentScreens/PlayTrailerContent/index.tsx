import {ActivityIndicator, BackHandler, View, StatusBar} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import styles from './styles';
import VideoPlayer from 'react-native-media-console';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {IMovie} from '../../../../types';
import {findMovieById} from '../../../lib/api/movies.lib';
import {useRoute} from '@react-navigation/native';
import {COLORS} from '../../../../assets/constants';
import Orientation from 'react-native-orientation-locker';
import {finishUserWatching} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import Video from 'react-native-video';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';
import {setPpvThankYouPending} from '../../../lib/ppvPlaybackFlow';
import {PPV_WATCH_COMPLETION_THRESHOLD} from '../../userScreens/ppv_screen/ppvConstants';

type TrailerPlayerNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'TrailerPlayer'>;

type TrailerPlayerRouteProp = RouteProp<NoBottomTabStackParams, 'TrailerPlayer'>;

type Props = {
    navigation: TrailerPlayerNavigationProp;
    route: TrailerPlayerRouteProp;
};

export default function TrailerPlayer({navigation, route}: Props) {
    const [movie, setMovie] = useState<IMovie | null>(null);
    const [isMoviePlaying, setIsMoviePlaying] = useState<boolean>(true);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'TrailerPlayer'>>();
    const [, setShouldAutoplay] = useState(true);
    const {user} = useAuthStore();
    const videoRef = useRef<Video>(null);

    useFocusEffect(
        React.useCallback(() => {
            setShouldAutoplay(true);
            hideNavigationBar();

            return () => {
                setShouldAutoplay(false);
                showNavigationBar();
            };
        }, []),
    );

    const movieId = routeParams.params?.id;
    const playFullMovie = routeParams.params?.playFullMovie === true;
    const fromPpvFlow = routeParams.params?.fromPpvFlow === true;
    const routeVideoUri = routeParams.params?.trailerURL?.trim();
    const routePosterUri = routeParams.params?.landscapeURL?.trim();
    const [hasStartedWatching] = useState(false);
    const videoDurationRef = useRef(0);
    const maxWatchProgressRef = useRef(0);

    const resolveVideoUri = (fetched: IMovie | null): string | undefined => {
        if (routeVideoUri) {
            return routeVideoUri;
        }
        if (!fetched) {
            return undefined;
        }
        if (playFullMovie) {
            return fetched.movieURL?.trim() || fetched.trailerURL?.trim();
        }
        return fetched.trailerURL?.trim();
    };

    const videoUri = resolveVideoUri(movie);
    const posterUri = routePosterUri || movie?.landscapeURL?.trim();
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

    useEffect(() => {
        if (movie?.duration && movie.duration > 0 && videoDurationRef.current <= 0) {
            videoDurationRef.current = movie.duration;
        }
    }, [movie?.duration]);

    const resolveVideoDuration = useCallback(
        (data?: {seekableDuration?: number; playableDuration?: number}) => {
            if (videoDurationRef.current > 0) {
                return videoDurationRef.current;
            }

            const seekableDuration = data?.seekableDuration ?? 0;
            const playableDuration = data?.playableDuration ?? 0;
            const inferredDuration = Math.max(seekableDuration, playableDuration, movie?.duration ?? 0);

            if (inferredDuration > 0) {
                videoDurationRef.current = inferredDuration;
            }

            return inferredDuration;
        },
        [movie?.duration],
    );

    const updateWatchProgress = useCallback(
        (currentTime: number, data?: {seekableDuration?: number; playableDuration?: number}) => {
            const duration = resolveVideoDuration(data);
            if (duration <= 0) {
                return;
            }

            const progress = Math.min(Math.max(currentTime / duration, 0), 1);
            maxWatchProgressRef.current = Math.max(maxWatchProgressRef.current, progress);
        },
        [resolveVideoDuration],
    );

    const shouldShowPpvThankYou = useCallback(() => {
        return (
            fromPpvFlow &&
            playFullMovie &&
            maxWatchProgressRef.current >= PPV_WATCH_COMPLETION_THRESHOLD &&
            Boolean(movie || movieId)
        );
    }, [fromPpvFlow, movie, movieId, playFullMovie]);

    const resolveThankYouMovie = useCallback((): IMovie => {
        if (movie) {
            return movie;
        }

        return {
            id: movieId ?? '',
            title: routeParams.params?.title ?? '',
            landscapeURL: routeParams.params?.landscapeURL ?? '',
            portraitURL: routeParams.params?.landscapeURL ?? '',
        } as IMovie;
    }, [movie, movieId, routeParams.params?.landscapeURL, routeParams.params?.title]);

    const handlePlayerExit = useCallback(() => {
        Orientation.lockToPortrait();
        StatusBar.setHidden(false);

        if (shouldShowPpvThankYou()) {
            setPpvThankYouPending(resolveThankYouMovie());
        }

        navigation.pop();
    }, [navigation, resolveThankYouMovie, shouldShowPpvThankYou]);

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            handlePlayerExit();
            return true;
        });

        return () => subscription.remove();
    }, [handlePlayerExit]);

    const onLoad = useCallback(
        (data: {duration: number}) => {
            if (data.duration > 0) {
                videoDurationRef.current = data.duration;
            }
        },
        [],
    );

    const onProgress = useCallback(
        (data: {currentTime: number; seekableDuration?: number; playableDuration?: number}) => {
            updateWatchProgress(data.currentTime, data);
        },
        [updateWatchProgress],
    );

    const onSeek = useCallback(
        (data: {seekTime: number; currentTime?: number}) => {
            const seekPosition = data.seekTime ?? data.currentTime ?? 0;
            updateWatchProgress(seekPosition);
        },
        [updateWatchProgress],
    );

    const onPlay = () => {
        setIsMoviePlaying(true);
        StatusBar.setHidden(true);
    };
    const onPause = () => {
        setIsMoviePlaying(false);
        StatusBar.setHidden(false);
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {videoUri ? (
                    <>
                        <VideoPlayer
                            videoRef={videoRef}
                            source={{
                                uri: videoUri,
                            }}
                            resizeMode="cover"
                            posterResizeMode="cover"
                            tapAnywhereToPause={false}
                            preventsDisplaySleepDuringVideoPlayback={true}
                            toggleResizeModeOnFullscreen={false}
                            poster={posterUri}
                            containerStyle={{zIndex: 100}}
                            onBack={handlePlayerExit}
                            paused={!isMoviePlaying}
                            onPlay={onPlay}
                            onPause={onPause}
                            onLoad={onLoad}
                            onProgress={onProgress}
                            onSeek={onSeek}
                            onEnd={handlePlayerExit}
                            onError={error => console.log('Video error:', error)}
                        />
                    </>
                ) : (
                    <>
                        {console.log('Movie indicator')}
                        <ActivityIndicator size="large" color={COLORS.CATPURPDRK} style={{alignSelf: 'center'}} />
                    </>
                )}
            </View>
        </View>
    );
}
