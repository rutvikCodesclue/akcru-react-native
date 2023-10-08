import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import styles from './styles';
import CruInviteCard from '../../../components/CruInviteCard';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import { acceptACRUInvite, declineACRUInvite, getCRUInvites } from '../../../lib/api/cru.lib';
import { ICruInvite, IMITInvite } from '../../../../types';
import { FONTS } from '../../../../assets/constants';
import { getMyMITInvites } from '../../../lib/api/mit.lib';
import MITInviteCard from '../../../components/MITInviteCard';
import imageindex from '../../../../assets/images/imageindex';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientStackParams } from '../../../navigation/ClientStack';

const UserProfileCruInvites = () => {
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [invites, setInvites] = React.useState<(ICruInvite | IMITInvite)[] | []>([]);
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();
    

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

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const _acceptCruInvite = (item: ICruInvite) => {
        setIsLoading(true);
        console.log('accept CruInvite');
        acceptACRUInvite({inviteId: item.id}).then(res => {
            console.log('accepted res:', res);
            setIsLoading(false);
            // Navigate to CruInviteAccept screen with necessary parameters for CruInvite
            navigation.navigate('CruInviteAccept', {
                id: item.cruId,
                inviteeName: item.cru.creator.firstName,
                creator: item.cru.creator,
                inviteDate: item.createdAt,
                profilePicture: item.cru.creator.profilePicture
            });
        });
    };

    const _declineCruInvite = (item: ICruInvite) => {
        setIsLoading(true);
        console.log('decline CruInvite');
        declineACRUInvite({inviteId: item.id}).then(res => {
            console.log('declined res:', res);
            setIsLoading(false);
            // Navigate to CruInviteDecline screen with necessary parameters for CruInvite
            navigation.navigate('CruInviteDecline', {
                id: item.cruId,
                inviteeName: item.cru.creator.firstName,
                creator: item.cru.creator,
                inviteDate: item.createdAt,
                profilePicture: item.cru.creator.profilePicture,
            });
        });
    };




    return (
        <View>
            <View>
                <Text style={styles.titleText1}>CRU INVITES</Text>
            </View>
            {!isLoaded ? (
                <Text style={{...FONTS.Title1, textAlign: 'center'}}>
                    {invites.length === 0 ? 'No Invites' : 'Loading...'}
                </Text>
            ) : (
                <ScrollView>
                    {invites.length > 0 ? (
                        invites.map(item => {
                            if (item instanceof Object && 'cru' in item) {
                                return (
                                    <View key={item.id} style={{marginHorizontal: 15, marginBottom: 10}}>
                                        <CruInviteCard
                                            cruInviteID={item.id}
                                            inviteeName={`${item.cru.creator.firstName} ${item.cru.creator.lastName}`}
                                            inviteePicture={item.cru.creator.profilePicture ?? undefined}
                                            inviteDate={item.createdAt}
                                            invitee={item.cru.creator}
                                            onPress={() => navigation.navigate('ViewUserScreen', {id: item.inviteeId})}
                                            decline={() => _declineCruInvite(item)}
                                            accept={() => _acceptCruInvite(item)}
                                        />
                                    </View>
                                );
                            }
                        })
                    ) : (
                        // Implement no invites empty state here
                        <Text style={{...FONTS.Title1, textAlign: 'center'}}>No Invites</Text>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

export default UserProfileCruInvites
