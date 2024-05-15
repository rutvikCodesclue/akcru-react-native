import {ActivityIndicator, View, StatusBar} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from './styles';
import VideoPlayer from 'react-native-media-console';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {IMovie} from '../../../../types';
import {findMovieById} from '../../../lib/api/movies.lib';
import {useRoute} from '@react-navigation/native';
import {COLORS} from '../../../../assets/constants';
import Orientation from 'react-native-orientation-locker';
import {finishUserWatching} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import Video from 'react-native-video';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';

type TrailerPlayerNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'TrailerPlayer'>;

type TrailerPlayerRouteProp = RouteProp<NoBottomTabStackParams, 'TrailerPlayer'>;

type Props = {
    navigation: TrailerPlayerNavigationProp;
    route: TrailerPlayerRouteProp;
};

export default function TrailerPlayer({navigation, route}: Props) {
    const [movie, setMovie] = useState<IMovie | null>(null);
    const [isMoviePlaying, setIsMoviePlaying] = useState<boolean>(true);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'TrailerPlayer'>>();
    const [, setShouldAutoplay] = useState(true);
    const {user} = useAuthStore();
    const videoRef = useRef<Video>(null);

    useFocusEffect(
        React.useCallback(() => {
            setShouldAutoplay(true);
            hideNavigationBar();

            return () => {
                setShouldAutoplay(false);
                showNavigationBar();
            };
        }, []),
    );

    const movieId = routeParams.params?.id;
    const [hasStartedWatching, ] = useState(false);
    useEffect(() => {
        const fetchMovie = async () => {
            if (movieId) {
                const fetchedMovie = await findMovieById(movieId);
                setMovie(fetchedMovie);
            }
        };

        fetchMovie();
        Orientation.lockToLandscape();
        StatusBar.setHidden(true);

        return () => {
            Orientation.lockToPortrait();
            StatusBar.setHidden(false);
            if (hasStartedWatching && user?.id && movieId) {
                finishUserWatching(user.id, movieId).then(finishedSuccessfully => {
                    if (finishedSuccessfully) {
                        //console.log(`User finished watching movie: ${movieId}`);
                    } else {
                        //console.log(`Failed to mark movie as finished: ${movieId}`);
                    }
                });
            }
        };
    }, [movieId, user?.id, hasStartedWatching]);

    const onPlay = () => {
        setIsMoviePlaying(true);
        StatusBar.setHidden(true);
    };
    const onPause = () => {
        setIsMoviePlaying(false);
        StatusBar.setHidden(false);
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {movie && movie?.trailerURL ? (
                    <>
                        <VideoPlayer
                            videoRef={videoRef}
                            source={{
                                uri: movie.trailerURL,
                            }}
                            resizeMode="cover"
                            posterResizeMode="cover"
                            tapAnywhereToPause={false}
                            preventsDisplaySleepDuringVideoPlayback={true}
                            toggleResizeModeOnFullscreen={false}
                            poster={movie.landscapeURL}
                            containerStyle={{zIndex: 100}}
                            onBack={() => navigation.pop()}
                            paused={!isMoviePlaying}
                            onPlay={onPlay}
                            onPause={onPause}
                            onEnd={() => navigation.pop()}
                            onError={error => console.log('Video error:', error)}
                        />
                    </>
                ) : (
                    <>
                        {console.log('Movie indicator')}
                        <ActivityIndicator size="large" color={COLORS.CATPURPDRK} style={{alignSelf: 'center'}} />
                    </>
                )}
            </View>
        </View>
    );
}
