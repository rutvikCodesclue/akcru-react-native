import React, {useCallback, useRef, useState} from 'react';
import {Text, SafeAreaView} from 'react-native';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {TestScreenParams} from '../../../navigation/TestScreen';
import {CommonActions, RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import Video from 'react-native-video';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import CrummunityScreen from '../CrummunityScreen';

// type TestScreenNavigationProp = StackNavigationProp<TestScreenParams, 'ViewUserScreen'>;

type Props = {
    navigation: TestScreenNavigationProp;
    route: TestScreenNavigationProp;
};
const Crummunity = createStackNavigator<CrummunityStackParams>();

export const TestScreen = ({route}: Props) => {
    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const videoRef = useRef(null);
    const navigation = useNavigation();

    // useFocusEffect(
    //     useCallback(() => {
    //         // Play video when screen is focused
    //         videoRef.current?.onVideoLoad();

    //         // return () => {
    //         //     // Pause video when screen is unfocused
    //         //     videoRef.current?.pauseAsync();
    //         // };
    //     }, []),
    // );

    // const onVideoEnd = () => {
    //     navigation.dispatch(
    //         CommonActions.navigate({
    //             name: 'CrummunityScreen',
    //         }),
    //     );
    // };
    return (
        <TabContainer>
            <SafeAreaView>
                <Video
                    // onEnd={() => navigation.navigate('CrummunityScreen')}
                    // ref={videoRef}
                    source={{uri: 'https://d1hre5rcnper1r.cloudfront.net/crummunity_guide.mp4'}}
                    style={{width: '100%', height: '100%'}}
                    paused={false} // make it start
                    repeat={true}
                    // resizeMode="cover"
                    // fullscreen={true}
                    fullscreenOrientation={'portrait'}
                    playWhenInactive={true}
                />
            </SafeAreaView>
        </TabContainer>
    );
};
