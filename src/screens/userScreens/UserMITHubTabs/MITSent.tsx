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

    useFocusEffect(
        React.useCallback(() => {
            setIsLoaded(true); 

            
            const fetchPendingMITs = async () => {
                try {
                    const res = await getMyMITs();
                    if (res) {
                        
                        const pendingMITs = res.filter(mit => mit.status === 'PENDING');
                        setCurrentMITS(pendingMITs);
                    }
                } catch (error) {
                    console.error('Error fetching MITs:', error);
                } finally {
                    setIsLoaded(false); 
                }
            };

            
            fetchPendingMITs();

            return () => {
                
            };
        }, []),
    );

    const fetchMITs = async () => {
        setIsLoaded(true);
        try {
            const fetchedMITS = await getMyMITs(); 
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
                
                setCurrentMITS(currentMITS.filter(mit => mit.id !== mitInviteId));
                
                
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
                
                <Text style={{...FONTS.Title1, textAlign: 'center', marginTop: '5%'}}>Loading...</Text>
            ) : currentMITS.length === 0 ? (
                
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
                        renderItem={({ item }) => {
                            const { username, profilePicture, badge, influencerStatus, companyStatus, ownerStatus, blackCloakStatus } = item.invitee;
                            const startDate = item.startDate ?? '';
                            
                            // Safely access movie title only if item.movie exists and is not null
                            const movieTitle = item.movie ? item.movie.title ?? 'N/A' : 'N/A';
                            
                            return (
                              <View style={{ marginVertical: 5, marginHorizontal: 15 }}>
                                <MITHubCard
                                  inviteeName={username ?? 'Unknown User'}
                                  inviteePicture={profilePicture ?? ''}
                                  MITDate={startDate}
                                  MITMoviechoice={movieTitle}
                                  scheduleDate={startDate}
                                  scheduleTime={startDate}
                                  timezone={item.timezone ?? 'N/A'}
                                  onPressIn={() => navigation.navigate('ViewUserScreen', { userID: item.inviteeId })}
                                  akcruBadge={badge}
                                  cancel={() => handleCancelMIT(item.id)}
                                  influencerStatus={influencerStatus}
                                  companyStatus={companyStatus}
                                  ownerStatus={ownerStatus}
                                  blackCloakStatus={blackCloakStatus}
                                />
                              </View>
                            );
                          }}
                    />
                </View>
            )}
        </View>
    );
};

export default MITSent;
