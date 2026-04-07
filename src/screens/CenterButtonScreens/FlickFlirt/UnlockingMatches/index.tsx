import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, Animated, Easing, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import MaskedView from '@react-native-masked-view/masked-view';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import imageindex from '../../../../../assets/images/imageindex';
import BackButton from '../../../../components/General/backbutton';
import FlickFlirtLockedPlaceholderCard from '../../../../components/FlickFlirtLockedPlaceholderCard';

const ACCENT_PURPLE = '#A855F7';
const ACCENT_BLUE = '#3B82F6';
const ACCENT_PINK = '#EC4899';

/** 0→100% in 10s wall time: 0→70% (6.3s), pause 1s at 70%, 70→100% (2.7s). */
const PROGRESS_TOTAL_MS = 10_000;
const PAUSE_AT_70_MS = 1_000;
const PROGRESS_ANIM_MS = PROGRESS_TOTAL_MS - PAUSE_AT_70_MS;
const DURATION_TO_70_MS = Math.round(PROGRESS_ANIM_MS * 0.7);
const DURATION_70_TO_100_MS = PROGRESS_ANIM_MS - DURATION_TO_70_MS;

/** Larger denominator = taller. 1st & 5th: short; 2nd & 4th: medium; 3rd (center): tallest. */
const LOCK_CARD_ASPECT_SHORT = 1 / 2.52;
const LOCK_CARD_ASPECT_MEDIUM = 1 / 2.65;
const LOCK_CARD_ASPECT_CENTER = 1 / 2.75;

