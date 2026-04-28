import React, {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {
    View,
    Text,
    ScrollView,
    ImageBackground,
    Image,
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
    const waitingForResponseText = counterpartUser?.username
        ? `Waitng for @${counterpartUser.username} to response`
        : 'Waitng for response';

    /** Expired (status or response window) or declined → ghosted content + fog overlay. */
    const isFogged = React.useMemo(() => {
        if (inviteStatusCode === 'DECLINED' || inviteStatusCode === 'EXPIRED') {
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
                duration: 18000,
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

    const handleBackToFeed = () => {
        navigate('ClientTabNavigator', {
            screen: 'ClientTabScreen',
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
    const inviteStatusDisplay = inviteStatusCode === 'PENDING' ? 'Awaiting Response' : inviteStatusCode;
    const safeBottomInset = Math.max(insets.bottom, 10);
    const pendingContentBottomPadding = showMITSwipe ? safeBottomInset + 180 : safeBottomInset + 24;
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
                                {isCurrentUserCreator ? (
                                    <Text style={styles.pendingWaitingText} numberOfLines={1}>
                                        {waitingForResponseText}
                                    </Text>
                                ) : null}
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

                            <LinearGradient
                                colors={['rgba(104, 214, 255, 0.96)', 'rgba(154, 132, 255, 0.96)', 'rgba(210, 136, 255, 0.96)']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={styles.inviteInfoCardBorder}>
                                <View style={styles.inviteInfoCard}>
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
                                            <View style={styles.inviteInfoStatusDot} />
                                            <Text style={styles.inviteInfoStatusText}>Status: {inviteStatusDisplay}</Text>
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>

                            <LinearGradient
                                colors={['rgba(255, 166, 214, 0.96)', 'rgba(223, 128, 255, 0.96)', 'rgba(134, 220, 255, 0.96)']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={styles.inviteMovieCardBorder}>
                                <View style={styles.inviteMovieCard}>
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
                                </View>
                            </LinearGradient>

                            {fromSentTab ? (
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
                        </ScrollView>

                        {showMITSwipe ? (
                            <View style={[styles.pendingSwipeBottomArea, {paddingBottom: safeBottomInset}]}>
                                <View style={styles.mitSwipeWrap}>
                                    <MITSwipe decline={handleDeclineNavigation} accept={handleAcceptNavigation} />
                                </View>
                                <Text style={styles.pendingSwipeHintText}>SWIPE BUTTON LEFT OR RIGHT.</Text>
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
                                    {isCurrentUserCreator ? (
                                        <Text style={styles.pendingWaitingText} numberOfLines={1}>
                                            {waitingForResponseText}
                                        </Text>
                                    ) : null}
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
                                        <LinearGradient
                                            colors={['rgba(104, 214, 255, 0.96)', 'rgba(154, 132, 255, 0.96)', 'rgba(210, 136, 255, 0.96)']}
                                            start={{x: 0, y: 0}}
                                            end={{x: 1, y: 1}}
                                            style={styles.inviteInfoCardBorder}>
                                            <View style={styles.inviteInfoCard}>
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
                                                        <View style={styles.inviteInfoStatusDot} />
                                                        <Text style={styles.inviteInfoStatusText}>Status: {inviteStatusDisplay}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </LinearGradient>
                                        <LinearGradient
                                            colors={['rgba(255, 166, 214, 0.96)', 'rgba(223, 128, 255, 0.96)', 'rgba(134, 220, 255, 0.96)']}
                                            start={{x: 0, y: 0}}
                                            end={{x: 1, y: 1}}
                                            style={styles.inviteMovieCardBorder}>
                                            <View style={styles.inviteMovieCard}>
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
                                            </View>
                                        </LinearGradient>
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
                    </Animated.View>
                ) : null}
            </View>

        </TabContainer>
    );
};

export default ChooseMITScreen;
