import {ActivityIndicator, Text, View, StatusBar} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from './styles';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect, useIsFocused} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {Akcru_Content} from '../../../../assets/constants/ListData';
import {IMovie} from '../../../../types';
import {findMovieById} from '../../../lib/api/movies.lib';
import {useRoute} from '@react-navigation/native';
import {COLORS, SIZES} from '../../../../assets/constants';
import LottieView from 'lottie-react-native';
import Orientation from 'react-native-orientation-locker';
import Video, {OnLoadData, OnProgressData, OnSeekData} from 'react-native-video';
import useWatchTimeStore from '../../../stores/watchTime.store';

type ContentPlayerNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'ContentPlayer'>;

type ContentPlayerRouteProp = RouteProp<NoBottomTabStackParams, 'ContentPlayer'>;

type Props = {
    navigation: ContentPlayerNavigationProp;
    route: ContentPlayerRouteProp;
};

export default function ContentPlayer({navigation, route}: Props) {
    const [movie, setMovie] = useState<IMovie[]>([]);
    const [isMoviePlaying, setIsMoviePlaying] = useState<number>(0);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'ContentPlayer'>>();
    const [hasLottieFirstLoopCompleted, setHasLottieFirstLoopCompleted] = useState(false);
    const {resumeVideo, startTimer, pauseTimer, resetTimer, setLastPlaybackPosition, getLastPlaybackPosition} =
        useWatchTimeStore();
    const isFocused = useIsFocused();
    const videoRef = useRef<Video>(null);
    const [hasLoggedRecently, setHasLoggedRecently] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            if (isMoviePlaying) {
                startTimer();
            }

            return () => {
                if (isFocused) {
                    pauseTimer();
                } else {
                    resetTimer();
                }
            };
        }, [isMoviePlaying]),
    );

    useEffect(() => {
        resumeVideo(videoRef);
    }, []);

    // useEffect(() => {
    //     if (videoRef.current) {
    //         console.log('Video reference obtained: ', videoRef.current);
    //     }
    // }, [hasLottieFirstLoopCompleted]);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const id: string | undefined = routeParams.params?.id;
                if (id) {
                    const fetchedMovie: IMovie | null = await findMovieById(id);
                    if (fetchedMovie) {
                        // console.log(fetchedMovie);
                        setMovie([fetchedMovie]);
                    } else {
                        setMovie([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching movie:', error);
            }
        };

        fetchMovie();

        Orientation.lockToLandscape();

        return () => {
            Orientation.lockToPortrait();

            StatusBar.setHidden(false);
        };
    }, [routeParams.params?.id]);

    const {
        title,
        year,
        length,
        rated,
        rating,
        description,
        actors,
        director,
        portraitURL,
        trailerURL,
        landscapeURL,
        movieURL,
        genres,
    } = movie[0] || {};

    const onLoad = (data: OnLoadData) => {
        setIsMoviePlaying(1);
        StatusBar.setHidden(true);
        // Seek to the last playback position if available
        const lastPlaybackPosition = getLastPlaybackPosition();
        console.log(`Last playback position: ${lastPlaybackPosition}`);
        if (videoRef.current && lastPlaybackPosition > 0) {
            videoRef.current.seek(lastPlaybackPosition);
        }
    };

    const onProgress = (data: OnProgressData) => {
        const watchTime = Math.floor(data.currentTime); // Ensure it's an integer
        const storedWatchTime = getLastPlaybackPosition(); // Retrieve the stored watch time

        // Only update the progress if the current watch time is greater than the stored watch time
        if (watchTime > storedWatchTime) {
            if (watchTime % 10 === 0 && !hasLoggedRecently) {
                // Check if it's a multiple of   10 seconds and hasn't been logged recently
                console.log(`Current watch time: ${watchTime}`);
                setHasLoggedRecently(true); // Set the flag to true after logging
                setLastPlaybackPosition(watchTime);
            } else if (watchTime % 10 !== 0) {
                // Reset the flag when the watch time is not a multiple of 10 seconds
                setHasLoggedRecently(false);
            }
        }
    };

    const onPause = () => {
        setIsMoviePlaying(0);
        StatusBar.setHidden(false);
    };

    const onSeek = (data: OnSeekData) => {
        resetTimer();
        startTimer();
    };

    const handlePlaybackRateChange = rate => {
        // Update isMoviePlaying based on the new playback rate
        if (rate === 1) {
            setIsMoviePlaying(1);
        } else {
            setIsMoviePlaying(0);
        }
        // Perform any additional actions needed when the playback rate changes
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {hasLottieFirstLoopCompleted ? (
                    movieURL ? (
                        <>
                            <Video
                                ref={videoRef}
                                source={{
                                    uri: movieURL,
                                }}
                                resizeMode="cover"
                                controls={true}
                                onLoad={onLoad}
                                onPlaybackRateChange={handlePlaybackRateChange}
                                // paused={!isMoviePlaying}
                                onProgress={onProgress}
                                // onSeek={onSeek}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                }}
                            />
                        </>
                    ) : (
                        <ActivityIndicator size="large" color={COLORS.BLACK} />
                    )
                ) : (
                    <View style={styles.activitycontainer}>
                        <Video source={require('../../../../assets/sounds/akcrusound1.mp3')} repeat={false} />
                        <LottieView
                            source={require('../../../../assets/lottie/Akcruopener1.json')}
                            autoPlay
                            loop={false}
                            style={{width: SIZES.ScreenHeight, height: SIZES.ScreenWidth}}
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
    );
}
