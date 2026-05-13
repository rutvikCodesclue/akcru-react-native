import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    View,
    StatusBar,
    AppState,
    Text,
    TouchableOpacity,
    BackHandler,
    Platform,
} from 'react-native';
import styles from './styles';
import VideoPlayer from 'react-native-media-console';
import {useRoute, useFocusEffect, useIsFocused} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {IMovie} from '../../../../types';
import {findMovieById} from '../../../lib/api/movies.lib';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import Orientation from 'react-native-orientation-locker';
import Video, {AdEvent as ImaAdEvent, type OnReceiveAdEventData} from 'react-native-video';
import useWatchTimeStore from '../../../stores/watchTime.store';
import {finishUserWatching, startUserWatching, logUserContentWatchHistory} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';
import {PLAYBACK_EVENT, updateWatchTime} from '../../../lib/api/watchtime.lib';
import {usePlaybackWatchTimeEvents} from '../../../hooks/usePlaybackWatchTimeEvents';
import AkcruOpener from '../../../components/AkcruOpener';
import {InterstitialAd, AdEventType, TestIds} from 'react-native-google-mobile-ads';
import {DEV_API_URL} from '@env';

type ContentPlayerNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'ContentPlayer'>;

type ContentPlayerRouteProp = RouteProp<NoBottomTabStackParams, 'ContentPlayer'>;

type Props = {
    navigation: ContentPlayerNavigationProp;
    route: ContentPlayerRouteProp;
};

