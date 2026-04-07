import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    Image,
    StyleSheet,
    Platform,
    Alert,
    ScrollView as RNScrollView,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {Icon} from '@rneui/base';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {COLORS} from '../../../../assets/constants';
import useAuthStore from '../../../stores/auth.store';
import {findAUser} from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';
import imageindex from '../../../../assets/images/imageindex';
import {navigateToUserMITHub} from '../../../util/RootNavigation';

/** Design ref: deep black-violet canvas */
const BG = '#0b090f';
/** MIT wordmark: cyan → deep purple → hot magenta (match reference art) */
const MIT_GRAD_LEFT = '#22d3ee';
const MIT_GRAD_MID = '#7c3aed';
const MIT_GRAD_RIGHT = '#ec4899';
const GRADIENT_A = '#4facfe';
const GRADIENT_MID = '#a855f7';
const GRADIENT_B = '#f093fb';
const NEON_PURPLE = '#c084fc';
const MIT_COST = 125;
const MAX_CHARS = 250;

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

type Nav = NativeStackNavigationProp<NoBottomTabStackParams, 'CrummunitySendMITScreen'>;
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

type ChipDef = {emoji: string; label: string};

const CHIP_SETS: ChipDef[][] = [
    [
        {emoji: '✨', label: 'Compliment her vibe'},
        {emoji: '❓', label: 'Ask a fun question'},
        {emoji: '💜', label: 'Share a shared interest'},
    ],
    [
        {emoji: '✨', label: 'Compliment their vibe'},
        {emoji: '❓', label: 'Ask what they are watching'},
        {emoji: '💜', label: 'Suggest a movie night'},
    ],
];

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
    preview: string;
    distanceLabel: string;
    matchLabel: string;
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

    const loc = f?.location ?? a?.location;
    const inf = f?.influencerStatus ?? a?.influencerStatus ?? false;
    const own = f?.ownerStatus ?? a?.ownerStatus ?? false;

    const preview = (f?.postPreview ?? '').trim();
    const distanceLabel =
        f?.distanceLabel ?? (loc && loc.trim().length > 0 ? loc : '2 miles away');
    const matchLabel = f?.matchLabel ?? '72% Match';

    return {
        pic,
        name,
        age,
        preview,
        distanceLabel,
        matchLabel,
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
    const [message, setMessage] = useState('');
    const [chipSetIdx, setChipSetIdx] = useState(0);

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

    const mitTickets = user?.MITCount ?? 0;

    const onSend = () => {
        const trimmed = message.trim();
        if (!recipientId) {
            return;
        }
        if (user?.id && recipientId === user.id) {
            Alert.alert('MIT', 'You cannot send a MIT to yourself.');
            return;
        }
        if (!trimmed.length) {
            Alert.alert('Write your MIT', 'Add a message before sending.');
            return;
        }
        if (mitTickets < 1) {
            Alert.alert('No MIT tickets', 'You need at least one Movie Invite Ticket to continue.', [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Get MITs',
                    onPress: () => navigateToUserMITHub(0),
                },
            ]);
            return;
        }
        navigation.navigate('SendMITViewUser', {userID: recipientId});
    };

    const cycleChips = () => {
        setChipSetIdx(i => (i + 1) % CHIP_SETS.length);
    };

    const chips = CHIP_SETS[chipSetIdx] ?? CHIP_SETS[0];

    if (!recipientId) {
        return (
            <View style={[styles.root, {paddingTop: insets.top}]}>
                <Text style={styles.errorText}>Missing recipient.</Text>
                <Pressable onPress={() => navigation.goBack()} style={styles.backHit}>
                    <Text style={styles.backText}>Go back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={14}
                style={[styles.backBtn, {top: insets.top + 6}]}>
                <Icon name="chevron-back" type="ionicon" color="#fff" size={30} />
            </Pressable>

            {/**
             * Avoid KeyboardAvoidingView + ScrollView (common cause of rubber-band / bounce).
             * iOS: automaticallyAdjustKeyboardInsets lets ScrollView move with the keyboard.
             */}
            <View style={styles.flex}>
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={[
                        styles.scrollContent,
                        {paddingTop: insets.top + 44, paddingBottom: insets.bottom + 28},
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
                    <LinearGradient
                        colors={['rgba(168,85,247,0.35)', 'rgba(236,72,153,0.28)', 'rgba(56,189,248,0.2)']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.mainCardGlow}>
                        <View style={styles.mainCardInner}>
                            <View style={styles.topDecor}>
                                <Icon
                                    name="sparkles"
                                    type="ionicon"
                                    color="#e879f9"
                                    size={16}
                                    style={neonGlow('#f0abfc', 12)}
                                />
                                <Icon
                                    name="heart"
                                    type="ionicon"
                                    color="#fb7185"
                                    size={16}
                                    style={neonGlow('#fb7185', 12)}
                                />
                                <Icon
                                    name="paper-plane"
                                    type="ionicon"
                                    color="#7dd3fc"
                                    size={17}
                                    style={neonGlow('#38bdf8', 12)}
                                />
                            </View>

                            <View style={styles.headerBlock}>
                                <Text style={styles.sendA}>Send a</Text>
                                <MaskedView
                                    style={styles.mitMask}
                                    maskElement={<Text style={styles.mitOutline}>MIT</Text>}>
                                    <LinearGradient
                                        colors={[MIT_GRAD_LEFT, MIT_GRAD_MID, MIT_GRAD_RIGHT]}
                                        locations={[0, 0.48, 1]}
                                        start={{x: 0, y: 0.5}}
                                        end={{x: 1, y: 0.5}}
                                        style={StyleSheet.absoluteFill}
                                    />
                                </MaskedView>
                                <View style={styles.taglineBlock}>
                                    <View style={styles.taglineGlowWrap}>
                                        <MaskedView
                                            style={styles.taglineMask}
                                            maskElement={
                                                <Text style={styles.taglineMaskText}>Make it count</Text>
                                            }>
                                            <LinearGradient
                                                colors={[
                                                    '#fb7185',
                                                    '#f472b6',
                                                    '#e879f9',
                                                    '#c084fc',
                                                ]}
                                                locations={[0, 0.32, 0.62, 1]}
                                                start={{x: 0, y: 0.5}}
                                                end={{x: 1, y: 0.5}}
                                                style={StyleSheet.absoluteFill}
                                            />
                                        </MaskedView>
                                    </View>
                                    <LinearGradient
                                        colors={[
                                            'rgba(251,113,133,0.45)',
                                            '#f472b6',
                                            '#e879f9',
                                            'rgba(192,132,252,0.5)',
                                        ]}
                                        locations={[0, 0.35, 0.7, 1]}
                                        start={{x: 0, y: 0.5}}
                                        end={{x: 1, y: 0.5}}
                                        style={styles.taglineBrush}
                                    />
                                </View>
                                <Text style={styles.desc}>
                                    A Message Intent that stands out. Better responses. Real connections.
                                </Text>
                            </View>

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
                                                        color="#c084fc"
                                                        size={20}
                                                        style={styles.verifiedIcon}
                                                    />
                                                ) : null}
                                            </View>

                                            <View style={styles.pillBlock}>
                                                <RNScrollView
                                                    horizontal
                                                    showsHorizontalScrollIndicator={false}
                                                    nestedScrollEnabled
                                                    keyboardShouldPersistTaps="handled"
                                                    bounces={false}
                                                    style={styles.pillScroll}
                                                    contentContainerStyle={styles.pillScrollContent}>
                                                    <View style={[styles.pill, styles.pillNoShrink]}>
                                                        <Icon
                                                            name="location"
                                                            type="ionicon"
                                                            color="#a855f7"
                                                            size={14}
                                                        />
                                                        <Text style={styles.pillText}>
                                                            {display.distanceLabel}
                                                        </Text>
                                                    </View>
                                                    <View style={[styles.pill, styles.pillNoShrink]}>
                                                        <Icon
                                                            name="flame"
                                                            type="ionicon"
                                                            color="#f472b6"
                                                            size={14}
                                                        />
                                                        <Text style={styles.pillText}>
                                                            {display.matchLabel}
                                                        </Text>
                                                    </View>
                                                </RNScrollView>
                                                <View style={styles.pillRowSecond}>
                                                    <View style={[styles.pill, styles.pillNoShrink]}>
                                                        <View style={styles.activeDot} />
                                                        <Text style={styles.pillText}>Active now</Text>
                                                    </View>
                                                </View>
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

                                    <View style={styles.writeRow}>
                                        <Text style={styles.writeLabel}>Write your MIT</Text>
                                        <Text style={styles.counter}>
                                            {message.length} / {MAX_CHARS}
                                        </Text>
                                    </View>

                                    <LinearGradient
                                        colors={[GRADIENT_B, GRADIENT_A]}
                                        start={{x: 0, y: 0.5}}
                                        end={{x: 1, y: 0.5}}
                                        style={styles.inputBorder}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Be creative, thoughtful, and genuine..."
                                            placeholderTextColor="rgba(255,255,255,0.38)"
                                            multiline
                                            maxLength={MAX_CHARS}
                                            value={message}
                                            onChangeText={setMessage}
                                            textAlignVertical="top"
                                        />
                                    </LinearGradient>

                                    <View style={styles.chipScroller}>
                                        {chips.map(({emoji, label}) => (
                                            <Pressable
                                                key={`${emoji}-${label}`}
                                                onPress={() =>
                                                    setMessage(prev =>
                                                        prev.trim() ? `${prev} ${label}` : label,
                                                    )
                                                }
                                                style={styles.chip}>
                                                <Text style={styles.chipText} numberOfLines={1}>
                                                    {emoji} {label}
                                                </Text>
                                            </Pressable>
                                        ))}
                                        <Pressable onPress={cycleChips} style={styles.refreshChip}>
                                            <Icon name="refresh" type="ionicon" color="#94a3b8" size={20} />
                                        </Pressable>
                                    </View>

                                    <Pressable onPress={onSend} style={styles.sendWrap}>
                                        <LinearGradient
                                            colors={[GRADIENT_A, GRADIENT_MID, GRADIENT_B]}
                                            locations={[0, 0.5, 1]}
                                            start={{x: 0, y: 0.5}}
                                            end={{x: 1, y: 0.5}}
                                            style={styles.sendBtn}>
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
                                                <Image
                                                    source={imageindex.GRAPHwallet1}
                                                    style={styles.coinSm}
                                                    resizeMode="contain"
                                                />
                                                <Text style={styles.sendCost}>{formatNumber(MIT_COST)}</Text>
                                            </View>
                                        </LinearGradient>
                                    </Pressable>

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

                                    <View style={styles.balanceRow}>
                                        <Text style={styles.balanceLabel}>Your Balance:</Text>
                                        <Image
                                            source={imageindex.GRAPHwallet1}
                                            style={styles.coinMd}
                                            resizeMode="contain"
                                        />
                                        <Text style={styles.balanceNum}>{balanceDisplay}</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>
                    </LinearGradient>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
    },
    flex: {flex: 1},
    scrollContent: {
        paddingHorizontal: 14,
    },
    backBtn: {
        position: 'absolute',
        left: 10,
        zIndex: 30,
        padding: 6,
    },
    mainCardGlow: {
        borderRadius: 26,
        padding: 1.5,
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
    mainCardInner: {
        borderRadius: 25,
        backgroundColor: 'rgba(11,9,15,0.88)',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 20,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    topDecor: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 22,
        marginBottom: 4,
        paddingVertical: 4,
    },
    headerBlock: {
        alignItems: 'center',
        marginBottom: 20,
    },
    sendA: {
        fontFamily: 'Montserrat-Bold',
        color: '#ffffff',
        fontSize: 26,
        letterSpacing: 1.1,
    },
    mitMask: {
        height: 72,
        width: 220,
        marginTop: 2,
        marginBottom: 0,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    mitOutline: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 62,
        fontWeight: '900',
        letterSpacing: 2,
        textAlign: 'center',
        color: '#000',
    },
    taglineBlock: {
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: -8,
        marginBottom: 2,
        paddingVertical: 2,
        transform: [{rotate: '-3deg'}],
    },
    taglineGlowWrap: {
        ...Platform.select({
            ios: {
                shadowColor: '#f472b6',
                shadowOffset: {width: 0, height: 0},
                shadowOpacity: 0.85,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    taglineMask: {
        height: 52,
        width: 300,
        alignSelf: 'center',
        justifyContent: 'center',
    },
    taglineMaskText: {
        fontSize: 38,
        textAlign: 'center',
        color: '#000',
        letterSpacing: 0.5,
        lineHeight: 46,
        includeFontPadding: false,
        textAlignVertical: 'center' as const,
        ...Platform.select({
            ios: {
                fontFamily: 'Snell Roundhand',
                fontWeight: '700',
            },
            default: {
                fontFamily: 'serif',
                fontStyle: 'italic',
                fontWeight: '700',
            },
        }),
    },
    taglineBrush: {
        width: 210,
        height: 5,
        marginTop: 10,
        borderRadius: 3,
        opacity: 1,
        transform: [{skewX: '-10deg'}, {rotate: '-1deg'}],
    },
    desc: {
        marginTop: 12,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.72)',
        fontSize: 12,
        lineHeight: 18,
        paddingHorizontal: 8,
        fontFamily: 'Montserrat-Regular',
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
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 0,
    },
    avatarColumn: {
        width: 92,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 2,
    },
    avatarRing: {
        width: 88,
        height: 88,
        borderRadius: 44,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInner: {
        width: 82,
        height: 82,
        borderRadius: 41,
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
        justifyContent: 'flex-start',
        alignSelf: 'stretch',
    },
    nameLine: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: -2,
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
    pillBlock: {
        marginTop: 10,
        width: '100%',
        alignSelf: 'stretch',
    },
    pillScroll: {
        width: '100%',
        flexGrow: 0,
    },
    pillScrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flexGrow: 0,
        gap: 8,
        paddingRight: 4,
    },
    pillNoShrink: {
        flexShrink: 0,
    },
    pillRowSecond: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    profileSectionDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.12)',
        width: '100%',
        marginTop: 18,
        marginBottom: 16,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        gap: 7,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    pillText: {
        color: 'rgba(255,255,255,0.92)',
        fontSize: 12,
        fontFamily: 'Montserrat-SemiBold',
        flexShrink: 0,
        ...Platform.select({
            android: {includeFontPadding: false},
        }),
    },
    activeDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#4ade80',
        ...neonGlow('#4ade80', 6),
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
        marginBottom: 20,
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
    writeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    writeLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: 'Montserrat-Medium',
    },
    counter: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 12,
        fontFamily: 'Montserrat-Regular',
    },
    inputBorder: {
        borderRadius: 18,
        padding: 2,
    },
    input: {
        minHeight: 128,
        borderRadius: 16,
        backgroundColor: 'rgba(6,4,16,0.96)',
        color: '#fff',
        padding: 14,
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
    },
    chipScroller: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    chip: {
        backgroundColor: 'rgba(38,38,55,0.95)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 22,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.08)',
        maxWidth: '88%',
    },
    chipText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontFamily: 'Montserrat-SemiBold',
    },
    refreshChip: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(38,38,55,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    sendWrap: {
        marginTop: 20,
        borderRadius: 18,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: GRADIENT_B,
                shadowOffset: {width: 0, height: 6},
                shadowOpacity: 0.5,
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
        gap: 5,
        marginLeft: 8,
    },
    coinSm: {
        width: 22,
        height: 22,
    },
    sendCost: {
        color: '#fff',
        fontSize: 17,
        fontFamily: 'Montserrat-Bold',
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
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
        gap: 7,
        flexWrap: 'wrap',
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.68)',
        fontSize: 13,
        fontFamily: 'Montserrat-Medium',
    },
    coinMd: {
        width: 22,
        height: 22,
    },
    balanceNum: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
    },
    errorText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 40,
    },
    backHit: {
        marginTop: 20,
        alignSelf: 'center',
        padding: 12,
    },
    backText: {
        color: COLORS.AKCRUBLUE,
        fontSize: 16,
    },
});
