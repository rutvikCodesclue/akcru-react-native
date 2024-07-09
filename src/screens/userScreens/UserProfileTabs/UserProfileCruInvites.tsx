import {View, Text, FlatList} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import CruInviteCard from '../../../components/CruInviteCard';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {acceptACRUInvite, declineACRUInvite, getCRUInvites} from '../../../lib/api/cru.lib';
import {ICruInvite, IMITInvite} from '../../../../types';
import {COLORS, FONTS} from '../../../../assets/constants';
import {getMyMITInvites} from '../../../lib/api/mit.lib';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../../navigation/ClientStack';
import useAuthStore from '../../../stores/auth.store';
import {UseTabMenu} from '../../../context/TabContext';

const UserProfileCruInvites = () => {
    const [cruInvites, setCRUInvites] = useState<ICruInvite[] | []>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [invites, setInvites] = React.useState<(ICruInvite | IMITInvite)[] | []>([]);
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();
    const user = useAuthStore(state => state.user);
    const {setRefetchCrus} = UseTabMenu();

    useFocusEffect(
        React.useCallback(() => {
            getCRUInvites({pending: true}).then(cruInvites => {
                if (cruInvites) {
                    const pendingCRUInvites = cruInvites.filter(
                        (invite: {status: string}) => invite.status !== 'ACCEPTED' && invite.status !== 'DECLINED',
                    );

                    setCRUInvites(pendingCRUInvites);

                    setIsLoaded(true);
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

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const _acceptCruInvite = (item: ICruInvite) => {
        setIsLoading(true);
        //console.log('accept CruInvite');
        acceptACRUInvite({inviteId: item.id}).then(res => {
            //console.log('accepted res:', res);
            setIsLoading(false);

            setRefetchCrus(true);
            navigation.navigate('CruInviteAccept', {
                id: item.cruId,
                inviteeName: item.cru.creator.firstName,
                creator: item.cru.creator,
                inviteDate: item.createdAt,
                profilePicture: item.cru.creator.profilePicture,
            });
        });
    };

    const _declineCruInvite = (item: ICruInvite) => {
        setIsLoading(true);
        //console.log('decline CruInvite');
        declineACRUInvite({inviteId: item.id}).then(res => {
            //console.log('declined res:', res);
            setIsLoading(false);

            navigation.navigate('CruInviteDecline', {
                id: item.cruId,
                inviteeName: item.cru.creator.firstName,
                creator: item.cru.creator,
                inviteDate: item.createdAt,
                profilePicture: item.cru.creator.profilePicture,
            });
        });
    };

    const handleCruInviteCardPress = (creatorId: string) => {
        navigation.navigate('ViewUserScreen', {userID: creatorId});
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
                <FlatList
                    data={cruInvites}
                    horizontal={false}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item, index}) => (
                        <View style={{marginHorizontal: 15, marginBottom: 10}}>
                            <CruInviteCard
                                cruInviteID={item.id}
                                inviteeName={`${item.cru.creator?.username}`}
                                inviteePicture={item.cru.creator?.profilePicture ?? undefined}
                                inviteDate={item.createdAt}
                                invitee={item.cru.creator}
                                onPress={() => handleCruInviteCardPress(item.cru.creatorId)}
                                decline={() => _declineCruInvite(item)}
                                accept={() => _acceptCruInvite(item)}
                            />
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.DARKGREY}}>No Invites</Text>
                    }
                />
            )}
        </View>
    );
};

export default UserProfileCruInvites;
