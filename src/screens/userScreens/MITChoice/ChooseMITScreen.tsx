import React, {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {
    View,
    Text,
    ScrollView,
    ImageBackground,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    Animated,
    Easing,
    StyleSheet,
} from 'react-native';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import MITSwipe from '../../../components/MITSwipe';
import Header from '../../../components/header';
import AkcruLevels from '../../../components/akcruBadges';
import AkcruButtons from '../../../components/akcruButtons';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../assets/images/imageindex';
import {RouteProp} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {acceptAMITInvite, declineAMITInvite, cancelSentMIT} from '../../../lib/api/mit.lib';
import {IMovie, IUserProfile} from '../../../../types';
import moment from 'moment';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {IMessage} from 'react-native-gifted-chat';
import {HMSSDK} from '@100mslive/react-native-hms';
import {getMitMessages} from '../../../lib/api/rooms.lib';
import useAuthStore from '../../../stores/auth.store';
import {navigate, reset} from '../../../util/RootNavigation';
import HexAvatar from '../../../components/HexAvatar';
import {
    capitalizeFirstLetterOfString,
    formatMovieDuration,
    formatNumber,
    getShortenedTimezone,
    mitStatusValueColor,
    selectAvatarBorderColor,
} from '../../../util/util';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import {getFollowers} from '../../../lib/api/user.lib';
import {getMatches} from '../../../lib/api/flickflirt.lib';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type ChooseMITScreenNavigationProp = StackNavigationProp<UserProfileStackParams, 'ChooseMITScreen'>;

type ChooseMITScreenRouteProp = RouteProp<UserProfileStackParams, 'ChooseMITScreen'>;

type Props = {
    navigation: ChooseMITScreenNavigationProp;
    route: ChooseMITScreenRouteProp;
};

const DEFAULT_COUNTDOWN_SECONDS = 48 * 60 * 60;

/** Fog + ghost: fade in, hold ~3s at peak, fade out (~4.5–5s total). */
const FOG_FADE_IN_MS = 900;
const FOG_HOLD_MS = 500;
const FOG_FADE_OUT_MS = 1000;

function getInviteStatusExplanation(statusUpper: string): string {
    switch (statusUpper) {
        case 'PENDING':
            return 'Movie invite not accepted yet';
        case 'ACCEPTED':
            return 'Movie invite accepted';
        case 'DECLINED':
            return 'Movie invite declined';
        case 'EXPIRED':
            return 'This invite has expired';
        default:
            return '';
    }
}

const getRemainingSecondsFromExpiry = (expiresAt?: string | null): number => {
    if (!expiresAt) {
        return DEFAULT_COUNTDOWN_SECONDS;
    }

    const expiresAtMs = new Date(expiresAt).getTime();
    if (Number.isNaN(expiresAtMs)) {
        return DEFAULT_COUNTDOWN_SECONDS;
    }

    const diffMs = expiresAtMs - Date.now();
    return Math.max(0, Math.floor(diffMs / 1000));
};

const ChooseMITScreen = ({navigation, route}: Props) => {
    const insets = useSafeAreaInsets();
    const {user} = useAuthStore();
    const MITID: number | undefined = route.params?.MITID ?? null;

    // Access other passed parameters
    const movie: IMovie | null = route.params?.movie ?? null;
    const creator: IUserProfile | null = route.params?.creator ?? null;
    const invitee: IUserProfile | null = route.params?.invitee ?? null;
    const inviteDate: string | undefined = route.params?.inviteDate ?? null;
    const akcruBadge: IUserProfile = route.params?.akcruBadge ?? null;
    const schedule: string | undefined = route.params?.schedule ?? null;
    const timezone: string | undefined = route.params?.timezone ?? null;
    const expiresAt: string | undefined = route.params?.expiresAt ?? null;
    const statusFromParams: string | undefined = route.params?.status;
    const statusFromMovie =
        movie && typeof movie === 'object' && 'status' in movie && typeof (movie as {status?: unknown}).status === 'string'
            ? (movie as {status: string}).status
            : undefined;
    const displayMovieStatus = statusFromParams ?? statusFromMovie;
    const inviteStatusCode = (displayMovieStatus ?? 'PENDING').toString().toUpperCase();
    const isPendingInvite = inviteStatusCode === 'PENDING';
    const inviteStatusExplanation = getInviteStatusExplanation(inviteStatusCode);
    const inviteStatusColor = mitStatusValueColor(inviteStatusCode);
    const initialRemainingSeconds = getRemainingSecondsFromExpiry(expiresAt);

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [remainingSeconds, setRemainingSeconds] = useState<number>(initialRemainingSeconds);
    const hourTensSwipeAnim = useRef(new Animated.Value(1)).current;
    const hourOnesSwipeAnim = useRef(new Animated.Value(1)).current;
    const minuteTensSwipeAnim = useRef(new Animated.Value(1)).current;
    const minuteOnesSwipeAnim = useRef(new Animated.Value(1)).current;
    const secondTensSwipeAnim = useRef(new Animated.Value(1)).current;
    const secondOnesSwipeAnim = useRef(new Animated.Value(1)).current;
    const previousRemainingSeconds = useRef<number>(initialRemainingSeconds);

    const fromSentTab = route.params?.fromSentTab === true;
    const creatorIdStr = creator?.id != null ? String(creator.id) : null;
    /** Logged-in user sent this MIT (Sent tab or any path with matching creator id). */
    const isCurrentUserCreator = React.useMemo(
        () =>
            fromSentTab ||
            (user?.id != null && creatorIdStr != null && String(user.id) === creatorIdStr),
        [fromSentTab, user?.id, creatorIdStr],
    );

    /** Hide entire bottom section (timer + swipe) when invite is done or window ended. */
    const showAcceptDeclineSection = React.useMemo(
        () =>
            inviteStatusCode === 'PENDING' &&
            remainingSeconds > 0,
        [inviteStatusCode, remainingSeconds],
    );

    /** Receiver only: sender must not see Accept/Decline swipe. */
    const showMITSwipe = showAcceptDeclineSection && !isCurrentUserCreator;
    const showPendingInviteUi = showAcceptDeclineSection;
    const counterpartUser = isCurrentUserCreator ? invitee : creator;
    const counterpartUserId = counterpartUser?.id != null ? String(counterpartUser.id) : null;

    /** Expired (status or response window) or declined → ghosted content + fog overlay. */
    const isFogged = React.useMemo(() => {
        if (inviteStatusCode === 'DECLINED' || inviteStatusCode === 'EXPIRED' || inviteStatusCode === 'CANCELED' || inviteStatusCode === 'CANCELLED') {
            return true;
        }
        if (inviteStatusCode === 'ACCEPTED') {
            return false;
        }
        return Boolean(expiresAt) && remainingSeconds <= 0;
    }, [inviteStatusCode, expiresAt, remainingSeconds]);

    const fogFadeProgress = useRef(new Animated.Value(0)).current;
    const ringSpin = useRef(new Animated.Value(0)).current;
    const ringSpinRotation = useMemo(
        () =>
            ringSpin.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
            }),
        [ringSpin],
    );
    const fogOrbs = useMemo(
        () => [
            {
                size: 200,
                top: -30,
                left: SIZES.ScreenWidth - 200 * 0.9, // ~10% cut on right side
                opacity: 0.28,
            },
            {
                size: 145,
                top: 80,
                left: 12,
                opacity: 0.24,
            },
            {
                size: 170,
                top: SIZES.ScreenHeight - 170 * 0.72,
                left: -20, // bottom-left with slight cut
                opacity: 0.22,
            },
        ],
        [],
    );

    useEffect(() => {
        if (!isFogged) {
            fogFadeProgress.setValue(0);
            return;
        }
        fogFadeProgress.setValue(0);
        const sequence = Animated.sequence([
            Animated.timing(fogFadeProgress, {
                toValue: 1,
                duration: FOG_FADE_IN_MS,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.delay(FOG_HOLD_MS),
            Animated.timing(fogFadeProgress, {
                toValue: 0,
                duration: FOG_FADE_OUT_MS,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
        ]);
        sequence.start();
        return () => sequence.stop();
    }, [isFogged, fogFadeProgress]);

    useEffect(() => {
        if (!showAcceptDeclineSection) {
            return;
        }
        const loop = Animated.loop(
            Animated.timing(ringSpin, {
                toValue: 1,
                duration: 14000,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );
        loop.start();
        return () => {
            loop.stop();
            ringSpin.setValue(0);
        };
    }, [showAcceptDeclineSection, ringSpin]);

    const ghostContentStyle = {
        opacity: fogFadeProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.4],
        }),
        transform: [
            {
                scale: fogFadeProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.98],
                }),
            },
        ],
    };

    const [messages, setMessages] = useState<IMessage[]>([]);

    var roomId = '';

    const hmsInstanceRef = useRef<HMSSDK | null>(null);

    useEffect(() => {
        return () => {
            hmsInstanceRef.current != null ?? hmsInstanceRef.current?.removeAllListeners();
            hmsInstanceRef.current != null ?? hmsInstanceRef.current?.leave();
        };
    }, []);

    const getTextMessage = async (roomId: string) => {
        const response = await getMitMessages(roomId);
        setMessages(response!);
    };

    const handleDecline = () => {
        setIsLoading(true);
        declineAMITInvite({inviteId: MITID})
            .then(res => {
                setIsLoading(false);
                // Add any additional logic you need after declining the invite
                // For example, navigate to another screen or update the UI.
                // You can add navigation.navigate here if needed.
            })
            .catch(error => {
                console.error('Error declining invite:', error);
                setIsLoading(false);
            });
    };

    const handleAccept = () => {
        setIsLoading(true);
        acceptAMITInvite({inviteId: MITID})
            .then(res => {
                setIsLoading(false);
                // Add any additional logic you need after accepting the invite
                // For example, navigate to another screen or update the UI.
                // You can add navigation.navigate here if needed.
            })
            .catch(error => {
                console.error('Error accepting invite:', error);
                setIsLoading(false);
            });
    };

    // Then, you can use these functions in your navigation.navigate calls
    const handleDeclineNavigation = () => {
        handleDecline(); // Call the decline function here
        navigation.navigate('DeclineMITScreen', {
            MITID: MITID,
            movie: movie,
            creator: creator,
            inviteDate: inviteDate,
            akcruBadge: akcruBadge,
            schedule: schedule,
            timezone: timezone,
            expiresAt: expiresAt,
        });
    };

    const handleAcceptNavigation = () => {
        handleAccept(); // Call the accept function here
        navigation.navigate('AcceptMITScreen', {
            MITID: MITID,
            movie: movie,
            creator: creator,
            inviteDate: inviteDate,
            akcruBadge: akcruBadge,
            schedule: schedule,
            timezone: timezone,
            expiresAt: expiresAt,
        });
    };

    const handleCancelInviteFromSent = () => {
        if (MITID == null) {
            Alert.alert('Unable to cancel invite', 'Missing invite information.');
            return;
        }

        setIsLoading(true);
        cancelSentMIT(String(MITID))
            .then(response => {
                setIsLoading(false);
                if (response.success) {
                    reset({
                        index: 0,
                        routes: [
                            {
                                name: 'ClientTabNavigator',
                                params: {
                                    screen: 'UserProfileStack',
                                    params: {
                                        screen: 'UserProfileScreen',
                                    },
                                },
                            },
                        ],
                    });
                    return;
                }
                Alert.alert('Unable to cancel invite', response.message || 'Please try again.');
            })
            .catch(error => {
                console.error('Error cancelling sent MIT invite:', error);
                setIsLoading(false);
                Alert.alert('Unable to cancel invite', 'Please try again.');
            });
    };

    //Playing Trailer functions

    const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state: string) => {
        if (state === 'ended') {
            setPlaying(false);
            Alert.alert('Trailer has finished playing!');
        }
    }, []);

    const toggleTrailerPlaying = useCallback(() => {
        setPlaying(prev => !prev);
    }, []);

    const handleChangeMovie = () => {
        if (counterpartUserId) {
            navigate('NoBottomStack', {
                screen: 'SendMITViewUser',
                params: {
                    userID: counterpartUserId,
                    isFromChangeMovie: true,
                    inviteId: MITID,
                    currentMovieId: movie?.id,
                },
            });
            return;
        }
        navigation.goBack();
    };

    const navigateToCrummunityNoBack = () => {
        reset({
            index: 0,
            routes: [
                {
                    name: 'ClientTabNavigator',
                    params: {
                        screen: 'CrummunityStack',
                        params: {
                            screen: 'CrummunityScreen',
                        },
                    },
                },
            ],
        });
    };

    const handleBackToFeed = () => {
        navigateToCrummunityNoBack();
    };
    const handleOpenMITChat = (initialMessage?: string) => {
        if (!counterpartUserId || MITID == null) {
            Alert.alert('Unable to open chat', 'Missing chat details.');
            return;
        }

        navigate('NoBottomStack', {
            screen: 'ViewChat',
            params: {
                userId: counterpartUserId,
                mItInviteId: String(MITID),
                movie: movie,
                profilePicture: counterpartUser?.profilePicture ?? '',
                username: counterpartUser?.username ?? '',
                initialMessage: initialMessage ?? '',
            },
        });
    };

    const [data, setData] = useState<IUserProfile[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (counterpartUserId) {
                const result = await getFollowers(counterpartUserId);
                console.log('result:', result);

                if (result && result.followers && Array.isArray(result.followers)) {
                    setData(result.followers);
                }
            }
        };

        fetchData();
    }, [counterpartUserId]);

    useEffect(() => {
        setRemainingSeconds(getRemainingSecondsFromExpiry(expiresAt));
        previousRemainingSeconds.current = getRemainingSecondsFromExpiry(expiresAt);

        if (!expiresAt) {
            return () => {};
        }

        const intervalId = setInterval(() => {
            const nextRemainingSeconds = getRemainingSecondsFromExpiry(expiresAt);
            setRemainingSeconds(nextRemainingSeconds);

            if (nextRemainingSeconds <= 0) {
                clearInterval(intervalId);
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [expiresAt]);

    useEffect(() => {
        const animateUnitChange = (animValue: Animated.Value) => {
            animValue.setValue(0);
            Animated.timing(animValue, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        };

        const previousHours = Math.floor(previousRemainingSeconds.current / 3600)
            .toString()
            .padStart(2, '0');
        const previousMinutes = Math.floor((previousRemainingSeconds.current % 3600) / 60)
            .toString()
            .padStart(2, '0');
        const previousSeconds = (previousRemainingSeconds.current % 60).toString().padStart(2, '0');

        const nextHours = Math.floor(remainingSeconds / 3600)
            .toString()
            .padStart(2, '0');
        const nextMinutes = Math.floor((remainingSeconds % 3600) / 60)
            .toString()
            .padStart(2, '0');
        const nextSeconds = (remainingSeconds % 60).toString().padStart(2, '0');

        if (nextHours[0] !== previousHours[0]) {
            animateUnitChange(hourTensSwipeAnim);
        }
        if (nextHours[1] !== previousHours[1]) {
            animateUnitChange(hourOnesSwipeAnim);
        }
        if (nextMinutes[0] !== previousMinutes[0]) {
            animateUnitChange(minuteTensSwipeAnim);
        }
        if (nextMinutes[1] !== previousMinutes[1]) {
            animateUnitChange(minuteOnesSwipeAnim);
        }
        if (nextSeconds[0] !== previousSeconds[0]) {
            animateUnitChange(secondTensSwipeAnim);
        }
        if (nextSeconds[1] !== previousSeconds[1]) {
            animateUnitChange(secondOnesSwipeAnim);
        }

        previousRemainingSeconds.current = remainingSeconds;
    }, [
        hourOnesSwipeAnim,
        hourTensSwipeAnim,
        minuteOnesSwipeAnim,
        minuteTensSwipeAnim,
        remainingSeconds,
        secondOnesSwipeAnim,
        secondTensSwipeAnim,
    ]);

    const countdownHours = Math.floor(remainingSeconds / 3600)
        .toString()
        .padStart(2, '0');
    const countdownMinutes = Math.floor((remainingSeconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
    const countdownSeconds = (remainingSeconds % 60).toString().padStart(2, '0');
    const hourDigits = countdownHours.split('');
    const minuteDigits = countdownMinutes.split('');
    const secondDigits = countdownSeconds.split('');
    const inviteDayLabel =
        schedule && timezone ? moment(schedule).tz(timezone).format('dddd') : '';
    const inviteDateTimeLabel =
        schedule && timezone
            ? `${moment(schedule).tz(timezone).format('MMM D')} • ${moment(schedule)
                  .tz(timezone)
                  .format('h:mm A')} ${getShortenedTimezone(timezone)}`
            : '';
    const isMovieTimePassed =
        schedule && timezone ? moment().tz(timezone).isAfter(moment(schedule).tz(timezone)) : false;
    const inviteStatusDisplay = inviteStatusCode === 'PENDING' ? 'Awaiting Response' : inviteStatusCode;
    const declinedHeaderTitle =
        inviteStatusCode === 'DECLINED'
            ? 'Invite Declined'
            : inviteStatusCode === 'EXPIRED'
              ? 'Invite Expired'
              : inviteStatusCode === 'CANCELED' || inviteStatusCode === 'CANCELLED'
                ? 'Invite Canceled'
                : 'Invite Update';
    const declinedHeaderSubtitle = inviteStatusExplanation || 'Please try again with a different invite.';
    const safeBottomInset = Math.max(insets.bottom, 10);
    const showPinnedSentActions = fromSentTab && inviteStatusCode === 'PENDING' && !showMITSwipe;
    const pendingContentBottomPadding = showMITSwipe
        ? safeBottomInset + 180
        : showPinnedSentActions
          ? safeBottomInset + 220
          : safeBottomInset + 24;
    const combinedCardGradients: [string, string, string][] = [
        ['rgba(104, 214, 255, 0.96)', 'rgba(154, 132, 255, 0.96)', 'rgba(210, 136, 255, 0.96)'],
    ];
    const renderPendingInviteCombinedCard = (colors: [string, string, string], index: number) => (
        <LinearGradient
            key={`pending-card-${index}`}
            colors={colors}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.inviteInfoCardBorder}>
            <View style={{backgroundColor: 'rgba(0,0,0,0.82)', borderRadius: 16, padding: 8}}>
                <View
                    style={[
                        styles.inviteInfoCard,
                        {backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 0},
                    ]}>
                    <View style={styles.inviteAvatarWrap}>
                        <HexAvatar
                            source={{uri: counterpartUser?.profilePicture}}
                            size={54}
                            bordercolor={selectAvatarBorderColor(counterpartUser?.badge ?? 'AKCRUIT')}
                        />
                    </View>
                    <View style={styles.inviteInfoBody}>
                        <Text style={styles.inviteInfoUsername} numberOfLines={1}>
                            @{counterpartUser?.username ?? 'user'}
                        </Text>
                        <View style={styles.inviteInfoMetaRow}>
                            <Icon name="calendar-outline" type="ionicon" size={14} color={COLORS.WHITE} />
                            <Text style={styles.inviteInfoMetaText}>{inviteDayLabel}</Text>
                        </View>
                        <View style={styles.inviteInfoMetaRow}>
                            <Icon name="time-outline" type="ionicon" size={14} color={COLORS.WHITE} />
                            <Text style={styles.inviteInfoMetaText}>{inviteDateTimeLabel}</Text>
                        </View>
                    <View style={styles.inviteInfoStatusRow}>
                        <View style={[styles.inviteInfoStatusDot, {backgroundColor: inviteStatusColor}]} />
                        <Text
                            style={[
                                styles.inviteInfoStatusText,
                                {
                                    color: COLORS.WHITE,
                                    textDecorationLine: 'underline',
                                    textDecorationColor: COLORS.WHITE,
                                },
                            ]}>
                            {inviteStatusDisplay}
                        </Text>
                    </View>
                </View>
                <View style={styles.inviteFollowerWrap}>
                    <Text style={styles.inviteFollowerCount}>{formatNumber(data.length)}</Text>
                    <Text style={styles.inviteFollowerLabel}>Followers</Text>
                </View>
            </View>
                <View style={{height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 8}} />
                <View
                    style={[
                        styles.inviteMovieCard,
                        {marginTop: 0, backgroundColor: 'transparent', paddingHorizontal: 0},
                    ]}>
                    <Image
                        source={{uri: movie?.portraitURL || movie?.landscapeURL}}
                        style={styles.inviteMoviePoster}
                        resizeMode="cover"
                    />
                    <View style={styles.inviteMovieInfo}>
                        <Text style={styles.inviteMovieTitle} numberOfLines={2}>
                            {movie?.title}
                        </Text>
                        <Text style={styles.inviteMovieMeta}>
                            {movie?.year} • {formatMovieDuration(movie?.duration)}
                        </Text>
                        <View style={styles.inviteMovieTagRow}>
                            {movie?.rated ? (
                                <Text style={styles.inviteMovieTag} numberOfLines={1}>
                                    {movie.rated}
                                </Text>
                            ) : null}
                            {movie?.genres?.[0] ? (
                                <Text style={styles.inviteMovieTag} numberOfLines={1}>
                                    {capitalizeFirstLetterOfString(movie.genres[0])}
                                </Text>
                            ) : null}
                            {movie?.rating ? (
                                <Text style={styles.inviteMovieTag} numberOfLines={1}>
                                    {movie.rating}/10
                                </Text>
                            ) : null}
                        </View>
                    </View>
                    {movie?.trailerURL ? (
                        <View style={styles.inviteTrailerWrap}>
                            <LinearGradient
                                colors={['#00E5FF', '#7C4DFF', '#FF4FD8']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={styles.inviteTrailerGradient}>
                                <TouchableOpacity
                                    style={styles.inviteTrailerSideButton}
                                    activeOpacity={0.85}
                                    onPress={() =>
                                        navigation.navigate('TrailerPlayer', {
                                            id: movie?.id,
                                            trailerURL: movie?.trailerURL,
                                            landscapeURL: movie?.landscapeURL,
                                        })
                                    }>
                                    <Icon name="play" type="ionicon" size={12} color={COLORS.WHITE} style={styles.inviteTrailerIcon} />
                                    <Text style={styles.inviteTrailerButtonText}>Movie Trailer</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    ) : null}
                </View>
            </View>
        </LinearGradient>
    );
    const getFoldDigitStyle = (animValue: Animated.Value) => ({
        transform: [
            {perspective: 1000},
            {
                rotateX: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-90deg', '0deg'],
                }),
            },
        ],
        opacity: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.7, 1],
        }),
    });

    const acceptedQuickPrompts = [
        'Good pick 👀 you ready?',
        "Had a feeling you'd say yes 😉",
        'You bringing snacks or am I ordering Cru Chew?',
        'Wanna keep it casual or make this a vibe?',
    ];
    const [acceptedDraftMessage, setAcceptedDraftMessage] = useState('');
    const isDeclinedStatus = inviteStatusCode === 'DECLINED';
    const isCancelledStatus = inviteStatusCode === 'CANCELED' || inviteStatusCode === 'CANCELLED';
    const isExpiredStatus = inviteStatusCode === 'EXPIRED';
    const showDeclinedPinnedActions = isDeclinedStatus;
    const [showUnlockBestMatchesCard, setShowUnlockBestMatchesCard] = useState(false);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await getMatches();
                if (!active || !data?.success) {
                    return;
                }
                const isUnlocked = !!data.unlocked;
                const hiddenCount = data.hiddenCount ?? 0;
                const additionalLockedCount = isUnlocked ? 0 : Math.max((data.matches?.length ?? 0) - 2, 0);
                const totalLockedCards = isUnlocked ? 0 : hiddenCount + additionalLockedCount;
                setShowUnlockBestMatchesCard(!isUnlocked && totalLockedCards > 0);
            } catch (e) {
                if (active) {
                    setShowUnlockBestMatchesCard(false);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    if (inviteStatusCode === 'ACCEPTED') {
        return (
            <TabContainer>
                <View style={styles.acceptedScreenContainer}>
                    <ScrollView
                        style={styles.chooseMitScroll}
                        contentContainerStyle={[styles.acceptedScrollContent, {paddingBottom: safeBottomInset + 130}]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}>
                        <Header />
                        <View style={styles.acceptedInnerContent}>
                            <View style={styles.acceptedTopArea}>
                                <TouchableOpacity
                                    style={styles.pendingBackButton}
                                    activeOpacity={0.85}
                                    onPress={() =>
                                        navigate('NoBottomStack', {
                                            screen: 'UserMITHubScreen',
                                        })
                                    }>
                                    <Icon name="chevron-back" type="ionicon" size={18} color={COLORS.LIGHTGREY} />
                                    <Text style={styles.pendingBackText}>Back</Text>
                                </TouchableOpacity>
                                <Image source={imageindex.accept_mit_image} style={styles.acceptedHeaderImage} resizeMode="contain" />
                                <Text style={styles.acceptedTitle}>Invite Accepted</Text>
                                <Text style={styles.acceptedSubtitle}>You're in. Your MIT chat is now unlocked.</Text>
                            </View>

                            {renderPendingInviteCombinedCard(combinedCardGradients[0], 0)}
                            {!isMovieTimePassed ? (
                                <>
                                    <TouchableOpacity
                                        style={styles.acceptedChatButton}
                                        activeOpacity={0.9}
                                        onPress={() => handleOpenMITChat('')}>
                                        <Text style={styles.acceptedChatButtonText}>Open MIT Chat</Text>
                                        <Text style={styles.acceptedChatHint}>Break the ice before the movie starts</Text>
                                    </TouchableOpacity>

                                    <Text style={styles.acceptedSmoothText}>Say something smooth...</Text>
                                    <View style={styles.acceptedPromptList}>
                                        {acceptedQuickPrompts.map(prompt => (
                                            <TouchableOpacity
                                                key={prompt}
                                                style={styles.acceptedPromptChip}
                                                activeOpacity={0.85}
                                                onPress={() => handleOpenMITChat(prompt)}>
                                                <Text style={styles.acceptedPromptText}>{prompt}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            ) : null}
                        </View>
                    </ScrollView>

                    {!isMovieTimePassed ? (
                        <View style={[styles.acceptedBottomComposer, {paddingBottom: safeBottomInset}]}>
                            <View style={styles.acceptedComposerInputRow}>
                                <TextInput
                                    style={styles.acceptedComposerInput}
                                    value={acceptedDraftMessage}
                                    onChangeText={setAcceptedDraftMessage}
                                    placeholder="Message your MIT match..."
                                    placeholderTextColor="rgba(226,205,252,0.92)"
                                />
                                <TouchableOpacity
                                    style={styles.acceptedComposerSend}
                                    activeOpacity={0.9}
                                    onPress={() => handleOpenMITChat(acceptedDraftMessage)}>
                                    <Icon name="send" type="ionicon" color={COLORS.WHITE} size={16} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}
                </View>
            </TabContainer>
        );
    }

    if (isDeclinedStatus || isCancelledStatus || isExpiredStatus) {
        return (
            <TabContainer>
                <View style={styles.acceptedScreenContainer}>
                    <Animated.View style={[styles.sheetcontainer, isFogged ? ghostContentStyle : null]}>
                        <ScrollView
                            style={styles.chooseMitScroll}
                            contentContainerStyle={[
                                styles.acceptedScrollContent,
                                {paddingBottom: safeBottomInset + (showDeclinedPinnedActions ? 310 : 24)},
                            ]}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}>
                            <Header />
                            <View style={styles.acceptedInnerContent}>
                                <TouchableOpacity
                                    style={styles.pendingBackButton}
                                    activeOpacity={0.85}
                                    onPress={() =>
                                        navigate('NoBottomStack', {
                                            screen: 'UserMITHubScreen',
                                        })
                                    }>
                                    <Icon name="chevron-back" type="ionicon" size={18} color={COLORS.LIGHTGREY} />
                                    <Text style={styles.pendingBackText}>Back</Text>
                                </TouchableOpacity>
                                <View style={styles.acceptedTopArea}>
                                    <Image source={imageindex.accept_mit_image} style={styles.acceptedHeaderImage} resizeMode="contain" />
                                    <Text style={styles.declinedTitle}>{declinedHeaderTitle}</Text>
                                    <Text style={styles.declinedSubtitle}>{declinedHeaderSubtitle}</Text>
                                </View>
                                {renderPendingInviteCombinedCard(combinedCardGradients[0], 0)}
                            </View>
                        </ScrollView>
                        {showDeclinedPinnedActions ? (
                            <View style={[styles.declinedPinnedActionsWrap, {paddingBottom: safeBottomInset}]}>
                                <TouchableOpacity
                                    style={styles.declinedSecondaryCta}
                                    activeOpacity={0.9}
                                    onPress={navigateToCrummunityNoBack}>
                                    <Text style={styles.declinedSecondaryTitle}>👥 Send This Invite to Someone Else</Text>
                                    <Text style={styles.declinedSecondarySub}>Your Cru might be down for this one</Text>
                                </TouchableOpacity>

                                {showUnlockBestMatchesCard ? (
                                    <LinearGradient
                                        colors={['#8D4CFF', 'rgba(104, 214, 255, 0.96)', 'rgba(154, 132, 255, 0.96)', 'rgba(210, 136, 255, 0.96)', '#B8860B']}
                                        start={{x: 0, y: 0}}
                                        end={{x: 1, y: 1}}
                                        style={styles.declinedUnlockCardBorder}>
                                        <View style={styles.declinedUnlockCard}>
                                            <Text style={styles.declinedUnlockTitle}>🔒 Unlock Your Best Matches</Text>
                                            <Text style={styles.declinedUnlockSub}>
                                                Higher match = higher chance they accept your invite
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.declinedUnlockButton}
                                                activeOpacity={0.9}
                                                onPress={() =>
                                                    reset({
                                                        index: 0,
                                                        routes: [
                                                            {
                                                                name: 'NoBottomStack',
                                                                params: {
                                                                    screen: 'FlickFlirtMatches',
                                                                },
                                                            },
                                                        ],
                                                    })
                                                }>
                                                <Text style={styles.declinedUnlockButtonText}>Unlock Matches</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </LinearGradient>
                                ) : null}
                                <TouchableOpacity style={styles.declinedBackToFeedWrap} activeOpacity={0.85} onPress={handleBackToFeed}>
                                    <View style={styles.declinedBackDividerRow}>
                                        <View style={styles.declinedBackDividerLine} />
                                        <Text style={styles.declinedBackToFeed}>Or jump back into your feed.</Text>
                                        <View style={styles.declinedBackDividerLine} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ) : null}
                        {isFogged ? (
                            <Animated.View
                                pointerEvents="none"
                                style={[
                                    StyleSheet.absoluteFill,
                                    {zIndex: 6},
                                    {
                                        opacity: fogFadeProgress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 0.82],
                                        }),
                                    },
                                ]}>
                                <LinearGradient
                                    colors={[
                                        'rgba(255,255,255,0.22)',
                                        'rgba(160,150,200,0.55)',
                                        'rgba(90,85,120,0.5)',
                                        'rgba(255,255,255,0.18)',
                                    ]}
                                    locations={[0, 0.35, 0.65, 1]}
                                    start={{x: 0.2, y: 0}}
                                    end={{x: 0.85, y: 1}}
                                    style={StyleSheet.absoluteFill}
                                />
                                {fogOrbs.map((orb, idx) => (
                                    <View
                                        key={`declined-fog-orb-${idx}`}
                                        style={[
                                            styles.fogOrb,
                                            {
                                                width: orb.size,
                                                height: orb.size,
                                                borderRadius: orb.size / 2,
                                                top: orb.top,
                                                left: orb.left,
                                                opacity: orb.opacity,
                                            },
                                        ]}
                                    />
                                ))}
                            </Animated.View>
                        ) : null}
                    </Animated.View>
                </View>
            </TabContainer>
        );
    }

    if (isPendingInvite) {
        return (
            <TabContainer>
                <View style={styles.pendingScreenContainer}>
                    <Animated.View style={[styles.sheetcontainer, isFogged ? ghostContentStyle : null]}>
                        <ScrollView
                            style={styles.chooseMitScroll}
                            contentContainerStyle={[
                                styles.pendingScreenScrollContent,
                                {paddingBottom: pendingContentBottomPadding},
                            ]}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            alwaysBounceVertical>
                            <View>
                                <Header />
                            </View>
                            <View style={[styles.pendingBackRow, showMITSwipe ? styles.pendingBackRowCompact : null]}>
                                <TouchableOpacity
                                    style={styles.pendingBackButton}
                                    activeOpacity={0.85}
                                    onPress={() =>
                                        navigate('NoBottomStack', {
                                            screen: 'UserMITHubScreen',
                                        })
                                    }>
                                    <Icon
                                        name="chevron-back"
                                        type="ionicon"
                                        size={18}
                                        color={COLORS.LIGHTGREY}
                                    />
                                    <Text style={styles.pendingBackText}>Back</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.countdownContainer, styles.countdownContainerSticky]}>
                                <View style={[styles.countdownRingWrap, showMITSwipe ? styles.countdownRingWrapCompact : null]}>
                                    <View style={styles.countdownOuterGlow} />
                                    <View style={styles.countdownRingOuter}>
                                        <Animated.View
                                            style={[
                                                styles.countdownRingSpin,
                                                {transform: [{rotate: ringSpinRotation}]},
                                            ]}>
                                            <LinearGradient
                                                colors={['rgba(121, 95, 255, 0.75)', 'rgba(255, 67, 195, 0.75)', 'rgba(101, 230, 255, 0.65)']}
                                                start={{x: 0, y: 0}}
                                                end={{x: 1, y: 1}}
                                                style={StyleSheet.absoluteFill}
                                            />
                                        </Animated.View>
                                        <View style={styles.countdownRingInnerContent}>
                                            <View style={styles.countdownDialCenter}>
                                                <Text style={styles.countdownTitleInCircle}>Expires in</Text>
                                                <View style={styles.countdownTimerRow}>
                                                    <View style={styles.countdownUnit}>
                                                        <View style={styles.countdownDigitsRow}>
                                                            <Animated.View style={getFoldDigitStyle(hourTensSwipeAnim)}>
                                                                <View style={styles.countdownDigitBox}>
                                                                    <Text style={styles.countdownDigitText}>{hourDigits[0]}</Text>
                                                                </View>
                                                            </Animated.View>
                                                            <Animated.View style={getFoldDigitStyle(hourOnesSwipeAnim)}>
                                                                <View style={styles.countdownDigitBox}>
                                                                    <Text style={styles.countdownDigitText}>{hourDigits[1]}</Text>
                                                                </View>
                                                            </Animated.View>
                                                        </View>
                                                    </View>
                                                    <Text style={styles.countdownSeparator}>:</Text>
                                                    <View style={styles.countdownUnit}>
                                                        <View style={styles.countdownDigitsRow}>
                                                            <Animated.View style={getFoldDigitStyle(minuteTensSwipeAnim)}>
                                                                <View style={styles.countdownDigitBox}>
                                                                    <Text style={styles.countdownDigitText}>{minuteDigits[0]}</Text>
                                                                </View>
                                                            </Animated.View>
                                                            <Animated.View style={getFoldDigitStyle(minuteOnesSwipeAnim)}>
                                                                <View style={styles.countdownDigitBox}>
                                                                    <Text style={styles.countdownDigitText}>{minuteDigits[1]}</Text>
                                                                </View>
                                                            </Animated.View>
                                                        </View>
                                                    </View>
                                                    <Text style={styles.countdownSeparator}>:</Text>
                                                    <View style={styles.countdownUnit}>
                                                        <View style={styles.countdownDigitsRow}>
                                                            <Animated.View style={getFoldDigitStyle(secondTensSwipeAnim)}>
                                                                <View style={styles.countdownDigitBox}>
                                                                    <Text style={styles.countdownDigitText}>{secondDigits[0]}</Text>
                                                                </View>
                                                            </Animated.View>
                                                            <Animated.View style={getFoldDigitStyle(secondOnesSwipeAnim)}>
                                                                <View style={styles.countdownDigitBox}>
                                                                    <Text style={styles.countdownDigitText}>{secondDigits[1]}</Text>
                                                                </View>
                                                            </Animated.View>
                                                        </View>
                                                    </View>
                                                </View>
                                                {!showMITSwipe ? (
                                                    <>
                                                        <View style={styles.countdownHRule} />
                                                        <Text style={styles.countdownSubTextInCircle}>
                                                            {"If they don't respond,\nyour mit is returned."}
                                                        </Text>
                                                    </>
                                                ) : null}
                                            </View>
                                        </View>
                                    </View>
                                </View>

                            {combinedCardGradients.map((gradientColors, index) =>
                                renderPendingInviteCombinedCard(gradientColors, index),
                            )}

                        </View>
                        </ScrollView>

                        {showMITSwipe ? (
                            <View style={[styles.pendingSwipeBottomArea, {paddingBottom: safeBottomInset}]}>
                                <View style={[styles.mitSwipeWrap, styles.pendingHorizontalInset]}>
                                    <MITSwipe decline={handleDeclineNavigation} accept={handleAcceptNavigation} />
                                </View>
                                <Text style={styles.pendingSwipeHintText}>SWIPE BUTTON LEFT OR RIGHT.</Text>
                            </View>
                        ) : null}
                        {showPinnedSentActions ? (
                            <View style={[styles.pendingSentPinnedContainer, {paddingBottom: safeBottomInset}]}>
                                <View style={styles.pendingActionsWrap}>
                                    <TouchableOpacity
                                        style={styles.cancelInviteButton}
                                        activeOpacity={0.85}
                                        onPress={handleCancelInviteFromSent}
                                        disabled={isLoading}>
                                        <Icon
                                            name="close"
                                            type="ionicon"
                                            size={16}
                                            color="#FFD8DE"
                                            style={styles.cancelInviteIcon}
                                        />
                                        <Text style={styles.cancelInviteButtonText}>
                                            {isLoading ? 'Cancelling...' : 'Cancel Invite'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.secondaryActionButton}
                                        activeOpacity={0.85}
                                        onPress={handleChangeMovie}>
                                        <Icon
                                            name="film"
                                            type="ionicon"
                                            size={16}
                                            color={COLORS.WHITE}
                                            style={styles.secondaryActionIcon}
                                        />
                                        <Text style={styles.secondaryActionText}>Change Movie</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.85} onPress={handleBackToFeed}>
                                        <Text style={styles.backToFeedText}>Back to feed</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : null}
                    </Animated.View>
                </View>
            </TabContainer>
        );
    }

    return (
        <TabContainer>
            <View style={{flex: 1, backgroundColor: COLORS.BLACK, position: 'relative'}}>
                {!isPendingInvite ? (
                    <LinearGradient
                        colors={['#07030F', '#1B0830', '#2A0F46', '#130522', '#05020B']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.screenGlowBackground}
                    />
                ) : null}
                <Animated.View style={[styles.sheetcontainer, isFogged ? ghostContentStyle : null]}>
                    <ScrollView
                        style={styles.chooseMitScroll}
                        contentContainerStyle={styles.chooseMitScrollContent}
                        stickyHeaderIndices={[0]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}>
                        <View>
                            <Header />
                        </View>
                        <View style={isPendingInvite ? styles.hiddenSection : undefined}>
                            <View
                                //   source={{uri: DIGITAL_PASS[0].SuperHeroPass}}
                                //   resizeMode="cover"
                                style={{
                                    height: isPendingInvite ? SIZES.ScreenHeight / 6 : SIZES.ScreenHeight / 4,
                                    marginTop: -60,
                                }}>
                                <LinearGradient
                                    // Background Linear Gradient
                                    colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.BLACK]}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        height: isPendingInvite ? SIZES.ScreenHeight / 6 : SIZES.ScreenHeight / 4,
                                    }}
                                />
                                <View style={styles.topcontainer}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                        }}>
                                        <TouchableOpacity
                                            onPress={() =>
                                                navigate('NoBottomStack', {
                                                    screen: 'UserMITHubScreen',
                                                })
                                            }>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                }}>
                                                <Icon
                                                    name="chevron-back"
                                                    type="ionicon"
                                                    size={20}
                                                    color={COLORS.LIGHTGREY}
                                                />
                                                <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            {inviteStatusCode !== 'PENDING' ? (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: -120,
                                        marginHorizontal: 15,
                                    }}>
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{marginRight: 8}}>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    navigation.navigate('ViewUserScreen', {userID: counterpartUserId})
                                                }>
                                                <HexAvatar
                                                    source={{uri: counterpartUser?.profilePicture}}
                                                    size={58}
                                                    bordercolor={selectAvatarBorderColor(counterpartUser?.badge ?? 'AKCRUIT')}
                                                />
                                            </TouchableOpacity>
                                            <View />
                                        </View>
                                        <View>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <Text style={{...FONTS.Username}}>{counterpartUser?.username}</Text>
                                                {counterpartUser?.ownerStatus && (
                                                    <CustomIcon
                                                        name="ribbon"
                                                        type="ionicon"
                                                        color={COLORS.STARGOLD}
                                                        baseSize={12}
                                                        style={{marginRight: 5}}
                                                    />
                                                )}
                                                {counterpartUser?.companyStatus && (
                                                    <CustomIcon
                                                        name="ribbon"
                                                        type="ionicon"
                                                        color={COLORS.WHITE}
                                                        baseSize={12}
                                                        style={{marginRight: 5}}
                                                    />
                                                )}
                                                {counterpartUser?.influencerStatus && (
                                                    <CustomIcon
                                                        name="ribbon"
                                                        type="ionicon"
                                                        color={COLORS.AKCRUBLUE}
                                                        baseSize={12}
                                                        style={{marginRight: 5}}
                                                    />
                                                )}
                                                {counterpartUser?.blackCloakStatus && (
                                                    <CustomIcon
                                                        name="ribbon"
                                                        type="ionicon"
                                                        color={COLORS.BLACKCLOAK}
                                                        baseSize={12}
                                                        style={{marginRight: 5}}
                                                    />
                                                )}
                                            </View>
                                            <Text style={{...FONTS.paragraph1}}>{counterpartUser?.firstName}</Text>
                                            {counterpartUser?.badge === 'AKCRUIT' && (
                                                <View>
                                                    <AkcruLevels.AkcruBadgeAkcruit />
                                                </View>
                                            )}
                                            {counterpartUser?.badge === 'GUARDIAN' && (
                                                <View>
                                                    <AkcruLevels.AkcruBadgeGuardian />
                                                </View>
                                            )}
                                            {counterpartUser?.badge === 'HERO' && (
                                                <View>
                                                    <AkcruLevels.AkcruBadgeHero />
                                                </View>
                                            )}
                                            {counterpartUser?.badge === 'SUPERHERO' && (
                                                <View>
                                                    <AkcruLevels.AkcruBadgeSuperHero />
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View style={{marginVertical: 8}}>
                                        <View
                                            style={{
                                                alignItems: 'center',
                                                borderLeftWidth: 1,
                                                borderColor: COLORS.DARKGREY,
                                                paddingLeft: 10,
                                            }}>
                                            <View
                                                style={{
                                                    width: 100,
                                                    height: 52,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                <Text style={{...FONTS.Title1, color: COLORS.AKCRUBLUE}}>
                                                    {formatNumber(data.length)}
                                                </Text>
                                                <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>Followers</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ) : null}
                            <View>
                                <View style={styles.bottomcontainer}>
                                    {!isPendingInvite ? (
                                        <>
                                            <View style={{alignItems: 'center', marginBottom: 10}}>
                                                <View style={{marginTop: 20, width: '100%'}}>
                                                    <View style={styles.mitMovieCard}>
                                                        <View style={styles.ticketWrapper}>
                                                            <View style={styles.ticketContainer}>
                                                                <ImageBackground
                                                                    source={{uri: movie?.portraitURL}}
                                                                    style={styles.ticketImage}
                                                                    resizeMode="cover">
                                                                    <LinearGradient
                                                                        colors={['transparent', COLORS.BLACK]}
                                                                        style={styles.linearGradient}>
                                                                        <View
                                                                            style={[
                                                                                styles.ticketCircle,
                                                                                {position: 'absolute', bottom: -10, left: -10},
                                                                            ]}
                                                                        />
                                                                        <View
                                                                            style={[
                                                                                styles.ticketCircle,
                                                                                {position: 'absolute', bottom: -10, right: -10},
                                                                            ]}
                                                                        />
                                                                    </LinearGradient>
                                                                </ImageBackground>
                                                            </View>
                                                            <View style={styles.ticketFooter}>
                                                                <View
                                                                    style={[
                                                                        styles.ticketCircle,
                                                                        {position: 'absolute', top: -10, left: -10},
                                                                    ]}
                                                                />
                                                                <View
                                                                    style={[
                                                                        styles.ticketCircle,
                                                                        {position: 'absolute', top: -10, right: -10},
                                                                    ]}
                                                                />
                                                                <View style={{alignItems: 'center', marginVertical: 10}}>
                                                                    <Image
                                                                        source={imageindex.barcode}
                                                                        style={{
                                                                            width: '75%',
                                                                            height: '100%',
                                                                        }}
                                                                    />
                                                                </View>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mitMovieCardContent}>
                                                            <Text style={{...FONTS.ContentTitle}} numberOfLines={3}>
                                                                {movie?.title}
                                                            </Text>
                                                            <View
                                                                style={{
                                                                    flexDirection: 'row',
                                                                    marginBottom: 5,
                                                                    marginTop: 6,
                                                                    alignItems: 'center',
                                                                    flexWrap: 'wrap',
                                                                }}>
                                                                <Text style={{...FONTS.Title2}}>{movie?.year}</Text>
                                                                <Text style={{...FONTS.Title2}}> | </Text>
                                                                <Text
                                                                    style={{
                                                                        ...FONTS.Title2,
                                                                    }}>
                                                                    {formatMovieDuration(movie?.duration)}
                                                                </Text>
                                                            </View>
                                                            <View style={{flexDirection: 'row', marginVertical: 5, flexWrap: 'wrap'}}>
                                                                <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                                                <Text style={styles.drawfonttag}>
                                                                    {capitalizeFirstLetterOfString(movie?.genres[0])}
                                                                </Text>
                                                                <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                                                            </View>
                                                            <AkcruButtons.SmallButton
                                                                btnname="Play Trailer"
                                                                variant="auth"
                                                                onPress={() => {
                                                                    navigation.navigate('TrailerPlayer', {
                                                                        id: movie?.id,
                                                                        trailerURL: movie?.trailerURL,
                                                                        landscapeURL: movie?.landscapeURL,
                                                                    });
                                                                }}
                                                                color={COLORS.PURPLE}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>

                                            <Text
                                                style={{
                                                    ...FONTS.Title2,
                                                    color: COLORS.PINK,
                                                    textAlign: 'center',
                                                }}>
                                                "{counterpartUser?.firstName}" wants to watch "{movie?.title}" with you
                                            </Text>
                                            <View style={{marginVertical: 10}}>
                                                <View style={styles.datebox}>
                                                    <Text style={styles.datetext}>
                                                        {' '}
                                                        {moment(schedule)
                                                            .tz(timezone)
                                                            .format('ddd, MMM Do')}{' '}
                                                    </Text>
                                                    <Text style={styles.datetext}>@ </Text>
                                                    <Text style={styles.datetext}>
                                                        {moment(schedule).tz(timezone).format('h:mm A')}{' '}
                                                        {getShortenedTimezone(timezone)}
                                                    </Text>
                                                </View>
                                                <View style={{alignItems: 'center'}}>
                                                    <Text style={styles.inviteStatusRow}>
                                                        <Text style={styles.inviteStatusPrefix}>
                                                            Status:{' '}
                                                        </Text>
                                                        <Text
                                                            style={[
                                                                styles.inviteStatusValue,
                                                                {color: inviteStatusColor},
                                                            ]}>
                                                            {inviteStatusCode}
                                                        </Text>
                                                    </Text>
                                                    {inviteStatusExplanation ? (
                                                        <Text style={styles.inviteStatusSubtext}>
                                                            {inviteStatusExplanation}
                                                        </Text>
                                                    ) : null}
                                                </View>
                                            </View>
                                        </>
                                    ) : null}
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    {showAcceptDeclineSection ? (
                        <View
                            style={[
                                styles.chooseMitBottomBar,
                                showMITSwipe ? styles.swipeSectionRaised : null,
                                {paddingBottom: Math.max(insets.bottom, 10)},
                            ]}>
                            {showPendingInviteUi ? (
                                <View style={[styles.pendingBackRow, showMITSwipe ? styles.pendingBackRowCompact : null]}>
                                    <TouchableOpacity
                                        style={styles.pendingBackButton}
                                        activeOpacity={0.85}
                                        onPress={() =>
                                            navigate('NoBottomStack', {
                                                screen: 'UserMITHubScreen',
                                            })
                                        }>
                                        <Icon
                                            name="chevron-back"
                                            type="ionicon"
                                            size={18}
                                            color={COLORS.LIGHTGREY}
                                        />
                                        <Text style={styles.pendingBackText}>Back</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                            <View
                                style={[
                                    styles.countdownContainer,
                                    styles.countdownContainerSticky,
                                    showMITSwipe ? styles.receiveTopCompact : null,
                                ]}>
                                {showPendingInviteUi ? (
                                    <>
                                        <View style={[styles.countdownRingWrap, showMITSwipe ? styles.countdownRingWrapCompact : null]}>
                                            <View style={styles.countdownOuterGlow} />
                                            <View style={styles.countdownRingOuter}>
                                                <Animated.View
                                                    style={[
                                                        styles.countdownRingSpin,
                                                        {transform: [{rotate: ringSpinRotation}]},
                                                    ]}>
                                                    <LinearGradient
                                                        colors={['rgba(121, 95, 255, 0.75)', 'rgba(255, 67, 195, 0.75)', 'rgba(101, 230, 255, 0.65)']}
                                                        start={{x: 0, y: 0}}
                                                        end={{x: 1, y: 1}}
                                                        style={StyleSheet.absoluteFill}
                                                    />
                                                </Animated.View>
                                                <View style={styles.countdownRingInnerContent}>
                                                    <View style={styles.countdownDialCenter}>
                                                        <Text style={styles.countdownTitleInCircle}>Expires in</Text>
                                                        <View style={styles.countdownTimerRow}>
                                                            <View style={styles.countdownUnit}>
                                                                <View style={styles.countdownDigitsRow}>
                                                                    <Animated.View style={getFoldDigitStyle(hourTensSwipeAnim)}>
                                                                        <View style={styles.countdownDigitBox}>
                                                                            <Text style={styles.countdownDigitText}>{hourDigits[0]}</Text>
                                                                        </View>
                                                                    </Animated.View>
                                                                    <Animated.View style={getFoldDigitStyle(hourOnesSwipeAnim)}>
                                                                        <View style={styles.countdownDigitBox}>
                                                                            <Text style={styles.countdownDigitText}>{hourDigits[1]}</Text>
                                                                        </View>
                                                                    </Animated.View>
                                                                </View>
                                                            </View>

                                                            <Text style={styles.countdownSeparator}>:</Text>

                                                            <View style={styles.countdownUnit}>
                                                                <View style={styles.countdownDigitsRow}>
                                                                    <Animated.View style={getFoldDigitStyle(minuteTensSwipeAnim)}>
                                                                        <View style={styles.countdownDigitBox}>
                                                                            <Text style={styles.countdownDigitText}>{minuteDigits[0]}</Text>
                                                                        </View>
                                                                    </Animated.View>
                                                                    <Animated.View style={getFoldDigitStyle(minuteOnesSwipeAnim)}>
                                                                        <View style={styles.countdownDigitBox}>
                                                                            <Text style={styles.countdownDigitText}>{minuteDigits[1]}</Text>
                                                                        </View>
                                                                    </Animated.View>
                                                                </View>
                                                            </View>

                                                            <Text style={styles.countdownSeparator}>:</Text>

                                                            <View style={styles.countdownUnit}>
                                                                <View style={styles.countdownDigitsRow}>
                                                                    <Animated.View style={getFoldDigitStyle(secondTensSwipeAnim)}>
                                                                        <View style={styles.countdownDigitBox}>
                                                                            <Text style={styles.countdownDigitText}>{secondDigits[0]}</Text>
                                                                        </View>
                                                                    </Animated.View>
                                                                    <Animated.View style={getFoldDigitStyle(secondOnesSwipeAnim)}>
                                                                        <View style={styles.countdownDigitBox}>
                                                                            <Text style={styles.countdownDigitText}>{secondDigits[1]}</Text>
                                                                        </View>
                                                                    </Animated.View>
                                                                </View>
                                                            </View>
                                                        </View>
                                                        <View style={styles.countdownHRule} />
                                                        <Text style={styles.countdownSubTextInCircle}>
                                                            {"If they don't respond,\nyour mit is returned."}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        {combinedCardGradients.map((gradientColors, index) =>
                                            renderPendingInviteCombinedCard(gradientColors, index),
                                        )}
                                    </>
                                ) : null}
                                {showMITSwipe ? (
                                    <>
                                        <View style={styles.mitSwipeWrap}>
                                            <MITSwipe decline={handleDeclineNavigation} accept={handleAcceptNavigation} />
                                        </View>
                                        <View>
                                            <Text
                                                style={{
                                                    ...FONTS.Title2,
                                                    color: COLORS.PINK,
                                                    textAlign: 'center',
                                                    paddingTop: 10,
                                                }}>
                                                SWIPE BUTTON LEFT OR RIGHT.
                                            </Text>
                                        </View>
                                    </>
                                ) : fromSentTab && inviteStatusCode === 'PENDING' ? (
                                    <View style={styles.pendingActionsWrap}>
                                        <TouchableOpacity
                                            style={styles.cancelInviteButton}
                                            activeOpacity={0.85}
                                            onPress={handleCancelInviteFromSent}
                                            disabled={isLoading}>
                                            <Icon
                                                name="close"
                                                type="ionicon"
                                                size={16}
                                                color="#FFD8DE"
                                                style={styles.cancelInviteIcon}
                                            />
                                            <Text style={styles.cancelInviteButtonText}>
                                                {isLoading ? 'Cancelling...' : 'Cancel Invite'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.secondaryActionButton}
                                            activeOpacity={0.85}
                                            onPress={handleChangeMovie}>
                                            <Icon
                                                name="film"
                                                type="ionicon"
                                                size={16}
                                                color={COLORS.WHITE}
                                                style={styles.secondaryActionIcon}
                                            />
                                            <Text style={styles.secondaryActionText}>Change Movie</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity activeOpacity={0.85} onPress={handleBackToFeed}>
                                            <Text style={styles.backToFeedText}>Back to feed</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    ) : null}
                </Animated.View>
                {isFogged ? (
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            StyleSheet.absoluteFill,
                            {zIndex: 6},
                            {
                                opacity: fogFadeProgress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 0.82],
                                }),
                            },
                        ]}>
                        <LinearGradient
                            colors={[
                                'rgba(255,255,255,0.22)',
                                'rgba(160,150,200,0.55)',
                                'rgba(90,85,120,0.5)',
                                'rgba(255,255,255,0.18)',
                            ]}
                            locations={[0, 0.35, 0.65, 1]}
                            start={{x: 0.2, y: 0}}
                            end={{x: 0.85, y: 1}}
                            style={StyleSheet.absoluteFill}
                        />
                        {fogOrbs.map((orb, idx) => (
                            <View
                                key={`pending-fog-orb-${idx}`}
                                style={[
                                    styles.fogOrb,
                                    {
                                        width: orb.size,
                                        height: orb.size,
                                        borderRadius: orb.size / 2,
                                        top: orb.top,
                                        left: orb.left,
                                        opacity: orb.opacity,
                                    },
                                ]}
                            />
                        ))}
                    </Animated.View>
                ) : null}
            </View>

        </TabContainer>
    );
};

export default ChooseMITScreen;
