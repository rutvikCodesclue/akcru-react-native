import {ActivityIndicator, View, StatusBar} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from './styles';
import VideoPlayer from 'react-native-media-console';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {ITrailer} from '../../../../types';
import {useRoute} from '@react-navigation/native';
import {COLORS} from '../../../../assets/constants';
import Orientation from 'react-native-orientation-locker';
import {finishUserWatching} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import Video from 'react-native-video';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';
import {getTrailerById} from '../../../lib/api/sizzles.lib';

type SizzlePlayerNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'SizzlePlayer'>;

type SizzlePlayerRouteProp = RouteProp<NoBottomTabStackParams, 'SizzlePlayer'>;

type Props = {
    navigation: SizzlePlayerNavigationProp;
    route: SizzlePlayerRouteProp;
};

export default function SizzlePlayer({navigation}: Props) {
    const [sizzle, setSizzle] = useState<ITrailer | null>(null);
    const [isSizzlePlaying, setIsSizzlePlaying] = useState<boolean>(true);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'SizzlePlayer'>>();
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

    const trailerId = routeParams.params?.id;
    const [hasStartedWatching] = useState(false);
    useEffect(() => {
        const fetchSizzle = async () => {
            if (trailerId) {
                const fetchedTrailer = await getTrailerById(trailerId);
                setSizzle(fetchedTrailer);
            }
        };

        fetchSizzle();
        Orientation.lockToLandscape();
        StatusBar.setHidden(true);

        return () => {
            Orientation.lockToPortrait();
            StatusBar.setHidden(false);
            if (hasStartedWatching && user?.id && trailerId) {
                finishUserWatching(user.id, trailerId).then(finishedSuccessfully => {
                    if (finishedSuccessfully) {

                    } else {
                        // Handle the case where the user did not finish watching the trailer
                        // You can show an error message or perform any other action here
                    }
                });
            }
        };
    }, [trailerId, user?.id, hasStartedWatching]);

    const onPlay = () => {
        setIsSizzlePlaying(true);
        StatusBar.setHidden(true);
    };
    const onPause = () => {
        setIsSizzlePlaying(false);
        StatusBar.setHidden(false);
    };

    const onEnd = () => {
        setIsSizzlePlaying(false);
        Orientation.lockToPortrait();
        StatusBar.setHidden(false);
        navigation.pop();
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                {sizzle && sizzle?.trailerURL ? (
                    <>
                        <VideoPlayer
                            videoRef={videoRef}
                            source={{
                                uri: sizzle.trailerURL,
                            }}
                            resizeMode="cover"
                            posterResizeMode="cover"
                            tapAnywhereToPause={false}
                            preventsDisplaySleepDuringVideoPlayback={true}
                            toggleResizeModeOnFullscreen={false}
                            poster={sizzle.landscapeURL}
                            containerStyle={{zIndex: 100}}
                            onBack={onEnd}
                            paused={!isSizzlePlaying}
                            onPlay={onPlay}
                            onPause={onPause}
                            onEnd={onEnd}
                            onError={error => console.log('Video error:', error)}
                        />
                    </>
                ) : (
                    <>
                        <ActivityIndicator size="large" color={COLORS.CATPURPDRK} style={{alignSelf: 'center'}} />
                    </>
                )}
            </View>
        </View>
    );
}
