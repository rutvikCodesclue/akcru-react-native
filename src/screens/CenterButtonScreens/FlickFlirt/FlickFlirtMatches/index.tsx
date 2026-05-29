// src/screens/FlickFlirtMatches.tsx

import React, {useState, useCallback, useMemo} from 'react';
import {View, Text, FlatList, StyleSheet, Alert, Modal, TouchableOpacity} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import FlickFlirtMatchCard from '../../../../components/FlickFlirtMatchCard';
import AkcruButtons from '../../../../components/akcruButtons';
import useAuthStore from '../../../../stores/auth.store';
import {isTablet} from '../../../../../assets/constants/theme';
import FlickFlirtBlurredBackground from '../../../../components/FlickFlirtBlurredBackground';
import FlickFlirtLockedPlaceholderCard from '../../../../components/FlickFlirtLockedPlaceholderCard';
import {AppLoadingModal} from '../../../../components/Loading';

import {getMatches, unlockMatches, MatchesResponse, UnlockOption} from '../../../../lib/api/flickflirt.lib';
import {getMyMITs} from '../../../../lib/api/mit.lib';
import {IMITInvite} from '../../../../../types';

function findMitWithPeer(
    invites: IMITInvite[] | undefined,
    peerId: string,
    myId: string | undefined,
): IMITInvite | undefined {
    if (!invites?.length || !myId) {
        return undefined;
    }
    return invites.find(i => {
        const otherId = i.creatorId === myId ? i.inviteeId : i.creatorId;
        return otherId === peerId && (i.status === 'ACCEPTED' || i.status === 'PENDING');
    });
}

