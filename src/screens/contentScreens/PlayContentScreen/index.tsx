import { ActivityIndicator, Text, View, StatusBar } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import styles from './styles'
import VideoPlayer from 'react-native-media-console';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import { Akcru_Content } from '../../../../assets/constants/ListData';
import { IMovie } from '../../../../types';
import { findMovieById } from '../../../lib/api/movies.lib';
import {useRoute} from '@react-navigation/native';
import { COLORS, SIZES } from '../../../../assets/constants';
import LottieView from 'lottie-react-native';
import Orientation from 'react-native-orientation-locker';
import Video, { OnSeekData } from 'react-native-video';
import useWatchTimeStore from '../../../stores/watchTime.store';


// import { OnSeekData } from 'react-native-video';

type ContentPlayerNavigationProp = StackNavigationProp<
  NoBottomTabStackParams,
  'ContentPlayer'
>;

type ContentPlayerRouteProp = RouteProp<
  NoBottomTabStackParams,
  'ContentPlayer'
>;

type Props = {
  navigation: ContentPlayerNavigationProp;
  route: ContentPlayerRouteProp;
};


export default function ContentPlayer({navigation, route}: Props) {
    // const id: number | undefined = route.params?.id ?? null;
    const [movie, setMovie] = useState<IMovie[]>([]);
    const [isMoviePlaying, setIsMoviePlaying] = useState<boolean>(true); // start the movie playing
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'ContentPlayer'>>();
    const [hasLottieFirstLoopCompleted, setHasLottieFirstLoopCompleted] = useState(false);
    const { startTimer, pauseTimer, resetTimer } = useWatchTimeStore();
    const isFocused = useIsFocused();

    // ON FOCUS/UNFOCUS
    useFocusEffect(
        React.useCallback(() => {
            // Start the timer when the component mounts and the movie is playing
            if (isMoviePlaying) {
                startTimer();
            }

            // Clean up the timer when the component unmounts
            return () => {
                if (isFocused) {
                    // pause the timer
                    console.log("pausing timer...");
                    pauseTimer();
                } else {
                    console.log("resetting timer...");
                    // reset the timer
                    resetTimer();
                }
            };
        }, 
    [isMoviePlaying]));

    useEffect(() => {
        // Fetch movie data based on the route parameter ID
        const fetchMovie = async () => {
            try {
                const id: string | undefined = routeParams.params?.id;
                if (id) {
                    const fetchedMovie: IMovie | null = await findMovieById(id);
                    if (fetchedMovie) {
                        setMovie([fetchedMovie]);
                    } else {
                        setMovie([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching movie:', error);
            }
        };

        // Fetch movie data
        fetchMovie();

        // Lock landscape orientation when entering this screen
        Orientation.lockToLandscape();

        // Allow landscape orientation when entering this screen
        // Orientation.unlockAllOrientations();

        // Lock the orientation back to portrait when leaving this screen
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


    const onPlay = () => {
        setIsMoviePlaying(true);
        // Hide the status bar when the movie starts playing
        StatusBar.setHidden(true);
    };
    const onPause = () => {
        setIsMoviePlaying(false);
        // Show the status bar when the movie is paused
        StatusBar.setHidden(false);
    };
    const onSeek = (data: OnSeekData) => {
        resetTimer();
        startTimer();
    };
    

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {hasLottieFirstLoopCompleted ? (
                    movieURL ? (
                        <>
                            <VideoPlayer
                                source={{
                                    uri: movieURL,
                                }}
                                tapAnywhereToPause={false}
                                preventsDisplaySleepDuringVideoPlayback={true}
                                toggleResizeModeOnFullscreen={false}
                                // poster={landscapeURL}
                                containerStyle={{zIndex: 100}}
                                onBack={() => navigation.pop()}
                                paused={!isMoviePlaying}
                                onPlay={onPlay}
                                onPause={onPause}
                                onSeek={onSeek}
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
