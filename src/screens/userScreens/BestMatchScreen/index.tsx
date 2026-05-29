import React, {useCallback, useState} from 'react';
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
    FlatList,
    ImageSourcePropType,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, {Defs, Rect, Stop, LinearGradient as SvgLinearGradient} from 'react-native-svg';
import {StackScreenProps} from '@react-navigation/stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {AUTH_BUTTON_THEME, COLORS, FONTS, SIZES} from '../../../../assets/constants';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import imageindex from '../../../../assets/images/imageindex';
import {navigate} from '../../../util/RootNavigation';
import {useHideBottomTabBarWhileFocused} from '../../ChatScreens/useHideBottomTabBarWhileFocused';

type Props = StackScreenProps<UserProfileStackParams, 'BestMatchScreen'>;

type MatchProfile = {
    id: string;
    name: string;
    matchPercent: number;
    archetypeName: string;
    image: ImageSourcePropType;
};

/** Carousel + page dots: length always matches (replace with API data later). */
const BEST_MATCH_CARD_DATA: MatchProfile[] = [
    {
        id: '1',
        name: 'Luna',
        matchPercent: 72,
        archetypeName: 'Laughing trailblazer',
        image: imageindex.FLickFlirt,
    },
    {
        id: '2',
        name: 'Jordan',
        matchPercent: 68,
        archetypeName: 'Curious explorer',
        image: imageindex.Drama,
    },
    {
        id: '3',
        name: 'Sam',
        matchPercent: 81,
        archetypeName: 'Playful realist',
        image: imageindex.Comedy,
    },
    {
        id: '4',
        name: 'Riley',
        matchPercent: 76,
        archetypeName: 'Midnight muse',
        image: imageindex.Action,
    },
];

const GRADIENT_CHIP_STROKE = 1.5;

/** True outline only: SVG stroke shows through the card; inner has no fill color. */
function GradientOutlineChip({children, gradientId}: {children: React.ReactNode; gradientId: string}) {
    const [size, setSize] = useState<{w: number; h: number} | null>(null);
    const halfStroke = GRADIENT_CHIP_STROKE / 2;
    return (
        <View style={styles.gradientChipWrap}>
            <View
                onLayout={(e) => {
                    const {width, height} = e.nativeEvent.layout;
                    if (width > 0 && height > 0) {
                        setSize({w: width, h: height});
                    }
                }}
                style={styles.gradientChipContent}>
                {children}
            </View>
            {size ? (
                <Svg pointerEvents="none" width={size.w} height={size.h} style={styles.gradientChipSvg}>
                    <Defs>
                        <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor={COLORS.PURPLE} />
                            <Stop offset="1" stopColor={COLORS.AKCRUBLUE} />
                        </SvgLinearGradient>
                    </Defs>
                    <Rect
                        x={halfStroke}
                        y={halfStroke}
                        width={size.w - GRADIENT_CHIP_STROKE}
                        height={size.h - GRADIENT_CHIP_STROKE}
                        rx={(size.h - GRADIENT_CHIP_STROKE) / 2}
                        ry={(size.h - GRADIENT_CHIP_STROKE) / 2}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth={GRADIENT_CHIP_STROKE}
                    />
                </Svg>
            ) : null}
        </View>
    );
}

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

type MatchCardProps = {
    profile: MatchProfile;
    cardWidth: number;
};

