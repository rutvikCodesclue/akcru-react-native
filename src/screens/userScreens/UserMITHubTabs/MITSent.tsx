import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet} from 'react-native';
import React, {useMemo, useState} from 'react';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {getMyMITs} from '../../../lib/api/mit.lib';
import {IMITInvite} from '../../../../types';
import {COLORS, FONTS} from '../../../../assets/constants/theme';
import useAuthStore from '../../../stores/auth.store';
import UserCruChatCard from '../../../components/UserCruChatCard';
import moment from 'moment-timezone';


const MITSent = () => {
    const [currentMITS, setCurrentMITS] = useState<IMITInvite[] | []>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const {user} = useAuthStore();
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

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

    const navigateToChooseMITForSent = (mit: IMITInvite) => {
        navigation.navigate('ChooseMITScreen', {
            MITID: mit.id,
            movie: mit.movie,
            creator: mit.creator,
            inviteDate: mit.createdAt,
            akcruBadge: mit.invitee.badge,
            schedule: mit.startDate,
            timezone: mit.timezone,
            invitee: mit.invitee,
            expiresAt: mit.expiresAt,
            status: mit.status,
            fromSentTab: true,
        });
    };

    const sortedSentMITs = useMemo(
        () => [...currentMITS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        [currentMITS],
    );

    return (
        <>
            <View style={{marginTop: 10, marginBottom: 75}}>
                <Text style={{...FONTS.Title2, marginHorizontal: 15}}>
                    You have {user?.MITCount} Movie Invites Tickets left
                </Text>
                {isLoaded ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                    </View>
                ) : sortedSentMITs.length === 0 ? (
                    <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.DARKGREY, marginTop: '5%'}}>
                        You have no sent Movie Invites Tickets
                    </Text>
                ) : (
                    <View>
                        {sortedSentMITs.map((mit, index) => {
                            const invitee = mit.invitee;
                            const username = invitee?.username ?? 'User';
                            const schedule = mit.startDate;
                            const tz = mit.timezone ?? undefined;
                            const dateLabel =
                                schedule && tz
                                    ? moment(schedule).tz(tz).format('MMM D, YYYY')
                                    : schedule
                                      ? new Date(schedule).toLocaleDateString()
                                      : '';
                            const timeLabel =
                                schedule && tz
                                    ? moment(schedule).tz(tz).format('h:mm a')
                                    : schedule
                                      ? new Date(schedule)
                                            .toLocaleTimeString(undefined, {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true,
                                            })
                                            .toLowerCase()
                                      : '';
                            const statusText = (mit.status ?? 'PENDING').toString().toUpperCase();
                            const isLast = index === sortedSentMITs.length - 1;

                            return (
                                <View key={mit.id} style={[styles.chatPanelBody, isLast && styles.chatPanelBodyLast]}>
                                    <TouchableOpacity
                                        activeOpacity={0.92}
                                        onPress={() => navigateToChooseMITForSent(mit)}
                                        accessibilityRole="button"
                                        accessibilityLabel="Open movie invite details"
                                        style={styles.chatCardTouch}>
                                        <UserCruChatCard
                                            userName={`you invited : ${username}`}
                                            movie={mit.movie?.title ?? ''}
                                            moviePoster={mit.movie?.landscapeURL}
                                            CruChatDate={dateLabel}
                                            CruChatTime={timeLabel}
                                            CRUChat={statusText}
                                            previewKind="mitStatus"
                                            userPicture={invitee?.profilePicture}
                                            badge={invitee?.badge}
                                        />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    loadingWrap: {
        minHeight: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatPanelBody: {
        width: '100%',
        alignSelf: 'stretch',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: COLORS.TRANSPARENT,
    },
    chatPanelBodyLast: {
        paddingBottom: 8,
    },
    chatCardTouch: {
        width: '100%',
        marginHorizontal: 0,
        marginTop: 8,
        marginBottom: 8,
    },
});

export default MITSent;
