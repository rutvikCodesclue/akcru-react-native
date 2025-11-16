import {View, Text, SafeAreaView, FlatList, Alert, Modal, TouchableOpacity, Platform} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import LinearGradient from 'react-native-linear-gradient';
import {ImageBackground} from 'react-native';
import imageindex from '../../../../../assets/images/imageindex';
import styles from './styles';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import {API} from '../../../../clients/api.client';
import AkcruButtons from '../../../../components/akcruButtons';
import {IMovie, IUserProfile} from '../../../../../types';
import {findFlickFlirtMovies} from '../../../../lib/api/movies.lib';
import Swiper from 'react-native-deck-swiper';
import useAuthStore from '../../../../stores/auth.store';
import {UserProfileStackParams} from '../../../../navigation/UserProfileStack';
import FlickFlirtMatchCard from '../../../../components/FlickFlirtMatchCard';
import {capitalizeFirstLetterOfString} from '../../../../util/util';
import {Icon} from '@rneui/base';

import {getMatches, unlockMatches, UnlockOption} from '../../../../lib/api/flickflirt.lib';
import {isTablet} from '../../../../../assets/constants/theme';
// ADD these imports near the top
import {InterstitialAd, AdEventType, TestIds} from 'react-native-google-mobile-ads';

const FlickFlirtSwipeold = () => {
    const [movies, setMovies] = useState<IMovie[]>([]);
    const [allSwiped, setAllSwiped] = useState(false);
    const [checkingFlirts, setCheckingFlirts] = useState(false);
    const [hasCheckedFlirts, setHasCheckedFlirts] = useState(false);

    const [matches, setMatches] = useState<IUserProfile[]>([]);
    const [hiddenCount, setHiddenCount] = useState(0);
    const [unlocked, setUnlocked] = useState(false);
    const [unlockOptions, setUnlockOptions] = useState<UnlockOption[]>([]);

    // Confirmation modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState<UnlockOption | null>(null);

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const navigationB = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [adLoaded, setAdLoaded] = useState(false);
    const interstitialRef = useRef<InterstitialAd | null>(null);

    const PROD_IDS = Platform.select({
        android: 'ca-app-pub-8264001768347242/2150819252', // <-- your real ANDROID id
        ios: 'ca-app-pub-8264001768347242/1708251538', // <-- your real iOS id (make a separate unit in AdMob)
    });

    const interstitialUnitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_IDS;

    // Create & preload interstitial once per mount
    useEffect(() => {
        if (!interstitialUnitId) return; // guard if iOS id not set yet
        // Create and keep a reference to the interstitial
        const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {
            requestNonPersonalizedAdsOnly: true,
            // keywords: ['dating', 'movies', 'entertainment'],
        });
        interstitialRef.current = ad;

        const setNotLoaded = () => setAdLoaded(false);

        // Listeners
        const offLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded(true);
        });

        const offClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            setNotLoaded();
            ad.load(); // prepare the next ad
        });

        const offError = ad.addAdEventListener(AdEventType.ERROR, () => {
            setNotLoaded();
        });

        // Kick off first load
        ad.load();

        // Cleanup
        return () => {
            offLoaded();
            offClosed();
            offError();
            interstitialRef.current = null;
        };
    }, [interstitialUnitId]);

    const {hydrateUser} = useAuthStore();

    // load sponsored movies
    useFocusEffect(
        React.useCallback(() => {
            findFlickFlirtMovies().then(setMovies).catch(console.error);
        }, []),
    );

    useFocusEffect(
        React.useCallback(() => {
            hydrateUser();
            return () => {
                hydrateUser();
            };
        }, [hydrateUser]),
    );

    const fetchMatches = async () => {
        try {
            const data = await getMatches();
            if (!data.success) {
                return Alert.alert('Error', data.message || 'Could not load matches.');
            }
            setMatches(data.matches);
            setHiddenCount(data.hiddenCount);
            setUnlocked(data.unlocked);
            setUnlockOptions(data.unlockOptions);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Network error fetching matches.');
        }
    };

    const handleSwipe = async (movieId: string, type: 'LIKE' | 'DISLIKE') => {
        try {
            await API.post('v1/flickflirt/swipe', {
                movieId,
                type,
            });
        } catch (error) {
            console.error('Error recording swipe:', error);
        }
    };

    const [swipeResult, setSwipeResult] = useState<null | 'LIKE' | 'NOPE'>(null);

    // const onSwipedAll = () => {
    //     setAllSwiped(true);
    //     setCheckingFlirts(true);
    //     fetchMatches().finally(() => {
    //         // simulate spinner delay
    //         setTimeout(() => {
    //             setHasCheckedFlirts(true);
    //             setCheckingFlirts(false);
    //         }, 1500);
    //     });
    // };

    const onSwipedAll = () => {
        setAllSwiped(true);
        setCheckingFlirts(true);

        // Start fetching immediately (so results are ready when ad closes)
        fetchMatches().finally(() => {
            // keep your small spinner delay
            setTimeout(() => {
                setHasCheckedFlirts(true);
                setCheckingFlirts(false);
            }, 1500);
        });

        // Show interstitial if it’s ready
        if (adLoaded && interstitialRef.current) {
            interstitialRef.current.show();
            // we do not block on the ad; user comes back to results once it closes
        } else {
            // Optional: try to load for next time
            interstitialRef.current?.load?.();
        }
    };

    const confirmUnlock = async () => {
        if (!selectedOpt) {
            return;
        }
        setModalVisible(false);

        try {
            const data = await unlockMatches(selectedOpt.durationDays);
            if (!data.success) {
                Alert.alert('Unable to Unlock', data.message);
                return;
            }
            // Append only new matches
            setMatches(prev => {
                const seen = new Set(prev.map(m => m.id));
                return [...prev, ...data.matches.filter(m => !seen.has(m.id))];
            });
            setHiddenCount(0);
            setUnlocked(true);
            hydrateUser(); // refresh AD balance
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Network error during unlock.');
        }
    };

    // 2) Open the unlock confirmation
    const openModal = () => {
        if (unlockOptions.length === 0) {
            return Alert.alert('Error', 'No unlock options available.');
        }
        // default to first option
        setSelectedOpt(unlockOptions[0]);
        setModalVisible(true);
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
                        // eslint-disable-next-line react-native/no-inline-styles
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: SIZES.ScreenHeight,
                        }}
                    />
                    <View>
                        <Header />
                    </View>
                    <BackButton navigation={navigation} />
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        {movies.length > 0 ? (
                            <Swiper
                                cards={movies}
                                renderCard={(movie: IMovie) => (
                                    <View style={styles.card}>
                                        <ImageBackground source={{uri: movie.portraitURL}} style={styles.cardImage}>
                                            <LinearGradient
                                                colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                                                // eslint-disable-next-line react-native/no-inline-styles
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    right: 0,
                                                    top: 0,
                                                    height: '100%',
                                                }}
                                            />
                                            <View style={{padding: isTablet() ? 30 : 10}}>
                                                <Text style={styles.bigTitle}>{movie.title}</Text>
                                                <View style={{flexDirection: 'row', marginVertical: 10}}>
                                                    <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                                    <Text style={styles.drawfonttag}>
                                                        {capitalizeFirstLetterOfString(movie?.genres[0])}
                                                    </Text>
                                                    <Text style={styles.drawfonttag}>
                                                        {capitalizeFirstLetterOfString(movie?.genres[1])}
                                                    </Text>

                                                    <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                                                </View>
                                                <Text style={styles.desc}>{movie.description}</Text>
                                            </View>
                                        </ImageBackground>
                                    </View>
                                )}
                                onSwipedLeft={cardIndex => {
                                    console.log('Swiped left:', movies[cardIndex].title);
                                    // Optionally store "disliked" movie
                                    setSwipeResult('NOPE');
                                    handleSwipe(movies[cardIndex].id, 'DISLIKE');

                                    setTimeout(() => setSwipeResult(null), 1200);
                                }}
                                onSwipedRight={cardIndex => {
                                    console.log('Swiped right:', movies[cardIndex].title);
                                    // Optionally store "liked" movie
                                    setSwipeResult('LIKE');
                                    handleSwipe(movies[cardIndex].id, 'LIKE');

                                    setTimeout(() => setSwipeResult(null), 1200);
                                }}
                                backgroundColor="transparent"
                                stackSize={4}
                                cardIndex={0}
                                verticalSwipe={false}
                                cardStyle={{
                                    marginTop: isTablet() ? 0 : '-10%',
                                    marginLeft: isTablet() ? '17%' : '3%',
                                    alignSelf: 'center', // center horizontally
                                }}
                                onSwipedAll={onSwipedAll}
                                overlayLabels={{
                                    left: {
                                        title: 'NOPE',
                                        style: {
                                            label: {
                                                backgroundColor: 'transparent',
                                                borderColor: 'red',
                                                color: 'red',
                                                fontSize: 38,
                                                fontWeight: 'bold',
                                                borderWidth: 2,
                                                padding: 10,
                                            },
                                            wrapper: {
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                justifyContent: 'flex-start',
                                                marginTop: 30,
                                                marginLeft: isTablet() ? -330 : -30,
                                            },
                                        },
                                    },
                                    right: {
                                        title: 'LIKE',
                                        style: {
                                            label: {
                                                backgroundColor: 'transparent',
                                                borderColor: '#00BFFF',
                                                color: '#00BFFF',
                                                fontSize: 38,
                                                fontWeight: 'bold',
                                                borderWidth: 2,
                                                padding: 10,
                                            },
                                            wrapper: {
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                justifyContent: 'flex-start',
                                                marginTop: 30,
                                                marginLeft: 30,
                                            },
                                        },
                                    },
                                }}
                                animateOverlayLabelsOpacity={true}
                            />
                        ) : (
                            <Text style={[FONTS.Title3, {color: COLORS.LIGHTGREY}]}>Loading movies...</Text>
                        )}
                        {allSwiped && checkingFlirts && (
                            <Text style={[FONTS.Title3, {color: COLORS.LIGHTGREY}]}>Checking For Flirts...</Text>
                        )}
                        {allSwiped && hasCheckedFlirts && (
                            <>
                                <View
                                    style={{
                                        flex: 1,
                                        marginLeft: '3%',
                                        marginRight: '3%',
                                        paddingBottom: 150, // reserve space for bottom buttons
                                    }}>
                                    {matches.length > 0 ? (
                                        <>
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
                                                            onPress={() =>
                                                                navigation.navigate('ViewUserScreen', {userID: item.id})
                                                            }
                                                            influencer={false}
                                                            akcruBadge={item.badge}
                                                            userDesc={item.description}
                                                            matchLabel={item.matchLabel}
                                                        />
                                                    </View>
                                                )}
                                            />
                                        </>
                                    ) : (
                                        <View style={{alignItems: 'center'}}>
                                            <Text
                                                style={[
                                                    FONTS.Title3,
                                                    {color: COLORS.LIGHTGREY, textAlign: 'center', marginBottom: 20},
                                                ]}>
                                                You have no matches.
                                            </Text>
                                            <AkcruButtons.XlLrgButton
                                                btnname="Start Over"
                                                onPress={() => navigationB.navigate('FlickFlirtScreen')}
                                                color={COLORS.PURPLE}
                                            />
                                        </View>
                                    )}
                                </View>

                                {/* Fixed bottom button stack */}
                                <View style={{position: 'absolute', bottom: '15%', alignSelf: 'center'}}>
                                    {!unlocked && hiddenCount > 0 && (
                                        <View style={styles.unlockWrapper}>
                                            <Text style={styles.unlockText}>
                                                {hiddenCount} more {hiddenCount > 1 ? 'matches' : 'match'} locked
                                            </Text>
                                            <AkcruButtons.XlLrgButton
                                                btnname={'Unlock Matches'}
                                                onPress={openModal}
                                                color={COLORS.PURPLE}
                                            />
                                        </View>
                                    )}
                                    <View style={styles.gotToStartWrapper}>
                                        <AkcruButtons.XlLrgButton
                                            btnname="Go To Start"
                                            onPress={() => navigationB.navigate('FlickFlirtScreen')}
                                            color={COLORS.PURPLE}
                                        />
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                    {!allSwiped && (
                        <View style={{alignItems: 'center', marginBottom: '20%'}}>
                            <Text style={[FONTS.Title3, {color: COLORS.AKCRUPINK}]}>
                                Swipe right if you like, swipe left if you dislike
                            </Text>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '40%'}}>
                                <Icon
                                    name={'sad'}
                                    type="ionicon"
                                    color={COLORS.CATREDLGT}
                                    size={isTablet() ? 60 : 40}
                                />
                                <Icon
                                    name={'happy'}
                                    type="ionicon"
                                    color={COLORS.AKCRUBLUE}
                                    size={isTablet() ? 60 : 40}
                                />
                            </View>
                        </View>
                    )}
                </SafeAreaView>
            </ImageBackground>
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

export default FlickFlirtSwipeold;
