import React from 'react';
import {Animated, BackHandler, Easing, Image, ImageBackground, Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_BUTTON_THEME, AUTH_TEXT_THEME} from '../../../../assets/constants/authTheme';
import Svg, {G, Path, Polygon} from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';
import imageindex from '../../../../assets/images/imageindex';
import FindMyMatchSvg from '../../../../assets/images/find_my_match.svg';
import JustAVibeSvg from '../../../../assets/images/just_a_vibe.svg';
import DontJustWatchInviteSvg from '../../../../assets/images/dont-just-watch-invite-converted.svg';
import onboardStyles from '../../loginScreens/Onboard/styles';
import {navigate} from '../../../util/RootNavigation';
import {useHideBottomTabBarWhileFocused} from '../../ChatScreens/useHideBottomTabBarWhileFocused';
import {AppLoadingModal} from '../../../components/Loading';
import ArchetypeHorizontalDivider from '../../../components/ArchetypeHorizontalDivider';

type Props = NativeStackScreenProps<UserProfileStackParams, 'UserMatchModesScreen'>;

const HEX_PATH = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
const HEX_POINTS_ROTATED = '135,0 270,58.5 270,175.5 135,234 0,175.5 0,58.5';

/** Flat-top hex vertices in UserMatchModes view space (0–270 × 0–234), center (135, 117). */
const HEX_VERTS: readonly [number, number][] = [
    [135, 0],
    [270, 58.5],
    [270, 175.5],
    [135, 234],
    [0, 175.5],
    [0, 58.5],
];

/** Larger dashed ring outside the main hex. */
const OUTER_HEX_SCALE = 1.22;
const OUTER_HEX_SCALE_X = OUTER_HEX_SCALE * 0.9;
const OUTER_HEX_SCALE_Y = OUTER_HEX_SCALE;
const INNER_HEX_SCALE_X = 0.82;
const INNER_HEX_SCALE_Y = 1;
/** Small hexes on the outer ring (edge midpoints — spread around the hex). */
const MINI_HEX_SCALE = 0.095;

/** Expanded viewBox so scaled outer hex + mini hexes are not clipped. */
const CLUSTER_VB = {x: -42, y: -36, w: 354, h: 306};

function outerEdgeMidpoint(edgeIndex: number, scaleX: number, scaleY: number): [number, number] {
    const a = HEX_VERTS[edgeIndex % 6];
    const b = HEX_VERTS[(edgeIndex + 1) % 6];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    return [135 + (mx - 135) * scaleX, 117 + (my - 117) * scaleY];
}

const floatingDots = [
    {top: '9%', left: '10%'},
    {top: '17%', right: '12%'},
    {top: '42%', left: '7%'},
    {top: '50%', right: '10%'},
    {top: '75%', left: '15%'},
    {top: '84%', right: '12%'},
] as const;

const orbitSources = [
    imageindex.Action,
    imageindex.Adventure,
    imageindex.Animation,
    imageindex.Comedy,
    imageindex.Crime,
    imageindex.Drama,
    imageindex.Family,
    imageindex.Thriller,
];

const FIXED_CARD_WIDTH = 320;
/** Half-cycle duration for emphasized Find My Match pulse (ms). */
const EMPHASIZED_PULSE_PHASE_MS = 1000;
/** Half-cycle for second card pulse — slower so it feels calmer than the top card. */
const SECONDARY_PULSE_PHASE_MS = 1700;

function HexMaskedImage({
    source,
    size,
}: {
    source: any;
    size: number;
}) {
    return (
        <MaskedView
            style={{width: size, height: size}}
            maskElement={
                <Svg height={size} width={size} viewBox="0 0 270 234">
                    <Path d={HEX_PATH} fill="black" transform="rotate(90 135 117)" />
                </Svg>
            }>
            <Image source={source} style={{width: size, height: size}} resizeMode="cover" />
        </MaskedView>
    );
}

/** Fixed 5-of-6 edge midpoints so both cards share identical mini-hex positions. */
const FIXED_OUTER_EDGE_INDICES: readonly number[] = [0, 1, 2, 4, 5];

