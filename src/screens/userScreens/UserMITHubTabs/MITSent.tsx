import {View, FlatList, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import MITHubCard from '../../../components/MITHubComps/MITHubCard';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {getMyMITInvites, getMyMITs} from '../../../lib/api/mit.lib';
import {ICruInvite, IMITInvite} from '../../../../types';
import {MITInviteHubCard} from '../../../components/MITHubComps';
import {FONTS} from '../../../../assets/constants/theme';
import CruInviteCard from '../../../components/CruInviteCard';
import {getCRUInvites} from '../../../lib/api/cru.lib';
import useAuthStore from '../../../stores/auth.store';

const MITSent = () => {
    const [currentMITS, setCurrentMITS] = useState<IMITInvite[] | []>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [invites, setInvites] = React.useState<(ICruInvite | IMITInvite)[] | []>([]);
    const {user, hydrateUser} = useAuthStore();
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            getMyMITs().then(res => {
                if (res) {
                    setCurrentMITS(res);
                }
            });
            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
            };
        }, []),
    );

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            // console.log('User Profile Cru Invite Tab focused');
            getCRUInvites({pending: true}).then(invites => {
                // console.log("cru invites: ", JSON.stringify(invites, null, 3));
                setInvites(invites);

                // get the MITS for the user and merge
                getMyMITInvites({pending: true}).then(mitInvites => {
                    // console.log("mitInvites: ", JSON.stringify(mitInvites, null, 3));

                    if (mitInvites) {
                        setInvites(prevInvites => [...prevInvites, ...mitInvites]);
                        // sort invites by date (newest to oldest) and set state
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

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                // console.log('User Profile Cru Invite Tab unfocused');
            };
        }, []),
    );

    return (
        <View style={{marginTop: 10, marginBottom: 75}}>
            <Text style={{...FONTS.Title2, marginHorizontal: 15}}>You have {user?.MITCount} Movie Invites Tickets left</Text>
            <FlatList
                data={currentMITS}
                horizontal={false}
                scrollEnabled={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => (
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
                            onPressIn={() =>
                                navigation.navigate('ViewUserScreen', {
                                    userID: item.inviteeId,
                                })
                            }
                            // influencer={item.influencer}
                            akcruBadge={item.invitee.badge}
                        />
                    </View>
                )}
            />
        </View>
    );
};

export default MITSent;
