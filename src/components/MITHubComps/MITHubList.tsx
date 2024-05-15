import {View, FlatList, Text} from 'react-native';
import React, {useState} from 'react';
import MITHubCard from './MITHubCard';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {getMyMITInvites, getMyMITs} from '../../lib/api/mit.lib';
import {ICruInvite, IMITInvite} from '../../../types';
import MITInviteHubCard from './MITInviteHubCard';
import {FONTS} from '../../../assets/constants/theme';
import {getCRUInvites} from '../../lib/api/cru.lib';

const MITHubList = () => {
    const [currentMITS, setCurrentMITS] = useState<IMITInvite[] | []>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [invites, setInvites] = React.useState<(ICruInvite | IMITInvite)[] | []>([]);

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

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
            getCRUInvites({pending: true}).then(invites => {
                setInvites(invites);

                getMyMITInvites({pending: true}).then(mitInvites => {
                    if (mitInvites) {
                        setInvites(prevInvites => [...prevInvites, ...mitInvites]);

                        setInvites(prevInvites =>
                            prevInvites.sort((a, b) => {
                                if (a.createdAt < b.createdAt) {
                                    return 1;
                                }
                                if (a.createdAt > b.createdAt) {
                                    return -1;
                                }
                                return 0;
                            }),
                        );
                    }

                    setIsLoaded(true);
                });
            });

            return () => {};
        }, []),
    );

    return (
        <View style={{marginTop: 10, marginBottom: 75}}>
            <View>
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
                                                onPress={() =>
                                                    navigation.navigate('ChooseMITScreen', {
                                                        MITID: item.id,
                                                        movie: item.movie,
                                                        creator: item.creator,
                                                        inviteDate: item.createdAt,
                                                        akcruBadge: item.invitee.badge,
                                                    })
                                                }
                                                scheduleDate={''}
                                                scheduleTime={''}
                                                timezone={''}
                                            />
                                        </View>
                                    );
                                }
                            })
                        ) : (
                            <Text style={{...FONTS.Title1, textAlign: 'center'}}>No Invites</Text>
                        )}
                    </View>
                )}
            </View>
            <FlatList
                data={currentMITS}
                horizontal={false}
                scrollEnabled={false}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({item}) => (
                    <View style={{marginVertical: 5, marginHorizontal: 15}}>
                        <MITHubCard
                            inviteeName={
                                item.invitee.firstName ? `${item.invitee.firstName}` : `${item.invitee.username}`
                            }
                            inviteePicture={item.invitee.profilePicture ?? ''}
                            MITDate={item.startDate}
                            MITMoviechoice={item.movie.title}
                            scheduleDate={item.startDate}
                            scheduleTime={item.startDate}
                            timezone={item.timezone}
                            onPressIn={() => navigation.navigate('ViewUserScreen', {userID: item.inviteeId})}
                            akcruBadge={item.invitee.badge}
                        />
                    </View>
                )}
            />
        </View>
    );
};

export default MITHubList;
