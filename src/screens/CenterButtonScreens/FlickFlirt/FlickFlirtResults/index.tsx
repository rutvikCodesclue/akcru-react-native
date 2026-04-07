import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    Text,
    FlatList,
    Alert,
    TouchableOpacity,
    Modal,
    Platform,
    StyleSheet,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {AUTH_BUTTON_THEME, AUTH_TEXT_THEME} from '../../../../../assets/constants/authTheme';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import imageindex from '../../../../../assets/images/imageindex';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import styles from './styles'; // reuse same style module if it contains modal styles; else copy those blocks here
import {IUserProfile, IMITInvite} from '../../../../../types';
import FlickFlirtMatchCard from '../../../../components/FlickFlirtMatchCard';
import AkcruButtons from '../../../../components/akcruButtons';
import {isTablet} from '../../../../../assets/constants/theme';
import {InterstitialAd, AdEventType, TestIds} from 'react-native-google-mobile-ads';
import useAuthStore from '../../../../stores/auth.store';
import {getMatches, unlockMatches, UnlockOption} from '../../../../lib/api/flickflirt.lib';
import {getMyMITs} from '../../../../lib/api/mit.lib';
import {Icon} from '@rneui/base';
import {useBackNavigatesToClientTab} from '../../../../hooks/useBackNavigatesToClientTab';
import FlickFlirtBlurredBackground from '../../../../components/FlickFlirtBlurredBackground';
import FlickFlirtLockedPlaceholderCard from '../../../../components/FlickFlirtLockedPlaceholderCard';
import LinearGradient from 'react-native-linear-gradient';

type Nav = NativeStackNavigationProp<NoBottomTabStackParams>;

const SEE_MORE_BORDER_RADIUS = 14;
const SEE_MORE_BORDER_PAD = 1.5;
const SEE_MORE_INNER_RADIUS = SEE_MORE_BORDER_RADIUS - SEE_MORE_BORDER_PAD;
/** Same purple → blue as FlickFlirt match actions */
const SEE_MORE_GRADIENT = {
    colors: [COLORS.PURPLE, COLORS.AKCRUBLUE] as const,
    start: {x: 0, y: 0.5},
    end: {x: 1, y: 0.5},
};

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

