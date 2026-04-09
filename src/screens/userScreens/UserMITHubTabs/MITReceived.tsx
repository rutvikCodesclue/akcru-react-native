import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {getMyMITInvites, getMyMITs} from '../../../lib/api/mit.lib';
import {ICruInvite, IMITInvite} from '../../../../types';
import {MITInviteHubCard} from '../../../components/MITHubComps';
import {COLORS, FONTS} from '../../../../assets/constants/theme';

const MITReceived = () => {
    const [currentMITS, setCurrentMITS] = useState<IMITInvite[] | []>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [invites, setInvites] = React.useState<(ICruInvite | IMITInvite)[] | []>([]);

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const [inviteCount, setInviteCount] = React.useState<number>(0);

    useFocusEffect(
        React.useCallback(() => {
            getMyMITs().then(res => {
                if (res) {
                    setCurrentMITS(res);
                }
            });
            return () => {};
        }, []),
    );

    useFocusEffect(
        React.useCallback(() => {
            getMyMITInvites({pending: true}).then(mitInvites => {
                if (mitInvites) {
                    const mitInviteCount = mitInvites.length;

                    setInvites(
                        mitInvites.sort((a, b) => {
                            if (a.createdAt < b.createdAt) {
                                return 1;
                            }
                            if (a.createdAt > b.createdAt) {
                                return -1;
                            }
                            return 0;
                        }),
                    );

                    setIsLoaded(true);

                    setInviteCount(mitInviteCount);
                } else {
                    setIsLoaded(true);
                    setInviteCount(0);
                }
            });

            return () => {};
        }, []),
    );

    useEffect(() => {
        setInviteCount(invites.length);
    }, [invites]);

    return (
        <View style={{marginTop: 10, marginBottom: 75}}>
            <View>
                <Text style={{...FONTS.Title2, marginHorizontal: 15}}>
                    You have {inviteCount} Movie Invites waiting for your response.
                </Text>
                {!isLoaded && <Text style={{...FONTS.Title1, textAlign: 'center'}}>Loading...</Text>}
                {isLoaded && (
                    <View style={{marginVertical: 5}}>
                        {invites.length > 0 ? (
                            invites.map(item => {
                                if (item instanceof Object && 'cru' in item) {
                                } else {
                                    return (
                                        <View key={item.id} style={{marginHorizontal: 15, marginBottom: 10}}>
                                            <MITInviteHubCard
                                                MITInviteID={item.id}
                                                movie={item.movie}
                                                creator={item.creator}
                                                inviteDate={item.createdAt}
                                                akcruBadge={item.invitee.badge}
                                                scheduleDate={item.startDate}
                                                scheduleTime={item.startDate}
                                                timezone={item.timezone}
                                                onPress={() =>
                                                    navigation.navigate('ChooseMITScreen', {
                                                        MITID: item.id,
                                                        movie: item.movie,
                                                        creator: item.creator,
                                                        inviteDate: item.createdAt,
                                                        akcruBadge: item.invitee.badge,
                                                        schedule: item.startDate,
                                                        timezone: item.timezone,
                                                        invitee: item.invitee,
                                                        expiresAt: item.expiresAt,
                                                    })
                                                }
                                            />
                                        </View>
                                    );
                                }
                            })
                        ) : (
                            <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.DARKGREY}}>
                                No Invites
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

export default MITReceived;
