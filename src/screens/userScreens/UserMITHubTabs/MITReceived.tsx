import {View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {getMyMITInvites} from '../../../lib/api/mit.lib';
import {ICruInvite, IMITInvite} from '../../../../types';
import {COLORS, SIZES} from '../../../../assets/constants';
import {FONTS} from '../../../../assets/constants/theme';
import {Icon} from '@rneui/base';
import UserCruChatCard from '../../../components/UserCruChatCard';
import moment from 'moment-timezone';

const MITReceived = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [invites, setInvites] = useState<(ICruInvite | IMITInvite)[] | []>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const [inviteCount, setInviteCount] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            getMyMITInvites().then(mitInvites => {
                if (mitInvites) {
                    const sorted = mitInvites.sort((a, b) => {
                        if (a.createdAt < b.createdAt) {
                            return 1;
                        }
                        if (a.createdAt > b.createdAt) {
                            return -1;
                        }
                        return 0;
                    });
                    setInvites(sorted);
                    setInviteCount(sorted.length);
                    setIsLoaded(true);
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

    const mitOnly = useMemo(
        () => invites.filter((item): item is IMITInvite => !(item && typeof item === 'object' && 'cru' in item)),
        [invites],
    );

    const filteredInvites = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) {
            return mitOnly;
        }
        return mitOnly.filter(mit => {
            const creatorName = mit.creator?.username?.toLowerCase() ?? '';
            const movieTitle = mit.movie?.title?.toLowerCase() ?? '';
            return creatorName.includes(q) || movieTitle.includes(q);
        });
    }, [mitOnly, searchQuery]);

    return (
        <View style={styles.outer}>
            <View style={styles.listRoot}>
                <View style={styles.inner}>
                    {!isLoaded ? (
                        <View style={styles.loadingWrap}>
                            <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                        </View>
                    ) : (
                        <>
                            <Text style={styles.countLine}>
                                You have {inviteCount} Movie Invites received.
                            </Text>
                            <View style={styles.searchWrap}>
                                <View style={styles.searchRow}>
                                    <Icon
                                        name="search"
                                        type="ionicon"
                                        size={20}
                                        color={COLORS.LIGHTGREY}
                                        style={{marginRight: 8}}
                                    />
                                    <TextInput
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholder="Search by user or movie"
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.searchInput}
                                    />
                                </View>
                            </View>

                            <View style={styles.chatPanelContainer}>
                                <View style={styles.chatPanel}>
                                    <Text style={styles.chatPanelTitle}>MIT Invites</Text>
                                </View>
                                {filteredInvites.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyTitle}>No invites</Text>
                                        <Text style={styles.emptySubtitle}>
                                            {mitOnly.length === 0
                                                ? 'You have no movie invites to respond to yet.'
                                                : 'No matches for your search.'}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.listBlock}>
                                        {filteredInvites.map((mit, index) => {
                                            const inviteeBadge = mit.invitee?.badge ?? 'AKCRUIT';
                                            const creator = mit.creator;
                                            const username = creator?.username ?? 'User';
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
                                            const isLast = index === filteredInvites.length - 1;
                                            return (
                                                <View
                                                    key={mit.id}
                                                    style={[styles.chatPanelBody, isLast && styles.chatPanelBodyLast]}>
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            navigation.navigate('ChooseMITScreen', {
                                                                MITID: mit.id,
                                                                movie: mit.movie,
                                                                creator: mit.creator,
                                                                inviteDate: mit.createdAt,
                                                                akcruBadge: inviteeBadge,
                                                                schedule: mit.startDate,
                                                                timezone: mit.timezone,
                                                                invitee: mit.invitee,
                                                                expiresAt: mit.expiresAt,
                                                                status: mit.status,
                                                                fromReceivedTab: true,
                                                            })
                                                        }
                                                        style={styles.chatCardTouch}>
                                                        <UserCruChatCard
                                                            userName={username}
                                                            movie={mit.movie?.title ?? ''}
                                                            moviePoster={mit.movie?.landscapeURL}
                                                            CruChatDate={dateLabel}
                                                            CruChatTime={timeLabel}
                                                            CRUChat={statusText}
                                                            previewKind="mitStatus"
                                                            userPicture={creator?.profilePicture}
                                                            badge={creator?.badge}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </View>
            <View style={{height: 8}} />
        </View>
    );
};

const styles = StyleSheet.create({
    outer: {
        marginTop: 4,
        marginBottom: 8,
    },
    listRoot: {
        marginHorizontal: 10,
        minHeight: SIZES.ScreenHeight * 0.35,
    },
    inner: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        flex: 1,
    },
    loadingWrap: {
        minHeight: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countLine: {
        ...FONTS.Title2,
        color: COLORS.OVERLAY_WHITE_92,
        marginBottom: 8,
        textAlign: 'center',
    },
    searchWrap: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_25,
        overflow: 'hidden',
        marginVertical: 8,
        backgroundColor: COLORS.TRANSPARENT,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
    },
    searchInput: {
        flex: 1,
        color: COLORS.WHITE,
        fontSize: 14,
    },
    chatPanelContainer: {
        marginTop: 6,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 0,
        backgroundColor: COLORS.TRANSPARENT,
    },
    chatPanel: {
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: COLORS.TRANSPARENT,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    chatPanelTitle: {
        color: COLORS.OVERLAY_WHITE_85,
        fontSize: 16,
        fontWeight: '600',
    },
    listBlock: {
        paddingHorizontal: 10,
        paddingBottom: 12,
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
    emptyState: {
        minHeight: 160,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    emptyTitle: {
        color: COLORS.WHITE,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: COLORS.OVERLAY_WHITE_75,
        fontSize: 14,
        textAlign: 'center',
    },
});

export default MITReceived;
