import { ActivityIndicator, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import styles from './styles'
import VideoPlayer from 'react-native-media-console';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import { Akcru_Content } from '../../../../assets/constants/ListData';
import { IMovie } from '../../../../types';
import { findMovieById } from '../../../lib/api/movies.lib';
import {useRoute} from '@react-navigation/native';
import { COLORS, SIZES } from '../../../../assets/constants';
import LottieView from 'lottie-react-native';
import Orientation from 'react-native-orientation-locker';

import Video from 'react-native-video';


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
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'ContentPlayer'>>();
    const [hasLottieFirstLoopCompleted, setHasLottieFirstLoopCompleted] = useState(false);

    useEffect(() => {
        // Fetch movie data based on the route parameter ID
        const fetchMovie = async () => {
            try {
                const id: string | undefined = routeParams.params?.id;
                if (id) {
                    const fetchedMovie: IMovie | undefined = await findMovieById(id);
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

    console.log('Movie URL:', movieURL); // Log movie URL for debugging
    console.log('Landscape URL:', landscapeURL); // Log landscape URL for debugging

    
    // function onSeek(data: OnSeekData): void {
    //     throw new Error('Function not implemented.');
    // }

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
                                toggleResizeModeOnFullscreen={false}
                                // poster={landscapeURL}
                                containerStyle={{zIndex: 100}}
                                onBack={() => navigation.pop()}
                                // onSeek={onSeek}
                            />
                        </>
                    ) : (
                        <ActivityIndicator size="large" color={COLORS.BLACK} />
                    )
                ) : (
                    <View style={styles.activitycontainer}>
                        <Video
                            source={require('../../../../assets/sounds/akcrusound1.mp3')}
                            repeat={false}                
                        />
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
