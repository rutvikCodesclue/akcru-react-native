import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Pressable,
    Modal,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {Icon} from '@rneui/base';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useHideBottomTabBarWhileFocused} from '../../ChatScreens/useHideBottomTabBarWhileFocused';
import {navigate} from '../../../util/RootNavigation';
import {startPpvMoviePlayback} from '../../../lib/ppvPlaybackFlow';
import {rentMovie} from '../../../lib/api/movies.lib';
import purchaseStyles from './ppvPurchaseStyles';
import {
    formatPpvRentConfirmationText,
    formatScreeningAccessHeading,
    getPpvMovieHeroUri,
    getPpvPriceDisplay,
    getRentalDurationHrs,
} from './ppvHelpers';
import imageindex from '../../../../assets/images/imageindex';
import {getAdPacks, AdPackInfo} from '../../../lib/api/adPurchase.lib';
import {
    AdPackPurchaseResponse,
    confirmAdPackPurchase,
    findAdPackForRentPrice,
    formatUsdPrice,
    onPackPurchasePress,
    parseRentPriceAmount,
    PPV_FALLBACK_USD_PRICE,
    convertRentPriceToUsdDecimal,
} from '../../../lib/adPackPurchaseFlow';
import useAuthStore from '../../../stores/auth.store';
import ConfirmationModal from '../../../components/ConfirmationModal';
import {COLORS} from '../../../../assets/constants';

type Props = StackScreenProps<UserProfileStackParams, 'PpvPurchaseScreen'>;

const fallbackThumbnail = imageindex.Thriller;

function logPpvPurchaseResponse(response: AdPackPurchaseResponse): void {
    console.log('[PpvPurchaseScreen] purchase response:', JSON.stringify(response, null, 2));
}

