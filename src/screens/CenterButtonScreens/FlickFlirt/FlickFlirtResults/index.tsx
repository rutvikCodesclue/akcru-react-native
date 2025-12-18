import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    SafeAreaView,
    FlatList,
    Alert,
    TouchableOpacity,
    Modal,
    ImageBackground,
    Platform,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import imageindex from '../../../../../assets/images/imageindex';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import styles from './styles'; // reuse same style module if it contains modal styles; else copy those blocks here
import {API} from '../../../../clients/api.client';
import {IUserProfile} from '../../../../../types';
import FlickFlirtMatchCard from '../../../../components/FlickFlirtMatchCard';
import AkcruButtons from '../../../../components/akcruButtons';
import {isTablet} from '../../../../../assets/constants/theme';
import {InterstitialAd, AdEventType, TestIds} from 'react-native-google-mobile-ads';
import useAuthStore from '../../../../stores/auth.store';
import {getMatches, unlockMatches, UnlockOption} from '../../../../lib/api/flickflirt.lib';
import { UserProfileStackParams } from '../../../../navigation/UserProfileStack';

type Nav = NativeStackNavigationProp<NoBottomTabStackParams>;

const FlickFlirtResults = () => {
    const navigation = useNavigation<Nav>();
    const {hydrateUser} = useAuthStore();

    const navi = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const [matches, setMatches] = useState<IUserProfile[]>([]);
    const [hiddenCount, setHiddenCount] = useState(0);
    const [unlocked, setUnlocked] = useState(false);
    const [unlockOptions, setUnlockOptions] = useState<UnlockOption[]>([]);
    const [loading, setLoading] = useState(true);

    // unlock modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState<UnlockOption | null>(null);

    // interstitial
    const [adLoaded, setAdLoaded] = useState(false);
    const interstitialRef = useRef<InterstitialAd | null>(null);
    const showOncePerFocusRef = useRef(false);

    const PROD_IDS = Platform.select({
        android: 'ca-app-pub-8264001768347242/2150819252',
        ios: 'ca-app-pub-8264001768347242/1708251538',
    });
    const interstitialUnitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_IDS;

    useEffect(() => {
        if (!interstitialUnitId) return;
        const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {requestNonPersonalizedAdsOnly: true});
        interstitialRef.current = ad;

        const offLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            // show only once per focus
            if (!showOncePerFocusRef.current) {
                showOncePerFocusRef.current = true;
                ad.show();
            }
        });
        const offClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            setAdLoaded(false);
        });
        const offError = ad.addAdEventListener(AdEventType.ERROR, () => setAdLoaded(false));

        ad.load();
        return () => {
            offLoaded();
            offClosed();
            offError();
            interstitialRef.current = null;
        };
    }, [interstitialUnitId]);

    useFocusEffect(
        React.useCallback(() => {
            // allow one show each time the screen is focused
            showOncePerFocusRef.current = false;

            // trigger load; LOADED handler will show it once
            interstitialRef.current?.load();

            return () => {};
        }, []),
    );

    // 
    const [phase, setPhase] = useState<'checking' | 'ready'>('checking');

    const load = async () => {
        const data = await getMatches();
        if (!data.success) throw new Error(data.message || 'Failed');
        setMatches(data.matches);
        setHiddenCount(data.hiddenCount);
        setUnlocked(data.unlocked);
        setUnlockOptions(data.unlockOptions);
    };

    const loadWithRetry = async () => {
        const waits = [300, 800, 1500];
        for (let i = 0; i < waits.length; i++) {
            try {
                await load();
                return;
            } catch {
                if (i < waits.length - 1) await new Promise(r => setTimeout(r, waits[i]));
            }
        }
        await load(); // last attempt throws to error boundary if you have one
    };

    useFocusEffect(
        React.useCallback(() => {
            let alive = true;
            setPhase('checking');
            (async () => {
                try {
                    await loadWithRetry();
                } finally {
                    if (alive) setPhase('ready');
                    hydrateUser();
                }
            })();
            return () => {
                alive = false;
            };
        }, [hydrateUser]),
    );

    /*fetch matches*/
    const fetchMatches = async () => {
        try {
            setLoading(true);
            const data = await getMatches();
            if (!data.success) {
                Alert.alert('Error', data.message || 'Could not load matches.');
                return;
            }
            setMatches(data.matches);
            setHiddenCount(data.hiddenCount);
            setUnlocked(data.unlocked);
            setUnlockOptions(data.unlockOptions);
        } catch (e) {
            Alert.alert('Error', 'Network error fetching matches.');
        } finally {
            setLoading(false);
        }
    };

    // Load on focus
    useFocusEffect(
        React.useCallback(() => {
            fetchMatches();
            hydrateUser();
        }, [hydrateUser]),
    );

    const openModal = () => {
        if (unlockOptions.length === 0) {
            Alert.alert('Error', 'No unlock options available.');
            return;
        }
        setSelectedOpt(unlockOptions[0]);
        setModalVisible(true);
    };

    const confirmUnlock = async () => {
        if (!selectedOpt) return;
        setModalVisible(false);
        try {
            const data = await unlockMatches(selectedOpt.durationDays);
            if (!data.success) {
                Alert.alert('Unable to Unlock', data.message);
                return;
            }
            // merge new matches
            setMatches(prev => {
                const seen = new Set(prev.map(m => m.id));
                return [...prev, ...data.matches.filter(m => !seen.has(m.id))];
            });
            setHiddenCount(0);
            setUnlocked(true);
            hydrateUser();
        } catch (e) {
            Alert.alert('Error', 'Network error during unlock.');
        }
    };

    return (
        <View>
            <ImageBackground
                source={imageindex.FLickFlirt}
                resizeMode="cover"
                style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                <SafeAreaView style={{flex: 1}}>
                    <LinearGradient
                        colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                        style={{position: 'absolute', left: 0, right: 0, top: 0, height: SIZES.ScreenHeight}}
                    />
                    <Header />
                    <BackButton navigation={navigation} />

                    <View style={{flex: 1, marginLeft: '3%', marginRight: '3%', paddingBottom: 150}}>
                        {loading ? (
                            <Text
                                style={[
                                    FONTS.Title3,
                                    {color: COLORS.LIGHTGREY, textAlign: 'center', marginTop: '40%'},
                                ]}>
                                Loading matches…
                            </Text>
                        ) : matches.length > 0 ? (
                            <FlatList
                                data={matches}
                                numColumns={2}
                                keyExtractor={item => item.id}
                                ListHeaderComponent={() => (
                                    <Text
                                        style={[
                                            FONTS.Title3,
                                            {
                                                color: COLORS.LIGHTGREY,
                                                textAlign: 'center',
                                                marginBottom: 10,
                                                marginTop: isTablet() ? '20%' : '40%',
                                            },
                                        ]}>
                                        You have matches.
                                    </Text>
                                )}
                                renderItem={({item}) => (
                                    <View style={{marginVertical: 5}}>
                                        <FlickFlirtMatchCard
                                            userPicture={item.profilePicture}
                                            userName={item.username}
                                            onPress={() => navi.navigate('ViewUserScreen', {userID: item.id})}
                                            influencer={false}
                                            akcruBadge={item.badge}
                                            userDesc={item.description}
                                            matchLabel={item.matchLabel}
                                        />
                                    </View>
                                )}
                            />
                        ) : (
                            <View style={{alignItems: 'center', marginTop: '40%'}}>
                                <Text
                                    style={[
                                        FONTS.Title3,
                                        {color: COLORS.LIGHTGREY, textAlign: 'center', marginBottom: 20},
                                    ]}>
                                    You have no matches.
                                </Text>
                                <AkcruButtons.XlLrgButton
                                    btnname="Go To Start"
                                    onPress={() => navigation.navigate('FlickFlirtScreen')}
                                    color={COLORS.PURPLE}
                                />
                            </View>
                        )}
                    </View>

                    {/* Bottom actions */}
                    <View style={{position: 'absolute', bottom: '15%', alignSelf: 'center'}}>
                        {!unlocked && hiddenCount > 0 && (
                            <View style={styles.unlockWrapper}>
                                <Text style={styles.unlockText}>
                                    {hiddenCount} more {hiddenCount > 1 ? 'matches' : 'match'} locked
                                </Text>
                                <AkcruButtons.XlLrgButton
                                    btnname="Unlock Matches"
                                    onPress={openModal}
                                    color={COLORS.PURPLE}
                                />
                            </View>
                        )}
                        <View style={styles.gotToStartWrapper}>
                            <AkcruButtons.XlLrgButton
                                btnname="Go To Start"
                                onPress={() => navigation.navigate('FlickFlirtScreen')}
                                color={COLORS.PURPLE}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </ImageBackground>

            {/* Unlock modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Unlock All Matches</Text>
                        <Text style={styles.modalLabel}>Choose an option:</Text>
                        {unlockOptions.map(opt => (
                            <TouchableOpacity
                                key={opt.durationDays}
                                style={[
                                    styles.optionRow,
                                    selectedOpt?.durationDays === opt.durationDays && styles.optionRowSelected,
                                ]}
                                onPress={() => setSelectedOpt(opt)}>
                                <Text style={styles.optionText}>
                                    {opt.durationDays} days — {opt.cost} AD
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={confirmUnlock}>
                                <Text style={styles.modalBtnText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default FlickFlirtResults;