const FlickFlirtMatches = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {hydrateUser, user: authUser} = useAuthStore();

    // UI state
    const [matches, setMatches] = useState<MatchesResponse['matches']>([]);
    const [hiddenCount, setHiddenCount] = useState<number>(0);
    const [unlocked, setUnlocked] = useState<boolean>(false);
    const [unlockOptions, setUnlockOptions] = useState<UnlockOption[]>([]);
    const [showLoader, setShowLoader] = useState<boolean>(true);
    const [midChatLoadingId, setMidChatLoadingId] = useState<string | null>(null);

    // Confirmation modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState<UnlockOption | null>(null);

    // 1) Fetch (limited) matches on focus
    useFocusEffect(
        useCallback(() => {
            let active = true;
            setShowLoader(true);
            (async () => {
                try {
                    const data = await getMatches(); // uses flickflirt.lib
                    if (!active) {
                        return;
                    }

                    if (!data.success) {
                        Alert.alert('Error', data.message || 'Failed to load matches.');
                        return;
                    }

                    setMatches(data.matches); // server-provided (2 items if locked)
                    setHiddenCount(data.hiddenCount);
                    setUnlocked(data.unlocked);
                    setUnlockOptions(data.unlockOptions); // e.g. [ {7,2500}, {30,7500} ]
                } catch (err) {
                    console.error(err);
                    Alert.alert('Error', 'Network error fetching matches.');
                } finally {
                    if (active) setShowLoader(false);
                }
            })();
            return () => {
                active = false;
            };
        }, []),
    );

    // 2) Open the unlock confirmation (e.g. bottom CTA)
    const openModal = () => {
        if (unlockOptions.length === 0) {
            return Alert.alert('Error', 'No unlock options available.');
        }
        // default to first option
        setSelectedOpt(unlockOptions[0]);
        setModalVisible(true);
    };

    const goToUnlockScreen = () => {
        if (unlockOptions.length === 0) {
            Alert.alert('Error', 'No unlock options available.');
            return;
        }
        navigation.navigate('FlickFlirtUnlockMatches', {unlockOptions});
    };

    // 3) Confirm unlock
    const confirmUnlock = async () => {
        if (!selectedOpt) {
            return;
        }
        setModalVisible(false);

        try {
            const data = await unlockMatches(selectedOpt!.durationDays);
            if (!data.success) {
                Alert.alert('Unable to Unlock', data.message);
                return;
            }
            // Append only new matches
            setMatches(prev => {
                const seen = new Set(prev.map(m => m.id));
                return [...prev, ...data.matches.filter(m => !seen.has(m.id))];
            });
            setHiddenCount(0);
            setUnlocked(true);
            hydrateUser(); // refresh AD balance
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Network error during unlock.');
        }
    };

    const visibleMatches = unlocked ? matches : matches.slice(0, 2);
    const additionalLockedCount = unlocked ? 0 : Math.max(matches.length - 2, 0);
    const totalLockedCards = unlocked ? 0 : hiddenCount + additionalLockedCount;
    const listData = [
        ...visibleMatches.map(item => ({type: 'match' as const, id: item.id, item})),
        ...Array.from({length: totalLockedCards}).map((_, idx) => ({
            type: 'locked' as const,
            id: `locked-${idx}`,
        })),
    ];

    const matchHandlers = useMemo(() => {
        const start = async (match: MatchesResponse['matches'][number]) => {
            setMidChatLoadingId(match.id);
            try {
                const invites = await getMyMITs();
                const invite = findMitWithPeer(invites, match.id, authUser?.id);
                if (!invite) {
                    Alert.alert(
                        'Mid-Chat',
                        'You need an active Movie Invite with this person to open Mid-Chat. Send a MIT first.',
                    );
                    return;
                }
                navigation.navigate('ViewChat', {
                    mItInviteId: invite.id,
                    userId: match.id,
                    profilePicture: match.profilePicture ?? '',
                    username: match.username,
                });
            } catch (e) {
                console.error(e);
                Alert.alert('Mid-Chat', 'Could not open chat. Try again.');
            } finally {
                setMidChatLoadingId(null);
            }
        };
        const sendMit = (match: MatchesResponse['matches'][number]) => {
            navigation.reset({
                index: 1,
                routes: [
                    {
                        name: 'ClientTabNavigator' as never,
                        params: {screen: 'ClientStack', params: {screen: 'HomeScreen'}} as never,
                    },
                    {name: 'SendMITViewUser' as never, params: {userid: match.id} as never},
                ],
            });
        };
        return {start, sendMit};
    }, [authUser?.id, navigation]);

    return (
        <View style={{flex: 1}}>
            <FlickFlirtBlurredBackground archetypeStyleGradients>
                    <Header />
                    <BackButton navigation={navigation} />

                    <View style={styles.matchesPanelContainer}>
                        <View style={styles.content}>
                        {matches.length > 0 ? (
                            <>
                                <FlatList
                                    data={listData}
                                    numColumns={2}
                                    keyExtractor={item => item.id}
                                    ListHeaderComponent={
                                        <View style={{marginTop: isTablet() ? '16%' : '5%'}}>
                                            <Text style={styles.headerText}>You have matches.</Text>
                                        </View>
                                    }
                                    columnWrapperStyle={styles.columnWrapper}
                                    contentContainerStyle={styles.listContent}
                                    renderItem={({item}) => {
                                        if (item.type === 'locked') {
                                            return (
                                                <FlickFlirtLockedPlaceholderCard
                                                    size="full"
                                                    onPress={goToUnlockScreen}
                                                />
                                            );
                                        }

                                        const match = item.item;
                                        return (
                                            <View style={styles.matchCardWrap}>
                                                <FlickFlirtMatchCard
                                                    userPicture={match.profilePicture}
                                                    userName={match.username}
                                                    onPress={() =>
                                                        navigation.navigate('ViewUserScreen', {
                                                            userID: match.id,
                                                            imageURL: '',
                                                        })
                                                    }
                                                    influencer={false}
                                                    akcruBadge={match.badge}
                                                    userDesc={match.description}
                                                    matchLabel={match.matchLabel}
                                                    archetype={match.archetype}
                                                    onStartMidChat={() => matchHandlers.start(match)}
                                                    onSendMit={() => matchHandlers.sendMit(match)}
                                                    midChatLoading={midChatLoadingId === match.id}
                                                />
                                            </View>
                                        );
                                    }}
                                />

                                {!unlocked && totalLockedCards > 0 && (
                                    <View style={{marginTop: 10, marginBottom: 100, alignItems: 'center'}}>
                                        <Text style={styles.unlockText}>
                                            You have {totalLockedCards} locked {totalLockedCards === 1 ? 'match' : 'matches'}
                                        </Text>
                                        <AkcruButtons.XlLrgButton
                                            btnname="Unlock Matches"
                                            onPress={goToUnlockScreen}
                                            color={COLORS.PURPLE}
                                            variant="auth"
                                        />
                                    </View>
                                )}
                            </>
                        ) :showLoader ? null: (
                            <View style={styles.noMatchWrapper}>
                                <Text style={styles.noMatchText}>You have no matches.</Text>
                                <AkcruButtons.XlLrgButton
                                    btnname="Start Over"
                                    onPress={() => navigation.navigate('FlickFlirtPrefAll')}
                                    color={COLORS.PURPLE}
                                />
                            </View>
                        )}
                        </View>
                    </View>
            </FlickFlirtBlurredBackground>

            {/* 4) Unlock confirmation modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Unlock All Matches</Text>

                        <Text style={styles.modalLabel}>Choose an option:</Text>
                        {unlockOptions.map(opt => (
                            <TouchableOpacity
                                key={opt.durationDays}
                                style={[
                                    styles.optionRow,
                                    selectedOpt?.durationDays === opt.durationDays && styles.optionRowSelected,
                                ]}
                                onPress={() => setSelectedOpt(opt)}>
                                <Text style={styles.optionText}>
                                    {opt.durationDays} days — {opt.cost} AD
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={confirmUnlock}>
                                <Text style={styles.modalBtnText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <AppLoadingModal visible={showLoader} message="Loading matches..." />

        </View>
    );
};

const styles = StyleSheet.create({
    /** Scroll region — transparent so the screen background shows through (no glass panel) */
    matchesPanelContainer: {
        flex: 1,
        minHeight: 0,
        marginTop: 10,
        marginHorizontal: 10,
        marginBottom: 8,
    },
    content: {flex: 1, justifyContent: 'center'},
    headerText: {...FONTS.Title3, color: COLORS.LIGHTGREY, textAlign: 'center', marginBottom: 6},
    lockedCountSubtext: {
        ...FONTS.Title3,
        color: COLORS.LIGHTGREY,
        textAlign: 'center',
        marginBottom: 10,
        opacity: 0.9,
    },
    listContent: {paddingHorizontal: 4, paddingBottom: 120},
    columnWrapper: {justifyContent: 'space-between'},
    cardWrapper: {marginVertical: 5, alignItems: 'center'},
    matchCardWrap: {marginVertical: 5, borderRadius: 18},
    noMatchWrapper: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    noMatchText: {...FONTS.Title3, color: COLORS.LIGHTGREY, textAlign: 'center', marginBottom: 20},
    unlockWrapper: {marginTop: 20, alignItems: 'center'},
    unlockText: {...FONTS.Title3, color: COLORS.LIGHTGREY, marginBottom: 10},

    // modal styles
    modalOverlay: {flex: 1, backgroundColor: COLORS.OVERLAY_BLACK_50, justifyContent: 'center', alignItems: 'center'},
    modalContent: {width: '80%', backgroundColor: COLORS.AKCRUBACKGROUND, borderRadius: 8, padding: 20},
    modalTitle: {...FONTS.Title2, marginBottom: 15, textAlign: 'center'},
    modalLabel: {...FONTS.Title3, marginBottom: 10},
    optionRow: {padding: 10, borderWidth: 1, borderColor: COLORS.LIGHTGREY, borderRadius: 4, marginBottom: 8},
    optionRowSelected: {backgroundColor: COLORS.PURPLE},
    optionText: {...FONTS.Title3, color: COLORS.LIGHTGREY, textAlign: 'center'},
    modalButtonsRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 20},
    modalBtn: {flex: 1, padding: 10, borderRadius: 4, alignItems: 'center', marginHorizontal: 5},
    cancelBtn: {backgroundColor: COLORS.AKCRUBLUE},
    confirmBtn: {backgroundColor: COLORS.PURPLE},
    modalBtnText: {...FONTS.Title3, color: COLORS.WHITE},
});

export default FlickFlirtMatches;