const FlickFlirtResults = () => {
    const navigation = useNavigation<Nav>();
    const goHome = useBackNavigatesToClientTab();
    const {hydrateUser, user: authUser} = useAuthStore();

    const [matches, setMatches] = useState<IUserProfile[]>([]);
    const [hiddenCount, setHiddenCount] = useState(0);
    const [unlocked, setUnlocked] = useState(false);
    const [unlockOptions, setUnlockOptions] = useState<UnlockOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [midChatLoadingId, setMidChatLoadingId] = useState<string | null>(null);

    // unlock modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState<UnlockOption | null>(null);

    // interstitial
    const [adLoaded, setAdLoaded] = useState(false);
    const [showEntryOverlay, setShowEntryOverlay] = useState(true);
    const interstitialRef = useRef<InterstitialAd | null>(null);
    const showOncePerFocusRef = useRef(false);

    const PROD_IDS = Platform.select({
        android: 'ca-app-pub-8264001768347242/2150819252',
        ios: 'ca-app-pub-8264001768347242/1708251538',
    });
    const interstitialUnitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_IDS;

    useEffect(() => {
        if (!interstitialUnitId) return;
        const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {requestNonPersonalizedAdsOnly: true});
        interstitialRef.current = ad;

        const offLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded(true);
            // show only once per focus
            if (!showOncePerFocusRef.current) {
                showOncePerFocusRef.current = true;
                ad.show();
            }
        });
        const offClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            setAdLoaded(false);
            setShowEntryOverlay(false);
        });
        const offError = ad.addAdEventListener(AdEventType.ERROR, () => {
            setAdLoaded(false);
            setShowEntryOverlay(false);
        });

        ad.load();
        return () => {
            offLoaded();
            offClosed();
            offError();
            interstitialRef.current = null;
        };
    }, [interstitialUnitId]);

    useFocusEffect(
        React.useCallback(() => {
            // allow one show each time the screen is focused
            showOncePerFocusRef.current = false;
            setShowEntryOverlay(true);

            // trigger load; LOADED handler will show it once
            interstitialRef.current?.load();

            // Fallback: don't block UI indefinitely if ad callbacks delay/fail.
            const timeout = setTimeout(() => {
                setShowEntryOverlay(false);
            }, 5000);

            return () => clearTimeout(timeout);
        }, []),
    );

    //
    const [phase, setPhase] = useState<'checking' | 'ready'>('checking');

    const load = async () => {
        const data = await getMatches();
        if (!data.success) throw new Error(data.message || 'Failed');
        setMatches(data.matches);
        setHiddenCount(data.hiddenCount);
        setUnlocked(data.unlocked);
        setUnlockOptions(data.unlockOptions);
    };

    const loadWithRetry = async () => {
        const waits = [300, 800, 1500];
        for (let i = 0; i < waits.length; i++) {
            try {
                await load();
                return;
            } catch {
                if (i < waits.length - 1) await new Promise(r => setTimeout(r, waits[i]));
            }
        }
        await load(); // last attempt throws to error boundary if you have one
    };

    useFocusEffect(
        React.useCallback(() => {
            let alive = true;
            setPhase('checking');
            (async () => {
                try {
                    await loadWithRetry();
                } finally {
                    if (alive) setPhase('ready');
                    hydrateUser();
                }
            })();
            return () => {
                alive = false;
            };
        }, [hydrateUser]),
    );

    /*fetch matches*/
    const fetchMatches = async () => {
        try {
            setLoading(true);
            const data = await getMatches();
            if (!data.success) {
                Alert.alert('Error', data.message || 'Could not load matches.');
                return;
            }
            setMatches(data.matches);
            setHiddenCount(data.hiddenCount);
            setUnlocked(data.unlocked);
            setUnlockOptions(data.unlockOptions);
        } catch (e) {
            Alert.alert('Error', 'Network error fetching matches.');
        } finally {
            setLoading(false);
        }
    };

    // Load on focus
    useFocusEffect(
        React.useCallback(() => {
            fetchMatches();
            hydrateUser();
        }, [hydrateUser]),
    );

    const openModal = () => {
        if (unlockOptions.length === 0) {
            Alert.alert('Error', 'No unlock options available.');
            return;
        }
        setSelectedOpt(unlockOptions[0]);
        setModalVisible(true);
    };

    const confirmUnlock = async () => {
        if (!selectedOpt) return;
        setModalVisible(false);
        try {
            const data = await unlockMatches(selectedOpt.durationDays);
            if (!data.success) {
                Alert.alert('Unable to Unlock', data.message);
                return;
            }
            // merge new matches
            setMatches(prev => {
                const seen = new Set(prev.map(m => m.id));
                return [...prev, ...data.matches.filter(m => !seen.has(m.id))];
            });
            setHiddenCount(0);
            setUnlocked(true);
            hydrateUser();
        } catch (e) {
            Alert.alert('Error', 'Network error during unlock.');
        }
    };

    const visibleMatches = matches.slice(0, 2);
    /** Locked = matches beyond the 2 shown + server-reported hidden (same idea as FlickFlirtMatches). */
    const lockedCardsCount = Math.max(0, matches.length - 2) + hiddenCount;

    const handleSeeMoreMatches = () => {
              navigation.reset({
                   index: 1,
                   routes: [
                       {
                           name: 'ClientTabNavigator' as never,
                           params: {screen: 'ClientStack', params: {screen: 'HomeScreen'}} as never,
                       },
                       {name: 'FlickFlirtMatches' as never},
                   ],
               });
    };

    const matchHandlers = useMemo(() => {
        const start = async (match: IUserProfile) => {
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
        const sendMit = (match: IUserProfile) => {
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
                    {!loading && matches.length > 0 ? (
                        <View style={localStyles.resultsIntro}>
                            <View style={localStyles.resultsIntroTitleRow}>
                                <Text style={localStyles.resultsIntroTitle}>Your matches are ready</Text>
                                <Icon
                                    name="sparkles"
                                    type="ionicon"
                                    color={COLORS.PURPLE}
                                    size={isTablet() ? 22 : 18}
                                    containerStyle={localStyles.resultsIntroSparkle}
                                />
                            </View>
                            <Text style={localStyles.resultsIntroSub}>These are just the beginning...</Text>
                        </View>
                    ) : null}

                    <View style={{flex: 1, marginLeft: '3%', marginRight: '3%', paddingBottom: 150}}>
                        {loading ? (
                            <Text
                                style={[
                                    FONTS.Title3,
                                    {color: COLORS.LIGHTGREY, textAlign: 'center', marginTop: '20%'},
                                ]}>
                                Finding Your Movie Matches...
                            </Text>
                        ) : matches.length > 0  ? (
                            <FlatList
                                data={visibleMatches}
                                numColumns={2}
                                keyExtractor={item => item.id}
                                contentContainerStyle={localStyles.resultsListContent}
                                renderItem={({item: match}) => {
                                    return (
                                        <View style={localStyles.matchCardWrap}>
                                            <FlickFlirtMatchCard
                                                pressable={false}
                                                userPicture={match.profilePicture}
                                                userName={match.username}
                                                influencer={false}
                                                archetype={match.archetype}
                                                akcruBadge={match.badge}
                                                userDesc={match.description}
                                                matchLabel={match.matchLabel}
                                                onStartMidChat={() => matchHandlers.start(match)}
                                                onSendMit={() => matchHandlers.sendMit(match)}
                                                midChatLoading={midChatLoadingId === match.id}
                                            />
                                        </View>
                                    );
                                }}
                            />
                        ) : !showEntryOverlay ? (
                            <View style={{alignItems: 'center', marginTop: '34%'}}>
                                <Text
                                    style={[
                                        FONTS.Title3,
                                        {color: COLORS.LIGHTGREY, textAlign: 'center', marginBottom: 20},
                                    ]}>
                                    You have no matches.
                                </Text>
                                <AkcruButtons.XlLrgButton
                                    btnname="Go To Start"
                                    onPress={() => navigation.navigate('FlickFlirtScreen')}
                                    color={COLORS.PURPLE}
                                />
                            </View>
                        ) : null}
                    </View>

                    {/* Bottom actions */}
                    <View style={{position: 'absolute', bottom: '10%', alignSelf: 'center'}}>
                        {!unlocked && lockedCardsCount > 0 && (
                            <View style={styles.unlockWrapper}>
                                <Text style={localStyles.seeMoreLockedTagline}>
                                    ✨ These matches are just your starting point ✨
                                </Text>
                                <LinearGradient
                                    colors={[...SEE_MORE_GRADIENT.colors]}
                                    start={SEE_MORE_GRADIENT.start}
                                    end={SEE_MORE_GRADIENT.end}
                                    style={localStyles.seeMoreLockedGradientOuter}>
                                    <View style={localStyles.seeMoreLockedGradientInner}>
                                        <View style={localStyles.seeMoreLockedBlock}>
                                            <View style={localStyles.seeMoreLockedTitleRow}>
                                                <Text style={localStyles.seeMoreLockedTitle}>
                                                    Your best matches are still locked
                                                </Text>
                                                <Icon
                                                    name="lock-closed"
                                                    type="ionicon"
                                                    color={COLORS.PURPLE}
                                                    size={isTablet() ? 20 : 17}
                                                    containerStyle={localStyles.seeMoreLockedIcon}
                                                />
                                            </View>
                                            <Text style={localStyles.seeMoreLockedSub}>
                                                Unlock to see who they are
                                            </Text>
                                        </View>
                                        <View style={localStyles.locksRowOuter}>
                                            <View style={localStyles.locksRow}>
                                                {[0, 1, 2, 3].map(i => (
                                                    <FlickFlirtLockedPlaceholderCard
                                                        key={i}
                                                        size="compact"
                                                        hideText
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                        <View style={localStyles.seeMoreLockedButtonWrap}>
                                            <TouchableOpacity
                                                activeOpacity={0.88}
                                                onPress={handleSeeMoreMatches}
                                                style={[
                                                    localStyles.seeMoreLockedCta,
                                                    {height: AUTH_BUTTON_THEME.getHeight()},
                                                ]}>
                                                <LinearGradient
                                                    colors={AUTH_BUTTON_THEME.colors}
                                                    start={AUTH_BUTTON_THEME.start}
                                                    end={AUTH_BUTTON_THEME.end}
                                                    style={localStyles.seeMoreLockedCtaGradient}>
                                                    <Text style={AUTH_TEXT_THEME.buttonLabel}>
                                                        See More Matches
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </View>
                        )}
                        <View style={styles.gotToStartWrapper}>

                        </View>
                    </View>

                    {showEntryOverlay && (
                        <View style={StyleSheet.absoluteFillObject}>
                            <FlickFlirtBlurredBackground
                                archetypeStyleGradients
                                source={imageindex.BgImageSM}
                                wrapWithSafeArea={false}
                                imageStyle={StyleSheet.absoluteFill}>
                                <View
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingBottom: 60,
                                    }}>
                                    <Text style={[FONTS.Title3, {color: COLORS.LIGHTGREY, marginBottom: 12}]}>
                                        Finding Your Movie Matches...
                                    </Text>
                                </View>
                            </FlickFlirtBlurredBackground>
                        </View>
                    )}
            </FlickFlirtBlurredBackground>

            {/* Unlock modal */}
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
        </View>
    );
};

const localStyles = StyleSheet.create({
    /** Fixed below BackButton — not scrolled with FlatList */
    resultsIntro: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 10,
        alignSelf: 'stretch',
    },
    resultsIntroTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    resultsIntroSparkle: {
        marginLeft: 6,
    },
    resultsIntroTitle: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
        fontWeight: '700',
    },
    resultsIntroSub: {
        ...FONTS.paragraph2,
        color: COLORS.LIGHTGREY,
        marginTop: 6,
    },
    resultsListContent: {
        paddingTop: 4,
        paddingBottom: 24,
    },
    seeMoreLockedTagline: {
        ...FONTS.chart,
        color: COLORS.WHITE,
        textAlign: 'center',
        width: SIZES.ScreenWidth * 0.92,
        alignSelf: 'center',
        marginBottom: 12,
        paddingHorizontal: 8,
        opacity: 0.95,
        fontSize: isTablet() ? 12 : 11,
    },
    /** Four `FlickFlirtLockedPlaceholderCard` compact cells (same UI as FlickFlirtMatches locked) */
    locksRowOuter: {
        width: '100%',
        marginTop: 12,
        alignSelf: 'stretch',
    },
    locksRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%',
    },
    /** Gradient stroke + dark inset — wraps copy + See More Matches */
    seeMoreLockedGradientOuter: {
        width: SIZES.ScreenWidth * 0.92,
        maxWidth: '100%',
        borderRadius: SEE_MORE_BORDER_RADIUS,
        padding: SEE_MORE_BORDER_PAD,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    seeMoreLockedGradientInner: {
        borderRadius: SEE_MORE_INNER_RADIUS,
        backgroundColor: 'rgba(0,0,0,0.82)',
        paddingVertical: 16,
        paddingHorizontal: 14,
        alignItems: 'center',
    },
    seeMoreLockedButtonWrap: {
        marginTop: 14,
        alignSelf: 'stretch',
        width: '100%',
        paddingHorizontal: 16,
    },
    seeMoreLockedCta: {
        width: '100%',
        borderRadius: AUTH_BUTTON_THEME.borderRadius,
        overflow: 'hidden',
    },
    seeMoreLockedCtaGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: AUTH_BUTTON_THEME.borderRadius,
    },
    /** Above “See More Matches” when additional matches are locked */
    seeMoreLockedBlock: {
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    seeMoreLockedTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    seeMoreLockedIcon: {
        marginLeft: 6,
    },
    seeMoreLockedTitle: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
        fontWeight: '700',
        textAlign: 'center',
    },
    seeMoreLockedSub: {
        ...FONTS.paragraph2,
        color: COLORS.LIGHTGREY,
        textAlign: 'center',
        marginTop: 8,
    },
    matchCardWrap: {
        marginVertical: 5,
        alignItems: 'center',
    },
});

export default FlickFlirtResults;
