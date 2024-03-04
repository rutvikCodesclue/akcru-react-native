import { ActivityIndicator, Text, View, StatusBar } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import styles from './styles'
import VideoPlayer from 'react-native-media-console';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import { IMovie } from '../../../../types';
import { findMovieById } from '../../../lib/api/movies.lib';
import {useRoute} from '@react-navigation/native';
import { COLORS, SIZES } from '../../../../assets/constants';
import Orientation from 'react-native-orientation-locker';
import AkcruButtons from '../../../components/akcruButtons';



type TrailerPlayerNavigationProp = StackNavigationProp<
  NoBottomTabStackParams,
  'TrailerPlayer'
>;

type TrailerPlayerRouteProp = RouteProp<
  NoBottomTabStackParams,
  'TrailerPlayer'
>;

type Props = {
  navigation: TrailerPlayerNavigationProp;
  route: TrailerPlayerRouteProp;
};


export default function TrailerPlayer({navigation, route}: Props) {
    // const id: number | undefined = route.params?.id ?? null;
    const [movie, setMovie] = useState<IMovie[]>([]);
    const [isMoviePlaying, setIsMoviePlaying] = useState<boolean>(true); // start the movie playing
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'TrailerPlayer'>>();
    const [shouldAutoplay, setShouldAutoplay] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            //console.log('Trailer Screen focused [Trailer Screen]');
            setShouldAutoplay(true);

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                //console.log('Trailer Screen unfocused [Trailer Screen]');
                setShouldAutoplay(false);
            };
        }, []),
    );
    

    

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

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {movieURL ? (
                    <>
                        <VideoPlayer
                            source={{
                                uri: trailerURL,
                            }}
                            tapAnywhereToPause={false}
                            preventsDisplaySleepDuringVideoPlayback={true}
                            toggleResizeModeOnFullscreen={false}
                            poster={landscapeURL}
                            containerStyle={{zIndex: 100}}
                            onBack={() => navigation.pop()}
                            paused={!isMoviePlaying}
                            onPlay={onPlay}
                            onPause={onPause}
                            onEnd={() => navigation.pop()}
                        />
                    </>
                ) : (
                    <ActivityIndicator size="large" color={COLORS.CATPURPDRK} style={{alignSelf: 'center'}} />
                )}
            </View>
        </View>
    );
}
