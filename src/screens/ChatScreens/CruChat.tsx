import {RouteProp, useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import { View} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import {Bubble, GiftedChat, IMessage} from 'react-native-gifted-chat';
import {COLORS, FONTS} from '../../../assets/constants';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RealtimeChannel} from '@supabase/supabase-js';
import _ from 'lodash';
import {Text, TouchableRipple} from 'react-native-paper';
import {supabase} from '../../../lib/supabase';
import HexAvatar from '../../components/HexAvatar';
import Header from '../../components/header';
import {getTextMessages, saveTextMessage} from '../../lib/api/rooms.lib';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import useAuthStore from '../../stores/auth.store';
import {selectAvatarBorderColor} from '../../util/util';
import CruChatComponent from './CruChatComponent';

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
                <TouchableRipple onPress={() => navigation.pop()}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                        <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                        <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                    </View>
                </TouchableRipple>
            </View>
            <CruChatComponent route={route}/>
        </SafeAreaView>
    );
};

export default CruChat;
