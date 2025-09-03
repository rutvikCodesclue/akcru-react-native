import {StyleSheet, Text, View, Image, TouchableWithoutFeedback, ActivityIndicator, StatusBar} from 'react-native';
import React from 'react';
import {SIZES, FONTS, COLORS} from '../../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import VideoPlayer from 'react-native-media-console';
import {capitalizeFirstLetterOfString, formatMovieDuration} from '../../../util/util';
import LottieView from 'lottie-react-native';
import Video, {OnProgressData, OnSeekData} from 'react-native-video';
import {MovieScreenProps} from './WatchPartyProps';
import Orientation from 'react-native-orientation-locker';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';
import useWatchTimeStore from '../../../stores/watchTime.store';

const MovieScreen = ({
    currentRoomHost,
    user,
    isStreamOpen,
    movie,
    isSyncedWithHost,
    isFullscreen,
    setIsFullscreen,
    isMoviePlaying,
    setIsMoviePlaying,
    hasLottieFirstLoopCompleted,
    setHasLottieFirstLoopCompleted,
    setCurrentTime,
    roomChannelRef,
    syncChannelRef,
    videoPlayerRef,
}: MovieScreenProps) => {
    const {startTimer, resetTimer} = useWatchTimeStore();

    const _handleStartMovie = async () => {
        // console.log('Starting the movie...');

        if (currentRoomHost === user?.id && videoPlayerRef.current) {
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'start-movie',
                payload: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
    };

    const ___onPlay = () => {
        if (currentRoomHost === user?.id && videoPlayerRef.current) {
            setIsMoviePlaying(true);

            StatusBar.setHidden(true);
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'play-movie',
                payload: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
    };

    const ___onPause = () => {
        if (currentRoomHost === user?.id && videoPlayerRef.current) {
            setIsMoviePlaying(false);

            StatusBar.setHidden(false);
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'pause-movie',
                payload: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
    };

    const ___onSeek = (data: OnSeekData) => {
        if (currentRoomHost === user?.id && videoPlayerRef.current) {
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'seek-movie',
                payload: {
                    currentTime: data.currentTime,
                    seekTime: data.seekTime,
                    timestamp: new Date().toISOString(),
                },
            });
        }

        resetTimer();
        startTimer();
    };

    const ___onProgress = async (data: OnProgressData) => {
        if (currentRoomHost === user?.id && Number(data.currentTime.toFixed(1)) % 5 === 0) {
            await syncChannelRef.current?.track({
                isMoviePlaying: true,
                currentTime: data.currentTime,
                timestamp: new Date().toISOString(),
            });
        }

        setCurrentTime(data.currentTime);
    };

    const ___onEnterFullscreen = () => {
        setIsFullscreen(true);

        StatusBar.setHidden(true);
        Orientation.lockToLandscape();

        hideNavigationBar();
        if (videoPlayerRef.current && !isMoviePlaying) {
            if (currentRoomHost === user?.id) {
                setIsMoviePlaying(true);
            } else {
                if (isSyncedWithHost.current) {
                    setIsMoviePlaying(true);
                }
            }
        }
    };

    const ___onExitFullScreen = () => {
        setIsFullscreen(false);
        StatusBar.setHidden(false);
        Orientation.lockToPortrait();

        showNavigationBar();

        if (videoPlayerRef.current && !isMoviePlaying) {
            if (currentRoomHost === user?.id) {
                setIsMoviePlaying(true);
            } else {
                if (isSyncedWithHost.current) {
                    setIsMoviePlaying(true);
                }
            }
        }
    };

    return (
        <View style={styles.container}>
            {isStreamOpen ? (
                <View style={styles.moviecontainer}>
                    <LinearGradient
                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                        style={styles.gradient}
                    />
                    <View style={styles.movieDetailsContainer}>
                        <Image source={{uri: movie?.portraitURL ?? undefined}} style={styles.poster} />
                    </View>
                    <View>
                        <Text style={{...FONTS.Title3}}>{movie?.title ?? 'Loading...'}</Text>
                        <View style={styles.movieInfoRow}>
                            <Text style={styles.movieYear}>{movie?.year}</Text>
                            <Text style={styles.movieDuration}>
                                {movie?.duration ? formatMovieDuration(movie?.duration) : '...'}
                            </Text>
                        </View>
                        <View style={styles.movieTagsRow}>
                            <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                            <Text style={styles.drawfonttag}>
                                {movie?.genres[0] ? capitalizeFirstLetterOfString(movie?.genres[0]) : '...'}
                            </Text>
                            <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                        </View>
                        <View style={styles.tagButtonsContainer}>
                            <TouchableWithoutFeedback>
                                <View style={styles.tagButton}>
                                    <Text style={styles.movieTag}>Link Device</Text>
                                    <Icon name="tv-outline" type="ionicon" size={20} color={COLORS.MIDORANGE} />
                                </View>
                            </TouchableWithoutFeedback>

                            {currentRoomHost === user?.id && roomChannelRef.current && (
                                <TouchableWithoutFeedback onPress={_handleStartMovie}>
                                    <View style={styles.playStreamButton}>
                                        <Text style={styles.movieTag}>Play Stream</Text>
                                        <Icon name="play" type="ionicon" size={20} color={COLORS.CATREDLGT} />
                                    </View>
                                </TouchableWithoutFeedback>
                            )}
                        </View>
                    </View>
                </View>
            ) : (
                <View>
                    <View style={styles.videocontain}>
                        <View style={styles.flexContainer}>
                            {hasLottieFirstLoopCompleted ? (
                                movie?.movieURL ? (
                                    <View style={!isFullscreen ? styles.movieview : styles.fullscreenmovie}>
                                        <VideoPlayer
                                            videoRef={videoPlayerRef}
                                            source={{
                                                uri: movie?.movieURL,
                                            }}
                                            mixWithOthers="mix"
                                            showHours={true}
                                            paused={!isMoviePlaying}
                                            poster={movie?.landscapeURL}
                                            resizeMode="contain"
                                            ignoreSilentSwitch="ignore"
                                            muted={false}
                                            volume={1.0}
                                            showOnStart={true}
                                            tapAnywhereToPause={false}
                                            preventsDisplaySleepDuringVideoPlayback={true}
                                            isFullscreen={isFullscreen}
                                            fullscreenAutorotate={false}
                                            disableVolume
                                            disableBack={true}
                                            disablePlayPause={currentRoomHost === user?.id ? false : true}
                                            disableSeekButtons={currentRoomHost === user?.id ? false : true}
                                            disableSeekbar={currentRoomHost === user?.id ? false : true}
                                            onProgress={___onProgress}
                                            onPlay={___onPlay}
                                            onPause={___onPause}
                                            onSeek={___onSeek}
                                            onEnterFullscreen={___onEnterFullscreen}
                                            onExitFullscreen={___onExitFullScreen}
                                        />
                                    </View>
                                ) : (
                                    <ActivityIndicator size="large" color={COLORS.BLACK} />
                                )
                            ) : (
                                <View>
                                    <Video
                                        source={require('../../../../assets/sounds/akcrusound1.mp3')}
                                        repeat={false}
                                    />
                                    <LottieView
                                        source={require('../../../../assets/lottie/Akcruopener1.json')}
                                        autoPlay
                                        loop={false}
                                        style={styles.movieview}
                                        onAnimationFinish={() => {
                                            if (!hasLottieFirstLoopCompleted) {
                                                setHasLottieFirstLoopCompleted(true);
                                            }
                                        }}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

export default MovieScreen;

const styles = StyleSheet.create({
    poster: {
        width: 70,
        height: 110,
        borderRadius: 5,
    },
    container: {
        flex: 1,
        zIndex: 100,
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        borderRadius: 5,
        height: SIZES.ScreenHeight * 0.18,
    },
    movieDetailsContainer: {
        marginRight: 10,
    },
    movieTitle: {
        ...FONTS.Title3,
    },
    movieInfoRow: {
        flexDirection: 'row',
        marginVertical: 4,
        alignItems: 'center',
    },
    movieYear: {
        ...FONTS.Title2,
        fontSize: 12,
    },
    movieDuration: {
        ...FONTS.Title2,
        fontSize: 12,
        marginHorizontal: 10,
    },
    movieTagsRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    movieTag: {
        ...FONTS.paragraph1,
        marginRight: 5,
        fontSize: 12,
    },
    tagButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.TAGCOLOR,
        marginRight: 5,
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 5,
        alignItems: 'center',
    },
    playStreamButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.TAGCOLOR,
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 5,
        alignItems: 'center',
    },
    moviecontainer: {
        marginHorizontal: 15,
        padding: 10,
        flexDirection: 'row',
        backgroundColor: '#1C202A',
        borderRadius: 5,
        height: SIZES.ScreenHeight * 0.18,
        alignItems: 'center',
    },
    drawfonttag: {
        ...FONTS.Title2Orange,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 4,
        borderRadius: 4,
        textAlign: 'center',
    },
    videocontain: {
        flex: 1,
        zIndex: 1,
        justifyContent: 'center',
    },
    fullscreenmovie: {
        width: SIZES.ScreenHeight,
        height: SIZES.ScreenWidth,
    },
    movieview: {
        height: SIZES.ScreenHeight / 3.5,
    },
    tagButtonsContainer: {
        flexDirection: 'row', // Moved from inline
    },
    flexContainer: {
        flex: 1, // Moved from inline
    },
});
