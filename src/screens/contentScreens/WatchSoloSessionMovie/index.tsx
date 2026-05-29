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
import SoloSessionCompletionModal from '../../../components/SoloSessionCompletionModal';
import SoloPauseModal from '../../../components/SoloPauseModal';



type WatchSoloSessionMovieNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'WatchSoloSessionMovie'>;

type WatchSoloSessionMovieRouteProp = RouteProp<NoBottomTabStackParams, 'WatchSoloSessionMovie'>;

type Props = {
    navigation: WatchSoloSessionMovieNavigationProp;
    route: WatchSoloSessionMovieRouteProp;
};

export default function WatchSoloSessionMovie({navigation}: Props) {
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
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'WatchSoloSessionMovie'>>();
    const movieId = routeParams.params?.id;
    const isEpisode = routeParams.params?.isEpisode;
    let currentTime = 0;

    const [adLoaded, setAdLoaded] = useState(false);
    const interstitialRef = useRef<InterstitialAd | null>(null);

    const [adDone, setAdDone] = useState(false);
    const adShownRef = useRef(false);
    const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
    const adOpenGuardTimerRef = useRef<NodeJS.Timeout | null>(null);

    const isInAdPhaseRef = useRef(true);

    const {syncProgressPosition, onPlaybackPlay, onPlaybackPause, onPlaybackComplete, playbackPositionRef} =
        usePlaybackWatchTimeEvents({
            contentId: movieId,
            isEpisode,
            suppressPlaybackTrackingRef: isInAdPhaseRef,
        });

    const [adLoading, setAdLoading] = useState(true);
    const [adShowing, setAdShowing] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [duration, setDuration] = useState<number>(0);
    /** True while Google IMA stream ads are playing (not the app interstitial / opener). */
    const [isImaStreamAdActive, setIsImaStreamAdActive] = useState(false);
    const isImaStreamAdActiveRef = useRef(false);

    const onReceiveImaAdEvent = useCallback((e: OnReceiveAdEventData) => {
        let next: boolean | null = null;
        switch (e.event) {
            case ImaAdEvent.CONTENT_PAUSE_REQUESTED:
            case ImaAdEvent.STARTED:
            case ImaAdEvent.AD_BREAK_STARTED:
            case ImaAdEvent.AD_PERIOD_STARTED:
                next = true;
                break;
            case ImaAdEvent.CONTENT_RESUME_REQUESTED:
            case ImaAdEvent.ALL_ADS_COMPLETED:
            case ImaAdEvent.AD_BREAK_ENDED:
            case ImaAdEvent.AD_PERIOD_ENDED:
            case ImaAdEvent.SKIPPED:
            case ImaAdEvent.USER_CLOSE:
            case ImaAdEvent.ERROR:
                next = false;
                break;
            default:
                break;
        }
        if (next === null) {
            return;
        }
        isImaStreamAdActiveRef.current = next;
        setIsImaStreamAdActive(next);
    }, []);
    const PROD_IDS = Platform.select({
        android: 'ca-app-pub-8264001768347242/2150819252',
        ios: 'ca-app-pub-8264001768347242/1708251538',
    });

    const interstitialUnitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_IDS;

    useEffect(() => {
        if (!interstitialUnitId) return;

        const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });
        interstitialRef.current = ad;

        const finishAdPhase = () => {
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
            if (adOpenGuardTimerRef.current) clearTimeout(adOpenGuardTimerRef.current);
            setAdShowing(false);
            setAdDone(true);
        };

        const offLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoading(false);
            if (!adShownRef.current) {
                ad.show();
                adShownRef.current = true;
            }
        });

        const offOpened = ad.addAdEventListener(AdEventType.OPENED, () => {
            setAdShowing(true);
            setIsMoviePlaying(false);
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
            setAdLoading(false);
            finishAdPhase();
        });

        ad.load();

        fallbackTimerRef.current = setTimeout(() => {
            if (!adShownRef.current) {
                setAdLoading(false);
                finishAdPhase();
            }
        }, 2500);

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

    const [loadingError, setLoadingError] = useState<string>('');

    useEffect(() => {
        isInAdPhaseRef.current = true;

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
        // Only re-run when movie changes — do not depend on hasStartedWatching or timers, or
        // isInAdPhaseRef flips back to true after playback starts and blocks onProgress / pause UI.
        return () => {
            isImaStreamAdActiveRef.current = false;
            setIsImaStreamAdActive(false);
        };
    }, [movieId]);

    const onBack = () => {
        onPause();

        if (!isInAdPhaseRef.current) {
            syncWatchTime();
            updateWatchTime(movieId, playbackPositionRef.current, isEpisode, PLAYBACK_EVENT.EXITED);
        }

        Orientation.lockToPortrait();

        const returnTo = routeParams.params?.returnTo;
        if (returnTo === 'goBack' && navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        navigation.navigate('ClientTabNavigator', {screen: 'ClientStack'});
    };

    useEffect(() => {
        const backAction = () => {
            Orientation.lockToPortrait();

            if (onBack) {
                onBack();
            }

            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [onBack]);

    useFocusEffect(
        React.useCallback(() => {
            Orientation.lockToLandscape();
            StatusBar.setHidden(true);
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

    const onLoad = (data: {duration?: number; seekableDuration?: number}) => {
        StatusBar.setHidden(true);

        const loaded =
            typeof data?.duration === 'number' && data.duration > 0
                ? data.duration
                : typeof data?.seekableDuration === 'number' && data.seekableDuration > 0
                  ? data.seekableDuration
                  : 0;
        if (loaded > 0 && !isImaStreamAdActiveRef.current) {
            setDuration(loaded);
        }

        if (isInAdPhaseRef.current) return;

        if (movieId) {
            getLastPlaybackPosition(movieId, isEpisode).then(lastPlaybackPosition => {
                if (videoRef.current && lastPlaybackPosition > 0) {
                    videoRef.current.seek(lastPlaybackPosition);
                }
            });
        }
    };

    const onProgress = (data: {
        currentTime: number;
        playableDuration?: number;
        seekableDuration?: number;
    }) => {
        if (isInAdPhaseRef.current) return;
        if (isImaStreamAdActiveRef.current) return;

        const t = Math.floor(data.currentTime);
        currentTime = t;
        syncProgressPosition(data.currentTime);

        const seekable = data.seekableDuration ?? 0;
        const playable = data.playableDuration ?? 0;
        const inferredDuration = duration > 0 ? duration : Math.max(seekable, playable);
        if (duration <= 0 && inferredDuration > 0) {
            setDuration(inferredDuration);
        }
        if (inferredDuration > 0) {
            // Duration can still be inferred for seek/playback logic,
            // but we no longer show any percentage progress UI.
        }

        if (t) {
            if (movieId && t % 10 === 0 && !hasLoggedRecently) {
                setLastPlaybackPosition(movieId, t, isEpisode);
                setHasLoggedRecently(true);
            } else if (t % 10 !== 0) {
                setHasLoggedRecently(false);
            }

            if (movieId && t % 60 === 0 && !hasLoggedRecently) {
                syncWatchTime();
            }
        }
    };

    const onPlay = () => {
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

        if (isInAdPhaseRef.current) return;

        if (movieId) {
            setLastPlaybackPosition(movieId, playbackPositionRef.current, isEpisode);
        }

        setShowPauseModal(true);

        onPlaybackPause();
    };


    const onEnd = () => {
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
                                    // Instead of pop, show completion modal
                                    Orientation.lockToPortrait();
                                    StatusBar.setHidden(false);
                                    setShowCompletionModal(true);
                                })
                                .catch(error => {
                                    console.error('Error logging user content watch history:', error);
                                    // Fallback if logging fails
                                    Orientation.lockToPortrait();
                                    StatusBar.setHidden(false);
                                    setShowCompletionModal(true);
                                });
                        } else {
                            Orientation.lockToPortrait();
                            StatusBar.setHidden(false);
                            setShowCompletionModal(true);
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

    const handleSendInvite = () => {
        setShowCompletionModal(false);
        if (movie) {
            navigation.navigate('SendMITSchedule', {id: movie.id, movieData: movie});
        }
    };

    const handleFindMatches = () => {
        setShowCompletionModal(false);
        // Assuming there is a screen or tab for finding matches
        navigation.navigate('ClientTabNavigator', {screen: 'FlickFlirt'});
    };

    const handleWatchSomethingElse = () => {
        setShowCompletionModal(false);
        navigation.navigate('ClientTabNavigator', {screen: 'Home'});
    };


    const adTagUrl = `${DEV_API_URL}/v1/video-ads/vmap/main?movieId=${movieId}`;

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {!adDone ? (
                    adLoading && !adShowing ? (
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <ActivityIndicator size="large" color={COLORS.PURPLE} />
                            <Text style={{...FONTS.paragraph1, marginTop: 8}}>Loading ad…</Text>
                        </View>
                    ) : (
                        <View style={{flex: 1, backgroundColor: COLORS.BLACK}} />
                    )
                ) : !hasLottieFirstLoopCompleted ? (
                    <AkcruOpener
                        onAnimationFinish={() => {
                            if (!hasLottieFirstLoopCompleted) {
                                setHasLottieFirstLoopCompleted(true);
                                isInAdPhaseRef.current = false;
                                setIsMoviePlaying(true);
                            }
                        }}
                    />
                ) : (
                    <>
                        {!loadingError ? (
                            movie && movie.movieURL ? (
                                <>
                                    <VideoPlayer
                                        videoRef={videoRef}
                                        source={{
                                            uri: movie.movieURL,
                                            ad: {
                                                adTagUrl,
                                            },
                                        }}
                                        resizeMode="cover"
                                        tapAnywhereToPause={false}
                                        preventsDisplaySleepDuringVideoPlayback={true}
                                        toggleResizeModeOnFullscreen={false}
                                        containerStyle={{zIndex: 100}}
                                        disableFullscreen={true}
                                        onBack={onBack}
                                        paused={!isMoviePlaying}
                                        onPlay={onPlay}
                                        onPause={onPause}
                                        onEnd={onEnd}
                                        onLoad={onLoad}
                                        onProgress={onProgress}
                                        onReceiveAdEvent={onReceiveImaAdEvent}
                                        onError={e => console.log('Video error:', e)}
                                        title={movie.title}
                                    />
                                </>
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
                <SoloSessionCompletionModal
                    visible={showCompletionModal}
                    onClose={() => {
                        setShowCompletionModal(false);
                        navigation.pop();
                    }}
                    onSendInvite={handleSendInvite}
                    onFindMatches={handleFindMatches}
                    onWatchSomethingElse={handleWatchSomethingElse}
                    movie={movie}
                />
                <SoloPauseModal
                    visible={showPauseModal}
                    onClose={() => {
                        setShowPauseModal(false);
                        Orientation.lockToLandscape();
                        StatusBar.setHidden(true);
                        setIsMoviePlaying(true);
                    }}
                    onSendInvite={() => {
                        setShowPauseModal(false);
                        if (movie) {
                            navigation.navigate('SendMITSchedule', {
                                id: movie.id,
                                movieData: movie,
                            });
                        }
                    }}
                    movie={movie}
                />
            </View>
        </View>


    );
}
