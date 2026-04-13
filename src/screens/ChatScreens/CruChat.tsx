import {RouteProp, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {Edge, SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Header from '../../components/header';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import CruChatComponent from './CruChatComponent';
import BackButton from '../../components/General/backbutton';
type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ViewChat'>;

type Props = {
    route: ViewUserFollowListRouteProp;
};

const CruChat = ({route}: Props) => {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const safeAreaEdges: Edge[] = isKeyboardVisible
        ? ['top', 'left', 'right', 'bottom']
        : ['top', 'left', 'right'];

    return (
        <SafeAreaView style={{flex: 1}} edges={safeAreaEdges}>
            <View style={{zIndex: 20}}>
                <Header />
            </View>
            <View style={{marginHorizontal: 15, marginBottom: 10, zIndex: 21}}>
                <BackButton navigation={navigation} />
            </View>
            <View style={{flex: 1, minHeight: 0}}>
                <CruChatComponent route={route} />
            </View>
        </SafeAreaView>
    );
};

export default CruChat;
