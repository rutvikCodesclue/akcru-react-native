import {View, FlatList, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import MITHubCard from '../../../components/MITHubComps/MITHubCard';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {cancelMIT, cancelSentMIT, getMyMITInvites, getMyMITs} from '../../../lib/api/mit.lib';
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

    const handleCancelMIT = async (mitInviteId: string) => {
        try {
            const response = await cancelMIT(mitInviteId); // Use the CRU View ID
            if (response.success) {
                // setRefetchDates(true);
                // setConfirmCancelMITModal(false);
                // setDateMITType('Success');
                // setDateMITResultModal(true);
                // setDateMITMessage('MIT cancelled successfully');
                // setDateMITIcon('md-checkmark-circle');
                // setDateMITIconColor('green');
            } else {
                // setRefetchDates(true);
                // setConfirmCancelMITModal(false);
                // setDateMITType('Fail');
                // setDateMITResultModal(true);
                // setDateMITMessage('Failed to cancel MIT');
                // setDateMITIcon('md-alert-circle');
                // setDateMITIconColor('red');
            }
        } catch (error) {
            // setRefetchDates(true);
            // setConfirmCancelMITModal(false);
            // setDateMITType('Error');
            // setDateMITResultModal(true);
            // setDateMITMessage('An error occurred while cancelling the MIT');
            // setDateMITIcon('md-alert-circle');
            // setDateMITIconColor('red');
            console.error('Error cancelling MIT:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            getMyMITs().then(res => {
                if (res) {
                    // Filter and keep only the PENDING MITs
                    const pendingMITs = res.filter(item => item.status === 'PENDING');
                    setCurrentMITS(pendingMITs);
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
            <Text style={{...FONTS.Title2, marginHorizontal: 15}}>
                You have {user?.MITCount} Movie Invites Tickets left
            </Text>
            <FlatList
                data={currentMITS}
                horizontal={false}
                scrollEnabled={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => (
                    <View style={{marginVertical: 5, marginHorizontal: 15}}>
                        <MITHubCard
                            inviteeName={
                              `${item.invitee.username}`
                            }
                            inviteePicture={item.invitee.profilePicture ?? ''}
                            MITDate={item.startDate}
                            MITMoviechoice={item.movie.title}
                            scheduleDate={item.startDate}
                            scheduleTime={item.startDate}
                            timezone={item.timezone}
                            onPressIn={() =>
                                navigation.navigate('ViewUserScreen', {
                                    userID: item.inviteeId,
                                })
                            }
                            // influencer={item.influencer}
                            akcruBadge={item.invitee.badge}
                            cancel={() => handleCancelMIT(item.id)}
                        />
                    </View>
                )}
            />
        </View>
    );
};

export default MITSent;
