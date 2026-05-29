import React, {useCallback, useMemo, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Platform,
} from 'react-native';
import {useFocusEffect, useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import BackButton from '../../../../components/General/backbutton';
import AkcruButtons from '../../../../components/akcruButtons';
import AdCoinIcon from '../../../../components/AdCoinIcon/AdCoinIcon';
import useAuthStore from '../../../../stores/auth.store';
import {unlockMatches, UnlockOption} from '../../../../lib/api/flickflirt.lib';

/** Paywall accents (design spec) */
const ACCENT_PURPLE = '#A855F7';
const ACCENT_BLUE = '#3B82F6';
const GRADIENT = {
    colors: [ACCENT_PURPLE, ACCENT_BLUE] as const,
    start: {x: 0, y: 0.5},
    end: {x: 1, y: 0.5},
};

/** Footer: balance + Continue on one row */
const FOOTER_CONTINUE_BTN_WIDTH = Math.floor(SIZES.ScreenWidth * 0.5 - 18);

type Nav = NativeStackNavigationProp<NoBottomTabStackParams, 'FlickFlirtUnlockMatches'>;
type Route = RouteProp<NoBottomTabStackParams, 'FlickFlirtUnlockMatches'>;

function formatAd(n: number): string {
    return n.toLocaleString(undefined, {maximumFractionDigits: 0});
}

function taglineForDays(days: number): string {
    switch (days) {
        case 1:
            return 'Perfect for a quick peek';
        case 7:
            return 'More time. More matches. More chances.';
        case 30:
            return 'The full experience. No limits.';
        default:
            return 'Unlock and see everyone waiting for you.';
    }
}

function passTitle(days: number): string {
    return `${days} Day Pass`;
}

/** Hex color → rgba for soft radial “spread” halos behind icons */
function hexToRgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '');
    if (h.length !== 6) {
        return hex;
    }
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Concentric layers + shadow so the icon color appears to spread / bloom on the dark bar.
 */
function BenefitIconWithSpread({
    color,
    iconName,
    iconType,
    size = 28,
}: {
    color: string;
    iconName: string;
    iconType: string;
    size?: number;
}) {
    /** Wider container so outer halo can spread farther past the icon */
    const outerSpread = size + 42;
    const box = outerSpread + 8;
    /** Softer, lighter spread so halos don’t compete with the icon shape */
    const spreadLayers: {diameter: number; alpha: number}[] = [
        {diameter: outerSpread, alpha: 0.035},
        {diameter: size + 34, alpha: 0.055},
        {diameter: size + 18, alpha: 0.09},
        {diameter: size + 4, alpha: 0.14},
    ];

    const iconShadow =
        Platform.OS === 'ios'
            ? {
                  shadowColor: color,
                  shadowOffset: {width: 0, height: 0},
                  shadowOpacity: 0.38,
                  shadowRadius: 11,
              }
            : {elevation: 8, shadowColor: color};

    return (
        <View style={[styles.benefitSpreadBox, {width: box, height: box}]}>
            {spreadLayers.map(layer => (
                <View
                    key={`${layer.diameter}-${layer.alpha}`}
                    pointerEvents="none"
                    style={[
                        styles.benefitSpreadLayer,
                        {
                            width: layer.diameter,
                            height: layer.diameter,
                            borderRadius: layer.diameter / 2,
                            left: (box - layer.diameter) / 2,
                            top: (box - layer.diameter) / 2,
                            backgroundColor: hexToRgba(color, layer.alpha),
                        },
                    ]}
                />
            ))}
            <View
                style={[
                    styles.benefitSpreadIcon,
                    {
                        left: (box - size) / 2,
                        top: (box - size) / 2,
                        width: size,
                        height: size,
                    },
                    iconShadow,
                ]}>
                <Icon name={iconName} type={iconType} size={size} color={color} />
            </View>
        </View>
    );
}

