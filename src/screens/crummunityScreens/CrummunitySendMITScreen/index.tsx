import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    Pressable,
    Image,
    ImageBackground,
    StyleSheet,
    Platform,
    Alert,
    StatusBar,
    Modal,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {AUTH_BUTTON_THEME, COLORS} from '../../../../assets/constants';
import useAuthStore from '../../../stores/auth.store';
import {findAUser} from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';
import imageindex from '../../../../assets/images/imageindex';
import AdCoinIcon from '../../../components/AdCoinIcon/AdCoinIcon';
import BackButton from '../../../components/General/backbutton';
import ConfirmationModal from '../../../components/ConfirmationModal';

/** Design ref: deep black-violet canvas */
const BG = '#0b090f';
const GRADIENT_A = '#4facfe';
const GRADIENT_B = '#f093fb';
const NEON_PURPLE = '#c084fc';
const MIT_COST = 1000;

const neonGlow = (color: string, r: number) =>
    Platform.select({
        ios: {
            shadowColor: color,
            shadowOffset: {width: 0, height: 0},
            shadowOpacity: 0.95,
            shadowRadius: r,
        },
        android: {elevation: 6},
    });

export type CrummunitySendMITParams = {
    recipientId: string;
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    dateOfBirth?: string;
    location?: string;
    badge?: IUserProfile['badge'];
    influencerStatus?: boolean;
    ownerStatus?: boolean;
    postPreview?: string;
    /** Shown in location pill; mock default "2 miles away" */
    distanceLabel?: string;
    /** Shown in match pill; mock default "72% Match" */
    matchLabel?: string;
};

type Nav = StackNavigationProp<NoBottomTabStackParams, 'CrummunitySendMITScreen'>;
type RProp = RouteProp<NoBottomTabStackParams, 'CrummunitySendMITScreen'>;

function formatNumber(n: number): string {
    return n.toLocaleString('en-US');
}

function ageFromDob(dob?: string): number | undefined {
    if (!dob) {
        return undefined;
    }
    const born = new Date(dob);
    if (Number.isNaN(born.getTime())) {
        return undefined;
    }
    const today = new Date();
    let age = today.getFullYear() - born.getFullYear();
    const m = today.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < born.getDate())) {
        age -= 1;
    }
    return age >= 0 && age < 120 ? age : undefined;
}

function BubbleHeartIcon() {
    return (
        <View style={styles.bubbleHeartWrap}>
            <Icon name="chatbubble-ellipses" type="ionicon" color="#e9d5ff" size={26} />
            <View style={styles.bubbleHeartBadge}>
                <Icon name="heart" type="ionicon" color="#f9a8d4" size={11} />
            </View>
        </View>
    );
}

function FeatureCol({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <View style={styles.featureCol}>
            <LinearGradient
                colors={['rgba(79,172,254,0.45)', 'rgba(192,132,252,0.5)']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.featureIconBg}>
                {icon}
            </LinearGradient>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureSub}>{subtitle}</Text>
        </View>
    );
}

function normalizeProfileImageUri(raw?: string | null): string | undefined {
    if (raw === undefined || raw === null) {
        return undefined;
    }
    let u = String(raw).trim();
    if (u === '' || u === 'null' || u === 'undefined') {
        return undefined;
    }
    if (u.startsWith('//')) {
        u = `https:${u}`;
    }
    if (!/^https?:\/\//i.test(u)) {
        return undefined;
    }
    return u;
}

function CircularProfile({uri}: {uri?: string}) {
    const remote = useMemo(() => normalizeProfileImageUri(uri), [uri]);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        setLoadFailed(false);
    }, [remote]);

    const source = remote && !loadFailed ? {uri: remote} : imageindex.Akcruplaceholder;

    return (
        <LinearGradient
            colors={[NEON_PURPLE, GRADIENT_B, GRADIENT_A]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.avatarRing}>
            <View style={styles.avatarInner}>
                <Image
                    source={source}
                    defaultSource={imageindex.Akcruplaceholder}
                    style={styles.avatarImage}
                    resizeMode="cover"
                    onError={() => setLoadFailed(true)}
                />
            </View>
        </LinearGradient>
    );
}

