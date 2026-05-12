import React, {useEffect, useRef, useState} from 'react';
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
import {Snackbar, Portal} from 'react-native-paper';
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
import Video from 'react-native-video';
import useWatchTimeStore from '../../../stores/watchTime.store';
import {finishUserWatching, startUserWatching, logUserContentWatchHistory} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';
import {updateWatchTime} from '../../../lib/api/watchtime.lib';
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

    const isInAdPhaseRef = useRef(true);

    const [adLoading, setAdLoading] = useState(true);
    const [adShowing, setAdShowing] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [duration, setDuration] = useState<number>(0);
    const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [shownPercentages, setShownPercentages] = useState<number[]>([]);
    const [currentPercent, setCurrentPercent] = useState<number>(0);



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
            interstitialRef.current = null;
        };
    }, [interstitialUnitId]);

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
    }, [movieId, hasStartedWatching, resetTimer, pauseTimer]);

    const onBack = () => {
        onPause();

        if (!isInAdPhaseRef.current) {
            syncWatchTime();
            updateWatchTime(movieId, currentTime, isEpisode);
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

    const onLoad = (data: any) => {
        console.log('Video Load Data:', data);
        StatusBar.setHidden(true);

        if (data && data.duration) {
            console.log('Setting Duration:', data.duration);
            setDuration(data.duration);
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

    const onProgress = (data: {currentTime: number}) => {
        if (isInAdPhaseRef.current) return;

        currentTime = Math.floor(data.currentTime);

        if (currentTime) {
            if (movieId && currentTime % 10 === 0 && !hasLoggedRecently) {
                setLastPlaybackPosition(movieId, currentTime, isEpisode);
                setHasLoggedRecently(true);
            } else if (currentTime % 10 !== 0) {
                setHasLoggedRecently(false);
            }

            if (movieId && currentTime % 60 === 0 && !hasLoggedRecently) {
                syncWatchTime();
                updateWatchTime(movieId, currentTime, isEpisode);
            }

            // Milestone snackbars
            if (duration > 0) {
                const percent = Math.floor((data.currentTime / duration) * 100);
                setCurrentPercent(percent);

                const milestones = [10, 25, 50, 75, 90];
                // Find milestones that are reached but not yet shown
                const applicableMilestones = milestones.filter(m => percent >= m && !shownPercentages.includes(m));

                if (applicableMilestones.length > 0) {
                    // Pick the highest one reached to avoid showing multiple in a row if seeking
                    const hitMilestone = Math.max(...applicableMilestones);

                    console.log('Milestone Triggered:', hitMilestone, 'Current Percent:', percent);
                    setShownPercentages(prev => [...prev, hitMilestone]);
                    setSnackbarMessage(`you played video ${hitMilestone}%`);
                    setSnackbarVisible(true);
                }
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
    };

    const onPause = () => {
        setIsMoviePlaying(false);
        pauseTimer();

        if (isInAdPhaseRef.current) return;

        if (movieId) {
            setLastPlaybackPosition(movieId, currentTime, isEpisode);
        }

        setShowPauseModal(true);
    };


    const onEnd = () => {
        if (isInAdPhaseRef.current) return;

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
            navigation.navigate('MITDateSchedule', {id: movie.id});
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
                        <View style={{flex: 1, backgroundColor: 'black'}} />
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
                                        onError={e => console.log('Video error:', e)}
                                        title={movie.title}
                                    />
                                    <View style={{position: 'absolute', top: 20, width: '100%', alignItems: 'center', zIndex: 1000}} pointerEvents="none">
                                        <Text style={{color: COLORS.WHITE, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, ...FONTS.Title1}}>
                                            Progress: {currentPercent}%
                                        </Text>
                                    </View>
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
                            navigation.navigate('MITDateSchedule', {
                                id: movie.id,
                            });
                        }
                    }}
                    movie={movie}
                />
            </View>
            <Portal>
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={{backgroundColor: COLORS.PURPLE}}
                    action={{
                        label: 'Close',
                        onPress: () => setSnackbarVisible(false),
                    }}>
                    <Text style={{color: COLORS.WHITE, ...FONTS.paragraph2}}>{snackbarMessage}</Text>
                </Snackbar>
            </Portal>
        </View>


    );
}
