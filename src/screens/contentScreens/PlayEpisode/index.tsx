import {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, View, StatusBar, Text, TouchableOpacity, Platform} from 'react-native';
import styles from './styles';
import VideoPlayer from 'react-native-media-console';
import {useRoute, useFocusEffect, useIsFocused} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {IEpisode} from '../../../../types';
import {getEpisodesBySeasonId} from '../../../lib/api/series.lib';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import LottieView from 'lottie-react-native';
import Orientation from 'react-native-orientation-locker';
import Video from 'react-native-video';
import useWatchTimeStore from '../../../stores/watchTime.store';
import {finishUserWatching, logUserContentWatchHistory, startUserWatching} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';
import {PLAYBACK_EVENT, updateWatchTime} from '../../../lib/api/watchtime.lib';
import {usePlaybackWatchTimeEvents} from '../../../hooks/usePlaybackWatchTimeEvents';
import AkcruOpener from '../../../components/AkcruOpener';
import {InterstitialAd, AdEventType, TestIds} from 'react-native-google-mobile-ads';

type EpisodePlayerNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'EpisodePlayer'>;
type EpisodePlayerRouteProp = RouteProp<NoBottomTabStackParams, 'EpisodePlayer'>;

type Props = {
    navigation: EpisodePlayerNavigationProp;
    route: EpisodePlayerRouteProp;
};