/** Feed params (MIT tap) win over API so the screen matches the author shown on the Skinny post. */
function mergeRecipientDisplay(
    feed: CrummunitySendMITParams | undefined,
    api: IUserProfile | null,
): {
    pic?: string;
    name: string;
    age?: number;
    verified: boolean;
} {
    const f = feed;
    const a = api;

    const picRaw = f?.profilePicture?.trim() || a?.profilePicture?.trim();
    const pic = picRaw || undefined;

    const first = f?.firstName ?? a?.firstName;
    const last = f?.lastName ?? a?.lastName;
    const un = f?.username ?? a?.username ?? '';
    const name =
        [first, last].filter(Boolean).join(' ').trim() || un || 'Member';

    const dob = f?.dateOfBirth ?? a?.dateOfBirth;
    const age = ageFromDob(dob);

    const inf = f?.influencerStatus ?? a?.influencerStatus ?? false;
    const own = f?.ownerStatus ?? a?.ownerStatus ?? false;

    return {
        pic,
        name,
        age,
        verified: Boolean(inf || own),
    };
}

export default function CrummunitySendMITScreen() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RProp>();
    const insets = useSafeAreaInsets();
    const p = route.params as CrummunitySendMITParams | undefined;

    const {user, hydrateUser, walletBalance} = useAuthStore();
    const [recipient, setRecipient] = useState<IUserProfile | null>(null);
    const [showInsufficientAdModal, setShowInsufficientAdModal] = useState(false);

    const recipientId = p?.recipientId ?? '';

    const loadRecipient = useCallback(async () => {
        if (!recipientId) {
            return;
        }
        const u = await findAUser({id: recipientId});
        setRecipient(u ?? null);
    }, [recipientId]);

    useEffect(() => {
        loadRecipient();
    }, [loadRecipient]);

    useEffect(() => {
        hydrateUser();
    }, [hydrateUser]);

    const display = useMemo(() => mergeRecipientDisplay(p, recipient), [p, recipient]);

    const balanceDisplay = useMemo(() => {
        const w = walletBalance?.replace(/,/g, '');
        const n = w !== undefined && w !== null && w !== '' ? Number(w) : NaN;
        if (!Number.isNaN(n)) {
            return formatNumber(n);
        }
        const ad = user?.adAmount;
        if (ad !== undefined && ad !== null) {
            return formatNumber(Math.floor(ad));
        }
        return '1,250';
    }, [walletBalance, user?.adAmount]);
    const adBalance = useMemo(() => {
        const walletNum = Number(walletBalance?.replace(/,/g, ''));
        if (Number.isFinite(walletNum)) {
            return walletNum;
        }
        const fallback = Number(user?.adAmount);
        return Number.isFinite(fallback) ? fallback : 0;
    }, [walletBalance, user?.adAmount]);

    const mitTickets = user?.MITCount ?? 0;

    const onSend = () => {
        if (!recipientId) {
            return;
        }
        if (user?.id && recipientId === user.id) {
            Alert.alert('MIT', 'You cannot send a MIT to yourself.');
            return;
        }
        if (mitTickets < 1 && adBalance < MIT_COST) {
            setShowInsufficientAdModal(true);
            return;
        }
        navigation.navigate('SendMITViewUser', {userID: recipientId});
    };

    if (!recipientId) {
        return (
            <View style={styles.root}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="transparent"
                    translucent={Platform.OS === 'android'}
                />
                <ImageBackground
                    source={imageindex.FLickFlirtBG}
                    style={styles.bgFill}
                    resizeMode="cover">
                    <LinearGradient
                        pointerEvents="none"
                        colors={['rgba(5,3,12,0.5)', 'rgba(11,9,15,0.82)', 'rgba(11,9,15,0.94)']}
                        locations={[0, 0.5, 1]}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <BackButton
                        navigation={navigation}
                        containerStyle={[
                            styles.backButtonOverlay,
                            {top: 0},
                        ]}
                    />
                    <View style={[styles.flex, {paddingTop: 28}]}>
                        <Text style={styles.errorText}>Missing recipient.</Text>
                    </View>
                </ImageBackground>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent={Platform.OS === 'android'}
            />
            <ImageBackground
                source={imageindex.FLickFlirtBG}
                style={styles.bgFill}
                resizeMode="cover">
                {/** Full-bleed night-city bg + washes (status bar sits over this, like the reference). */}
                <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(6,4,14,0.35)', 'rgba(11,9,15,0.65)', 'rgba(11,9,15,0.92)']}
                    locations={[0, 0.42, 1]}
                    style={StyleSheet.absoluteFillObject}
                />
                <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(168,85,247,0.2)', 'rgba(236,72,153,0.08)', 'transparent']}
                    locations={[0, 0.45, 1]}
                    style={styles.topAtmosphereGlow}
                />
                <BackButton
                    navigation={navigation}
                    containerStyle={[
                        styles.backButtonOverlay,
                        {top: 0},
                    ]}
                />

                {/**
                 * Avoid KeyboardAvoidingView + ScrollView (common cause of rubber-band / bounce).
                 * iOS: automaticallyAdjustKeyboardInsets lets ScrollView move with the keyboard.
                 */}
                <View style={styles.flex}>
                    <ScrollView
                        style={styles.flex}
                        contentContainerStyle={[
                            styles.scrollContent,
                            {
                                paddingTop: 28,
                                paddingBottom: insets.bottom + 28,
                                flexGrow: 1,
                            },
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        bounces={false}
                        alwaysBounceVertical={false}
                        overScrollMode="never"
                        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                        contentInsetAdjustmentBehavior="never"
                        decelerationRate={Platform.OS === 'ios' ? 'fast' : ('normal' as const)}
                        scrollEventThrottle={16}
                        {...(Platform.OS === 'ios' ? {directionalLockEnabled: true} : {})}>
                        <View style={styles.heroSection}>
                            <Image
                                source={imageindex.CrummunitySendMITHero}
                                style={styles.heroImage}
                                resizeMode="contain"
                                accessibilityRole="image"
                                accessibilityLabel="Send a MIT. Make it count."
                            />
                        </View>

                        <View style={styles.mainCardInner}>
                                <LinearGradient
                                    colors={['rgba(192,132,252,0.85)', 'rgba(244,114,182,0.72)']}
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 1}}
                                    style={styles.lowerSectionBorder}>
                                    <View style={styles.lowerSectionInner}>
                                    <Text style={styles.cardCaption}>Your MIT will be delivered to</Text>

                                    <View style={styles.profileRow}>
                                        <View style={styles.avatarColumn}>
                                            <CircularProfile uri={display.pic} />
                                        </View>
                                        <View style={styles.profileMeta}>
                                            <View style={styles.nameLine}>
                                                <Text style={styles.profileName} numberOfLines={2}>
                                                    {display.name}
                                                    {display.age !== undefined ? `, ${display.age}` : ''}
                                                </Text>
                                                {display.verified ? (
                                                    <Icon
                                                        name="checkmark-circle"
                                                        type="ionicon"
                                                        color={NEON_PURPLE}
                                                        size={20}
                                                        style={styles.verifiedIcon}
                                                    />
                                                ) : null}
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.profileSectionDivider} />

                                    <Text style={styles.sectionTitle}>Why MITs get more replies</Text>
                                    <View style={styles.featureRow}>
                                        <FeatureCol
                                            icon={<BubbleHeartIcon />}
                                            title="Stands Out"
                                            subtitle="Your message is highlighted in her inbox."
                                        />
                                        <View style={styles.featureDivider} />
                                        <FeatureCol
                                            icon={
                                                <Icon
                                                    name="trending-up"
                                                    type="ionicon"
                                                    color="#e9d5ff"
                                                    size={24}
                                                />
                                            }
                                            title="Better Responses"
                                            subtitle="MITs get up to 3x more replies."
                                        />
                                        <View style={styles.featureDivider} />
                                        <FeatureCol
                                            icon={
                                                <Icon name="heart" type="ionicon" color="#e9d5ff" size={24} />
                                            }
                                            title="Real Connections"
                                            subtitle="Start conversations that actually go somewhere."
                                        />
                                    </View>

                                    <Pressable onPress={onSend} style={styles.sendWrap}>
                                        <LinearGradient
                                            colors={AUTH_BUTTON_THEME.colors}
                                            start={AUTH_BUTTON_THEME.start}
                                            end={AUTH_BUTTON_THEME.end}
                                            style={[
                                                styles.sendBtn,
                                                mitTickets > 0 ? styles.sendBtnCentered : null,
                                            ]}>
                                            <View style={styles.sendLeft}>
                                                <Icon
                                                    name="paper-plane"
                                                    type="ionicon"
                                                    color="#fff"
                                                    size={22}
                                                />
                                                <Text style={styles.sendText}>Send MIT</Text>
                                            </View>
                                            <View style={styles.sendRight}>
                                                {mitTickets < 1 ? (
                                                    <>
                                                        <AdCoinIcon />
                                                        <Text style={styles.sendCost}>{formatNumber(MIT_COST)}</Text>
                                                    </>
                                                ) : null}
                                            </View>
                                        </LinearGradient>
                                    </Pressable>

                                    {mitTickets < 1 ? (
                                        <View style={styles.disclaimerRow}>
                                            <Icon
                                                name="lock-closed"
                                                type="ionicon"
                                                color="rgba(255,255,255,0.4)"
                                                size={13}
                                            />
                                            <Text style={styles.disclaimer}>
                                                MITs are a premium feature. Your balance will be used.
                                            </Text>
                                        </View>
                                    ) : null}

                                    {mitTickets < 1 ? (
                                        <View style={styles.balanceSection}>
                                            <Text style={styles.balanceLabelInline}>Your Balance</Text>
                                            <AdCoinIcon />
                                            <Text style={styles.balanceNum} numberOfLines={1}>
                                                {balanceDisplay}
                                            </Text>
                                        </View>
                                    ) : null}
                                    {mitTickets > 0 ? (
                                        <Text style={styles.mitTicketNotice}>
                                            You have {mitTickets} MIT {mitTickets === 1 ? 'ticket' : 'tickets'}.
                                        </Text>
                                    ) : null}
                                </View>
                                </LinearGradient>
                        </View>
                </ScrollView>
            </View>
            <Modal
                visible={showInsufficientAdModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowInsufficientAdModal(false)}>
                <ConfirmationModal
                    onPressYes={() => {
                        setShowInsufficientAdModal(false);
                        navigation.navigate('PurchaseAdScreen', {
                            passCostAd: MIT_COST,
                        });
                    }}
                    onPressNo={() => setShowInsufficientAdModal(false)}
                    variant="continueWatching"
                    yesLabel="Buy AD"
                    noLabel="Cancel"
                    confirmationText={`You need ${formatNumber(
                        MIT_COST,
                    )} AD to send a MIT when no ticket is available.`}
                />
            </Modal>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        width: '100%',
        backgroundColor: BG,
    },
    /** Edge-to-edge under status bar (image + overlays). */
    bgFill: {
        flex: 1,
        width: '100%',
    },
    topAtmosphereGlow: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 280,
    },
    heroSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 6,
    },
    heroImage: {
        width: '100%',
        maxWidth: 340,
        height: 220,
        alignSelf: 'center',
    },
    flex: {flex: 1, width: '100%', alignSelf: 'stretch'},
    scrollContent: {
        width: '100%',
        paddingHorizontal: 14,
    },
    backButtonOverlay: {
        position: 'absolute',
        left: 4,
        zIndex: 30,
        marginTop: 0,
    },
    mainCardInner: {
        borderRadius: 25,
        backgroundColor: 'transparent',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#c084fc',
                shadowOffset: {width: 0, height: 0},
                shadowOpacity: 0.45,
                shadowRadius: 18,
            },
            android: {elevation: 12},
        }),
    },
    lowerSectionBorder: {
        borderRadius: 20,
        padding: 1.5,
        marginTop: 4,
        marginBottom: 4,
    },
    lowerSectionInner: {
        borderRadius: 17,
        padding: 16,
        paddingBottom: 18,
        backgroundColor: 'rgba(18,16,28,0.94)',
        overflow: 'hidden',
        width: '100%',
    },
    cardCaption: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.88)',
        fontSize: 12,
        marginBottom: 12,
        fontFamily: 'Montserrat-Regular',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 0,
    },
    avatarColumn: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarRing: {
        width: 74,
        height: 74,
        borderRadius: 37,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInner: {
        width: 68,
        height: 68,
        borderRadius: 34,
        overflow: 'hidden',
        backgroundColor: '#1a1530',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1530',
    },
    profileMeta: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
        alignSelf: 'stretch',
    },
    nameLine: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    profileName: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Montserrat-Bold',
        flexShrink: 1,
    },
    verifiedIcon: {
        marginLeft: 6,
    },
    profileSectionDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.12)',
        width: '100%',
        marginTop: 18,
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Montserrat-Bold',
        marginBottom: 14,
        marginTop: 0,
        textAlign: 'center',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: 4,
    },
    featureCol: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    featureDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.14)',
        alignSelf: 'stretch',
        marginVertical: 12,
    },
    featureIconBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        ...neonGlow('#a855f7', 10),
    },
    featureTitle: {
        color: '#e9d5ff',
        fontSize: 11,
        fontFamily: 'Montserrat-Bold',
        textAlign: 'center',
        marginBottom: 6,
    },
    featureSub: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: 10,
        fontFamily: 'Montserrat-Regular',
        textAlign: 'center',
        lineHeight: 13,
    },
    bubbleHeartWrap: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubbleHeartBadge: {
        position: 'absolute',
        bottom: 10,
        right: 8,
    },
    sendWrap: {
        marginTop: 20,
        borderRadius: 18,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: COLORS.PINK,
                shadowOffset: {width: 0, height: 6},
                shadowOpacity: 0.45,
                shadowRadius: 14,
            },
            android: {elevation: 10},
        }),
    },
    sendBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 17,
        paddingHorizontal: 18,
        borderRadius: 18,
    },
    sendBtnCentered: {
        justifyContent: 'center',
    },
    sendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    sendText: {
        color: '#fff',
        marginLeft: 12,
        fontSize: 17,
        fontFamily: 'Montserrat-Bold',
    },
    sendRight: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: 6,
        marginLeft: 8,
    },
    sendCost: {
        color: '#fff',
        fontSize: 17,
        fontFamily: 'Montserrat-Bold',
        ...Platform.select({
            android: {includeFontPadding: false, textAlignVertical: 'center' as const},
        }),
    },
    disclaimerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
        paddingHorizontal: 8,
        gap: 8,
    },
    disclaimer: {
        color: 'rgba(255,255,255,0.48)',
        fontSize: 11,
        fontFamily: 'Montserrat-Regular',
        flex: 1,
        textAlign: 'center',
    },
    balanceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        marginTop: 18,
        paddingTop: 4,
        paddingHorizontal: 4,
        gap: 8,
    },
    balanceLabelInline: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 15,
        fontFamily: 'Montserrat-SemiBold',
        flexShrink: 0,
        ...Platform.select({
            android: {includeFontPadding: false},
        }),
    },
    balanceNum: {
        color: COLORS.WHITE,
        fontSize: 17,
        fontFamily: 'Montserrat-Bold',
        flexShrink: 1,
        minWidth: 0,
        ...Platform.select({
            android: {includeFontPadding: false, textAlignVertical: 'center' as const},
        }),
    },
    mitTicketNotice: {
        marginTop: 10,
        textAlign: 'center',
        color: 'rgba(192,132,252,0.95)',
        fontSize: 12,
        fontFamily: 'Montserrat-SemiBold',
    },
    errorText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 40,
    },
});
