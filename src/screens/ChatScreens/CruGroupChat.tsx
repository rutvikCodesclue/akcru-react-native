import {RouteProp, useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {COLORS, FONTS} from '../../../assets/constants';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Text, TouchableRipple} from 'react-native-paper';
import Header from '../../components/header';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import CruGroupChatComponent from './CruGroupChatComponent';
import {getMyCRU} from '../../lib/api/cru.lib';
import {ICru, IUserProfile} from '../../../types';
import BackButton from '../../components/General/backbutton';

type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ViewChat'>;

type Props = {
    route: ViewUserFollowListRouteProp;
};

const CruGroupChat = ({route}: Props) => {
    const isMyCruChat = route.params?.isMyCruChat || null;
    const cruData = route.params?.cru || null;

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const [CRU, setCRU] = useState<ICru | undefined>(undefined);
    const [members, setMembers] = useState<IUserProfile[] | []>([]);
    useEffect(() => {
        if (isMyCruChat) {
            getMyCRU().then(res => {
                setCRU(res?.CRU);

                if (res?.CRU.members) {
                    setMembers(res.CRU.members);
                }
            });
        } else {
            setCRU(cruData);

            if (cruData?.members) {
                setMembers(cruData.members);
            }
        }
    }, []);

    return (
        <SafeAreaView style={{flex: 1, paddingBottom: 10}}>
            <View style={{zIndex: 20}}>
                <Header />
            </View>
            <View style={{marginHorizontal: 15, marginBottom: 10, zIndex: 21}}>
                <BackButton navigation={navigation} />
            </View>
            {CRU ? <CruGroupChatComponent cru={CRU} members={members} /> : null}
        </SafeAreaView>
    );
};

export default CruGroupChat;