export default function ContentPlayer({navigation}: Props) {
    const [movie, setMovie] = useState<IMovie | null>(null);
    const [isMoviePlaying, setIsMoviePlaying] = useState<boolean>(false);
    const [hasLottieFirstLoopCompleted, setHasLottieFirstLoopCompleted] = useState(false);
    const {startTimer, pauseTimer, resetTimer, setLastPlaybackPosition, getLastPlaybackPosition, syncWatchTime} =
        useWatchTimeStore();
    const isFocused = useIsFocused();
    const videoRef = useRef<Video>(null);
    const [hasLoggedRecently, setHasLoggedRecently] = useState(false);
    const {user} = useAuthStore();
    const [hasStartedWatching, setHasStartedWatching] = useState(false);
    const [loadingError, setLoadingError] = useState<string>('');
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'ContentPlayer'>>();
    const movieId = routeParams.params?.id;
    const isEpisode = routeParams.params?.isEpisode; // Add this line to get the isEpisode parameter
    let currentTime = 0;

    const interstitialRef = useRef<InterstitialAd | null>(null);

    const [adDone, setAdDone] = useState(false); // interstitial finished (closed/error/fallback)
    const adShownRef = useRef(false); // prevent double show
    const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
    const adOpenGuardTimerRef = useRef<NodeJS.Timeout | null>(null);
    const openerTransitionDoneRef = useRef(false);
    const streamAdFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const streamAdTimerStartedRef = useRef(false);
    const playback403RetriedRef = useRef(false);

    /** IMA/VMAP stream preroll from API — disable on IMA error or timeout so main film still plays. */
    const [useStreamAds, setUseStreamAds] = useState(true);
    const [playbackRemountNonce, setPlaybackRemountNonce] = useState(0);

    const isInAdPhaseRef = useRef(true); // true until opener completes -> prevents saving ad time as movie time

    const {syncProgressPosition, onPlaybackPlay, onPlaybackPause, onPlaybackComplete, playbackPositionRef} =
        usePlaybackWatchTimeEvents({
            contentId: movieId,
            isEpisode,
            suppressPlaybackTrackingRef: isInAdPhaseRef,
        });

    const PROD_INTERSTITIAL_ANDROID = 'ca-app-pub-8264001768347242/2150819252';
    const PROD_INTERSTITIAL_IOS = 'ca-app-pub-8264001768347242/1708251538';
    const TEST_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712';
    const TEST_INTERSTITIAL_IOS = 'ca-app-pub-3940256099942544/4411468910';

    const prodInterstitialId =
        Platform.OS === 'android'
            ? PROD_INTERSTITIAL_ANDROID
            : Platform.OS === 'ios'
              ? PROD_INTERSTITIAL_IOS
              : '';
    const testInterstitialId =
        Platform.OS === 'android'
            ? TEST_INTERSTITIAL_ANDROID
            : Platform.OS === 'ios'
              ? TEST_INTERSTITIAL_IOS
              : '';
    const interstitialUnitId = __DEV__
        ? TestIds.INTERSTITIAL || testInterstitialId
        : prodInterstitialId || testInterstitialId;

    // Create & preload interstitial once per mount (mirrors EpisodePlayer; avoids stuck "Loading ad" UI)
    useEffect(() => {
        if (!interstitialUnitId) {
            setAdDone(true);
            return;
        }

        const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });
        interstitialRef.current = ad;

        const finishAdPhase = () => {
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
            if (adOpenGuardTimerRef.current) clearTimeout(adOpenGuardTimerRef.current);
            setAdDone(true);
        };

        const offLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            if (!adShownRef.current) {
                ad.show();
                adShownRef.current = true;
            }
        });

        const offOpened = ad.addAdEventListener(AdEventType.OPENED, () => {
            setIsMoviePlaying(false);
            // Guard against cases where CLOSED never arrives from SDK/device state.
            if (adOpenGuardTimerRef.current) clearTimeout(adOpenGuardTimerRef.current);
            adOpenGuardTimerRef.current = setTimeout(() => {
                finishAdPhase();
            }, 12000);
        });

        const offClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            finishAdPhase();
            ad.load();
        });

        const offError = ad.addAdEventListener(AdEventType.ERROR, () => {
            finishAdPhase();
        });

        ad.load();

        fallbackTimerRef.current = setTimeout(() => {
            if (!adShownRef.current) {
                finishAdPhase();
            }
        }, 8000);

        return () => {
            offLoaded();
            offOpened();
            offClosed();
            offError();
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
            if (adOpenGuardTimerRef.current) clearTimeout(adOpenGuardTimerRef.current);
            interstitialRef.current = null;
        };
    }, [interstitialUnitId]);

    useEffect(() => {
        openerTransitionDoneRef.current = false;
        streamAdTimerStartedRef.current = false;
        isInAdPhaseRef.current = true;
        playback403RetriedRef.current = false;
        setPlaybackRemountNonce(0);
    }, [movieId]);

    useEffect(() => {
        setUseStreamAds(true);
    }, [movieId]);

    const clearStreamAdFallbackTimer = useCallback(() => {
        if (streamAdFallbackTimerRef.current) {
            clearTimeout(streamAdFallbackTimerRef.current);
            streamAdFallbackTimerRef.current = null;
        }
    }, []);

    const refreshMovieStreamUrl = useCallback(async (): Promise<boolean> => {
        if (!movieId) {
            return false;
        }
        try {
            const fresh = await findMovieById(movieId);
            if (!fresh?.movieURL) {
                return false;
            }
            setMovie(prev => {
                if (!prev) {
                    return fresh;
                }
                return prev.movieURL === fresh.movieURL ? prev : fresh;
            });
            return true;
        } catch {
            return false;
        }
    }, [movieId]);

    const onVideoError = useCallback(
        (err: {error?: Record<string, unknown> | string}) => {
            console.log('Video error:', err);
            const payload = err?.error;
            const errStr =
                typeof payload === 'object' && payload !== null
                    ? JSON.stringify(payload)
                    : String(payload ?? err);
            const is403 =
                errStr.includes('403') ||
                errStr.includes('BAD_HTTP_STATUS') ||
                errStr.includes('22004');
            if (!movieId || !is403 || playback403RetriedRef.current) {
                return;
            }
            playback403RetriedRef.current = true;
            void findMovieById(movieId).then(fresh => {
                if (fresh?.movieURL) {
                    setMovie(fresh);
                    setPlaybackRemountNonce(n => n + 1);
                } else {
                    setLoadingError('Playback link expired. Please try again.');
                }
            });
        },
        [movieId],
    );

    const onReceiveImaAdEvent = useCallback(
        (e: OnReceiveAdEventData) => {
            if (e.event === ImaAdEvent.ERROR) {
                clearStreamAdFallbackTimer();
                setUseStreamAds(false);
                return;
            }
            if (
                e.event === ImaAdEvent.STARTED ||
                e.event === ImaAdEvent.STREAM_LOADED ||
                e.event === ImaAdEvent.LOADED ||
                e.event === ImaAdEvent.AD_BREAK_STARTED
            ) {
                clearStreamAdFallbackTimer();
            }
            if (e.event === ImaAdEvent.CONTENT_RESUME_REQUESTED || e.event === ImaAdEvent.ALL_ADS_COMPLETED) {
                clearStreamAdFallbackTimer();
                void (async () => {
                    setIsMoviePlaying(false);
                    await refreshMovieStreamUrl();
                    setIsMoviePlaying(true);
                })();
                return;
            }
            if (e.event === ImaAdEvent.AD_BREAK_ENDED) {
                clearStreamAdFallbackTimer();
                setIsMoviePlaying(true);
            }
        },
        [clearStreamAdFallbackTimer, refreshMovieStreamUrl],
    );

    useEffect(() => {
        if (!hasLottieFirstLoopCompleted || !movie?.movieURL || !useStreamAds) {
            return;
        }
        if (streamAdTimerStartedRef.current) {
            return;
        }
        streamAdTimerStartedRef.current = true;
        clearStreamAdFallbackTimer();
        streamAdFallbackTimerRef.current = setTimeout(() => {
            streamAdFallbackTimerRef.current = null;
            setUseStreamAds(false);
        }, 20000);
        return () => {
            clearStreamAdFallbackTimer();
        };
    }, [hasLottieFirstLoopCompleted, movie?.movieURL, useStreamAds, clearStreamAdFallbackTimer]);

    useEffect(() => {
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

    const onBack = () => {
        onPause();

        // ✅ Don’t sync/update watchtime if user backs out during ad/opener
        if (!isInAdPhaseRef.current) {
            syncWatchTime();
            updateWatchTime(movieId, playbackPositionRef.current, isEpisode, PLAYBACK_EVENT.EXITED);
        }

        Orientation.lockToPortrait();

        // Opt-in: callers that want the system back-stack behavior (so back
        // returns to the screen that pushed the player) pass `returnTo: 'goBack'`.
        // All existing entry points omit this flag and keep the original
        // hardcoded route to ClientTabNavigator → ClientStack.
        const returnTo = routeParams.params?.returnTo;
        if (returnTo === 'goBack' && navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        navigation.navigate('ClientTabNavigator', {screen: 'ClientStack'});
    };

    useEffect(() => {
        const backAction = () => {
            // Unlock the orientation or reset to portrait
            Orientation.lockToPortrait(); // Or use Orientation.unlockAllOrientations();

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
        StatusBar.setHidden(true);

        // ✅ Do NOT seek or load resume position while in ad/opener phase
        if (isInAdPhaseRef.current) return;

        if (movieId) {
            getLastPlaybackPosition(movieId, isEpisode).then(lastPlaybackPosition => {
                if (videoRef.current && lastPlaybackPosition > 0) {
                    videoRef.current.seek(lastPlaybackPosition);
                }
            });
        }
    };

    const onProgress = (data: {currentTime: number}) => {
        // ✅ Ignore progress events until content phase starts
        if (isInAdPhaseRef.current) return;

        currentTime = Math.floor(data.currentTime);
        syncProgressPosition(data.currentTime);

        if (currentTime) {
            if (movieId && currentTime % 10 === 0 && !hasLoggedRecently) {
                setLastPlaybackPosition(movieId, currentTime, isEpisode);
                setHasLoggedRecently(true);
            } else if (currentTime % 10 !== 0) {
                setHasLoggedRecently(false);
            }

            if (movieId && currentTime % 60 === 0 && !hasLoggedRecently) {
                syncWatchTime();
                updateWatchTime(movieId, currentTime, isEpisode, PLAYBACK_EVENT.PROGRESS);
            }
        }
    };

    const onPlay = () => {
        // ✅ Do not start timers/watching during ad phase
        if (isInAdPhaseRef.current) return;

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

        onPlaybackPlay();
    };

    const onPause = () => {
        setIsMoviePlaying(false);
        pauseTimer();

        // ✅ Don't save positions during ad phase
        if (isInAdPhaseRef.current) return;

        if (movieId) {
            setLastPlaybackPosition(movieId, currentTime, isEpisode);
        }

        onPlaybackPause();
    };

    const onEnd = () => {
        // ✅ If end fires during ad phase for any reason, ignore
        if (isInAdPhaseRef.current) return;

        onPlaybackComplete();

        setIsMoviePlaying(false);
        pauseTimer();
        resetTimer();

        if (movieId) {
            finishUserWatching(movieId, isEpisode)
                .then(finishedSuccessfully => {
                    if (finishedSuccessfully) {
                        const pausedCurrentTime = playbackPositionRef.current;
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

    const adTagUrl =
        movieId && DEV_API_URL
            ? `${DEV_API_URL}/v1/video-ads/vmap/main?movieId=${encodeURIComponent(movieId)}`
            : '';

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {!adDone ? (
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <ActivityIndicator size="large" color={COLORS.PURPLE} />
                        <Text style={{...FONTS.paragraph1, marginTop: 8}}>Loading ad…</Text>
                    </View>
                ) : !hasLottieFirstLoopCompleted ? (
                    // PHASE 2: show opener AFTER ad finishes
                    <AkcruOpener
                        onAnimationFinish={() => {
                            if (openerTransitionDoneRef.current) return;
                            openerTransitionDoneRef.current = true;
                            setHasLottieFirstLoopCompleted(true);
                            isInAdPhaseRef.current = false;
                            setIsMoviePlaying(true);
                            if (movieId) {
                                void (async () => {
                                    try {
                                        const fresh = await findMovieById(movieId);
                                        if (fresh?.movieURL) {
                                            setMovie(fresh);
                                        } else if (!movie?.movieURL) {
                                            setLoadingError(
                                                'Failed to prepare playback. The stream link may have expired — please try again.',
                                            );
                                        }
                                    } catch {
                                        if (!movie?.movieURL) {
                                            setLoadingError(
                                                'Failed to prepare playback. Please check your connection and try again.',
                                            );
                                        }
                                    }
                                })();
                            }
                        }}
                    />
                ) : (
                    // PHASE 3: player
                    <>
                        {!loadingError ? (
                            movie && movie.movieURL ? (
                                <VideoPlayer
                                    key={`${movie.movieURL}-${useStreamAds ? 'ima' : 'plain'}-${playbackRemountNonce}`}
                                    videoRef={videoRef}
                                    source={
                                        useStreamAds && adTagUrl
                                            ? {
                                                  uri: movie.movieURL,
                                                  ad: {adTagUrl},
                                              }
                                            : {uri: movie.movieURL}
                                    }
                                    resizeMode="cover"
                                    tapAnywhereToPause={false}
                                    preventsDisplaySleepDuringVideoPlayback={true}
                                    toggleResizeModeOnFullscreen={false}
                                    // poster={movie.landscapeURL}
                                    containerStyle={{zIndex: 100}}
                                    disableFullscreen={true}
                                    onBack={onBack}
                                    paused={!isMoviePlaying} // ← stays paused until opener finished
                                    onPlay={onPlay}
                                    onPause={onPause}
                                    onEnd={onEnd}
                                    onLoad={onLoad}
                                    onProgress={onProgress}
                                    onReceiveAdEvent={onReceiveImaAdEvent}
                                    onError={onVideoError}
                                    title={movie.title}
                                />
                            ) : (
                                <ActivityIndicator size="large" color={COLORS.BLACK} />
                            )
                        ) : (
                            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={{color: 'red', fontSize: 16}}>{loadingError}</Text>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
                                    <Text style={{...FONTS.Title1, color: COLORS.MIDORANGE}}>Go Back</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </View>
        </View>
    );
}