export default function EpisodePlayer({navigation}: Props) {
    const [episode, setEpisode] = useState<IEpisode | null>(null);
    const [isEpisodePlaying, setIsEpisodePlaying] = useState<boolean>(false);
    const [hasLottieFirstLoopCompleted, setHasLottieFirstLoopCompleted] = useState(false);
    const {startTimer, pauseTimer, resetTimer, setLastPlaybackPosition, getLastPlaybackPosition, syncWatchTime} =
        useWatchTimeStore();
    const isFocused = useIsFocused();
    const videoRef = useRef<Video>(null);
    const [hasLoggedRecently, setHasLoggedRecently] = useState(false);
    const {user} = useAuthStore();
    const [hasStartedWatching, setHasStartedWatching] = useState(false);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'EpisodePlayer'>>();

    // Add detailed logging
    const {seriesId, seasonId, episodeId, episode: passedEpisode} = routeParams.params || {};

    let currentTime = 0;
    const [loadingError, setLoadingError] = useState<string>('');

    const [adDone, setAdDone] = useState(false); // interstitial finished (closed/error/fallback)
    const adShownRef = useRef(false); // show only once
    const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
    const adOpenGuardTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInAdPhaseRef = useRef(true);

    const {syncProgressPosition, onPlaybackPlay, onPlaybackPause, onPlaybackComplete, playbackPositionRef} =
        usePlaybackWatchTimeEvents({
            contentId: episodeId,
            isEpisode: true,
            suppressPlaybackTrackingRef: isInAdPhaseRef,
        });

    // interstitial instance + unit id
    const interstitialRef = useRef<InterstitialAd | null>(null);
    const PROD_IDS = Platform.select({
        android: 'ca-app-pub-8264001768347242/2150819252',
        ios: 'ca-app-pub-8264001768347242/1708251538',
    });
    const interstitialUnitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_IDS;

    useEffect(() => {
        isInAdPhaseRef.current = true;
    }, [episodeId]);

    useEffect(() => {
        if (!interstitialUnitId) return;

        const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });
        interstitialRef.current = ad;

        const finishAdPhase = () => {
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
            if (adOpenGuardTimerRef.current) clearTimeout(adOpenGuardTimerRef.current);
            setAdDone(true); // allow opener to show
        };

        const offLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            if (!adShownRef.current) {
                ad.show();
                adShownRef.current = true;
            }
        });

        const offOpened = ad.addAdEventListener(AdEventType.OPENED, () => {
            // make sure content stays paused during ad
            setIsEpisodePlaying(false);
            if (adOpenGuardTimerRef.current) clearTimeout(adOpenGuardTimerRef.current);
            adOpenGuardTimerRef.current = setTimeout(() => {
                finishAdPhase();
            }, 12000);
        });

        const offClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            finishAdPhase(); // proceed to opener
            ad.load(); // optional: prepare next ad
        });

        const offError = ad.addAdEventListener(AdEventType.ERROR, () => {
            finishAdPhase(); // fallback if ad fails
        });

        // kick off load immediately
        ad.load();

        // fallback: if no LOADED/ERROR in ~2.5s, move on
        fallbackTimerRef.current = setTimeout(() => {
            if (!adShownRef.current) finishAdPhase();
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


    const resetOrientationAndExit = () => {
        console.log('Resetting orientation and exiting...');
        Orientation.lockToPortrait();
        StatusBar.setHidden(false);
        showNavigationBar();
        navigation.pop();
    };

    // Centralized cleanup function
    const performCleanup = async () => {
        console.log('Performing cleanup...');
        pauseTimer();
        syncWatchTime();

        if (episodeId) {
            updateWatchTime(episodeId, playbackPositionRef.current, true, PLAYBACK_EVENT.EXITED);
            setLastPlaybackPosition(episodeId, playbackPositionRef.current, true);
        }

        if (hasStartedWatching && episodeId) {
            try {
                await finishUserWatching(episodeId, true);
                resetTimer();
                setHasStartedWatching(false);
            } catch (error) {
                console.error('Error in cleanup finishUserWatching:', error);
            }
        }
    };

    useEffect(() => {
        // If episode data was passed, use it directly
        if (passedEpisode) {
            console.log('Using passed episode data');
            setEpisode(passedEpisode);
            Orientation.lockToLandscape();
            StatusBar.setHidden(true);
            return;
        }

        // Otherwise fetch it (keep existing logic as fallback)
        const fetchEpisode = async () => {
            console.log('fetchEpisode called with:', {seriesId, seasonId, episodeId});

            if (seriesId && seasonId && episodeId) {
                try {
                    console.log('Fetching episodes for season...');
                    const episodes = await getEpisodesBySeasonId(seriesId, seasonId);
                    console.log('Fetched episodes:', episodes);
                    console.log('Looking for episode with id:', episodeId);

                    const fetchedEpisode =
                        episodes.find(episode => {
                            console.log('Checking episode:', episode);
                            console.log('Episode id:', episode?.id);
                            return episode?.id === episodeId;
                        }) || null;

                    console.log('Found episode:', fetchedEpisode);

                    if (fetchedEpisode) {
                        setEpisode(fetchedEpisode);
                    } else {
                        console.log('Episode not found in array');
                        setLoadingError('Failed to load the episode. Please try again.');
                    }
                } catch (error) {
                    console.error('Error fetching the episode:', error);
                    setLoadingError('Failed to load the episode. Please try again.');
                }
            } else {
                console.log('Missing required params:', {seriesId, seasonId, episodeId});
                setLoadingError('Missing episode parameters.');
            }
        };

        fetchEpisode();
        Orientation.lockToLandscape();
        StatusBar.setHidden(true);

        return () => {
            console.log('Cleanup - hasStartedWatching:', hasStartedWatching, 'episodeId:', episodeId);
            if (hasStartedWatching && episodeId) {
                finishUserWatching(episodeId, true)
                    .then(finishedSuccessfully => {
                        if (finishedSuccessfully) {
                            resetTimer();
                            pauseTimer();
                            performCleanup();
                            Orientation.lockToPortrait();
                            StatusBar.setHidden(false);
                        }
                    })
                    .catch(error => {
                        console.error('Error in cleanup finishUserWatching:', error);
                    });
            }
        };
    }, [seriesId, seasonId, episodeId, passedEpisode, hasStartedWatching, resetTimer, pauseTimer]);

    useFocusEffect(
        React.useCallback(() => {
            hideNavigationBar();
            if (isEpisodePlaying) {
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
        }, [isEpisodePlaying, pauseTimer, isFocused, resetTimer]),
    );

    const onLoad = () => {
        console.log('onLoad called');
        StatusBar.setHidden(true);
        if (episodeId) {
            console.log('Getting last playback position for:', episodeId);
            getLastPlaybackPosition(episodeId, true)
                .then(lastPlaybackPosition => {
                    console.log('Last playback position:', lastPlaybackPosition);
                    if (videoRef.current && lastPlaybackPosition > 0) {
                        videoRef.current.seek(lastPlaybackPosition);
                    }
                })
                .catch(error => {
                    console.error('Error getting last playback position:', error);
                });
        }
    };

    const onProgress = (data: {currentTime: number}) => {
        currentTime = Math.floor(data.currentTime);
        syncProgressPosition(data.currentTime);
        if (episodeId && currentTime % 10 === 0 && !hasLoggedRecently) {
            setLastPlaybackPosition(episodeId, currentTime, true);
            setHasLoggedRecently(true);
        } else if (currentTime % 10 !== 0) {
            setHasLoggedRecently(false);
        }
        if (episodeId && currentTime % 60 === 0 && !hasLoggedRecently) {
            syncWatchTime();
            updateWatchTime(episodeId, currentTime, true, PLAYBACK_EVENT.PROGRESS);
        }
    };

    const onPlay = () => {
        console.log('onPlay called');
        console.log('User:', user);
        console.log('Episode ID:', episodeId);
        console.log('Has started watching:', hasStartedWatching);

        setIsEpisodePlaying(true);
        startTimer();

        if (user?.id && episodeId && !hasStartedWatching) {
            console.log('Starting user watching...');
            startUserWatching(episodeId, true)
                .then(startedSuccessfully => {
                    console.log('Start watching result:', startedSuccessfully);
                    if (startedSuccessfully) {
                        setHasStartedWatching(true);
                        console.log('Logging content watch history...');
                        logUserContentWatchHistory(user.id, episodeId, true);
                    }
                })
                .catch(error => {
                    console.error('Error in startUserWatching:', error);
                });
        }

        onPlaybackPlay();
    };

    const onPause = () => {
        console.log('onPause called');
        setIsEpisodePlaying(false);
        pauseTimer();
        if (episodeId) {
            setLastPlaybackPosition(episodeId, playbackPositionRef.current, true);
        }

        onPlaybackPause();
    };

    const onEnd = () => {
        console.log('onEnd called');

        if (!isInAdPhaseRef.current) {
            onPlaybackComplete();
        }
        setIsEpisodePlaying(false);
        pauseTimer();
        resetTimer();

        if (user?.id && episodeId) {
            console.log('Finishing user watching...');
            finishUserWatching(episodeId, true)
                .then(finishedSuccessfully => {
                    console.log('Finish watching result:', finishedSuccessfully);
                    if (finishedSuccessfully) {
                        logUserContentWatchHistory(user.id, episodeId, true)
                            .then(() => {
                                const pausedCurrentTime = playbackPositionRef.current;
                                setLastPlaybackPosition(episodeId, pausedCurrentTime, true);
                                setHasStartedWatching(false);
                                Orientation.lockToPortrait();
                                StatusBar.setHidden(false);
                                navigation.pop();
                            })
                            .catch(error => {
                                console.error('Error logging watch history:', error);
                            });
                    } else {
                        console.error('Error finishing episode watching.');
                    }
                })
                .catch(error => {
                    console.error('Error in finishUserWatching:', error);
                });
        }
        resetOrientationAndExit();
    };

    const onBack = async () => {
        console.log('onBack called');
        setIsEpisodePlaying(false);
        await performCleanup();
        resetOrientationAndExit();
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {!adDone ? (
                    // PHASE 1: interstitial (plays on mount)
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <ActivityIndicator size="large" color={COLORS.PURPLE} />
                        <Text style={{...FONTS.paragraph1, marginTop: 8}}>Loading ad…</Text>
                    </View>
                ) : !hasLottieFirstLoopCompleted ? (
                    // PHASE 2: opener (only AFTER ad finishes)
                    <AkcruOpener
                        onAnimationFinish={() => {
                            if (!hasLottieFirstLoopCompleted) {
                                setHasLottieFirstLoopCompleted(true);
                                isInAdPhaseRef.current = false;
                                setIsEpisodePlaying(true); // start episode right after opener
                            }
                        }}
                    />
                ) : (
                    // PHASE 3: player
                    <>
                        {!loadingError ? (
                            episode && episode.episodeURL ? (
                                <VideoPlayer
                                    videoRef={videoRef}
                                    source={{uri: episode.episodeURL}}
                                    resizeMode="cover"
                                    posterResizeMode="cover"
                                    tapAnywhereToPause={false}
                                    preventsDisplaySleepDuringVideoPlayback={true}
                                    toggleResizeModeOnFullscreen={false}
                                    // poster={episode.landscapeURL}
                                    containerStyle={{zIndex: 100}}
                                    onBack={onBack}
                                    // gate playback until ad + opener are done
                                    paused={!adDone || !hasLottieFirstLoopCompleted || !isEpisodePlaying}
                                    onPlay={onPlay}
                                    onPause={onPause}
                                    onEnd={onEnd}
                                    onLoad={onLoad}
                                    onProgress={onProgress}
                                    onError={e => console.log('Video error:', e)}
                                    title={episode.title}
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
