import React, {useState, useEffect, useCallback} from 'react';
import {View, ScrollView, SafeAreaView, ActivityIndicator, Modal, Text} from 'react-native';
import {useRoute, useNavigation, useFocusEffect} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import useAuthStore from '../../../stores/auth.store';
import {getUserWallet} from '../../../lib/api/wallet.lib';
import {findSeriesWithEpisodes, getSeasonPurchaseStatus, rentSeason, buySeason} from '../../../lib/api/series.lib';
import {getUserReactions} from '../../../lib/api/movies.lib';
import SeriesDetailCard from '../../../components/SeriesDetailCard';
import ContentPurchaseModal from '../../../components/ContentPurchaseModal';
import TabContainer from '../../../components/TabContainer/TabContainer';
import Header from '../../../components/header';
import {ISeries} from '../../../../types';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {COLORS} from '../../../../assets/constants';
import ComfirmationModal from '../../../components/ConfirmationModal';
import Orientation from 'react-native-orientation-locker';
import styles from './styles';

type SeriesDetailScreenRouteProp = RouteProp<NoBottomTabStackParams, 'SeriesDetailScreen'>;

export default function SeriesDetailScreen() {
    const route = useRoute<SeriesDetailScreenRouteProp>();
    const navigation = useNavigation();

    const [series, setSeries] = useState<ISeries | null>(null);
    const [isSeriesDataLoaded, setIsSeriesDataLoaded] = useState(false);

    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
    const [purchaseStatus, setPurchaseStatus] = useState<{
        active: boolean;
        purchaseType?: 'RENT' | 'BUY' | null;
        expireAt?: string | null;
    }>({active: false});
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [confirmAction, setConfirmAction] = useState<'rent' | 'buy' | null>(null);

    const [reactions, setReactions] = useState<string[]>([]);
    const rawBalance = useAuthStore(s => s.walletBalance);
    const setWalletBalance = useAuthStore(s => s.setWalletBalance);
    const balance = rawBalance != null ? Number(rawBalance) : 0;

    useFocusEffect(
        React.useCallback(() => {
            // Force portrait when this screen comes into focus
            Orientation.lockToPortrait();

            return () => {
                // Optional cleanup if needed
            };
        }, []),
    );

    // 1) load wallet & reactions once
    useEffect(() => {
        getUserWallet().then(b => {
            if (b !== undefined) setWalletBalance(b);
        });
        getUserReactions().then(r => Array.isArray(r) && setReactions(r));
    }, [setWalletBalance]);

    // 2) fetch entire series/package
    useEffect(() => {
        const load = async () => {
            const id = route.params?.id;
            if (!id) return;
            const s = await findSeriesWithEpisodes(id);
            if (s) {
                setSeries(s);
                setIsSeriesDataLoaded(true);
                setSelectedSeasonId(s.seasons[0].id);
            }
        };
        load();
    }, [route.params?.id]);

    // 3) refetch purchaseStatus helper
    const refetchSeasonStatus = useCallback(async () => {
        if (!selectedSeasonId) return;
        const status = await getSeasonPurchaseStatus(selectedSeasonId);
        setPurchaseStatus(status);
    }, [selectedSeasonId]);

    // 4) on focus
    useFocusEffect(
        useCallback(() => {
            refetchSeasonStatus();
        }, [refetchSeasonStatus]),
    );

    if (!series || !selectedSeasonId) {
        return (
            <TabContainer>
                <SafeAreaView style={styles.screenContainer}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                        <Text style={styles.helperText}>Loading series details...</Text>
                    </View>
                </SafeAreaView>
            </TabContainer>
        );
    }

    // 5) derive flags & costs
    const cur = series.seasons.find(s => s.id === selectedSeasonId)!;
    const rentable = cur.rentable;
    const buyable = cur.buyable;
    const rentCost = cur.rentalPrice != null ? Number(cur.rentalPrice) : 0;
    const buyCost = cur.buyPrice != null ? Number(cur.buyPrice) : 0;
    const rentalHours = cur.rentalDurationHrs;

    const alwaysFree = !rentable && !buyable;
    const unlocked = alwaysFree || purchaseStatus.active;

    const rentalLabel = rentable && rentalHours ? `${rentalHours}h rental for ${rentCost} AD` : undefined;
    const buyLabel = buyable ? `Buy the season for ${buyCost} AD` : undefined;

    const canRent = balance >= rentCost;
    const canBuy = balance >= buyCost;

    const primaryText = purchaseStatus.active
        ? 'Play'
        : alwaysFree
          ? 'Play for Free'
          : rentable && !buyable
            ? rentalLabel!
            : buyable && !rentable
              ? buyLabel!
              : 'Buy or Rent';

    // 6) helper to play first episode for the selected season
    const playFirstEpisode = () => {
        const ep = cur.episodes[0];
        if (!ep || !ep.id) {
            console.error('Episode or episode.id is missing:', ep);
            return;
        }

        navigation.navigate('EpisodePlayer', {
            seriesId: series.id,
            seasonId: cur.id,
            episodeId: ep.id,
        });
    };

    // 7) main button handler
    const handlePrimary = () => {
        if (!purchaseStatus.active && (rentable || buyable)) {
            setShowPurchaseModal(true);
        } else {
            playFirstEpisode();
        }
    };

    const handleRent = async () => {
        setShowPurchaseModal(false);
        setIsProcessing(true);
        const ok = await rentSeason(cur.id);
        setIsProcessing(false);
        if (ok) {
            // mark unlocked client‐side so they won’t pay again
            setPurchaseStatus({active: true, purchaseType: 'RENT', expireAt: null});
            playFirstEpisode();
        }
    };

    const handleBuy = async () => {
        setShowPurchaseModal(false);
        setIsProcessing(true);
        const ok = await buySeason(cur.id);
        setIsProcessing(false);
        if (ok) {
            setPurchaseStatus({active: true, purchaseType: 'BUY', expireAt: null});
            playFirstEpisode();
        }
    };

    return (
        <TabContainer>
            <SafeAreaView style={styles.screenContainer}>
                <ScrollView
                    stickyHeaderIndices={[0]}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    style={styles.screenContainer}>
                    <View style={styles.headerContainer}>
                        <Header />
                    </View>
                    {isSeriesDataLoaded ? (
                        <View style={styles.detailsCardContainer}>
                            <SeriesDetailCard
                                portraitURL={series.portraitURL}
                                title={series.title}
                                years={series.years}
                                yearsActive={series.yearsActive}
                                rated={series.rated}
                                rating={series.rating}
                                description={series.description}
                                actors={series.actors.map(a => a.name).join(', ')}
                                directors={series.director.map(d => d.name).join(', ')}
                                id={series.id}
                                seriesTrailerURL={series.seriesTrailerURL}
                                landscapeURL={series.landscapeURL}
                                seasons={series.seasons}
                                episodes={series.seasons.flatMap(s => s.episodes)}
                                genre1={series.genres[0]}
                                genre2={series.genres[1]}
                                reactions={reactions}
                                contentButtonName={isProcessing ? 'Processing…' : primaryText}
                                playSeries={handlePrimary}
                                onLockedPress={() => setShowPurchaseModal(true)}
                                selectedSeasonId={selectedSeasonId}
                                onSelectSeason={setSelectedSeasonId}
                                seasonUnlocked={unlocked}
                                onRent={handleRent}
                                onBuy={handleBuy}
                                rentalLabel={rentalLabel}
                                buyLabel={buyLabel}
                            />
                        </View>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                            <Text style={styles.helperText}>Loading series details...</Text>
                        </View>
                    )}
                </ScrollView>

                {/* only show if it’s still locked */}
                {!purchaseStatus.active && (rentable || buyable) && (
                    <ContentPurchaseModal
                        visible={showPurchaseModal}
                        onClose={() => setShowPurchaseModal(false)}
                        onRent={() => {
                            setShowPurchaseModal(false);
                            setConfirmAction('rent');
                        }}
                        onBuy={() => {
                            setShowPurchaseModal(false);
                            setConfirmAction('buy');
                        }}
                        rentalLabel={rentalLabel}
                        buyLabel={buyLabel}
                        canRent={canRent}
                        canBuy={canBuy}
                        rentalPrice={rentCost}
                        buyPrice={buyCost}
                        balance={balance}
                    />
                )}
                {confirmAction != null && (
                    <Modal
                        transparent
                        animationType="fade"
                        visible={confirmAction != null}
                        onRequestClose={() => setConfirmAction(null)}>
                        <ComfirmationModal
                            confirmationText={
                                confirmAction === 'rent'
                                    ? `Rent this season for ${rentCost} AD? This cannot be undone.`
                                    : `Buy this season for ${buyCost} AD? This cannot be undone.`
                            }
                            onPressYes={() => {
                                if (confirmAction === 'rent') handleRent();
                                else handleBuy();
                                setConfirmAction(null);
                            }}
                            onPressNo={() => {
                                setConfirmAction(null);
                            }}
                        />
                    </Modal>
                )}
            </SafeAreaView>
        </TabContainer>
    );
}