function pickPopularTier(sorted: UnlockOption[]): number | undefined {
    if (sorted.length === 0) {
        return undefined;
    }
    const seven = sorted.find(o => o.durationDays === 7);
    if (seven) {
        return 7;
    }
    const mid = sorted[Math.floor((sorted.length - 1) / 2)];
    return mid?.durationDays;
}

const FlickFlirtUnlockMatches = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const {unlockOptions: rawOptions} = route.params;

    const hydrateUser = useAuthStore(s => s.hydrateUser);
    const walletBalance = useAuthStore(s => s.walletBalance);

    const sortedOptions = useMemo(
        () => [...rawOptions].sort((a, b) => a.durationDays - b.durationDays),
        [rawOptions],
    );

    const popularDays = useMemo(() => pickPopularTier(sortedOptions), [sortedOptions]);

    const defaultSelection = useMemo(() => {
        const seven = sortedOptions.find(o => o.durationDays === 7);
        return seven ?? sortedOptions[0] ?? null;
    }, [sortedOptions]);

    const [selected, setSelected] = useState<UnlockOption | null>(defaultSelection);
    const [submitting, setSubmitting] = useState(false);

    useFocusEffect(
        useCallback(() => {
            hydrateUser();
        }, [hydrateUser]),
    );

    const balanceNum = Number(walletBalance ?? '0');
    const balanceLabel = `${formatAd(Number.isFinite(balanceNum) ? balanceNum : 0)} AD`;

    const onContinue = async () => {
        if (!selected) {
            return;
        }
        const bal = Number(walletBalance ?? '0');
        const balanceOk = Number.isFinite(bal) ? bal : 0;
        if (balanceOk < selected.cost) {
            navigation.navigate('PurchaseAdScreen', {
                passCostAd: selected.cost,
                passDays: selected.durationDays,
                unlockOptions: rawOptions,
            });
            return;
        }
      navigation.navigate('UnlockingMatches', {durationDays: selected.durationDays});
    };

    if (sortedOptions.length === 0) {
        return (
            <SafeAreaView style={styles.safe}>
                <BackButton navigation={navigation} />
                <View style={styles.emptyWrap}>
                    <Text style={styles.emptyTitle}>No unlock options</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.emptyBtn}>
                        <Text style={styles.emptyBtnText}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <BackButton navigation={navigation} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Unlock your best matches ✨</Text>
                <Text style={styles.subtitle}>{"See who's waiting & connect at a deeper level."}</Text>

                <View style={styles.trustPill}>
                    <Icon name="shield-checkmark" type="ionicon" size={14} color={COLORS.OVERLAY_WHITE_85} />
                    <Text style={styles.trustPillText}>Secure · Private · Worth It</Text>
                </View>

                <View style={styles.cards}>
                    {sortedOptions.map(opt => {
                        const isPopular = popularDays === opt.durationDays;
                        const isSelected =
                            selected?.durationDays === opt.durationDays &&
                            selected?.cost === opt.cost;
                        const costColor = isPopular ? ACCENT_PURPLE : ACCENT_BLUE;

                        const iconName =
                            opt.durationDays <= 1
                                ? 'time-outline'
                                : opt.durationDays <= 7
                                  ? 'calendar-outline'
                                  : 'calendar-outline';
                        const iconTintHex = isPopular ? ACCENT_PURPLE : ACCENT_BLUE;
                        const iconSquareGradient = [
                            hexToRgba(iconTintHex, 0.72),
                            hexToRgba(iconTintHex, 0),
                            hexToRgba(iconTintHex, 0.72),
                        ];

                        const inner = (
                            <TouchableOpacity
                                style={styles.cardInner}
                                activeOpacity={0.85}
                                onPress={() => setSelected(opt)}>
                                {isPopular ? (
                                    <View style={styles.popularRibbon}>
                                        <Text style={styles.popularRibbonText}>MOST POPULAR</Text>
                                    </View>
                                ) : null}
                                <View style={[styles.cardRow, !isPopular && styles.cardRowTightTop]}>
                                    <LinearGradient
                                        colors={iconSquareGradient}
                                        locations={[0, 0.5, 1]}
                                        start={{x: 0, y: 0}}
                                        end={{x: 1, y: 1}}
                                        style={[
                                            styles.iconSquare,
                                            {borderColor: hexToRgba(iconTintHex, 0.5)},
                                        ]}>
                                        <Icon name={iconName} type="ionicon" size={22} color={COLORS.WHITE} />
                                    </LinearGradient>
                                    <View style={styles.cardCopy}>
                                        <Text style={styles.passTitle}>{passTitle(opt.durationDays)}</Text>
                                        <Text style={[styles.passCost, {color: costColor}]}>
                                            {formatAd(opt.cost)} AD
                                        </Text>
                                        <Text style={styles.passTag}>{taglineForDays(opt.durationDays)}</Text>
                                    </View>
                                    <View style={styles.radioOuter}>
                                        {isSelected ? (
                                            <LinearGradient {...GRADIENT} style={styles.radioGradient}>
                                                <Icon name="checkmark" type="ionicon" size={16} color={COLORS.WHITE} />
                                            </LinearGradient>
                                        ) : (
                                            <View style={styles.radioEmpty} />
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );

                        if (isSelected) {
                            return (
                                <LinearGradient
                                    key={`${opt.durationDays}-${opt.cost}`}
                                    {...GRADIENT}
                                    style={styles.cardGradientShell}>
                                    {inner}
                                </LinearGradient>
                            );
                        }

                        return (
                            <View key={`${opt.durationDays}-${opt.cost}`} style={styles.cardPlainShell}>
                                {inner}
                            </View>
                        );
                    })}
                </View>

                <View style={styles.benefitsBar}>
                    <View style={styles.benefitCol}>
                        <BenefitIconWithSpread
                            color={ACCENT_BLUE}
                            iconName="heart-multiple"
                            iconType="material-community"
                            size={28}
                        />
                        <Text style={styles.benefitBarText}>See your top matches</Text>
                    </View>
                    <View style={styles.benefitDivider} />
                    <View style={styles.benefitCol}>
                        <BenefitIconWithSpread
                            color={COLORS.PINK}
                            iconName="poll"
                            iconType="material-community"
                            size={28}
                        />
                        <Text style={styles.benefitBarText}>Higher match percentages</Text>
                    </View>
                    <View style={styles.benefitDivider} />
                    <View style={styles.benefitCol}>
                        <BenefitIconWithSpread
                            color={COLORS.PINK}
                            iconName="send"
                            iconType="material-community"
                            size={28}
                        />
                        <Text style={styles.benefitBarText}>Connect & send MITs</Text>
                    </View>
                </View>


            </ScrollView>


            <View style={styles.footer}>
                <View style={styles.footerRow}>
                    <View style={styles.balanceBlock}>
                        <Text style={styles.balanceLabel}>Your Balance</Text>
                        <View style={styles.balanceRow}>
                            <AdCoinIcon style={styles.adCoinBalanceSpacing} />
                            <Text style={styles.balanceValue} numberOfLines={1}>
                                {balanceLabel}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.continueWrap}>
                        <AkcruButtons.XlLrgButton
                            btnname="Continue"
                            onPress={onContinue}
                            color={COLORS.PURPLE}
                            variant="auth"
                            disabled={!selected}
                            loading={submitting}
                            authButtonWidth={FOOTER_CONTINUE_BTN_WIDTH}
                        />
                    </View>
                </View>
            </View>
             <View style={styles.secureFoot}>
                            <Icon name="lock-closed" type="ionicon" size={12} color={COLORS.OVERLAY_WHITE_45} />
                            <Text style={styles.secureFootText}>Your purchase is secure and encrypted</Text>
                        </View>
        </SafeAreaView>
    );
};

