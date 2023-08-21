import { Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import styles from './styles'
import VideoPlayer from 'react-native-media-console';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import { Akcru_Content } from '../../../../assets/constants/ListData';
import { IMovie } from '../../../../types';
import { findMovieById } from '../../../lib/api/movies.lib';
import {useRoute} from '@react-navigation/native';


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
    const [isMovieDataLoaded, setIsMovieDataLoaded] = useState(false);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const id: string | undefined = routeParams.params?.id; // Extract the id from the route
                if (id) {
                    const fetchedMovie: IMovie | undefined = await findMovieById(id); // Fetch movie by ID
                    if (fetchedMovie) {
                        setMovie([fetchedMovie]); // Set the fetched movie
                    } else {
                        setMovie([]); // Clear movie if not found
                    }
                }
            } catch (error) {
                console.error('Error fetching movie:', error);
            }
        };

        fetchMovie();
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
    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
            <VideoPlayer
                source={{
                    uri: movieURL,
                }}
                tapAnywhereToPause={false}
                toggleResizeModeOnFullscreen={false}
                poster={landscapeURL}
                containerStyle={{zIndex: 100}}
                onBack={() => navigation.pop()}
            />
        </View>
        </View>
        
    );
}
