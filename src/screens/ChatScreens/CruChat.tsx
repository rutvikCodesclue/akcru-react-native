import {RouteProp, useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import React from 'react';
import {SafeAreaView, View} from 'react-native';
import {COLORS, FONTS} from '../../../assets/constants';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Text, TouchableRipple} from 'react-native-paper';
import Header from '../../components/header';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import CruChatComponent from './CruChatComponent';
import BackButton from '../../components/General/backbutton';

type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ViewChat'>;

type Props = {
    route: ViewUserFollowListRouteProp;
};

const CruChat = ({route}: Props) => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    return (
        <SafeAreaView style={{flex: 1, paddingBottom: 10}}>
            <View style={{zIndex: 20}}>
                <Header />
            </View>
            <View style={{marginHorizontal: 15, marginBottom: 10, zIndex: 21}}>
               <BackButton navigation={navigation} />
            </View>
            <CruChatComponent route={route} />
        </SafeAreaView>
    );
};

export default CruChat;
