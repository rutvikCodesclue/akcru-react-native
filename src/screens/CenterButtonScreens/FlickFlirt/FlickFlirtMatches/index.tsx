// src/screens/FlickFlirtMatches.tsx

import React, {useState, useCallback} from 'react';
import {
    View,
    Text,
    SafeAreaView,
    FlatList,
    ImageBackground,
    StyleSheet,
    Alert,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../../assets/images/imageindex';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import FlickFlirtMatchCard from '../../../../components/FlickFlirtMatchCard';
import AkcruButtons from '../../../../components/akcruButtons';
import useAuthStore from '../../../../stores/auth.store';
import {isTablet} from '../../../../../assets/constants/theme';
import {Icon} from '@rneui/base';

import {getMatches, unlockMatches, MatchesResponse, UnlockOption} from '../../../../lib/api/flickflirt.lib';

const FlickFlirtMatches = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {hydrateUser} = useAuthStore();

    // UI state
    const [matches, setMatches] = useState<MatchesResponse['matches']>([]);
    const [hiddenCount, setHiddenCount] = useState<number>(0);
    const [unlocked, setUnlocked] = useState<boolean>(false);
    const [unlockOptions, setUnlockOptions] = useState<UnlockOption[]>([]);
    const [showLoader, setShowLoader] = useState<boolean>(true);

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

    // 2) Open the unlock confirmation
    const openModal = () => {
        if (unlockOptions.length === 0) {
            return Alert.alert('Error', 'No unlock options available.');
        }
        // default to first option
        setSelectedOpt(unlockOptions[0]);
        setModalVisible(true);
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

    const handleSendInviteTicket = () => {
        Alert.alert('Info', 'Open a profile card and send invite from there.');
    };

    return (
        <View style={{flex: 1}}>
            <ImageBackground source={imageindex.FLickFlirt} resizeMode="cover" style={styles.background}>
                <SafeAreaView style={styles.container}>
                    <LinearGradient
                        colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                        style={StyleSheet.absoluteFill}
                    />
                    <Header />
                    <BackButton navigation={navigation} />

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
                                                <TouchableOpacity
                                                    activeOpacity={0.9}
                                                    onPress={openModal}
                                                    style={styles.lockedCardWrap}>
                                                    <ImageBackground
                                                        source={imageindex.BgImageSM}
                                                        resizeMode="cover"
                                                        style={styles.lockedCardBg}
                                                        imageStyle={styles.lockedCardBgImage}>
                                                        <LinearGradient
                                                            colors={['rgba(34,18,56,0.55)', 'rgba(14,13,38,0.75)', 'rgba(34,18,56,0.55)']}
                                                            style={StyleSheet.absoluteFill}
                                                        />
                                                        <View style={styles.lockedInner}>
                                                            <View style={styles.lockCircle}>
                                                                <Text style={styles.lockIcon}>🔒</Text>
                                                            </View>
                                                            <Text style={styles.lockedTitle}>LOCKED MATCH</Text>
                                                            <Text style={styles.lockedSubTitle}>Unlock to view profile</Text>
                                                        </View>
                                                    </ImageBackground>
                                                </TouchableOpacity>
                                            );
                                        }

                                        const match = item.item;
                                        return (
                                            <View style={styles.matchCardWrap}>
                                                <FlickFlirtMatchCard
                                                    userPicture={match.profilePicture}
                                                    userName={match.username}
                                                    onPress={() => navigation.navigate('ViewUserScreen', {userID: match.id})}
                                                    influencer={false}
                                                    akcruBadge={match.badge}
                                                    userDesc={match.description}
                                                    matchLabel={match.matchLabel}
                                                    archetype={match.archetype}
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
                                            onPress={openModal}
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
                </SafeAreaView>
            </ImageBackground>

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

            <Modal animationType="fade" transparent visible={showLoader}>
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                    <Text style={styles.loaderText}>Loading matches...</Text>
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    background: {width: SIZES.ScreenWidth, height: SIZES.ScreenHeight},
    container: {flex: 1},
    content: {flex: 1, justifyContent: 'center'},
    headerText: {...FONTS.Title3, color: COLORS.LIGHTGREY, textAlign: 'center', marginBottom: 6},
    lockedCountSubtext: {
        ...FONTS.Title3,
        color: COLORS.LIGHTGREY,
        textAlign: 'center',
        marginBottom: 10,
        opacity: 0.9,
    },
    listContent: {paddingHorizontal: 4, paddingBottom: 12},
    columnWrapper: {justifyContent: 'space-between'},
    cardWrapper: {marginVertical: 5, alignItems: 'center'},
    matchCardWrap: {marginVertical: 5, borderRadius: 18},
    lockedCardWrap: {
        width: SIZES.ScreenWidth / 2.1,
        alignItems: 'center',
        marginVertical: 5,
    },
    lockedCardBg: {
        width: SIZES.ScreenWidth / 2.3,
        height: (SIZES.ScreenWidth / 2.3) * 1.42,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockedCardBgImage: {
        borderRadius: 16,
    },
    lockedInner: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    lockCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    lockIcon: {
        fontSize: 22,
    },
    lockedTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        letterSpacing: 0.8,
        textAlign: 'center',
    },
    lockedSubTitle: {
        ...FONTS.paragraph2,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginTop: 6,
    },
    noMatchWrapper: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    noMatchText: {...FONTS.Title3, color: COLORS.LIGHTGREY, textAlign: 'center', marginBottom: 20},
    unlockWrapper: {marginTop: 20, alignItems: 'center'},
    unlockText: {...FONTS.Title3, color: COLORS.LIGHTGREY, marginBottom: 10},

    // modal styles
    modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'},
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
    loaderOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loaderText: {
        ...FONTS.Title3,
        color: COLORS.AKCRUBLUE,
        marginTop: 10,
    },
});

export default FlickFlirtMatches;