function HexCluster({
    centerImage,
    clusterWidth,
}: {
    centerImage: any;
    clusterWidth: number;
}) {
    const ringW = clusterWidth;
    const ringH = (ringW * 234) / 270;
    const centerSize = ringW * 0.58;
    const miniSize = ringW * 0.14;

    const miniHexEdgeIndices = FIXED_OUTER_EDGE_INDICES;

    const clusterW = ringW * (CLUSTER_VB.w / 270);
    const clusterH = ringW * (CLUSTER_VB.h / 270);
    const offX = (clusterW - ringW) / 2;
    const offY = (clusterH - ringH) / 2;
    const outerMiniImageSize = miniSize * 0.95;
    const outerMiniHexPositions = React.useMemo(
        () =>
            miniHexEdgeIndices.map(edgeIdx => {
                const [cx, cy] = outerEdgeMidpoint(edgeIdx, OUTER_HEX_SCALE_X, OUTER_HEX_SCALE_Y);
                const x = ((cx - CLUSTER_VB.x) / CLUSTER_VB.w) * clusterW;
                const yBase = ((cy - CLUSTER_VB.y) / CLUSTER_VB.h) * clusterH;
                // Side (left/right) mini hexes: move slightly down for better visual centering on dashed edge.
                const y = edgeIdx === 1 || edgeIdx === 4 ? yBase + clusterH * 0.15 : yBase;
                return {x, y};
            }),
        [miniHexEdgeIndices, clusterW, clusterH],
    );

    const responsiveOrbitPositions = [
        {top: -miniSize * 0.18, left: ringW * 0.5 - miniSize * 0.5},
        {top: ringH * 0.39, right: ringW * 0.09 - miniSize * 0.5},
        {bottom: -miniSize * 0.18, left: ringW * 0.5 - miniSize * 0.5},
        {top: ringH * 0.39, left: ringW * 0.09 - miniSize * 0.5},
    ];

    const svgStroke = (w: number) => Math.max(1, (w * 2) / ringW);

    return (
        <View style={[styles.clusterWrap, {width: clusterW, height: clusterH}]}>
            <Svg
                width={clusterW}
                height={clusterH}
                viewBox={`${CLUSTER_VB.x} ${CLUSTER_VB.y} ${CLUSTER_VB.w} ${CLUSTER_VB.h}`}
                style={StyleSheet.absoluteFillObject}>
                <G transform={`translate(135 117) scale(${OUTER_HEX_SCALE_X} ${OUTER_HEX_SCALE_Y}) translate(-135 -117)`}>
                    <Polygon
                        points={HEX_POINTS_ROTATED}
                        fill="none"
                        stroke="rgba(200, 180, 255, 0.5)"
                        strokeWidth={svgStroke(1.6)}
                        strokeDasharray="10 12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </G>
                <G transform={`translate(135 117) scale(${INNER_HEX_SCALE_X} ${INNER_HEX_SCALE_Y}) translate(-135 -117)`}>
                    <Polygon
                        points={HEX_POINTS_ROTATED}
                        fill="none"
                        stroke="rgba(240, 225, 255, 0.72)"
                        strokeWidth={svgStroke(2)}
                        strokeDasharray="8 10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </G>
                {miniHexEdgeIndices.map((edgeIdx, i) => {
                    const [cx, cy] = outerEdgeMidpoint(edgeIdx, OUTER_HEX_SCALE_X, OUTER_HEX_SCALE_Y);
                    return (
                        <G
                            key={`mini-${edgeIdx}-${i}`}
                            transform={`translate(${cx} ${cy}) scale(${MINI_HEX_SCALE}) translate(-135 -117)`}>
                            <Polygon
                                points={HEX_POINTS_ROTATED}
                                fill="none"
                                stroke="rgba(220, 200, 255, 0.65)"
                                strokeWidth={svgStroke(2.2)}
                                strokeDasharray="5 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </G>
                    );
                })}
            </Svg>
            <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
                {outerMiniHexPositions.map((point, idx) => (
                    <View
                        key={`mini-image-${idx}`}
                        style={{
                            position: 'absolute',
                            left: point.x - outerMiniImageSize / 2,
                            top: point.y - outerMiniImageSize / 2,
                        }}>
                        <HexMaskedImage source={orbitSources[(idx + 2) % orbitSources.length]} size={outerMiniImageSize} />
                    </View>
                ))}
            </View>

            <View
                style={{
                    position: 'absolute',
                    left: offX,
                    top: offY,
                    width: ringW,
                    height: ringH,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <View style={styles.centerHex}>
                    <HexMaskedImage source={centerImage} size={centerSize} />
                </View>
            </View>

            <View
                style={{
                    position: 'absolute',
                    left: offX,
                    top: offY,
                    width: ringW,
                    height: ringH,
                }}>
                {responsiveOrbitPositions.map((pos, idx) => (
                    <View key={idx} style={[styles.orbitHex, pos]}>
                        <HexMaskedImage source={orbitSources[idx % orbitSources.length]} size={miniSize} />
                    </View>
                ))}
            </View>
        </View>
    );
}

function ModeCard({
    title,
    subtitle,
    centerImage,
    clusterWidth,
    onPress: onNavigate,
    emphasized = false,
    pulsePhaseMs,
}: {
    title: string;
    subtitle: string;
    centerImage: any;
    clusterWidth: number;
    onPress: () => void;
    emphasized?: boolean;
    /** With `emphasized`, half-cycle duration in ms (default: EMPHASIZED_PULSE_PHASE_MS). */
    pulsePhaseMs?: number;
}) {
    const idlePulseScale = React.useRef(new Animated.Value(1)).current;
    const pressScale = React.useRef(new Animated.Value(1)).current;
    const glowBoost = React.useRef(new Animated.Value(0)).current;
    const navigationFiredRef = React.useRef(false);
    const phaseMs = pulsePhaseMs ?? EMPHASIZED_PULSE_PHASE_MS;

    const combinedScale = React.useMemo(
        () => Animated.multiply(idlePulseScale, pressScale),
        [idlePulseScale, pressScale],
    );

    React.useEffect(() => {
        if (!emphasized) {
            return;
        }
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(idlePulseScale, {
                    toValue: 1.018,
                    duration: phaseMs,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(idlePulseScale, {
                    toValue: 1,
                    duration: phaseMs,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [emphasized, idlePulseScale, phaseMs]);

    const handlePress = () => {
        if (navigationFiredRef.current) {
            return;
        }
        navigationFiredRef.current = true;
        Animated.sequence([
            Animated.parallel([
                Animated.spring(pressScale, {
                    toValue: 1.07,
                    friction: 4,
                    tension: 320,
                    useNativeDriver: true,
                }),
                Animated.timing(glowBoost, {
                    toValue: 1,
                    duration: 140,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(100),
        ]).start(({finished}) => {
            if (finished) {
                onNavigate();
            } else {
                navigationFiredRef.current = false;
            }
        });
    };

    const pressGlowOpacity = glowBoost.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.85],
    });

    const authBtnWidth = Math.min(AUTH_BUTTON_THEME.width, FIXED_CARD_WIDTH * 0.92);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${title}. ${subtitle}`}
            android_ripple={null}
            delayLongPress={600000}
            onPress={handlePress}
            style={[styles.cardWrap, emphasized && styles.cardWrapEmphasized, {width: FIXED_CARD_WIDTH}]}>
            <Animated.View style={{transform: [{scale: combinedScale}]}}>
                <View style={styles.cardContainer}>
                    <View style={styles.hexInteractiveWrap}>
                        <Animated.View
                            pointerEvents="none"
                            style={[styles.hexGlowPress, {opacity: pressGlowOpacity}]}
                        />
                        <HexCluster centerImage={centerImage} clusterWidth={clusterWidth} />
                    </View>

                    <View style={styles.modeCardButtonShell}>
                        <LinearGradient
                            colors={AUTH_BUTTON_THEME.colors}
                            start={AUTH_BUTTON_THEME.start}
                            end={AUTH_BUTTON_THEME.end}
                            style={{
                                width: authBtnWidth,
                                height: AUTH_BUTTON_THEME.getHeight(),
                                borderRadius: AUTH_BUTTON_THEME.borderRadius,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <Text
                                selectable={false}
                                suppressHighlighting
                                style={AUTH_TEXT_THEME.buttonLabel}>
                                {title}
                            </Text>
                        </LinearGradient>
                    </View>
                    <Text selectable={false} suppressHighlighting style={styles.subtitle}>
                        {subtitle}
                    </Text>
                </View>
            </Animated.View>
        </Pressable>
    );
}

function AnimatedImageModeCard({
    onPress: onNavigate,
    accessibilityLabel,
    SvgComponent,
    pulsePhaseMs = EMPHASIZED_PULSE_PHASE_MS,
    imageScale = 1,
    imageScaleX,
    imageScaleY,
}: {
    onPress: () => void;
    accessibilityLabel: string;
    SvgComponent: React.ComponentType<any>;
    pulsePhaseMs?: number;
    imageScale?: number;
    imageScaleX?: number;
    imageScaleY?: number;
}) {
    const idlePulseScale = React.useRef(new Animated.Value(1)).current;
    const pressScale = React.useRef(new Animated.Value(1)).current;
    const glowBoost = React.useRef(new Animated.Value(0)).current;
    const navigationFiredRef = React.useRef(false);

    const combinedScale = React.useMemo(
        () => Animated.multiply(idlePulseScale, pressScale),
        [idlePulseScale, pressScale],
    );

    React.useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(idlePulseScale, {
                    toValue: 1.018,
                    duration: pulsePhaseMs,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(idlePulseScale, {
                    toValue: 1,
                    duration: pulsePhaseMs,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [idlePulseScale, pulsePhaseMs]);

    const handlePress = () => {
        if (navigationFiredRef.current) {
            return;
        }
        navigationFiredRef.current = true;
        Animated.sequence([
            Animated.parallel([
                Animated.spring(pressScale, {
                    toValue: 1.07,
                    friction: 4,
                    tension: 320,
                    useNativeDriver: true,
                }),
                Animated.timing(glowBoost, {
                    toValue: 1,
                    duration: 140,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(100),
        ]).start(({finished}) => {
            if (finished) {
                onNavigate();
            } else {
                navigationFiredRef.current = false;
            }
        });
    };

    const pressGlowOpacity = glowBoost.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.85],
    });

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            android_ripple={null}
            delayLongPress={600000}
            onPress={handlePress}
            style={styles.findMyMatchImageCardPressable}>
            <Animated.View style={styles.findMyMatchImageCardAnimated}>
                <Animated.View
                    pointerEvents="none"
                    style={[styles.findMyMatchImageCardGlow, {opacity: pressGlowOpacity}]}
                />
                <Animated.View style={{transform: [{scale: combinedScale}]}}>
                    <View style={styles.findMyMatchImageCard}>
                        <View
                            style={[
                                styles.modeImageScaleWrap,
                                {transform: [{scaleX: imageScaleX ?? imageScale}, {scaleY: imageScaleY ?? imageScale}]},
                            ]}>
                            <SvgComponent width="100%" height="100%" />
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
}

export default function UserMatchModesScreen({navigation}: Props) {
    useHideBottomTabBarWhileFocused(navigation as any);
    const [showArchetypeLoader, setShowArchetypeLoader] = React.useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const onHardwareBackPress = () => true;
            const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
            return () => sub.remove();
        }, []),
    );
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowArchetypeLoader(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const openFindMyMatch = () => {
        navigation.popToTop();
        navigate('NoBottomStack', {
            screen: 'ClientTabNavigator',
            params: {screen: 'FlickFlirtScreen'},
        });
    };

    const openJustAVibe = () => {
        navigation.popToTop();
        navigate('NoBottomStack', {
            screen: 'ClientTabNavigator',
            params: {screen: 'CrummunityStack'},
        });
    };

    return (
        <View style={styles.root}>
            <ImageBackground
                source={imageindex.BgImageSM}
                resizeMode={showArchetypeLoader ? 'cover' : 'contain'}
                imageStyle={showArchetypeLoader ? undefined : styles.bgImage}
                style={
                    showArchetypeLoader
                        ? [onboardStyles.bgimage, onboardStyles.standaloneBgFill]
                        : styles.backgroundLayer
                }>
                <SafeAreaView style={styles.safe}>
                    {!showArchetypeLoader && (
                        <LinearGradient colors={['#000000', '#000000']} style={styles.container}>
                            {floatingDots.map((dot, i) => (
                                <View key={i} style={[styles.dot, dot]} />
                            ))}
                            <View style={styles.body}>
                                <View style={styles.heroHeaderWrap}>
                                    <Text style={styles.heroHeaderTitleLine}>How do you want</Text>
                                    <View style={styles.heroHeaderLine2Wrap}>
                                        <Text style={styles.heroHeaderTitleLine}>to show up </Text>
                                        <Text style={styles.heroHeaderTonight}>tonight?</Text>
                                    </View>
                                    <View style={styles.heroHeaderSubtitleWrap}>
                                        <Text style={styles.heroHeaderStar}>✦</Text>
                                        <Text style={styles.heroHeaderSubtitle}>
                                            Every movie. Every invite. Real connections.
                                        </Text>
                                        <Text style={styles.heroHeaderStar}>✦</Text>
                                    </View>
                                </View>
                                <View style={[styles.sectionBlock, styles.primarySection]}>
                                    <AnimatedImageModeCard
                                        accessibilityLabel="Find My Match"
                                        SvgComponent={FindMyMatchSvg}
                                        onPress={openFindMyMatch}
                                    />
                                </View>
                                <ArchetypeHorizontalDivider
                                    title="OR"
                                    containerStyle={styles.modeDividerWrap}
                                    titleStyle={styles.modeDividerText}
                                />
                                <View style={[styles.sectionBlock, styles.secondarySection]}>
                                    <AnimatedImageModeCard
                                        accessibilityLabel="Just A Vibe"
                                        SvgComponent={JustAVibeSvg}
                                        pulsePhaseMs={SECONDARY_PULSE_PHASE_MS}
                                        imageScaleX={1.02}
                                        imageScaleY={1.02}
                                        onPress={openJustAVibe}
                                    />
                                </View>
                                <View style={styles.bottomTaglineWrap}>
                                    <DontJustWatchInviteSvg
                                        width={Math.min(SIZES.ScreenWidth * 0.92, 330)}
                                        height={44}
                                    />
                                </View>
                            </View>
                        </LinearGradient>
                    )}
                </SafeAreaView>
            </ImageBackground>

            <AppLoadingModal
                visible={showArchetypeLoader}
                message="This is how you watch..."
                secondaryMessage="Now let's see where you fit."
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    backgroundLayer: {
        flex: 1,
    },
    bgImage: {
        width: SIZES.ScreenWidth,
        height: SIZES.ScreenHeight,
        alignSelf: 'center',
        top: -(SIZES.ScreenHeight * 0.15),
    },
    safe: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
    },
    body: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: 8,
    },
    heroHeaderWrap: {
        alignItems: 'center',
        paddingTop: 26,
        paddingBottom: 10,
    },
    heroHeaderTitleLine: {
        ...FONTS.Title2,
        color: '#F8F8FC',
        textAlign: 'center',
        lineHeight: 24,
        fontSize: 28,
        letterSpacing: 0.2,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 6,
    },
    heroHeaderLine2Wrap: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginTop: -4,
    },
    heroHeaderTonight: {
        color: '#FF4DB6',
        fontStyle: 'italic',
        fontSize: 26,
        lineHeight: 26,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 6,
    },
    heroHeaderSubtitleWrap: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroHeaderSubtitle: {
        ...FONTS.paragraph1,
        color: '#D9DAE7',
        textAlign: 'center',
        fontSize: 11,
        lineHeight: 14,
        marginHorizontal: 8,
    },
    heroHeaderStar: {
        color: '#FF4DB6',
        fontSize: 18,
        lineHeight: 18,
    },
    sectionBlock: {
        flex: 1,
        width: '100%',
        minHeight: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primarySection: {
        paddingTop: 4,
    },
    secondarySection: {
        paddingBottom: 4,
    },
    modeDividerWrap: {
        marginTop: 2,
        marginBottom: 2,
        width: Math.min(SIZES.ScreenWidth * 0.9, 360),
        alignSelf: 'center',
    },
    modeDividerText: {
        color: '#FF63C3',
    },
    findMyMatchImageCardPressable: {
        alignSelf: 'center',
    },
    findMyMatchImageCardAnimated: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    findMyMatchImageCardGlow: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderRadius: 20,
        backgroundColor: 'rgba(160, 90, 220, 0.45)',
    },
    findMyMatchImageCard: {
        width: Math.min(SIZES.ScreenWidth * 0.95, 360),
        height: Math.min(SIZES.ScreenHeight * 0.36, 320),
        borderRadius: 20,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    modeImageScaleWrap: {
        width: '100%',
        height: '100%',
    },
    bottomTaglineWrap: {
        alignItems: 'center',
        paddingBottom: 10,
        marginTop: 4,
    },
    cardWrap: {
        alignItems: 'center',
        marginBottom: 0,
    },
    cardWrapEmphasized: {
        marginBottom: 0,
    },
    cardContainer: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 16,
        borderRadius: 18,
    },
    hexInteractiveWrap: {
        position: 'relative',
        alignItems: 'center',
        alignSelf: 'center',
    },
    hexGlowPress: {
        position: 'absolute',
        left: -14,
        right: -14,
        top: -10,
        bottom: -10,
        borderRadius: 26,
        backgroundColor: 'rgba(160, 90, 220, 0.45)',
    },
    modeCardButtonShell: {
        marginTop: 10,
        alignItems: 'center',
    },
    clusterWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerHex: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    orbitHex: {
        position: 'absolute',
    },
    subtitle: {
        marginTop: 10,
        ...FONTS.paragraph1,
        color: COLORS.WHITE,
        textAlign: 'center',
    },
    dot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(194,134,255,0.7)',
    },
});
