import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, View, StatusBar, Text, TouchableOpacity} from 'react-native';
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
import {updateWatchTime} from '../../../lib/api/watchtime.lib';
import AkcruOpener from '../../../components/AkcruOpener';

type EpisodePlayerNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'EpisodePlayer'>;

type EpisodePlayerRouteProp = RouteProp<NoBottomTabStackParams, 'EpisodePlayer'>;

type Props = {
    navigation: EpisodePlayerNavigationProp;
    route: EpisodePlayerRouteProp;
};

export default function EpisodePlayer({navigation}: Props) {
    const [episode, setEpisode] = useState<IEpisode | null>(null);
    const [isEpisodePlaying, setIsEpisodePlaying] = useState<boolean>(true);
    const [hasLottieFirstLoopCompleted, setHasLottieFirstLoopCompleted] = useState(false);
    const {startTimer, pauseTimer, resetTimer, setLastPlaybackPosition, getLastPlaybackPosition, syncWatchTime} =
        useWatchTimeStore();
    const isFocused = useIsFocused();
    const videoRef = useRef<Video>(null);
    const [hasLoggedRecently, setHasLoggedRecently] = useState(false);
    const {user} = useAuthStore();
    const [hasStartedWatching, setHasStartedWatching] = useState(false);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'EpisodePlayer'>>();
    const {seriesId, seasonId, episodeId} = routeParams.params || {};
    let currentTime = 0;

    const [loadingError, setLoadingError] = useState<string>('');

    useEffect(() => {
        console.log('Play Episode');

        const fetchEpisode = async () => {
            if (seriesId && seasonId && episodeId) {
                try {
                    const episodes = await getEpisodesBySeasonId(seriesId, seasonId);
                    const fetchedEpisode = episodes.find(episode => episode.id === episodeId) || null;
                    if (fetchedEpisode) {
                        setEpisode(fetchedEpisode);
                    } else {
                        setLoadingError('Failed to load the episode. Please try again.');
                    }
                } catch (error) {
                    console.error('Error fetching the episode:', error);
                    setLoadingError('Failed to load the episode. Please try again.');
                }
            }
        };

        fetchEpisode();
        Orientation.lockToLandscape();
        StatusBar.setHidden(true);

        return () => {
            if (hasStartedWatching && episodeId) {
                finishUserWatching(episodeId, true).then(finishedSuccessfully => {
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
    }, [seriesId, seasonId, episodeId, hasStartedWatching, resetTimer, pauseTimer]);

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
        setIsEpisodePlaying(true);
        StatusBar.setHidden(true);
        if (episodeId) {
            getLastPlaybackPosition(episodeId, true).then(lastPlaybackPosition => {
                if (videoRef.current && lastPlaybackPosition > 0) {
                    videoRef.current.seek(lastPlaybackPosition);
                }
            });
        }
    };

    const onProgress = (data: {currentTime: number}) => {
        currentTime = Math.floor(data.currentTime);
        if (episodeId && currentTime % 10 === 0 && !hasLoggedRecently) {
            setLastPlaybackPosition(episodeId, currentTime, true);
            setHasLoggedRecently(true);
        } else if (currentTime % 10 !== 0) {
            setHasLoggedRecently(false);
        }
        if (episodeId && currentTime % 60 === 0 && !hasLoggedRecently) {
            syncWatchTime();
            updateWatchTime(episodeId, currentTime, true);
        }
    };

    const onPlay = () => {
        setIsEpisodePlaying(true);
        startTimer();
        if (user?.id && episodeId && !hasStartedWatching) {
            startUserWatching(episodeId, true).then(startedSuccessfully => {
                if (startedSuccessfully) {
                    setHasStartedWatching(true);
                    logUserContentWatchHistory(user.id, episodeId, true); // Pass the correct parameters
                }
            });
        }
    };

    const onPause = () => {
        setIsEpisodePlaying(false);
        pauseTimer();
        if (episodeId) {
            const pausedCurrentTime = currentTime;

            setLastPlaybackPosition(episodeId, pausedCurrentTime, true);
        }
    };
    const onEnd = () => {
        setIsEpisodePlaying(false);
        pauseTimer();
        resetTimer();

        if (user?.id && episodeId) {
            finishUserWatching(episodeId, true).then(finishedSuccessfully => {
                if (finishedSuccessfully) {
                    logUserContentWatchHistory(user.id, episodeId, true)
                        .then(() => {
                            const pausedCurrentTime = currentTime;
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
            });
        }
    };

    const onBack = () => {
        Orientation.lockToPortrait();
        StatusBar.setHidden(false);
        navigation.pop();
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {hasLottieFirstLoopCompleted ? (
                    !loadingError ? (
                        episode && episode.episodeURL ? (
                            <>
                                <VideoPlayer
                                    videoRef={videoRef}
                                    source={{
                                        uri: episode.episodeURL,
                                    }}
                                    resizeMode="cover"
                                    posterResizeMode="cover"
                                    tapAnywhereToPause={false}
                                    preventsDisplaySleepDuringVideoPlayback={true}
                                    toggleResizeModeOnFullscreen={false}
                                    poster={episode.landscapeURL}
                                    containerStyle={{zIndex: 100}}
                                    onBack={onBack}
                                    paused={!isEpisodePlaying}
                                    onPlay={onPlay}
                                    onPause={onPause}
                                    onEnd={onEnd}
                                    onLoad={onLoad}
                                    onProgress={onProgress}
                                    onError={error => console.log('Video error:', error)}
                                    title={episode.title}
                                />
                            </>
                        ) : (
                            <>
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
                )}
            </View>
        </View>
    );
}
