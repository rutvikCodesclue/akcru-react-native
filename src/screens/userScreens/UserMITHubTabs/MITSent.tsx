import {View, FlatList, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import MITHubCard from '../../../components/MITHubComps/MITHubCard';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {cancelMIT, cancelSentMIT, getMyMITInvites, getMyMITs} from '../../../lib/api/mit.lib';
import {ICruInvite, IMITInvite} from '../../../../types';
import {MITInviteHubCard} from '../../../components/MITHubComps';
import {COLORS, FONTS} from '../../../../assets/constants/theme';
import CruInviteCard from '../../../components/CruInviteCard';
import {getCRUInvites} from '../../../lib/api/cru.lib';
import useAuthStore from '../../../stores/auth.store';
import { UseTabMenu } from '../../../context/TabContext';


const MITSent = () => {
    const [currentMITS, setCurrentMITS] = useState<IMITInvite[] | []>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [invites, setInvites] = React.useState<(ICruInvite | IMITInvite)[] | []>([]);
    const {user, hydrateUser} = useAuthStore();
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const {setUpdateMITs} = UseTabMenu();

    // useFocusEffect(
    //     React.useCallback(() => {
            
    //         // This code will run when the screen comes into focus (e.g., when navigating to this screen)
    //         getMyMITs().then(res => {
    //             if (res) {
    //                 // Filter and keep only the PENDING MITs
    //                 const pendingMITs = res.filter(item => item.status === 'PENDING');
    //                 setCurrentMITS(pendingMITs);
    //             }
    //         });
    //         return () => {
    //             // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
    //         };
    //     }, []),
    // );

    // useFocusEffect(
    //     React.useCallback(() => {
    //         setIsLoaded(true);
    //         // This code will run when the screen comes into focus (e.g., when navigating to this screen)
    //         // console.log('User Profile Cru Invite Tab focused');
    //         getCRUInvites({pending: true}).then(invites => {
    //             // console.log("cru invites: ", JSON.stringify(invites, null, 3));
    //             setInvites(invites);

    //             // get the MITS for the user and merge
    //             getMyMITInvites({pending: true}).then(mitInvites => {
    //                 // console.log("mitInvites: ", JSON.stringify(mitInvites, null, 3));

    //                 if (mitInvites) {
    //                     setInvites(prevInvites => [...prevInvites, ...mitInvites]);
    //                     // sort invites by date (newest to oldest) and set state
    //                     setInvites(prevInvites =>
    //                         prevInvites.sort((a, b) => {
    //                             if (a.createdAt < b.createdAt) {
    //                                 return 1;
    //                             }
    //                             if (a.createdAt > b.createdAt) {
    //                                 return -1;
    //                             }
    //                             return 0;
    //                         }),
    //                     );
    //                 }

    //                 setIsLoaded(false);
    //             });
    //         });

    //         return () => {
    //             // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
    //             // console.log('User Profile Cru Invite Tab unfocused');
    //         };
    //     }, []),
    // );

    useFocusEffect(
        React.useCallback(() => {
            setIsLoaded(true); // Indicate loading

            // Asynchronously fetch MITs and update state with only the pending ones
            const fetchPendingMITs = async () => {
                try {
                    const res = await getMyMITs();
                    if (res) {
                        // Filter for pending MITs
                        const pendingMITs = res.filter(mit => mit.status === 'PENDING');
                        setCurrentMITS(pendingMITs);
                    }
                } catch (error) {
                    console.error('Error fetching MITs:', error);
                } finally {
                    setIsLoaded(false); // Indicate loading is complete
                }
            };

            // Execute the fetch operation
            fetchPendingMITs();

            return () => {
                // Optional clean-up logic
            };
        }, []),
    );

    const fetchMITs = async () => {
        setIsLoaded(true);
        try {
            const fetchedMITS = await getMyMITs(); // Your function to fetch MITs
            if (fetchedMITS) {
                setCurrentMITS(fetchedMITS);
            }
        } catch (error) {
            console.error('Error fetching MITs:', error);
        } finally {
            setIsLoaded(false);
        }
    };

    const handleCancelMIT = async (mitInviteId: string) => {
        setIsLoaded(true);
        try {
            const response = await cancelSentMIT(mitInviteId);
            if (response.success) {
                hydrateUser({...user, MITCount: (user?.MITCount || 0) + 1});
                // Instead of re-fetching all MITs, filter out the cancelled one
                setCurrentMITS(currentMITS.filter(mit => mit.id !== mitInviteId));
                // Trigger an update in components related to MITs
                // setUpdateMITs(prevState => !prevState);
            } else {
                console.error('Failed to cancel MIT:', response.message);
            }
        } catch (error) {
            console.error('Error cancelling MIT:', error);
        } finally {
            setIsLoaded(false);
        }
    };


    return (
        <View style={{marginTop: 10, marginBottom: 75}}>
            <Text style={{...FONTS.Title2, marginHorizontal: 15}}>
                You have {user?.MITCount} Movie Invites Tickets left
            </Text>
            {isLoaded ? (
                // If the data is still loading, show a loading indicator
                <Text style={{...FONTS.Title1, textAlign: 'center', marginTop: '5%'}}>Loading...</Text>
            ) : currentMITS.length === 0 ? (
                // If loading is done and there are no items, show the "no sent MITs" message
                <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.DARKGREY, marginTop: '5%'}}>
                    You have no sent Movie Invites Tickets
                </Text>
            ) : (
                <View>
                    <FlatList
                        data={currentMITS}
                        horizontal={false}
                        scrollEnabled={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => (
                            <View style={{marginVertical: 5, marginHorizontal: 15}}>
                                <MITHubCard
                                    inviteeName={`${item.invitee.username}`}
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
            )}
        </View>
    );
};

export default MITSent;
