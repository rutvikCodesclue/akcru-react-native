import {ActivityIndicator, View, StatusBar} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from './styles';
import VideoPlayer from 'react-native-media-console';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {ISeries} from '../../../../types';
import {findSeriesById} from '../../../lib/api/series.lib';
import {useRoute} from '@react-navigation/native';
import {COLORS} from '../../../../assets/constants';
import Orientation from 'react-native-orientation-locker';
// import {finishUserWatchingSeries} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import Video from 'react-native-video';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';

type SeriesTrailerPlayerNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'SeriesTrailerPlayer'>;

type SeriesTrailerPlayerRouteProp = RouteProp<NoBottomTabStackParams, 'SeriesTrailerPlayer'>;

type Props = {
    navigation: SeriesTrailerPlayerNavigationProp;
    route: SeriesTrailerPlayerRouteProp;
};

export default function SeriesTrailerPlayer({navigation, route}: Props) {
    const [series, setSeries] = useState<ISeries | null>(null);
    const [isSeriesPlaying, setIsSeriesPlaying] = useState<boolean>(true);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'SeriesTrailerPlayer'>>();
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

    const seriesId = routeParams.params?.id;
    const [hasStartedWatching] = useState(false);
    useEffect(() => {
        const fetchSeries = async () => {
            if (seriesId) {
                const fetchedSeries = await findSeriesById(seriesId);
                setSeries(fetchedSeries);
            }
        };

        fetchSeries();
        Orientation.lockToLandscape();
        StatusBar.setHidden(true);

        return () => {
            Orientation.lockToPortrait();
            StatusBar.setHidden(false);
            // if (hasStartedWatching && user?.id && seriesId) {
            //     finishUserWatchingSeries(user.id, seriesId).then((finishedSuccessfully: any) => {
            //         if (finishedSuccessfully) {
            //             //console.log(`User finished watching series: ${seriesId}`);
            //         } else {
            //             //console.log(`Failed to mark series as finished: ${seriesId}`);
            //         }
            //     });
            // }
        };
    }, [seriesId, user?.id, hasStartedWatching]);

    const onPlay = () => {
        setIsSeriesPlaying(true);
        StatusBar.setHidden(true);
    };
    const onPause = () => {
        setIsSeriesPlaying(false);
        StatusBar.setHidden(false);
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {series && series?.seriesTrailerURL ? (
                    <>
                        <VideoPlayer
                            videoRef={videoRef}
                            source={{
                                uri: series.seriesTrailerURL,
                            }}
                            resizeMode="cover"
                            posterResizeMode="cover"
                            tapAnywhereToPause={false}
                            preventsDisplaySleepDuringVideoPlayback={true}
                            toggleResizeModeOnFullscreen={false}
                            poster={series.landscapeURL}
                            containerStyle={{zIndex: 100}}
                            onBack={() => navigation.pop()}
                            paused={!isSeriesPlaying}
                            onPlay={onPlay}
                            onPause={onPause}
                            onEnd={() => navigation.pop()}
                            onError={error => console.log('Video error:', error)}
                        />
                    </>
                ) : (
                    <>
                        {console.log('Series indicator')}
                        <ActivityIndicator size="large" color={COLORS.CATPURPDRK} style={{alignSelf: 'center'}} />
                    </>
                )}
            </View>
        </View>
    );
}