export default function PpvPurchaseScreen({navigation, route}: Props) {
    useHideBottomTabBarWhileFocused(navigation);

    const hydrateUser = useAuthStore(s => s.hydrateUser);

    const {movie, screeningWindowLabel} = route.params;

    const [ppvPack, setPpvPack] = useState<AdPackInfo | null>(null);
    const [selectedPack, setSelectedPack] = useState<AdPackInfo | null>(null);
    const [loadingPack, setLoadingPack] = useState(true);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [purchaseInProgress, setPurchaseInProgress] = useState(false);
    const [heroImageFailed, setHeroImageFailed] = useState(false);

    const rentalDurationHrs = useMemo(() => getRentalDurationHrs(movie), [movie]);
    const screeningAccessHeading = useMemo(
        () => formatScreeningAccessHeading(rentalDurationHrs),
        [rentalDurationHrs],
    );
    const heroUri = useMemo(() => getPpvMovieHeroUri(movie), [movie]);
    const heroSource = useMemo(() => {
        if (!heroUri || heroImageFailed) {
            return fallbackThumbnail;
        }
        return {uri: heroUri};
    }, [heroUri, heroImageFailed]);

    useEffect(() => {
        setHeroImageFailed(false);
    }, [heroUri]);

    useEffect(() => {
        if (movie.isPurchaseAd) {
            setPpvPack(null);
            setLoadingPack(false);
            return;
        }

        setLoadingPack(true);
        getAdPacks()
            .then(packs => {
                const matchedPack = findAdPackForRentPrice(
                    packs,
                    movie.rentalPrice ?? movie.price ?? null,
                );
                setPpvPack(matchedPack ?? null);
                if (!matchedPack) {
                    console.warn('[PpvPurchaseScreen] No RevenueCat pack available for rent price');
                }
            })
            .catch(err => {
                console.error('[PpvPurchaseScreen] Failed to load AD packs:', err);
                Alert.alert('Error', 'Could not load purchase options. Please try again.');
            })
            .finally(() => setLoadingPack(false));
    }, [movie.isPurchaseAd, movie.price, movie.rentalPrice]);

    const priceDisplay = useMemo(() => {
        if (movie.isPurchaseAd) {
            return getPpvPriceDisplay(movie);
        }
        if (ppvPack?.priceUSD != null && ppvPack.priceUSD > 0) {
            return formatUsdPrice(ppvPack.priceUSD);
        }
        const rawAmount = parseRentPriceAmount(movie.rentalPrice ?? movie.price);
        if (rawAmount > 0) {
            return formatUsdPrice(convertRentPriceToUsdDecimal(rawAmount));
        }
        return formatUsdPrice(PPV_FALLBACK_USD_PRICE);
    }, [movie, ppvPack]);

    const rentConfirmationText = useMemo(() => formatPpvRentConfirmationText(movie), [movie]);

    const handlePayPress = useCallback(() => {
        if (purchaseInProgress) {
            return;
        }

        if (movie.isPurchaseAd) {
            setConfirmVisible(true);
            return;
        }

        if (!ppvPack) {
            return;
        }

        onPackPurchasePress(ppvPack, {
            selectTier: setSelectedPack,
            showConfirm: () => setConfirmVisible(true),
        });
    }, [movie.isPurchaseAd, ppvPack, purchaseInProgress]);

    const handleConfirmPurchase = useCallback(async () => {
        setConfirmVisible(false);
        setPurchaseInProgress(true);

        try {
            if (movie.isPurchaseAd) {
                const rented = await rentMovie(movie.id);
                if (!rented) {
                    Alert.alert(
                        'Purchase Failed',
                        'Could not complete rental. Please check your AD balance and try again.',
                    );
                    return;
                }

                await hydrateUser();
                startPpvMoviePlayback(movie, navigation);
                return;
            }

            const pack = selectedPack ?? ppvPack;
            if (!pack) {
                Alert.alert('Error', 'Purchase option unavailable. Please try again.');
                return;
            }

            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Alert.alert('Purchase In Progress', 'Please follow the in-app purchase prompts.');
            }

            const response = await confirmAdPackPurchase(pack, {
                hydrateUser,
                navigate: (screen, params) => {
                    navigate('NoBottomStack', {screen, params});
                },
            });

            logPpvPurchaseResponse(response);

            if (response.status !== 'success') {
                Alert.alert(
                    'Purchase Failed',
                    response.errorMessage ?? 'Some issue occurred during purchase. Please try again later.',
                );
                return;
            }

            if (response.transactionId) {
                startPpvMoviePlayback(movie, navigation);
            }
        } finally {
            setPurchaseInProgress(false);
        }
    }, [hydrateUser, movie, navigation, ppvPack, selectedPack]);

    const payDisabled =
        purchaseInProgress || (!movie.isPurchaseAd && (loadingPack || !ppvPack));

    return (
        <SafeAreaView style={purchaseStyles.safeArea}>
            <View style={purchaseStyles.header}>
                <View style={purchaseStyles.headerRow}>
                    <TouchableOpacity
                        style={purchaseStyles.backButton}
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                        accessibilityLabel="Go back">
                        <Icon name="chevron-back" type="ionicon" size={28} color={COLORS.WHITE} />
                    </TouchableOpacity>
                    <View style={purchaseStyles.headerCopy}>
                        <Text style={purchaseStyles.unlockTitle}>UNLOCK ACCESS</Text>
                        <Text style={purchaseStyles.unlockSubtitle}>TO THE EXCLUSIVE SCREENING</Text>
                    </View>
                    <View style={purchaseStyles.headerSpacer} />
                </View>
            </View>

            <View style={purchaseStyles.screenBody}>
                <View style={purchaseStyles.contentArea}>
                    <View style={purchaseStyles.heroSection}>
                        <Image
                            source={heroSource}
                            style={purchaseStyles.heroImage}
                            resizeMode="contain"
                            onError={() => setHeroImageFailed(true)}
                        />
                    </View>

                    <View style={purchaseStyles.screeningBox}>
                        <View style={purchaseStyles.screeningIconWrap}>
                            <Icon name="time-outline" type="ionicon" size={20} color={COLORS.CATREDLGT} />
                        </View>
                        <View style={purchaseStyles.screeningCopy}>
                            <View style={purchaseStyles.screeningHeadingRow}>
                                <Text style={purchaseStyles.screeningHeading}>{screeningAccessHeading} </Text>
                                <Text style={purchaseStyles.screeningHeadingAccent}>ACCESS</Text>
                            </View>
                            <Text style={purchaseStyles.screeningDates}>{screeningWindowLabel}</Text>
                            <Text style={purchaseStyles.screeningHint}>Watch anytime during the window.</Text>
                        </View>
                    </View>
                </View>

                <View style={purchaseStyles.bottomFooter}>
                    <Text style={purchaseStyles.priceAmount}>{priceDisplay}</Text>

                    <Pressable
                        style={[purchaseStyles.applePayButton, payDisabled && {opacity: 0.5}]}
                        accessibilityRole="button"
                        accessibilityLabel="Pay with Apple Pay"
                        disabled={payDisabled}
                        onPress={handlePayPress}>
                        {purchaseInProgress ? (
                            <ActivityIndicator size="small" color={COLORS.BLACK} />
                        ) : (
                            <>
                                <Icon name="logo-apple" type="ionicon" size={22} color={COLORS.BLACK} />
                                <Text style={purchaseStyles.applePayLabel}>Pay</Text>
                            </>
                        )}
                    </Pressable>

                    <Text style={purchaseStyles.legalText}>
                        By continuing, you agree to our{' '}
                        <Text style={purchaseStyles.legalLink}>Terms of Service</Text> and{' '}
                        <Text style={purchaseStyles.legalLink}>Privacy Policy.</Text>
                    </Text>
                </View>
            </View>

            <Modal transparent visible={confirmVisible} animationType="fade">
                <ConfirmationModal
                    onPressYes={handleConfirmPurchase}
                    onPressNo={() => setConfirmVisible(false)}
                    variant="continueWatching"
                    yesLabel="Confirm"
                    noLabel="Cancel"
                    confirmationText={rentConfirmationText}
                />
            </Modal>
        </SafeAreaView>
    );
}
