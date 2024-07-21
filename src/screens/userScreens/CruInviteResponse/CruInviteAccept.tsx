import React, {useEffect} from 'react';
import {View, Text, ScrollView, SafeAreaView} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import styles from './styles';
import {RouteProp} from '@react-navigation/native';
import {Avatar} from '@rneui/base';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../assets/images/imageindex';
import {StackNavigationProp} from '@react-navigation/stack';
import {IUserProfile} from '../../../../types';
import {ClientStackParams} from '../../../navigation/ClientStack';
import HexAvatar from '../../../components/HexAvatar';
import { MULTISIZES } from '../../../../assets/constants/theme';
import { selectAvatarBorderColor } from '../../../util/util';

type CruInviteAcceptNavigationProp = StackNavigationProp<ClientStackParams, 'CruInviteDecline'>;

type CruInviteAcceptRouteProp = RouteProp<ClientStackParams, 'CruInviteDecline'>;

type Props = {
    navigation: CruInviteAcceptNavigationProp;
    route: CruInviteAcceptRouteProp;
};

const CruInviteAccept = ({navigation, route}: Props) => {
    const creator: IUserProfile | null = route.params?.creator ?? null;
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.navigate('UserProfileScreen');
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.sheetcontainer}>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View>
                        <Header />
                    </View>
                    <View>
                        <View style={{height: SIZES.ScreenHeight / 4, marginTop: -60}}>
                            <LinearGradient
                                colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    height: SIZES.ScreenHeight / 4,
                                }}
                            />
                            <View style={styles.topcontainer}>
                                <View>
                                    <Text
                                        style={{
                                            ...FONTS.Title3,
                                            color: COLORS.CATGREENLGT,
                                            fontSize: 16,
                                            textAlign: 'center',
                                            paddingTop: '10%',
                                        }}>
                                        YOU ACCEPTED A CRU INVITE FROM
                                    </Text>
                                    <Text
                                        style={{
                                            ...FONTS.Title3,
                                            color: COLORS.LIGHTGREY,
                                            fontSize: 16,
                                            textAlign: 'center',
                                        }}>
                                        {creator?.username}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View
                            style={{
                                alignItems: 'center',

                                marginHorizontal: 15,
                                marginBottom: 20,
                            }}>
                            <View>
                                <View>
                                    <HexAvatar
                                        source={{uri: creator?.profilePicture}}
                                        size={MULTISIZES.Xlarge150}
                                        bordercolor={selectAvatarBorderColor(creator?.badge ?? 'AKCRUIT')}
                                    />
                                </View>
                            </View>
                        </View>
                        <View>
                            <View style={styles.bottomcontainer}>
                                <Text
                                    style={{
                                        ...FONTS.paragraph1,
                                        fontSize: 12,
                                        textAlign: 'center',
                                    }}>
                                    We will notify "{creator?.username}" you have ACCEPTED to join their CRU.
                                </Text>
                                <View style={{alignItems: 'center', marginTop: 30}} />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default CruInviteAccept;
