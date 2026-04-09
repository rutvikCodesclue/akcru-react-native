import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Platform,
    ScrollView,
} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../../../assets/constants';
import BackButton from '../../../components/General/backbutton';
import AkcruButtons from '../../../components/akcruButtons';
import {getAdPacks, purchaseAD, purchaseADInApp, AdPackInfo} from '../../../lib/api/adPurchase.lib';
import {GoldenCoinCoins} from '../../../../assets/svg';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import useAuthStore from '../../../stores/auth.store';
import {UnlockOption} from '../../../lib/api/flickflirt.lib';
import {navigationRef} from '../../../util/RootNavigation';
import AdCoinIcon from '../../../components/AdCoinIcon/AdCoinIcon';

const ACCENT_PURPLE = '#BF5AF2';
const ACCENT_BLUE = '#0A84FF';
const BEST_VALUE_ORANGE = '#FF9F0A';

const CARD_RADIUS = 14;

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

function formatAd(n: number): string {
    return n.toLocaleString(undefined, {maximumFractionDigits: 0});
}

function tierRibbon(tier: string): {label: string; color: string} | null {
    switch (tier) {
        case 'MICRO':
            return {label: 'BEST TO START', color: hexToRgba(ACCENT_PURPLE, 0.5)};
        case 'STARTER':
            return {label: 'POPULAR', color: hexToRgba(ACCENT_BLUE, 0.5)};
        case 'BOOSTER':
            return {label: 'BEST VALUE', color: hexToRgba(BEST_VALUE_ORANGE, 0.5)};
        default:
            return null;
    }
}

function packTagline(tier: string): string {
    switch (tier) {
        case 'MICRO':
            return 'Perfect for a quick unlock';
        case 'STARTER':
            return 'Get started. Unlock 7-day access.';
        case 'BOOSTER':
            return 'More matches. Better connections.';
        case 'ELITE':
            return 'More matches, more possibilities.';
        case 'WHALE':
            return 'For the dedicated.';
        case 'ULTRA':
            return 'Unlimited possibilities.';
        default:
            return 'Boost your Akcru balance.';
    }
}

type PurchaseAdRouteParams = {
    passCostAd?: number;
    passDays?: number;
    unlockOptions?: UnlockOption[];
};

