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

    // Add a state to keep track of the invite count
    const [inviteCount, setInviteCount] = React.useState<number>(0);

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

            // Get the MITS for the user
            getMyMITInvites({pending: true}).then(mitInvites => {
                // console.log("mitInvites: ", JSON.stringify(mitInvites, null, 3));

                if (mitInvites) {
                    // Count the number of MIT invites
                    const mitInviteCount = mitInvites.length;

                    // sort invites by date (newest to oldest) and set state
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
                    // Call setInviteCount with the total count of MIT invites
                    setInviteCount(mitInviteCount);
                } else {
                    // If there are no MIT invites, set the count to 0
                    setIsLoaded(true);
                    setInviteCount(0);
                }
            });

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                // console.log('User Profile Cru Invite Tab unfocused');
            };
        }, []),
    );

    // useFocusEffect(
    //     React.useCallback(() => {
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

    //                 setIsLoaded(true);
    //             });
    //         });

    //         return () => {
    //             // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
    //             // console.log('User Profile Cru Invite Tab unfocused');
    //         };
    //     }, []),
    // );

    useEffect(() => {
        // When the invites change, update the invite count
        setInviteCount(invites.length);
    }, [invites]);

    return (
        <View style={{marginTop: 10, marginBottom: 75}}>
            <View>
                {/* Display the invite count */}
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
                                    // FIXME: implement MIT invite card
                                    return (
                                        <View key={item.id} style={{marginHorizontal: 15, marginBottom: 10}}>
                                            <MITInviteHubCard
                                                MITInviteID={item.id}
                                                movie={item.movie}
                                                creator={item.creator}
                                                // inviteeName={`${item.creator.firstName} ${item.creator.lastName}`}
                                                // inviteePicture={item.creator.profilePicture ?? undefined}
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
                                                        invitee: item.invitee
                                                    })
                                                }
                                            />
                                        </View>
                                    );
                                }
                            })
                        ) : (
                            // FIXME: implement no invites empty state
                            <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.DARKGREY}}>No Invites</Text>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

export default MITReceived;