function MatchCard({profile, cardWidth}: MatchCardProps) {
    return (
        <View style={[styles.cardGlowWrap, {width: cardWidth + 4}]}>
            <LinearGradient
                colors={['#ff2d9b', COLORS.PURPLE, COLORS.AKCRUBLUE]}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}
                style={[styles.cardBorder, {width: cardWidth + 4}]}>
                <View style={[styles.cardInner, {width: cardWidth}]}>
                    <Image source={profile.image} style={styles.cardBgImage} resizeMode="cover" />
                    <LinearGradient
                        colors={[
                            'rgba(2,0,16,0.35)',
                            'rgba(5,3,68,0.55)',
                            'rgba(2,0,24,0.88)',
                            '#020018',
                        ]}
                        locations={[0, 0.35, 0.72, 1]}
                        start={{x: 0.5, y: 0}}
                        end={{x: 0.5, y: 1}}
                        style={styles.cardBgGradient}
                    />

                    <View style={styles.cardContentColumn}>
                        <View style={styles.bottomOverlay}>
                            <Text style={styles.cardName}>{profile.name}</Text>
                            <View style={styles.badgesRow}>
                                <GradientOutlineChip gradientId={`chip-${profile.id}-match`}>
                                    <Text style={styles.matchPillText}>{profile.matchPercent}% match</Text>
                                </GradientOutlineChip>
                                <GradientOutlineChip gradientId={`chip-${profile.id}-arc`}>
                                    <Text style={styles.archetypePillText}>{profile.archetypeName}</Text>
                                </GradientOutlineChip>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

export default function BestMatchScreen({navigation}: Props) {
    useHideBottomTabBarWhileFocused(navigation as any);
    const {width: windowWidth} = useWindowDimensions();
    const cardWidth = Math.min(windowWidth - 32, 400);
    const cards = BEST_MATCH_CARD_DATA;
    const [activeIndex, setActiveIndex] = useState(0);
    /** Card stack height ≈ inner minHeight + `cardBorder` padding (2+2); list taller than card caused the extra gap */
    const carouselListHeight = SIZES.ScreenHeight * 0.62 + 4;
    const scrollHorizontalPad = 16;
    const actionsRowGap = 12;
    const actionBtnWidth = (windowWidth - scrollHorizontalPad * 2 - actionsRowGap) / 2;

    const onCarouselScrollEnd = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (cards.length === 0) {
                return;
            }
            const x = e.nativeEvent.contentOffset.x;
            const next = Math.round(x / windowWidth);
            setActiveIndex(Math.min(Math.max(0, next), cards.length - 1));
        },
        [cards.length, windowWidth],
    );

    const renderMatchItem = useCallback(
        ({item}: {item: MatchProfile}) => (
            <View style={[styles.carouselPage, {width: windowWidth}]}>
                <MatchCard profile={item} cardWidth={cardWidth} />
            </View>
        ),
        [cardWidth, windowWidth],
    );

    const keyExtractor = useCallback((item: MatchProfile) => item.id, []);

    const getItemLayout = useCallback(
        (_list: ArrayLike<MatchProfile> | null | undefined, index: number) => ({
            length: windowWidth,
            offset: windowWidth * index,
            index,
        }),
        [windowWidth],
    );

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                nestedScrollEnabled>
                <View style={styles.headerBlock}>
                    <Text style={styles.titlePlain}>Here's one of your</Text>
                    <GradientTitleLine />
                    <Text style={styles.subtitle}>Swipe left to see more matches</Text>
                </View>

                <View style={styles.carouselOuter}>
                    <FlatList
                        data={cards}
                        renderItem={renderMatchItem}
                        keyExtractor={keyExtractor}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={onCarouselScrollEnd}
                        getItemLayout={getItemLayout}
                        style={[styles.carouselList, {height: carouselListHeight}]}
                        nestedScrollEnabled
                        initialNumToRender={cards.length}
                        decelerationRate="fast"
                    />
                </View>

                <View style={styles.belowCarousel}>
                    <View style={styles.dots}>
                        {cards.map((m, i) => (
                            <View
                                key={m.id}
                                style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
                            />
                        ))}
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={[styles.actionTouchable, {width: actionBtnWidth}]}
                            onPress={() =>
                                navigate('NoBottomStack', {
                                    screen: 'UserMITHubScreen',
                                    params: {index: 0},
                                })
                            }>
                            <LinearGradient
                                colors={AUTH_BUTTON_THEME.colors}
                                start={AUTH_BUTTON_THEME.start}
                                end={AUTH_BUTTON_THEME.end}
                                style={styles.mitBtn}>
                                <View style={styles.actionBtnRow}>
                                    <CustomIcon name="paper-plane-outline" type="ionicon" color={COLORS.WHITE} baseSize={20} />
                                    <View style={styles.actionTextBlock}>
                                        <Text style={styles.mitTitle} numberOfLines={2}>
                                            Send MIT
                                        </Text>
                                        <Text style={styles.mitSub} numberOfLines={2}>
                                            Make it count
                                        </Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[styles.actionTouchable, {width: actionBtnWidth}]}
                            onPress={() => navigation.navigate('ChatList')}>
                            <LinearGradient
                                colors={['rgba(0,189,244,0.35)', 'rgba(101,48,252,0.35)']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={styles.midChatGradientBorder}>
                                <View style={styles.midChatInner}>
                                    <View style={styles.actionBtnRow}>
                                        <CustomIcon
                                            name="chatbubble-ellipses-outline"
                                            type="ionicon"
                                            color={COLORS.WHITE}
                                            baseSize={22}
                                        />
                                        <View style={styles.actionTextBlock}>
                                            <Text style={styles.actionTitle} numberOfLines={2}>
                                                Send Chat
                                            </Text>
                                            <Text style={styles.actionSubLight} numberOfLines={2}>
                                                Break the ice
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
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
        paddingBottom: 40,
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
        backgroundColor: COLORS.TRANSPARENT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientTitleText: {
        ...FONTS.Title2,
        fontWeight: '800',
        color: COLORS.BLACK,
    },
    subtitle: {
        ...FONTS.paragraph1,
        color: COLORS.DARKGREY,
        marginTop: 8,
        fontStyle: 'italic',
    },
    carouselOuter: {
        marginHorizontal: -16,
        alignSelf: 'stretch',
    },
    carouselList: {
        flexGrow: 0,
    },
    carouselPage: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    belowCarousel: {
        alignSelf: 'stretch',
        width: '100%',
    },
    dots: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 20,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: COLORS.OVERLAY_WHITE_22,
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
        minHeight: SIZES.ScreenHeight * 0.62,
        flexDirection: 'column',
    },
    cardBgImage: {
        ...StyleSheet.absoluteFillObject,
    },
    cardBgGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    cardContentColumn: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bottomOverlay: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 18,
    },
    cardName: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
        fontWeight: '800',
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    gradientChipWrap: {
        alignSelf: 'flex-start',
        position: 'relative',
    },
    gradientChipContent: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    gradientChipSvg: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
    matchPillText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: '800',
        fontSize: 12,
        textTransform: 'lowercase',
    },
    archetypePillText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: '700',
        fontSize: 12,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        alignSelf: 'stretch',
        marginTop: 22,
        justifyContent: 'center',
    },
    actionTouchable: {
        minHeight: 72,
        borderRadius: 16,
        overflow: 'hidden',
    },
    midChatGradientBorder: {
        borderRadius: 16,
        padding: 1.5,
        width: '100%',
        minHeight: 72,
    },
    midChatInner: {
        backgroundColor: '#0b0828',
        borderRadius: 15,
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        width: '100%',
        minHeight: 69,
    },
    actionBtnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
    },
    actionTextBlock: {
        flexShrink: 1,
        justifyContent: 'center',
    },
    actionTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: '700',
        textAlign: 'left',
    },
    actionSub: {
        ...FONTS.paragraph1,
        color: COLORS.DARKGREY,
        marginTop: 2,
        fontSize: 11,
        textAlign: 'left',
    },
    actionSubLight: {
        ...FONTS.paragraph1,
        color: COLORS.OVERLAY_WHITE_72,
        marginTop: 2,
        fontSize: 11,
        textAlign: 'left',
    },
    mitBtn: {
        width: '100%',
        minHeight: 72,
        borderRadius: 16,
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    mitTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: '800',
        textAlign: 'left',
    },
    mitSub: {
        ...FONTS.paragraph1,
        color: COLORS.OVERLAY_WHITE_85,
        marginTop: 2,
        fontSize: 11,
        textAlign: 'left',
    },
});
