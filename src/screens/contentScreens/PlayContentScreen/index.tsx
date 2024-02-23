
import {ActivityIndicator, Text, View, StatusBar} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from './styles';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect, useIsFocused} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {Akcru_Content} from '../../../../assets/constants/ListData';
import {IMovie} from '../../../../types';
import {findMovieById} from '../../../lib/api/movies.lib';

// import { ActivityIndicator, Text, View, StatusBar } from 'react-native'
// import React, { useEffect, useRef, useState } from 'react'
// import styles from './styles'
// import VideoPlayer from 'react-native-media-console';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RouteProp, useFocusEffect, useIsFocused } from '@react-navigation/native';
// import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
// import { IMovie } from '../../../../types';
// import { findMovieById } from '../../../lib/api/movies.lib';

import {useRoute} from '@react-navigation/native';
import {COLORS, SIZES} from '../../../../assets/constants';
import LottieView from 'lottie-react-native';
import Orientation from 'react-native-orientation-locker';
import Video, {OnLoadData, OnProgressData, OnSeekData} from 'react-native-video';
import useWatchTimeStore from '../../../stores/watchTime.store';
import {finishUserWatching, getUserCurrentWatching, logUserMovieWatchHistory, startUserWatching} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';

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

// <!--     const {startTimer, pauseTimer, resetTimer} = useWatchTimeStore();
//     const isFocused = useIsFocused(); -->
    const {user, hydrateUser} = useAuthStore();
    const [hasStartedWatching, setHasStartedWatching] = useState(false);


    useFocusEffect(
        React.useCallback(() => {
            if (isMoviePlaying) {
                startTimer();
            }

            return () => {
                if (isFocused) {

                    pauseTimer();
                } else {

//                     // pause the timer
//                     console.log('pausing timer...');
//                     pauseTimer();
//                 } else {
//                     console.log('resetting timer...');
//                     // reset the timer

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


        // Allow landscape orientation when entering this screen
        // Orientation.unlockAllOrientations();
        StatusBar.setHidden(true);
        // Lock the orientation back to portrait when leaving this screen

        return () => {
            Orientation.lockToPortrait();

            StatusBar.setHidden(false);
            // If the user has started watching, mark the movie as finished
            if (hasStartedWatching) {
                const userId = user?.id; // Replace with actual user ID
                const movieId = routeParams.params?.id;

                if (userId && movieId) {
                    finishUserWatching(userId, movieId).then(finishedSuccessfully => {
                        if (finishedSuccessfully) {
                            console.log(`User finished watching movie: ${movieId}`);
                        } else {
                            console.log(`Failed to mark movie as finished: ${movieId}`);
                        }
                    });
                }
            }
        };

    }, [routeParams.params?.id, user?.id, hasStartedWatching]);


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


    const onPlay = () => {
        setIsMoviePlaying(true);
        // Hide the status bar when the movie starts playing
        StatusBar.setHidden(true);

        const userId = user?.id; // Replace with actual user ID
        const movieId = routeParams.params?.id;

        if (userId && movieId) {
            // Start watching the movie
            const startWatching = async () => {
                const startedSuccessfully = await startUserWatching(userId, movieId);
                if (startedSuccessfully) {
                    setHasStartedWatching(true);
                    console.log('User started watching movie:', movieId);
                    // Log this as a new watch session
                    logUserMovieWatchHistory(userId, movieId); // Corrected function name
                } else {
                    console.log('Failed to start watching movie:', movieId);
                }
            };
            startWatching();
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
    }
    const fetchUserCurrentWatching = async () => {
        const userId = user?.id; // Replace with actual user ID
        console.log('Fetching current watching for user:', userId); // Log the userId being used for the request

        if (userId) {
            try {
                const currentWatching = await getUserCurrentWatching(userId);
                console.log('Response from getUserCurrentWatching:', currentWatching); // Check the entire response

                if (currentWatching && currentWatching.length > 0) {
                    console.log('User is currently watching:', currentWatching);
                    // Process the current watching data as needed
                } else {
                    console.log('No current watching data found for user:', userId);
                }
            } catch (error) {
                console.error('Error fetching user current watching:', error);
            }
        }
    };
    // Fetch user's current watching only if the movie has started
    useEffect(() => {
        if (hasStartedWatching && user?.id) {
            fetchUserCurrentWatching();
        }
    }, [hasStartedWatching, user?.id]); // Depend on user ID as well to refetch when user changes

    const videoContainerStyle = {
        
        zIndex: 100,

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

// <!--                                 tapAnywhereToPause={false}
//                                 preventsDisplaySleepDuringVideoPlayback={true}
//                                 toggleResizeModeOnFullscreen={false}
//                                 // poster={landscapeURL}
//                                 containerStyle={videoContainerStyle}
//                                 onBack={() => navigation.pop()}
//                                 paused={!isMoviePlaying}
//                                 onPlay={onPlay}
//                                 onPause={onPause}
//                                 onSeek={onSeek} -->

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