export default function PurchaseAdScreen() {
    const navigation = useNavigation<StackNavigationProp<NoBottomTabStackParams>>();
    const route = useRoute();
    const {passCostAd, passDays, unlockOptions} = (route.params ?? {}) as PurchaseAdRouteParams;

    const hydrateUser = useAuthStore(s => s.hydrateUser);
    const walletBalance = useAuthStore(s => s.walletBalance);

    const [tiers, setTiers] = useState<AdPackInfo[]>([]);
    const [loadingTiers, setLoadingTiers] = useState(true);
    const [selectedTier, setSelectedTier] = useState<AdPackInfo | null>(null);
    const [confirmVisible, setConfirmVis] = useState(false);
    const [purchaseInProgress, setPurchaseInProgress] = useState(false);

    useFocusEffect(
        useCallback(() => {
            hydrateUser();
        }, [hydrateUser]),
    );

    useEffect(() => {
        getAdPacks()
            .then(data => {
                setTiers(data);
                const micro = data.find(t => t.tier === 'MICRO');
                setSelectedTier(micro ?? data[0] ?? null);
            })
            .catch(err => {
                console.error('Failed to load AD bundles:', err);
                Alert.alert('Error', 'Could not load purchase options');
            })
            .finally(() => setLoadingTiers(false));
    }, []);

    const balanceNum = Number(walletBalance ?? '0');
    const balanceSafe = Number.isFinite(balanceNum) ? balanceNum : 0;
    const balanceLabel = `${formatAd(balanceSafe)} AD`;

    const shortfall = useMemo(() => {
        if (passCostAd == null || !Number.isFinite(passCostAd)) {
            return null;
        }
        return Math.max(0, passCostAd - balanceSafe);
    }, [passCostAd, balanceSafe]);

    const passTitle =
        passDays != null && passDays > 0 ? `${passDays} Day Pass` : 'your pass';

    const onPackPurchasePress = (tier: AdPackInfo) => {
        setSelectedTier(tier);
        setConfirmVis(true);
    };

    const confirmPurchase = async () => {
        setConfirmVis(false);
        if (!selectedTier) {
            return;
        }

        setPurchaseInProgress(true);
        try {
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Alert.alert('Purchase In Progress', 'Please follow the in-app purchase prompts.');
                const txId = await purchaseADInApp(selectedTier.tier);
                if (txId) {
                    await hydrateUser();
                    Alert.alert('Purchase Successful', 'Thank you for your purchase of AD!');
                }
            } else {
                const checkoutUrl = await purchaseAD(selectedTier.tier);
                navigation.navigate('StripeWebCheckout', {checkoutUrl});
            }
        } catch (err: any) {
            console.error('Checkout session error:', err);
            Alert.alert('Purchase Failed', 'Some issue occurred during purchase. Please try again later.');
        } finally {
            setPurchaseInProgress(false);
        }
    };

    const onWhyPassPress = () => {
        if (unlockOptions && unlockOptions.length > 0) {
            navigation.navigate('FlickFlirtUnlockMatches', {unlockOptions});
        }
    };

    /** Safe back: default BackButton can call invalid routes when stack depth is 1; fall back to app home. */
    const handlePurchaseBack = useCallback(() => {
        try {
            if (navigation.canGoBack()) {
                navigation.goBack();
                return;
            }
        } catch {
            // fall through to home
        }

        const routeNames = navigation.getState()?.routeNames as string[] | undefined;
        const navAny = navigation as unknown as {navigate: (name: string, params?: object) => void};

        if (routeNames?.includes('ClientTabNavigator')) {
            navAny.navigate('ClientTabNavigator');
            return;
        }
        if (routeNames?.includes('HomeScreen')) {
            navAny.navigate('HomeScreen');
            return;
        }

        if (navigationRef.isReady()) {
            navigationRef.navigate('ClientTabNavigator');
        }
    }, [navigation]);

    return (
        <TabContainer style={styles.tabWrap}>
            <SafeAreaView style={styles.safe}>
                <BackButton navigation={navigation} onBack={handlePurchaseBack} />

                {loadingTiers ? (
                    <View style={styles.loaderWrap}>
                        <ActivityIndicator size="large" color={ACCENT_PURPLE} />
                    </View>
                ) : (
                    <View style={styles.contentColumn}>
                    <View style={styles.headerTrustBlock}>
                        <View style={styles.headerTitleRow}>
                                <Text style={styles.title}>Get Akcru Dollars</Text>
                            <AdCoinIcon size="small" />
                        </View>
                        <Text style={styles.subtitle}>
                            {passCostAd != null
                                ? 'You need more AD to unlock your matches.'
                                : 'Add Akcru Dollars to your wallet — use them across the app.'}
                        </Text>

                        <View style={styles.trustRow}>
                            <View style={styles.trustPill}>
                                <Icon name="lock-closed" type="ionicon" size={14} color="rgba(255,255,255,0.85)" />
                                <Text style={styles.trustPillText}>Secure Payment</Text>
                            </View>
                            <View style={styles.trustPill}>
                                <Icon name="flash" type="ionicon" size={14} color="rgba(255,255,255,0.85)" />
                                <Text style={styles.trustPillText}>Instant Delivery</Text>
                            </View>
                        </View>
                    </View>

                    <ScrollView
                        style={styles.scrollFlex}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled">
                        <View style={styles.cards}>
                            {tiers.map(t => {
                                const ribbon = tierRibbon(t.tier);
                                const isMicro = t.tier === 'MICRO';
                                const isSelected = selectedTier?.tier === t.tier;
                                const inner = (
                                    <TouchableOpacity
                                        style={[
                                            styles.cardInner,
                                            (isMicro || isSelected) && styles.cardInnerMicro,
                                            !isSelected && styles.cardInnerUnselectedOutline,
                                        ]}
                                        activeOpacity={0.85}
                                        onPress={() => setSelectedTier(t)}>
                                        <View style={styles.cardRow}>
                                            <View style={styles.coinStack}>
                                                <GoldenCoinCoins width={50} height={70} />
                                            </View>
                                            <View style={styles.cardCopy}>
                                                <Text style={styles.packName}>{t.label}</Text>
                                                <Text style={styles.packAd}>{formatAd(t.adGiven)} AD</Text>
                                                <Text style={styles.packTag}>{packTagline(t.tier)}</Text>
                                            </View>
                                            <View style={styles.priceTagRow}>
                                                {ribbon ? (
                                                    <View
                                                        style={[styles.ribbonBeside, {backgroundColor: ribbon.color}]}>
                                                        <Text
                                                            style={styles.ribbonText}
                                                            numberOfLines={1}
                                                            adjustsFontSizeToFit
                                                            minimumFontScale={0.75}>
                                                            {ribbon.label}
                                                        </Text>
                                                    </View>
                                                ) : null}
                                                <TouchableOpacity
                                                    style={styles.priceBtn}
                                                    onPress={() => onPackPurchasePress(t)}
                                                    activeOpacity={0.85}>
                                                    <Text style={styles.priceBtnText}>${t.priceUSD.toFixed(2)}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );

                                if (isSelected) {
                                    return (
                                        <LinearGradient
                                            key={t.tier}
                                            colors={[ACCENT_PURPLE, ACCENT_BLUE]}
                                            start={{x: 0, y: 0.5}}
                                            end={{x: 1, y: 0.5}}
                                            style={styles.cardGradientShell}>
                                            {inner}
                                        </LinearGradient>
                                    );
                                }

                                return (
                                    <View key={t.tier} style={styles.cardPlainShell}>
                                        {inner}
                                    </View>
                                );
                            })}
                        </View>

                        {passDays != null && passDays > 0 ? (
                            <TouchableOpacity
                                style={styles.whyPassCard}
                                onPress={onWhyPassPress}
                                activeOpacity={0.88}
                                disabled={!unlockOptions || unlockOptions.length === 0}>
                                <View style={styles.whyPassLeft}>
                                    <View style={styles.whyCalWrap}>
                                        <Icon name="calendar" type="ionicon" size={22} color={COLORS.WHITE} />
                                    </View>
                                    <View style={styles.whyPassCopy}>
                                        <Text style={styles.whyPassTitle}>
                                            {passDays === 7 ? 'Why 7 Day Pass?' : `Why ${passDays} Day Pass?`}
                                        </Text>
                                        <Text style={styles.whyPassSub}>More time. More matches. More chances.</Text>
                                    </View>
                                </View>
                                <View style={styles.whyPassArrow}>
                                    <Icon name="chevron-forward" type="ionicon" size={20} color={ACCENT_BLUE} />
                                </View>
                            </TouchableOpacity>
                        ) : null}


                    </ScrollView>

                    <View style={styles.balanceBarOuter}>
                        <View style={styles.balanceBar}>
                            <View style={styles.balanceCol}>
                                <Text style={styles.balanceLabel}>Your Balance</Text>
                                <View style={styles.balanceRow}>
                                    <AdCoinIcon style={styles.adCoinBalanceSpacing} />
                                    <Text style={styles.balanceValue} numberOfLines={1}>
                                        {balanceLabel}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.balanceDivider} />
                            <View style={[styles.balanceCol, styles.balanceColRight]}>
                                {shortfall != null && shortfall > 0 ? (
                                    <Text style={styles.needMore}>
                                        Need {formatAd(shortfall)} AD more to unlock {passTitle}
                                    </Text>
                                ) : shortfall === 0 && passCostAd != null ? (
                                    <Text style={styles.needMore}>You have enough AD to unlock {passTitle}</Text>
                                ) : (
                                    <Text style={styles.needMore}>
                                        Use AD for matches, gifts, and premium features.
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                      <View style={styles.secureFoot}>
                                                <Icon name="lock-closed" type="ionicon" size={12} color="rgba(255,255,255,0.45)" />
                                                <Text style={styles.secureFootText}>Your purchase is secure and encrypted</Text>
                                            </View>
                    </View>
                )}

                <Modal transparent visible={confirmVisible} animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>
                                Confirm purchase of {selectedTier?.adGiven.toLocaleString()} AD for $
                                {selectedTier?.priceUSD.toFixed(2)}? (All sales are final — no refunds)
                            </Text>
                            <View style={styles.modalActions}>
                                <AkcruButtons.SmallButton
                                    btnname="Cancel"
                                    onPress={() => setConfirmVis(false)}
                                    color={COLORS.AKCRUBLUE}
                                />
                                <AkcruButtons.SmallButton
                                    btnname="Confirm"
                                    onPress={confirmPurchase}
                                    color={COLORS.CATPURPLGT}
                                    disabled={purchaseInProgress}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </TabContainer>
    );
}