export default function UnlockingMatchesScreen() {
    const navigation = useNavigation();
    const progress = useRef(new Animated.Value(0)).current;
    const [progressPercent, setProgressPercent] = useState(0);

    const cards = useMemo(() => [0, 1, 2, 3, 4], []);

    useEffect(() => {
        const id = progress.addListener(({value}: {value: number}) => {
            setProgressPercent(Math.min(100, Math.round(value * 100)));
        });
        return () => {
            progress.removeListener(id);
        };
    }, [progress]);

    useEffect(() => {
        const anim = Animated.sequence([
            Animated.timing(progress, {
                toValue: 0.7,
                duration: DURATION_TO_70_MS,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.delay(PAUSE_AT_70_MS),
            Animated.timing(progress, {
                toValue: 1,
                duration: DURATION_70_TO_100_MS,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]);
        anim.start(({finished}) => {
            if (finished) {
                if (navigation.canGoBack()) {
                    navigation.goBack();
                }
            }
        });
        return () => {
            anim.stop();
        };
    }, [progress, navigation]);

    const barWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.bgGlowTop} pointerEvents="none" />

            <View style={styles.mainColumn}>
                <View style={styles.heroWrap}>
                    <Image
                        source={imageindex.UnlockingCards}
                        style={styles.heroImage}
                        resizeMode="contain"
                        accessibilityRole="image"
                        accessibilityIgnoresInvertColors
                    />
                </View>

                <View style={styles.restContent}>
                    <View style={styles.upperRest}>
                        <View style={styles.titleBlock}>
                            <View style={styles.titleRow}>
                                <Text style={styles.titlePlain}>Unlocking </Text>
                                <MaskedView
                                    style={styles.gradientTextMask}
                                    maskElement={
                                        <Text style={[styles.titlePlain, styles.titleMaskText]}>
                                            your matches...
                                        </Text>
                                    }>
                                    <LinearGradient
                                        colors={[ACCENT_PURPLE, ACCENT_PINK]}
                                        start={{x: 0, y: 0.5}}
                                        end={{x: 1, y: 0.5}}
                                        style={styles.gradientTextFill}
                                    />
                                </MaskedView>
                            </View>
                            <Text style={styles.subtitle}>
                                {"You're about to see who's been waiting."}
                            </Text>
                        </View>

                        <View style={styles.locksRowOuter}>
                            <View style={styles.locksRow}>
                                {cards.map(i => (
                                    <View
                                        key={i}
                                        style={[styles.lockSlot, i === 2 && styles.lockSlotCenter]}>
                                        <FlickFlirtLockedPlaceholderCard
                                            size="compact"
                                            hideText
                                            style={
                                                i === 2
                                                    ? styles.lockedCardCenter
                                                    : i === 0 || i === 4
                                                      ? styles.lockedCardOuter
                                                      : styles.lockedCardMid
                                            }
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.bottomRest}>
                        <View style={styles.progressCard}>
                            <View style={styles.progressHead}>
                                <Icon name="sparkles" type="ionicon" size={18} color={ACCENT_PURPLE} />
                                <View style={styles.progressCopy}>
                                    <Text style={styles.progressTitle}>Analyzing compatibility, shared vibes, and more</Text>
                                    <Text style={styles.progressHint}>{"This won't take long..."}</Text>
                                </View>
                            </View>
                            <View style={styles.trackRow}>
                                <View style={styles.track}>
                                    <Animated.View style={[styles.trackFillWrap, {width: barWidth}]}>
                                        <LinearGradient
                                            colors={[ACCENT_BLUE, ACCENT_PURPLE, ACCENT_PINK]}
                                            start={{x: 0, y: 0.5}}
                                            end={{x: 1, y: 0.5}}
                                            style={styles.trackFill}
                                        />
                                    </Animated.View>
                                </View>
                                <Text style={styles.progressPercent} accessibilityLiveRegion="polite">
                                    {progressPercent}%
                                </Text>
                            </View>
                        </View>

                        <View style={styles.footerTrust}>
                            <Icon name="shield-checkmark" type="ionicon" size={14} color="rgba(255,255,255,0.45)" />
                            <Text style={styles.footerTrustText}>Secure • Private • Just for you</Text>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#000000',
    },
    bgGlowTop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        opacity: 0.35,
    },
    /** Fills space below back button: top 40% hero image, bottom ~60% for copy, cards, progress. */
    mainColumn: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    heroWrap: {
        height: '40%',
        minHeight: 0,
        width: SIZES.ScreenWidth,
        alignSelf: 'center',
        marginHorizontal: -20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    /** Full asset visible (no crop); scales uniformly inside the 40% band. */
    heroImage: {
        width: '100%',
        height: '100%',
    },
    restContent: {
        flex: 1,
        minHeight: 0,
        width: '100%',
        paddingTop: 8,
    },
    upperRest: {
        flexShrink: 1,
        width: '100%',
    },
    bottomRest: {
        marginTop: 'auto',
        width: '100%',
        gap: 12,
    },
    titleBlock: {
        width: '100%',
        alignItems: 'center',
        alignSelf: 'center',
        paddingHorizontal: 8,
    },
    titleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        maxWidth: '100%',
    },
    titlePlain: {
        ...FONTS.Title1,
        fontSize: 24,
        color: COLORS.WHITE,
        lineHeight: 32,
    },
    gradientTextMask: {
        height: 34,
        width: 212,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    gradientTextFill: {
        width: 212,
        height: 34,
    },
    titleMaskText: {
        backgroundColor: 'transparent',
    },
    subtitle: {
        ...FONTS.Title3,
        fontSize: 15,
        color: 'rgba(255,255,255,0.55)',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
        paddingHorizontal: 4,
    },
    lockedCardOuter: {
        aspectRatio: LOCK_CARD_ASPECT_SHORT,
    },
    lockedCardMid: {
        aspectRatio: LOCK_CARD_ASPECT_MEDIUM,
    },
    lockedCardCenter: {
        aspectRatio: LOCK_CARD_ASPECT_CENTER,
    },
    locksRowOuter: {
        width: SIZES.ScreenWidth * 0.92,
        maxWidth: '100%',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        flexShrink: 1,
    },
    locksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    lockSlot: {
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{scale: 0.92}],
        opacity: 0.88,
    },
    lockSlotCenter: {
        transform: [{scale: 1.06}],
        opacity: 1,
        zIndex: 2,
        shadowColor: ACCENT_PURPLE,
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.45,
        shadowRadius: 10,
        elevation: 8,
    },
    progressCard: {
        width: '100%',
        borderRadius: 16,
        padding: 16,
        backgroundColor: 'rgba(10,10,28,0.94)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    progressHead: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 14,
    },
    progressCopy: {
        flex: 1,
    },
    progressTitle: {
        ...FONTS.Title3,
        fontSize: 15,
        color: 'rgba(255,255,255,0.92)',
        lineHeight: 21,
    },
    progressHint: {
        ...FONTS.paragraph2,
        fontSize: 13,
        color: 'rgba(255,255,255,0.38)',
        marginTop: 4,
    },
    trackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    track: {
        flex: 1,
        height: 8,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        minWidth: 0,
    },
    progressPercent: {
        ...FONTS.Title3,
        fontSize: 14,
        fontVariant: ['tabular-nums'],
        color: 'rgba(255,255,255,0.85)',
        minWidth: 40,
        textAlign: 'right',
    },
    trackFillWrap: {
        height: '100%',
        borderRadius: 6,
        overflow: 'hidden',
    },
    trackFill: {
        flex: 1,
    },
    footerTrust: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
    },
    footerTrustText: {
        ...FONTS.paragraph2,
        fontSize: 13,
        color: 'rgba(255,255,255,0.42)',
    },
});