const CARD_RADIUS = 16;
const BORDER = 1.5;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.AKCRUBACKGROUND,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    title: {
        ...FONTS.Title1,
        fontSize: 22,
        color: COLORS.WHITE,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    subtitle: {
        ...FONTS.Title3,
        fontSize: 14,
        color: COLORS.OVERLAY_WHITE_55,
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    trustPill: {
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_22,
        marginBottom: 22,
    },
    trustPillText: {
        ...FONTS.paragraph2,
        color: COLORS.OVERLAY_WHITE_75,
        fontSize: 15,
    },
    cards: {
        gap: 12,
    },
    cardGradientShell: {
        borderRadius: CARD_RADIUS + 1,
        padding: BORDER,
    },
    cardPlainShell: {
        borderRadius: CARD_RADIUS,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_12,
        backgroundColor: 'rgba(8,8,28,0.6)',
        overflow: 'hidden',
    },
    cardInner: {
        borderRadius: CARD_RADIUS,
        backgroundColor: '#07071c',
        paddingVertical: 16,
        paddingHorizontal: 14,
        overflow: 'hidden',
    },
    popularRibbon: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 2,
        backgroundColor: ACCENT_PURPLE,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    popularRibbonText: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.WHITE,
        letterSpacing: 0.6,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
    },
    cardRowTightTop: {
        marginTop: 0,
    },
    iconSquare: {
        width: 60,
        height: 60,
        borderRadius: CARD_RADIUS,
        borderWidth: 1,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardCopy: {
        flex: 1,
        marginLeft: 12,
    },
    passTitle: {
        ...FONTS.Title2,
        fontSize: 19,
        color: COLORS.WHITE,
    },
    passCost: {
        ...FONTS.Title3,
        fontSize: 18,
        marginTop: 2,
        fontWeight: '700',
    },
    passTag: {
        ...FONTS.paragraph2,
        color: COLORS.OVERLAY_WHITE_45,
        marginTop: 4,
        fontSize: 14,
    },
    radioOuter: {
        marginLeft: 8,
    },
    radioGradient: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioEmpty: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: COLORS.OVERLAY_WHITE_25,
    },
    benefitsBar: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginTop: 12,
        marginBottom: 12,
        paddingTop: 12,
        paddingBottom: 18,
        paddingHorizontal: 8,
        borderRadius: 14,
        backgroundColor: 'rgba(8,8,20,0.92)',
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_08,
    },
    benefitCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    benefitSpreadBox: {
        marginBottom: 2,
        position: 'relative',
        alignSelf: 'center',
    },
    benefitSpreadLayer: {
        position: 'absolute',
    },
    benefitSpreadIcon: {
        position: 'absolute',
        zIndex: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    benefitDivider: {
        width: 0.2,
        alignSelf: 'center',
        height: '90%',
        backgroundColor: COLORS.OVERLAY_WHITE_16,
    },
    benefitBarText: {
        ...FONTS.paragraph2,
        fontSize: 11,
        lineHeight: 15,
        color: COLORS.OVERLAY_WHITE_92,
        textAlign: 'center',
    },
    secureFootDivider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: COLORS.OVERLAY_WHITE_14,
    },
    secureFoot: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 4,
    },
    secureFootText: {
        fontSize: 13,
        color: COLORS.OVERLAY_WHITE_40,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.OVERLAY_WHITE_08,
        backgroundColor: COLORS.AKCRUBACKGROUND,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    balanceBlock: {
        flex: 1,
        minWidth: 0,
        marginRight: 10,
    },
    balanceLabel: {
        ...FONTS.paragraph2,
        color: COLORS.OVERLAY_WHITE_45,
        fontSize: 15,
        marginBottom: 4,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adCoinBalanceSpacing: {
        marginRight: 8,
    },
    balanceValue: {
        ...FONTS.Title2,
        fontSize: 17,
        color: COLORS.WHITE,
        flexShrink: 1,
    },
    continueWrap: {
        flexShrink: 0,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    emptyWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyTitle: {...FONTS.Title2, fontSize: 18, color: COLORS.LIGHTGREY, marginBottom: 16},
    emptyBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: COLORS.PURPLE,
        borderRadius: 8,
    },
    emptyBtnText: {...FONTS.Title3, fontSize: 16, color: COLORS.WHITE},
});

export default FlickFlirtUnlockMatches;
