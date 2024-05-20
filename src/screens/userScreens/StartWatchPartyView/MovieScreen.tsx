import {StyleSheet, Text, View, Image, TouchableWithoutFeedback, ActivityIndicator} from 'react-native';
import React from 'react';
import {SIZES, FONTS, COLORS} from '../../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import VideoPlayer from 'react-native-media-console';
import {capitalizeFirstLetterOfString, formatMovieDuration, selectAvatarBorderColor} from '../../../util/util';
import LottieView from 'lottie-react-native';
import Video from 'react-native-video';

interface Props {
    onPress: () => void;
    isHost: boolean;
    isStreamOpen: boolean;
    movie: any;
    roomChannelRef: any;
    hasLottieFirstLoopCompleted: any;
    isFullscreen: boolean;
    videoPlayerRef: any;
    isMoviePlaying: boolean; 
    onProgress: any; 
    onPlay: any;
    onPause: any;
    onSeek: any;
    onEnterFullScreen: any; 
    onExitFullScreen: any; 
    setHasLottieFirstLoopCompleted: React.Dispatch<React.SetStateAction<boolean>>;
}

const MovieScreen = ({onPress, isStreamOpen, isHost, movie, roomChannelRef, hasLottieFirstLoopCompleted, isFullscreen, videoPlayerRef, isMoviePlaying, onProgress, onPlay, onPause, onSeek, onEnterFullscreen, onExitFullScreen, setHasLottieFirstLoopCompleted}: Props) => {
    return (
        <View style={{flex: 1, zIndex: 100}}>
            {isStreamOpen ? (
                <View style={styles.moviecontainer}>
                    <LinearGradient
                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,

                            borderRadius: 5,
                            height: SIZES.ScreenHeight * 0.18,
                        }}
                    />
                    <View style={{marginRight: 10}}>
                        <Image source={{uri: movie?.portraitURL ?? undefined}} style={styles.poster} />
                    </View>
                    <View>
                        <Text style={{...FONTS.Title3}}>{movie?.title ?? 'Loading...'}</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                marginVertical: 4,
                                alignItems: 'center',
                            }}>
                            <Text style={{...FONTS.Title2, fontSize: 12}}>{movie?.year}</Text>
                            <Text
                                style={{
                                    ...FONTS.Title2,
                                    fontSize: 12,
                                    marginHorizontal: 10,
                                }}>
                                {movie?.duration ? formatMovieDuration(movie?.duration) : '...'}
                            </Text>
                        </View>
                        <View style={{flexDirection: 'row', marginBottom: 8}}>
                            <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                            <Text style={styles.drawfonttag}>
                                {movie?.genres[0] ? capitalizeFirstLetterOfString(movie?.genres[0]) : '...'}
                            </Text>
                            <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <TouchableWithoutFeedback>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        backgroundColor: COLORS.TAGCOLOR,
                                        marginRight: 5,
                                        paddingHorizontal: 5,
                                        paddingVertical: 5,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                    }}>
                                    <Text
                                        style={{
                                            ...FONTS.paragraph1,
                                            marginRight: 5,
                                            fontSize: 12,
                                        }}>
                                        Link Device
                                    </Text>
                                    <Icon name="tv-outline" type="ionicon" size={20} color={COLORS.MIDORANGE} />
                                </View>
                            </TouchableWithoutFeedback>

                            {isHost && roomChannelRef.current && (
                                <TouchableWithoutFeedback onPress={onPress}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            backgroundColor: COLORS.TAGCOLOR,
                                            paddingHorizontal: 5,
                                            paddingVertical: 5,
                                            borderRadius: 5,
                                            alignItems: 'center',
                                        }}>
                                        <Text
                                            style={{
                                                ...FONTS.paragraph1,
                                                marginRight: 5,
                                                fontSize: 12,
                                            }}>
                                            Play Stream
                                        </Text>
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
                        <View style={{flex: 1}}>
                            {hasLottieFirstLoopCompleted ? (
                                movie?.movieURL ? (
                                    <View style={!isFullscreen ? styles.movieview : styles.fullscreenmovie}>
                                        <VideoPlayer
                                            videoRef={videoPlayerRef}
                                            source={{
                                                uri: movie?.movieURL,
                                            }}
                                            showHours={true}
                                            paused={!isMoviePlaying}
                                            poster={movie?.landscapeURL}
                                            resizeMode="contain"
                                            posterResizeMode="cover"
                                            showOnStart={true}
                                            tapAnywhereToPause={false}
                                            preventsDisplaySleepDuringVideoPlayback={true}
                                            isFullscreen={isFullscreen}
                                            fullscreenAutorotate={false}
                                            disableBack={true}
                                            disablePlayPause={isHost ? false : true}
                                            disableSeekButtons={isHost ? false : true}
                                            disableSeekbar={isHost ? false : true}
                                            onProgress={onProgress}
                                            onPlay={onPlay}
                                            onPause={onPause}
                                            onSeek={onSeek}
                                            onEnterFullscreen={onEnterFullscreen}
                                            onExitFullscreen={onExitFullScreen}
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
    )
};

export default MovieScreen;

const styles = StyleSheet.create({
    poster: {
        width: 70,
        height: 110,
        borderRadius: 5,
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

});