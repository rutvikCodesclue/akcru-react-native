import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Image,
    Platform,
    useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {StackScreenProps} from '@react-navigation/stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import imageindex from '../../../../assets/images/imageindex';
import {navigate} from '../../../util/RootNavigation';
import {useHideBottomTabBarWhileFocused} from '../../ChatScreens/useHideBottomTabBarWhileFocused';
import {isTablet} from '../../../../assets/constants/theme';

type Props = StackScreenProps<UserProfileStackParams, 'BestMatchScreen'>;

const INTERESTS = [
    {label: 'Music', icon: 'headset' as const, type: 'ionicon' as const},
    {label: 'Movies', icon: 'film-outline' as const, type: 'ionicon' as const},
    {label: 'Travel', icon: 'airplane-outline' as const, type: 'ionicon' as const},
    {label: 'Photography', icon: 'camera-outline' as const, type: 'ionicon' as const},
];

function GradientTitleLine() {
    return (
        <MaskedView
            style={styles.gradientMask}
            maskElement={
                <View style={styles.gradientMaskInner}>
                    <Text style={styles.gradientTitleText}>best matches</Text>
                </View>
            }>
            <LinearGradient
                colors={[COLORS.AKCRUBLUE, COLORS.PURPLE]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={StyleSheet.absoluteFill}
            />
        </MaskedView>
    );
}

export default function BestMatchScreen({navigation}: Props) {
    useHideBottomTabBarWhileFocused(navigation as any);
    const {width} = useWindowDimensions();
    const cardWidth = Math.min(width - 32, 400);
    const iconBase = isTablet() ? 20 : 16;

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                <View style={styles.headerBlock}>
                    <Text style={styles.titlePlain}>Here's one of your</Text>
                    <GradientTitleLine />
                    <Text style={styles.subtitle}>Swipe to see the rest {'>'}</Text>
                </View>

                <View style={[styles.cardGlowWrap, {width: cardWidth + 4}]}>
                    <LinearGradient
                        colors={['#ff2d9b', COLORS.PURPLE, COLORS.AKCRUBLUE]}
                        start={{x: 0, y: 0.5}}
                        end={{x: 1, y: 0.5}}
                        style={[styles.cardBorder, {width: cardWidth + 4}]}>
                        <View style={[styles.cardInner, {width: cardWidth}]}>
                            <Image
                                source={imageindex.FLickFlirt}
                                style={styles.profileImage}
                                resizeMode="cover"
                            />
                            <LinearGradient
                                colors={['transparent', 'rgba(5,3,68,0.92)', '#020018']}
                                style={styles.imageBottomFade}
                            />

                            <View style={styles.matchBadge}>
                                <CustomIcon
                                    name="flame"
                                    type="ionicon"
                                    color="#ffb86c"
                                    baseSize={14}
                                    style={{marginRight: 6}}
                                />
                                <Text style={styles.matchBadgeText}>72% Match</Text>
                            </View>

                            <TouchableOpacity style={styles.heartBtn} activeOpacity={0.8}>
                                <CustomIcon name="heart-outline" type="ionicon" color={COLORS.WHITE} baseSize={22} />
                            </TouchableOpacity>

                            <View style={styles.bottomOverlay}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.nameText}>Luna, 24</Text>
                                    <CustomIcon
                                        name="checkmark-circle"
                                        type="ionicon"
                                        color={COLORS.PURPLE}
                                        baseSize={iconBase}
                                    />
                                </View>
                                <Text style={styles.bio}>
                                    Deep conversations, spontaneous adventures, and finding the best coffee in every
                                    city.
                                </Text>

                                <View style={styles.chipsRow}>
                                    {INTERESTS.map((item) => (
                                        <View key={item.label} style={styles.chip}>
                                            <CustomIcon name={item.icon} type={item.type} color={COLORS.LIGHTGREY} baseSize={13} />
                                            <Text style={styles.chipLabel}>{item.label}</Text>
                                        </View>
                                    ))}
                                </View>

                                <Text style={styles.sharedHeading}>Shared favorites</Text>
                                <View style={styles.sharedCard}>
                                    <Image source={imageindex.Thriller} style={styles.sharedThumb} resizeMode="cover" />
                                    <View style={styles.sharedMeta}>
                                        <Text style={styles.sharedTitle}>Inception</Text>
                                        <Text style={styles.sharedDesc}>Mind-bending thriller</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.dots}>
                    {[0, 1, 2, 3].map((i) => (
                        <View
                            key={i}
                            style={[styles.dot, i === 0 ? styles.dotActive : styles.dotInactive]}
                        />
                    ))}
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.midChatOuter}
                        onPress={() => navigation.navigate('ChatList')}>
                        <LinearGradient
                            colors={['rgba(0,189,244,0.35)', 'rgba(101,48,252,0.35)']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.midChatGradientBorder}>
                            <View style={styles.midChatInner}>
                                <CustomIcon name="chatbubble-ellipses-outline" type="ionicon" color={COLORS.AKCRUBLUE} baseSize={22} />
                                <Text style={styles.actionTitle}>Start Mid-Chat</Text>
                                <Text style={styles.actionSub}>Break the ice</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() =>
                            navigate('NoBottomStack', {
                                screen: 'UserMITHubScreen',
                                params: {index: 0},
                            })
                        }>
                        <LinearGradient
                            colors={[COLORS.AKCRUBLUE, COLORS.PINK]}
                            start={{x: 0, y: 0.5}}
                            end={{x: 1, y: 0.5}}
                            style={styles.mitBtn}>
                            <CustomIcon name="paper-plane-outline" type="ionicon" color={COLORS.WHITE} baseSize={20} />
                            <Text style={styles.mitTitle}>Send a MIT</Text>
                            <Text style={styles.mitSub}>Make it count</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.footerTrust}>
                    <CustomIcon name="lock-closed-outline" type="ionicon" color={COLORS.DARKGREY} baseSize={14} />
                    <Text style={styles.footerTrustText}>Your connection is private and secure</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#020010',
    },
    scrollContent: {
        paddingBottom: 28,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    headerBlock: {
        alignItems: 'center',
        marginBottom: 18,
        marginTop: 4,
    },
    titlePlain: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: '600',
        textAlign: 'center',
    },
    gradientMask: {
        height: 34,
        marginTop: 4,
        alignSelf: 'center',
        minWidth: 200,
    },
    gradientMaskInner: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientTitleText: {
        ...FONTS.Title2,
        fontWeight: '800',
        color: '#000',
    },
    subtitle: {
        ...FONTS.paragraph1,
        color: COLORS.DARKGREY,
        marginTop: 8,
        fontStyle: 'italic',
    },
    cardGlowWrap: {
        alignSelf: 'center',
        ...Platform.select({
            ios: {
                shadowColor: COLORS.PINK,
                shadowOffset: {width: 0, height: 0},
                shadowOpacity: 0.55,
                shadowRadius: 18,
            },
            android: {elevation: 14},
        }),
    },
    cardBorder: {
        borderRadius: 22,
        padding: 2,
    },
    cardInner: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#0a0520',
        alignSelf: 'center',
    },
    profileImage: {
        width: '100%',
        height: SIZES.ScreenHeight * 0.36,
    },
    imageBottomFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '55%',
    },
    matchBadge: {
        position: 'absolute',
        top: 14,
        left: 14,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(101,48,252,0.92)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    matchBadgeText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: '700',
        fontSize: 12,
    },
    heartBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    bottomOverlay: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 18,
        marginTop: -12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    nameText: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
        fontWeight: '800',
    },
    bio: {
        ...FONTS.paragraph1,
        color: COLORS.LIGHTGREY,
        fontStyle: 'italic',
        marginTop: 8,
        lineHeight: 22,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 14,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(34,40,53,0.95)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    chipLabel: {
        ...FONTS.Title2,
        color: COLORS.LIGHTGREY,
        fontSize: 12,
    },
    sharedHeading: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        marginTop: 18,
        marginBottom: 10,
        opacity: 0.9,
    },
    sharedCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(15,12,40,0.95)',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    sharedThumb: {
        width: 72,
        height: 72,
    },
    sharedMeta: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    sharedTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: '700',
    },
    sharedDesc: {
        ...FONTS.paragraph1,
        color: COLORS.DARKGREY,
        marginTop: 4,
        fontSize: 13,
    },
    dots: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 18,
        marginBottom: 22,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        backgroundColor: COLORS.PURPLE,
    },
    dotInactive: {
        backgroundColor: 'rgba(255,255,255,0.22)',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        maxWidth: 400,
        justifyContent: 'center',
    },
    midChatOuter: {
        flex: 1,
        minHeight: 96,
    },
    midChatGradientBorder: {
        borderRadius: 16,
        padding: 1.5,
        flex: 1,
    },
    midChatInner: {
        flex: 1,
        backgroundColor: '#0b0828',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
    },
    actionTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: '700',
        marginTop: 6,
        textAlign: 'center',
    },
    actionSub: {
        ...FONTS.paragraph1,
        color: COLORS.DARKGREY,
        marginTop: 2,
        fontSize: 11,
    },
    mitBtn: {
        flex: 1,
        minHeight: 96,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
    },
    mitTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: '800',
        marginTop: 6,
    },
    mitSub: {
        ...FONTS.paragraph1,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 2,
        fontSize: 11,
    },
    footerTrust: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
    },
    footerTrustText: {
        ...FONTS.paragraph1,
        color: COLORS.DARKGREY,
        fontSize: 12,
    },
});
