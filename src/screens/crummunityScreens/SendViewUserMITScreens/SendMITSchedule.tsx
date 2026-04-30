import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ImageBackground,
    SafeAreaView,
    Image,
    ActivityIndicator,
    Platform,
    Modal,
    StyleSheet,
    BackHandler,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Header from '../../../components/header';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import AkcruButtons from '../../../components/akcruButtons';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../assets/images/imageindex';
import styles from '../../contentScreens/MovieMITScheduleScreen/styles';
import {IMITInvite, IMovie, IUserProfile} from '../../../../types';
import {findMovieById} from '../../../lib/api/movies.lib';
import {useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {
    capitalizeFirstLetterOfString,
    combineDateAndTime,
    formatMovieDuration,
} from '../../../util/util';
import {findAUser} from '../../../lib/api/user.lib';
import {changeMITInviteMovie, createAMITInvite, getMyMITs} from '../../../lib/api/mit.lib';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {ROOM_VALIDATION_CHECK_TIME} from '../../../util/config';
import BackButton from '../../../components/General/backbutton';
import OTPResultModal from '../../../components/CodeModals/OTPResultModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {reset} from '../../../util/RootNavigation';
import useAuthStore from '../../../stores/auth.store';
import MITInvitePairAnimation from '../../../components/MITInvitePairAnimation';
import {Icon} from '@rneui/base';

import {InterstitialAd, AdEventType, TestIds} from 'react-native-google-mobile-ads';
import Video from 'react-native-video';

const MIT_SEND_INVITE_TICKET_ICON_URL = 'https://img.icons8.com/fluency/96/movie.png';
const chooseMitCardStyles = StyleSheet.create({
    inviteMovieCardBorder: {
        width: '100%',
        borderRadius: 16,
        padding: 1,
        marginTop: 2,
    },
    inviteMovieCard: {
        width: '100%',
        borderRadius: 16,
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        paddingHorizontal: 8,
        paddingVertical: 10,
        minHeight: 98,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inviteMoviePoster: {
        width: 58,
        height: 78,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    inviteMovieInfo: {
        flex: 1,
        minWidth: 0,
        paddingRight: 8,
    },
    inviteMovieTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
    },
    inviteMovieMeta: {
        ...FONTS.paragraph2,
        color: 'rgba(236,220,255,0.9)',
        marginTop: 3,
    },
    inviteMovieTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 6,
    },
    inviteMovieTag: {
        ...FONTS.paragraph2,
        color: '#1A0C2A',
        backgroundColor: '#DDB3FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 6,
        marginBottom: 4,
    },
    inviteTrailerWrap: {
        minWidth: 76,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,255,255,0.2)',
        paddingLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inviteTrailerGradient: {
        borderRadius: 10,
        padding: 1,
    },
    inviteTrailerSideButton: {
        borderRadius: 10,
        backgroundColor: 'rgba(20, 10, 34, 0.9)',
        paddingHorizontal: 8,
        minHeight: 52,
        paddingVertical: 8,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    inviteTrailerIcon: {
        marginBottom: 2,
    },
    inviteTrailerButtonText: {
        ...FONTS.paragraph2,
        color: COLORS.WHITE,
        textAlign: 'center',
    },
});

type SendMITScheduleNavigationProp = StackNavigationProp<CrummunityStackParams, 'SendMITSchedule'>;

type SendMITScheduleRouteProp = RouteProp<CrummunityStackParams, 'SendMITSchedule'>;

type Props = {
    navigation: SendMITScheduleNavigationProp;
    route: SendMITScheduleRouteProp;
};

export default function SendMITSchedule({route}: Props) {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const insets = useSafeAreaInsets();
    const routeParams = useRoute<RouteProp<CrummunityStackParams, 'SendMITSchedule'>>();
    const loggedInUser = useAuthStore(state => state.user);

    const userID: string | undefined = route.params?.userID ?? null;
    const rawIsFromChangeMovie = route.params?.isFromChangeMovie ?? routeParams.params?.isFromChangeMovie;
    const isFromChangeMovie = rawIsFromChangeMovie === true || rawIsFromChangeMovie === 'true';
    const inviteId: string | undefined =
        route.params?.inviteId != null
            ? String(route.params.inviteId)
            : routeParams.params?.inviteId != null
              ? String(routeParams.params?.inviteId)
              : undefined;
    const primaryMitActionLabel = isFromChangeMovie ? 'Update MIT' : 'Send MIT';

    const [movie, setMovie] = useState<IMovie | null>(null);
    const [isMovieDataLoaded, setIsMovieDataLoaded] = useState(false);
    const [loading, setLoading] = useState(true);

    // Interstitial setup
    const interstitialRef = useRef<InterstitialAd | null>(null);
    const [adLoaded, setAdLoaded] = useState(false);
    const latestSentInviteRef = useRef<IMITInvite | null>(null);
    const [showSendMITVideoOverlay, setShowSendMITVideoOverlay] = useState(false);
    const pendingInviteSuccessFlowRef = useRef<(() => void) | null>(null);

    const PROD_IDS = Platform.select({
            android: 'ca-app-pub-8264001768347242/2150819252', // <-- your real ANDROID id
            ios: 'ca-app-pub-8264001768347242/1708251538', // <-- your real iOS id (make a separate unit in AdMob)
        });

        const interstitialUnitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_IDS;

    useEffect(() => {
        if (!interstitialUnitId) return; // guard if iOS id not set yet
        const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });
        interstitialRef.current = ad;

        const offLoaded = ad.addAdEventListener(AdEventType.LOADED, () => setAdLoaded(true));
        const offClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            setAdLoaded(false);
            setShowSendMIT(false);
            setIsSelectionDisabled(true);
            navigateAfterInviteSent();

            ad.load(); // preload next ad
        });
        const offError = ad.addAdEventListener(AdEventType.ERROR, () => setAdLoaded(false));

        // kick off first load
        ad.load();

        return () => {
            offLoaded();
            offClosed();
            offError();
            interstitialRef.current = null;
        };
    }, [interstitialUnitId, navigateAfterInviteSent]);

    useFocusEffect(
        React.useCallback(() => {
            findAUser({id: userID}).then(user => {
                setUser(user);
            });

            return () => {};
        }, []),
    );

    const [user, setUser] = useState<IUserProfile | undefined>(undefined);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const id: string | undefined = routeParams.params?.id;
                if (id) {
                    const fetchedMovie: IMovie | null = await findMovieById(id);
                    if (fetchedMovie) {
                        setMovie(fetchedMovie);
                        setIsMovieDataLoaded(true);
                    } else {
                        setMovie(null);
                        setIsMovieDataLoaded(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching movie:', error);
                setIsMovieDataLoaded(false);
            }
        };

        fetchMovie();
    }, [routeParams.params?.id]);

    const {
        title,
        description,
        actors,
        director,
        genres,
        portraitURL,

        rating,
        year,
        rated,

        duration,
    } = movie || {};

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [selectedTimeZone, setSelectedTimeZone] = useState('');
    const [, setIsDateTimeSelected] = useState(false);
    const [isSelectionDisabled, setIsSelectionDisabled] = useState(false);
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const handlePreviousMonth = () => {
        const previousMonth = new Date(currentYear, currentMonth - 1);
        setSelectedDate(previousMonth);
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(currentYear, currentMonth + 1);
        setSelectedDate(nextMonth);
    };

    const handleDateChange = day => {
        const updatedDate = new Date(currentYear, currentMonth, day);
        setSelectedDate(updatedDate);
    };

    const handleTimeChange = (hours, minutes) => {
        const updatedTime = new Date(selectedTime);
        updatedTime.setHours(hours);
        updatedTime.setMinutes(minutes);
        setSelectedTime(updatedTime);
    };

    const handleTimeZoneChange = timeZone => {
        setSelectedTimeZone(timeZone);
    };

    const handleSetDateTime = async () => {
        setLoading(true);
        setIsSelectionDisabled(true);

        try {
            if (isFromChangeMovie && movie?.id && inviteId) {
                const response = await changeMITInviteMovie({
                    inviteId,
                    newMovieId: movie.id,
                });

                if (response.success) {
                    reset({
                        index: 0,
                        routes: [
                            {
                                name: 'NoBottomStack',
                                params: {
                                    screen: 'ClientTabNavigator',
                                    params: {
                                        screen: 'CrummunityStack',
                                        params: {
                                            screen: 'CrummunityScreen',
                                        },
                                    },
                                },
                            },
                        ],
                    });
                    return;
                }

                const updateMessage = response.message?.trim();
                setInviteFailedMessage(
                    updateMessage ? updateMessage : 'Failed to update Movie Invite Ticket. Please try again.',
                );
                setShowInviteFailedModal(true);
                setIsSelectionDisabled(false);
                return;
            }

            if (selectedDate && selectedTime && selectedTimeZone && movie && user) {
                const startDateISO = combineDateAndTime(selectedDate, selectedTime, selectedTimeZone);

                if (startDateISO) {
                    const response = await createAMITInvite({
                        movieId: movie.id,
                        username: user.username,
                        startDate: startDateISO,
                        timezone: selectedTimeZone,
                    });

                    if (response.success) {
                        latestSentInviteRef.current = response.invite ?? null;
                        setIsDateTimeSelected(true);
                        setShowSendMIT(false);
                        playSendMITVideoThen(handleInviteSuccessFlow);
                    } else {
                        const msg = response.message?.trim();
                        setInviteFailedMessage(msg ? msg : 'Failed to send Movie Invite Ticket. Please try again.');
                        setShowInviteFailedModal(true);
                        setIsSelectionDisabled(false);
                    }
                }
            }
        } catch (error) {
            console.error('Error setting date and time:', error);
            setInviteFailedMessage(
                isFromChangeMovie
                    ? 'Failed to update Movie Invite Ticket. Please try again.'
                    : 'Failed to send Movie Invite Ticket. Please try again.',
            );
            setShowInviteFailedModal(true);
            setIsSelectionDisabled(false);
        } finally {
            setLoading(false);
        }
    };

    const timeZones = [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Australia/Sydney',
    ];

    const [showSendMIT, setShowSendMIT] = useState(false);
    const [showInviteFailedModal, setShowInviteFailedModal] = useState(false);
    const [inviteFailedMessage, setInviteFailedMessage] = useState('');
    const showMITAnimationCard = false;
    const contentHorizontalPadding = 10;
    const fixedActionBottom = Math.max(insets.bottom, 12);
    const fixedActionReservedSpace = 96 + fixedActionBottom;
    const isPrimaryActionDisabled = isFromChangeMovie
        ? isSelectionDisabled
        : !selectedDate || !selectedTime || !selectedTimeZone || isSelectionDisabled;

    useEffect(() => {
        if (!isFromChangeMovie || selectedTimeZone) {
            return;
        }
        const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setSelectedTimeZone(detectedTimeZone || timeZones[0]);
    }, [isFromChangeMovie, selectedTimeZone, timeZones]);

    const navigateAfterInviteSent = React.useCallback(async () => {
        let latestInvite = latestSentInviteRef.current;
        try {
            const myMITs = await getMyMITs();
            const pendingMITs = (myMITs ?? []).filter(mit => mit.status === 'PENDING');
            if (pendingMITs.length > 0) {
                pendingMITs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                latestInvite = pendingMITs[0];
            }
        } catch (error) {
            console.error('[SendMITSchedule] getMyMITs failed before ChooseMITScreen navigation:', error);
        }

        if (latestInvite) {
            const fallbackSchedule =
                combineDateAndTime(selectedDate, selectedTime, selectedTimeZone) ?? new Date().toISOString();
            const safeSchedule =
                latestInvite.startDate && !Number.isNaN(new Date(latestInvite.startDate).getTime())
                    ? latestInvite.startDate
                    : fallbackSchedule;
            const safeExpiresAt =
                latestInvite.expiresAt && !Number.isNaN(new Date(latestInvite.expiresAt).getTime())
                    ? latestInvite.expiresAt
                    : undefined;
            const safeTimezone = latestInvite.timezone || selectedTimeZone || 'America/New_York';

            reset({
                index: 0,
                routes: [
                    {
                        name: 'NoBottomStack',
                        params: {
                            screen: 'ChooseMITScreen',
                            params: {
                                MITID: latestInvite.id,
                                movie: latestInvite.movie,
                                creator: latestInvite.creator,
                                invitee: latestInvite.invitee,
                                inviteDate: latestInvite.createdAt,
                                akcruBadge: latestInvite.invitee,
                                schedule: safeSchedule,
                                timezone: safeTimezone,
                                expiresAt: safeExpiresAt,
                                status: latestInvite.status,
                                fromSentTab: true,
                            },
                        },
                    },
                ],
            });
            return;
        }
        if (userID) {
            navigation.navigate('ViewUserScreen', {
                userID,
                imageURL: user?.profilePicture ?? '',
            });
            return;
        }
        navigation.navigate('UserMITHubScreen', {index: 0});
    }, [navigation, selectedDate, selectedTime, selectedTimeZone, user?.profilePicture, userID]);

    const handleInviteSuccessFlow = React.useCallback(() => {
        if (adLoaded && interstitialRef.current) {
            interstitialRef.current.show();
        } else {
            setIsSelectionDisabled(true);
            setShowSendMIT(false);
            navigateAfterInviteSent();
            interstitialRef.current?.load?.();
        }
    }, [adLoaded, navigateAfterInviteSent]);

    const completeSendMITVideoAndContinue = React.useCallback(() => {
        setShowSendMITVideoOverlay(false);
        const onComplete = pendingInviteSuccessFlowRef.current;
        pendingInviteSuccessFlowRef.current = null;
        if (onComplete) {
            onComplete();
        }
    }, []);

    const playSendMITVideoThen = React.useCallback((onComplete: () => void) => {
        pendingInviteSuccessFlowRef.current = onComplete;
        setShowSendMITVideoOverlay(true);
    }, []);

    useEffect(() => {
        navigation.setOptions({gestureEnabled: !showSendMITVideoOverlay});
        if (!showSendMITVideoOverlay) {
            return;
        }
        const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => {
            backHandlerSubscription.remove();
            navigation.setOptions({gestureEnabled: true});
        };
    }, [navigation, showSendMITVideoOverlay]);

    const handleCloseInviteFailedModal = () => {
        setShowInviteFailedModal(false);
        setInviteFailedMessage('');
    };

    return (
        <TabContainer>
            <SafeAreaView style={{flex: 1, backgroundColor: COLORS.BLACK}}>
                {!showSendMIT && isMovieDataLoaded ? (
                    <View
                        style={{
                            backgroundColor: COLORS.BLACK,
                            paddingBottom: 4,
                        }}>
                        <Header />
                        <View style={{marginHorizontal: 15, marginTop: 0}}>
                            <BackButton navigation={navigation} />
                        </View>
                    </View>
                ) : null}
                <ScrollView
                    style={{backgroundColor: COLORS.BLACK}}
                    contentContainerStyle={{
                        paddingBottom: showSendMIT ? 20 : fixedActionReservedSpace,
                        paddingHorizontal: contentHorizontalPadding,
                    }}>
                    {showSendMIT ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: COLORS.BLACK,
                            }}>
                            <Text
                                style={{
                                    ...FONTS.Title3,
                                    textAlign: 'center',
                                    paddingVertical: 20,
                                }}>
                                Your Movie Invite Ticket was sent successfully!
                            </Text>
                            <View style={styles.ticketContainer}>
                                <ImageBackground
                                    source={{uri: portraitURL}}
                                    style={styles.ticketImage}
                                    resizeMode="cover">
                                    <LinearGradient
                                        colors={['transparent', COLORS.AKCRUBLUE]}
                                        style={styles.linearGradient}>
                                        <View
                                            style={[
                                                styles.ticketCircle,
                                                {position: 'absolute', bottom: -40, left: -40},
                                            ]}
                                        />
                                        <View
                                            style={[
                                                styles.ticketCircle,
                                                {position: 'absolute', bottom: -40, right: -40},
                                            ]}
                                        />
                                    </LinearGradient>
                                </ImageBackground>
                            </View>

                            <View style={styles.ticketFooter}>
                                <View style={[styles.ticketCircle, {position: 'absolute', top: -40, left: -40}]} />
                                <View style={[styles.ticketCircle, {position: 'absolute', top: -40, right: -40}]} />
                                <View>
                                    <Text
                                        style={{
                                            ...FONTS.Title1,
                                            textAlign: 'center',
                                            marginBottom: 10,
                                            width: '75%',
                                            alignSelf: 'center',
                                        }}>
                                        {title}
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        width: '75%',
                                        alignSelf: 'center',
                                    }}>
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={{...FONTS.Title3}}>{selectedDate.toLocaleDateString()}</Text>
                                        <Text style={{...FONTS.paragraph2}}>DATE</Text>
                                    </View>
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={{...FONTS.Title3}}>
                                            {selectedTime.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Text>
                                        <Text style={{...FONTS.paragraph2}}>TIME</Text>
                                    </View>
                                </View>
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <Image
                                        source={imageindex.barcode}
                                        style={{
                                            width: '75%',
                                            height: '50%',
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View>
                            {isMovieDataLoaded ? (
                                <View>
                                    <View style={{marginTop: 0}}>
                                        <LinearGradient
                                            colors={['#00E5FF', '#7C4DFF', '#FF4FD8']}
                                            start={{x: 0, y: 0}}
                                            end={{x: 1, y: 1}}
                                            style={chooseMitCardStyles.inviteMovieCardBorder}>
                                            <View style={chooseMitCardStyles.inviteMovieCard}>
                                                <Image
                                                    source={{uri: movie?.portraitURL || movie?.landscapeURL}}
                                                    style={chooseMitCardStyles.inviteMoviePoster}
                                                    resizeMode="cover"
                                                />
                                                <View style={chooseMitCardStyles.inviteMovieInfo}>
                                                    <Text style={chooseMitCardStyles.inviteMovieTitle} numberOfLines={2}>
                                                        {title}
                                                    </Text>
                                                    <Text style={chooseMitCardStyles.inviteMovieMeta}>
                                                        {year} • {formatMovieDuration(duration)}
                                                    </Text>
                                                    <View style={chooseMitCardStyles.inviteMovieTagRow}>
                                                        {rated ? (
                                                            <Text style={chooseMitCardStyles.inviteMovieTag} numberOfLines={1}>
                                                                {rated}
                                                            </Text>
                                                        ) : null}
                                                        {genres?.[0] ? (
                                                            <Text style={chooseMitCardStyles.inviteMovieTag} numberOfLines={1}>
                                                                {capitalizeFirstLetterOfString(genres[0])}
                                                            </Text>
                                                        ) : null}
                                                        {rating ? (
                                                            <Text style={chooseMitCardStyles.inviteMovieTag} numberOfLines={1}>
                                                                {rating}/10
                                                            </Text>
                                                        ) : null}
                                                    </View>
                                                </View>
                                                {movie?.trailerURL ? (
                                                    <View style={chooseMitCardStyles.inviteTrailerWrap}>
                                                        <LinearGradient
                                                            colors={['#FF4FD8', '#7C4DFF', '#00E5FF']}
                                                            start={{x: 0, y: 0}}
                                                            end={{x: 1, y: 1}}
                                                            style={chooseMitCardStyles.inviteTrailerGradient}>
                                                            <TouchableOpacity
                                                                style={chooseMitCardStyles.inviteTrailerSideButton}
                                                                activeOpacity={0.85}
                                                                onPress={() =>
                                                                    navigation.navigate('TrailerPlayer', {
                                                                        id: movie?.id,
                                                                        trailerURL: movie?.trailerURL,
                                                                        landscapeURL: movie?.landscapeURL,
                                                                    })
                                                                }>
                                                                <Icon
                                                                    name="play"
                                                                    type="ionicon"
                                                                    size={12}
                                                                    color={COLORS.WHITE}
                                                                    style={chooseMitCardStyles.inviteTrailerIcon}
                                                                />
                                                                <Text style={chooseMitCardStyles.inviteTrailerButtonText}>
                                                                    Movie Trailer
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </LinearGradient>
                                                    </View>
                                                ) : null}
                                            </View>
                                        </LinearGradient>

                                        <View style={{marginTop: 12}}>
                                            <Text style={{...FONTS.Title2, color: '#E8C5FF', marginBottom: 6}}>
                                                Movie Details
                                            </Text>
                                            <Text style={{...FONTS.paragraph1, color: COLORS.WHITE}}>
                                                {description || 'No description available.'}
                                            </Text>
                                            <Text style={{...FONTS.Title2AkcruBlue, marginTop: 10}}>
                                                <Text style={{color: COLORS.DARKGREY}}>Cast:</Text>{' '}
                                                {actors && actors.length > 0
                                                    ? actors.map(actor => actor.name).join(', ')
                                                    : 'N/A'}
                                            </Text>
                                            <Text style={{...FONTS.Title2AkcruBlue, marginTop: 6}}>
                                                <Text style={{color: COLORS.DARKGREY}}>Directors:</Text>{' '}
                                                {director && director.length > 0
                                                    ? director.map(d => d.name).join(', ')
                                                    : 'N/A'}
                                            </Text>
                                        </View>
                                    </View>
                                    {showMITAnimationCard ? (
                                        <MITInvitePairAnimation
                                            containerStyle={{marginTop: 24, width: '100%', alignSelf: 'center'}}
                                            compact
                                            sender={{
                                                username: loggedInUser?.username,
                                                profilePicture: loggedInUser?.profilePicture,
                                                badge: loggedInUser?.badge,
                                            }}
                                            receiver={{
                                                username: user?.username,
                                                profilePicture: user?.profilePicture,
                                                badge: user?.badge,
                                            }}
                                        />
                                    ) : null}
                                    <View style={{marginTop: 20, marginBottom: 75}}>
                                        {!isFromChangeMovie ? (
                                            <>
                                                <Text style={styles.scheduleFieldLabel}>Select Date...</Text>
                                                <View style={styles.container}>
                                                    <View style={styles.schedulePickerRow}>
                                                        <TouchableOpacity
                                                            onPress={handlePreviousMonth}
                                                            style={styles.scheduleArrowButton}>
                                                            <Icon
                                                                name="chevron-back"
                                                                type="ionicon"
                                                                color={COLORS.WHITE}
                                                                size={18}
                                                            />
                                                        </TouchableOpacity>
                                                        <Text style={styles.scheduleMonthText}>
                                                            {months[currentMonth]} {currentYear}
                                                        </Text>
                                                        <TouchableOpacity onPress={handleNextMonth} style={styles.scheduleArrowButton}>
                                                            <Icon
                                                                name="chevron-forward"
                                                                type="ionicon"
                                                                color={COLORS.WHITE}
                                                                size={18}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>

                                                    <View style={styles.datePickerContainer}>
                                                        {[...Array(daysInMonth)].map((_, index) => {
                                                            const day = index + 1;
                                                            const isSelected = selectedDate.getDate() === day;
                                                            const currentDate = new Date();
                                                            currentDate.setHours(0, 0, 0, 0);
                                                            const currentDay = new Date(currentYear, currentMonth, day);
                                                            const currentDayOfWeek = currentDay.getDay();
                                                            const isSelectable = currentDay >= currentDate;
                                                            return (
                                                                <TouchableOpacity
                                                                    key={day}
                                                                    onPress={() => handleDateChange(day)}
                                                                    style={[
                                                                        styles.dayButton,
                                                                        isSelected && styles.dayButtonSelected,
                                                                        (isSelectionDisabled || !isSelectable) &&
                                                                            styles.disabledButton,
                                                                    ]}
                                                                    disabled={isSelectionDisabled || !isSelectable}>
                                                                    <Text style={styles.dayOfWeekText}>
                                                                        {daysOfWeek[currentDayOfWeek]}
                                                                    </Text>
                                                                    <Text
                                                                        style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                                                                        {day}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </View>
                                                </View>
                                                <Text style={styles.scheduleFieldLabel}>Choose a Time & Zone...</Text>
                                                <View style={styles.scheduleSplitPickerRow}>
                                                    <View style={styles.scheduleSplitPickerColumn}>
                                                        <Text style={styles.scheduleSplitPickerTitle}>Time</Text>
                                                        <FlatList
                                                            nestedScrollEnabled
                                                            data={[...Array(24 * 4)].map((_, index) => index)}
                                                            keyExtractor={item => `time-${item}`}
                                                            style={styles.scheduleSplitPickerList}
                                                            contentContainerStyle={styles.scheduleSplitPickerListContent}
                                                            showsVerticalScrollIndicator={true}
                                                            keyboardShouldPersistTaps="handled"
                                                            renderItem={({item: index}) => {
                                                                const hours = Math.floor(index / 4);
                                                                const minutes = (index % 4) * 15;
                                                                const isSelected =
                                                                    selectedTime.getHours() === hours &&
                                                                    selectedTime.getMinutes() === minutes;
                                                                const currentTime = new Date();
                                                                const selectedDateTime = new Date(
                                                                    selectedDate.getFullYear(),
                                                                    selectedDate.getMonth(),
                                                                    selectedDate.getDate(),
                                                                    hours,
                                                                    minutes,
                                                                );
                                                                const isPastTime = selectedDateTime < currentTime;
                                                                const ampmHours =
                                                                    hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                                                                const ampmSuffix = hours >= 12 ? 'PM' : 'AM';
                                                                return (
                                                                    <TouchableOpacity
                                                                        onPress={() => handleTimeChange(hours, minutes)}
                                                                        style={[
                                                                            styles.timeButton,
                                                                            styles.timeButtonBlock,
                                                                            isSelected && styles.timeButtonSelected,
                                                                            (isSelectionDisabled || isPastTime) &&
                                                                                styles.disabledButton,
                                                                        ]}
                                                                        disabled={isSelectionDisabled || isPastTime}>
                                                                        <Text
                                                                            style={[
                                                                                styles.timeText,
                                                                                isSelected && styles.timeTextSelected,
                                                                            ]}>
                                                                            {ampmHours < 10 ? `0${ampmHours}` : ampmHours}:
                                                                            {minutes === 0 ? '00' : minutes} {ampmSuffix}
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            }}
                                                        />
                                                    </View>
                                                    <View style={styles.scheduleSplitPickerColumn}>
                                                        <Text style={styles.scheduleSplitPickerTitle}>Timezone</Text>
                                                        <FlatList
                                                            nestedScrollEnabled
                                                            data={timeZones}
                                                            keyExtractor={item => item}
                                                            style={styles.scheduleSplitPickerList}
                                                            contentContainerStyle={styles.scheduleSplitPickerListContent}
                                                            showsVerticalScrollIndicator={true}
                                                            keyboardShouldPersistTaps="handled"
                                                            renderItem={({item: timeZone}) => {
                                                                const isSelected = selectedTimeZone === timeZone;
                                                                return (
                                                                    <TouchableOpacity
                                                                        onPress={() => handleTimeZoneChange(timeZone)}
                                                                        style={[
                                                                            styles.timeZoneButton,
                                                                            styles.timeZoneButtonBlock,
                                                                            isSelected && styles.timeZoneButtonSelected,
                                                                            isSelectionDisabled && styles.disabledButton,
                                                                        ]}
                                                                        disabled={isSelectionDisabled}>
                                                                        <Text
                                                                            style={[
                                                                                styles.timeZoneText,
                                                                                isSelected && styles.timeZoneTextSelected,
                                                                            ]}>
                                                                            {timeZone}
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            }}
                                                        />
                                                    </View>
                                                </View>
                                            </>
                                        ) : null}
                                            <View>
                                                <View>
                                                    {showSendMIT ? (
                                                        <View>
                                                            <Text
                                                                style={{
                                                                    ...FONTS.Title2,
                                                                    color: COLORS.AKCRUBLUE,
                                                                    textAlign: 'center',
                                                                }}>
                                                                You've just sent a Movie Invite Ticket
                                                            </Text>
                                                            <Text
                                                                style={{
                                                                    ...FONTS.Title2,
                                                                    color: COLORS.AKCRUBLUE,
                                                                    textAlign: 'center',
                                                                }}>
                                                                to {user?.username} to watch:
                                                            </Text>
                                                            <Text
                                                                style={{
                                                                    ...FONTS.Title2,
                                                                    color: COLORS.AKCRUBLUE,
                                                                    textAlign: 'center',
                                                                }}>
                                                                "{title}"
                                                            </Text>
                                                            <View>
                                                                <View
                                                                    style={{
                                                                        flexDirection: 'row',
                                                                        justifyContent: 'center',
                                                                    }}>
                                                                    <View style={{margin: 10}}>
                                                                        <Image
                                                                            source={{uri: portraitURL}}
                                                                            style={{
                                                                                width: 65,
                                                                                height: 100,
                                                                                borderRadius: 5,
                                                                            }}
                                                                        />
                                                                    </View>
                                                                    <View style={styles.selectedDateTimeContainer}>
                                                                        <Text style={styles.selectedDateTimeText}>
                                                                            {selectedDate.toLocaleDateString()}
                                                                        </Text>
                                                                        <Text style={styles.selectedDateTimeText}>
                                                                            {' '}
                                                                            {selectedTime.toLocaleTimeString([], {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })}
                                                                        </Text>
                                                                        <Text style={styles.selectedDateTimeText}>
                                                                            {selectedTimeZone}
                                                                        </Text>
                                                                    </View>
                                                                </View>

                                                                <View style={{alignItems: 'center', marginBottom: 20}}>
                                                                    <Text
                                                                        style={{
                                                                            ...FONTS.Title2,
                                                                            textAlign: 'center',
                                                                            color: COLORS.AKCRUBLUE,
                                                                        }}>
                                                                        You will be notified if your MIT has been
                                                                        ACCEPTED or DECLINED
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    ) : null}
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                            ) : (
                                <View style={styles.activitycontainer}>
                                    <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                                </View>
                            )}
                        </View>
                    )}
                    {!loading && <Text style={{...FONTS.Title1, textAlign: 'center'}}>Loading...</Text>}
                </ScrollView>
                {!showSendMIT && isMovieDataLoaded ? (
                    <View style={[styles.scheduleBottomDock, {paddingBottom: fixedActionBottom}]}>
                        <AkcruButtons.SmallButton
                            btnname={primaryMitActionLabel}
                            variant="auth"
                            authButtonWidth={SIZES.ScreenWidth - 30}
                            color={COLORS.AKCRUBLUE}
                            authLeftImage={{uri: MIT_SEND_INVITE_TICKET_ICON_URL}}
                            authImagePosition="right"
                            onPress={handleSetDateTime}
                            disabled={isPrimaryActionDisabled}
                        />
                    </View>
                ) : null}
                <Modal
                    animationType="fade"
                    transparent={false}
                    visible={showSendMITVideoOverlay}
                    onRequestClose={() => {}}>
                    <View style={styles.sendMITVideoOverlay}>
                        <Video
                            source={require('../../../../assets/video/send_mit_animation.mp4')}
                            style={styles.sendMITVideo}
                            resizeMode="cover"
                            repeat={false}
                            controls={false}
                            paused={!showSendMITVideoOverlay}
                            onEnd={completeSendMITVideoAndContinue}
                            onError={completeSendMITVideoAndContinue}
                        />
                    </View>
                </Modal>
                <Modal transparent visible={showInviteFailedModal} animationType="fade">
                    <OTPResultModal
                        closeModal={handleCloseInviteFailedModal}
                        type="failed"
                        message={inviteFailedMessage}
                    />
                </Modal>
            </SafeAreaView>
        </TabContainer>
    );
}