const styles = StyleSheet.create({
    tabWrap: {
        flex: 1,
        backgroundColor: '#000000',
    },
    safe: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loaderWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentColumn: {
        flex: 1,
    },
    headerTrustBlock: {
        paddingHorizontal: 20,
        backgroundColor: '#000000',
    },
    scrollFlex: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    balanceBarOuter: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#000000',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 8,
    },
    title: {
        ...FONTS.Title1,
        fontSize: 22,
        color: COLORS.WHITE,
    },
    adCoinBalanceSpacing: {
        marginRight: 8,
    },
    subtitle: {
        ...FONTS.Title3,
        fontSize: 14,
        color: 'rgba(255,255,255,0.55)',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    trustRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 22,
    },
    trustPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    trustPillText: {
        ...FONTS.paragraph2,
        color: 'rgba(255,255,255,0.75)',
        fontSize: 13,
    },
    cards: {
        gap: 12,
    },
    cardGradientShell: {
        borderRadius: CARD_RADIUS + 1,
        padding: 1.5,
    },
    cardPlainShell: {
        borderRadius: CARD_RADIUS + 1,
        padding: 1.5,
        backgroundColor: 'rgba(18,18,28,0.95)',
        overflow: 'hidden',
    },
    cardInner: {
        borderRadius: CARD_RADIUS,
        backgroundColor: '#0a0a12',
        paddingVertical: 14,
        paddingHorizontal: 12,
        overflow: 'hidden',
        minHeight: 100,
        justifyContent: 'center',
    },
    cardInnerUnselectedOutline: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    cardInnerMicro: {
        backgroundColor: '#07071c',
    },
    priceTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginLeft: 8,
        flexShrink: 0,
    },
    ribbonBeside: {
        paddingHorizontal: 6,
        paddingVertical: 5,
        borderRadius: 6,
        maxWidth: 104,
        justifyContent: 'center',
    },
    ribbonText: {
        fontSize: 9,
        fontWeight: '800',
        color: COLORS.WHITE,
        letterSpacing: 0.35,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coinStack: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardCopy: {
        flex: 1,
        marginLeft: 12,
        minWidth: 0,
    },
    packName: {
        ...FONTS.Title2,
        fontSize: 16,
        color: COLORS.WHITE,
        fontWeight: '700',
    },
    packAd: {
        ...FONTS.Title3,
        fontSize: 16,
        color: ACCENT_PURPLE,
        fontWeight: '700',
        marginTop: 2,
    },
    packTag: {
        ...FONTS.paragraph2,
        color: 'rgba(255,255,255,0.45)',
        marginTop: 4,
        fontSize: 13,
    },
    priceBtn: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: 'rgba(44,44,46,0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    priceBtnText: {
        ...FONTS.Title3,
        fontSize: 15,
        color: COLORS.WHITE,
        fontWeight: '700',
    },
    balanceBar: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginTop: 0,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: CARD_RADIUS,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    balanceCol: {
        flex: 1,
        justifyContent: 'center',
    },
    balanceColRight: {
        paddingLeft: 4,
    },
    balanceDivider: {
        width: 1,
        alignSelf: 'stretch',
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 10,
    },
    balanceLabel: {
        ...FONTS.paragraph2,
        color: 'rgba(255,255,255,0.45)',
        fontSize: 13,
        marginBottom: 6,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceValue: {
        ...FONTS.Title2,
        fontSize: 17,
        color: COLORS.WHITE,
        flexShrink: 1,
    },
    needMore: {
        ...FONTS.paragraph2,
        color: 'rgba(255,255,255,0.55)',
        fontSize: 13,
        lineHeight: 18,
    },
    whyPassCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        padding: 14,
        borderRadius: CARD_RADIUS,
        borderWidth: 1.5,
        borderColor: 'rgba(10,132,255,0.45)',
        backgroundColor: 'rgba(10,132,255,0.08)',
    },
    whyPassLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    whyCalWrap: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: ACCENT_PURPLE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    whyPassCopy: {
        marginLeft: 12,
        flex: 1,
    },
    whyPassTitle: {
        ...FONTS.Title2,
        fontSize: 16,
        color: COLORS.WHITE,
    },
    whyPassSub: {
        ...FONTS.paragraph2,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
        fontSize: 13,
    },
    whyPassArrow: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(10,132,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secureFoot: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 0,
        marginBottom: 8,
    },
    secureFootText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        padding: 20,
        borderRadius: 12,
        width: '85%',
    },
    modalTitle: {
        textAlign: 'center',
        ...FONTS.Title2,
        color: COLORS.WHITE,
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: 16,
        justifyContent: 'space-between',
    },
});
