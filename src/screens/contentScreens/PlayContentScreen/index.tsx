import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, View, StatusBar, AppState, Text, TouchableOpacity, BackHandler, Platform} from 'react-native';
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
import { DEV_API_URL } from '@env';

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
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'ContentPlayer'>>();
    const movieId = routeParams.params?.id;
    const isEpisode = routeParams.params?.isEpisode; // Add this line to get the isEpisode parameter
    let currentTime = 0;

    const [adLoaded, setAdLoaded] = useState(false);
    const interstitialRef = useRef<InterstitialAd | null>(null);

    const [adDone, setAdDone] = useState(false); // interstitial finished (closed/error/fallback)
    const adShownRef = useRef(false); // prevent double show
    const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

    const PROD_IDS = Platform.select({
        android: 'ca-app-pub-8264001768347242/2150819252', // <-- your real ANDROID id
        ios: 'ca-app-pub-8264001768347242/1708251538', // <-- your real iOS id (make a separate unit in AdMob)
    });

    const interstitialUnitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_IDS;

    // Create & preload interstitial once per mount
    useEffect(() => {
        if (!interstitialUnitId) return;

        const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });
        interstitialRef.current = ad;

        const offLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            if (!adShownRef.current) {
                ad.show();
                adShownRef.current = true;
            }
        });

        const offOpened = ad.addAdEventListener(AdEventType.OPENED, () => {
            // make sure content is paused while ad is up
            setIsMoviePlaying(false);
        });

        const finishAdPhase = () => {
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
            setAdDone(true);
        };

        const offClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            finishAdPhase(); // proceed to opener
            ad.load(); // optional: prepare next time
        });

        const offError = ad.addAdEventListener(AdEventType.ERROR, () => {
            finishAdPhase(); // no ad available — proceed to opener
        });

        // Kick off load immediately on mount
        ad.load();

        // Fallback in case neither LOADED nor ERROR fires quickly
        fallbackTimerRef.current = setTimeout(() => {
            if (!adShownRef.current) finishAdPhase();
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
        Orientation.lockToLandscape();
        StatusBar.setHidden(true);
    }, [movieId, hasStartedWatching, resetTimer, pauseTimer]);

    const onBack = () => {
        onPause();

        syncWatchTime();
        // Update watch time
        updateWatchTime(movieId, currentTime, isEpisode);
        // navigation.pop();

        Orientation.lockToPortrait();
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

    const adTagUrl = `${DEV_API_URL}/v1/video-ads/vmap/main?movieId=${movieId}`;
    console.log("VMAP_URL_USED:", adTagUrl);
    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {!adDone ? (
                    // PHASE 1: waiting/playing interstitial
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <ActivityIndicator size="large" color={COLORS.PURPLE} />
                        <Text style={{...FONTS.paragraph1, marginTop: 8}}>Loading ad…</Text>
                    </View>
                ) : !hasLottieFirstLoopCompleted ? (
                    // PHASE 2: show opener AFTER ad finishes
                    <AkcruOpener
                        onAnimationFinish={() => {
                            if (!hasLottieFirstLoopCompleted) {
                                setHasLottieFirstLoopCompleted(true);
                                setIsMoviePlaying(true); // start movie right after opener
                            }
                        }}
                    />
                ) : (
                    // PHASE 3: player
                    <>
                        {!loadingError ? (
                            movie && movie.movieURL ? (
                                <VideoPlayer
                                    videoRef={videoRef}
                                    source={{
                                        uri: movie.movieURL,
                                        ad: {
                                            adTagUrl, 
                                            // 'http://10.0.2.2:3000/v1/video-ads/vmap/main',
                                            // 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480|640x360|640x480&iu=/23317898787/app_video_preroll&env=vp&impl=s&gdfp_req=1&output=vast&unviewed_position_start=1&url=[referrer_url]&description_url=[description_url]&correlator=[timestamp]',
                                        },
                                    }}
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
                                    onError={e => console.log('Video error:', e)}
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
