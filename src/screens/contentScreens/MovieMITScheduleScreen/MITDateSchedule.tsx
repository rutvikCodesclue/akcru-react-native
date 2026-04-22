import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Pressable,
    Image,
    TextInput,
    ImageBackground,
    Platform,
    Alert,
    Animated,
    Modal,
    Easing,
    BackHandler,
} from 'react-native';
import styles from './styles';
import React, {useState, useRef, useEffect} from 'react';
import Header from '../../../components/header';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants/index';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {findAUser} from '../../../lib/api/user.lib';
import {searchForUsers} from '../../../lib/api/user.lib';
import {IMovie, IUserProfile} from '../../../../types';
import {findMovieById} from '../../../lib/api/movies.lib';
import {Icon} from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import {
    capitalizeFirstLetterOfString,
    combineDateAndTime,
    formatMovieDuration,
    selectAvatarBorderColor,
} from '../../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import AkcruLevels from '../../../components/akcruBadges';
import AkcruButtons from '../../../components/akcruButtons';
import {createAMITInvite} from '../../../lib/api/mit.lib';
import HexAvatar from '../../../components/HexAvatar';
import {MULTISIZES} from '../../../../assets/constants/theme';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import BackButton from '../../../components/General/backbutton';
import useAuthStore from '../../../stores/auth.store';
import OTPResultModal from '../../../components/CodeModals/OTPResultModal';

import {InterstitialAd, AdEventType, TestIds} from 'react-native-google-mobile-ads';

/** Movie ticket graphic for Send Movie Invite (Icons8 Fluency PNG — same CDN family as Home section icons). */
const MIT_SEND_INVITE_TICKET_ICON_URL = 'https://img.icons8.com/fluency/96/movie.png';

type MitDiscoverySectionTitleKey = 'Your Matches' | 'Your Archetype';

/** Vector icons (bundled) so section icons always show — remote PNGs can fail to load. */
const DISCOVERY_SECTION_ICON: Record<MitDiscoverySectionTitleKey, {name: string; color: string}> = {
    'Your Matches': {name: 'heart', color: '#F472B6'},
    'Your Archetype': {name: 'sparkles', color: '#C4B5FD'},
};

const DiscoverySectionTitle = ({title}: {title: MitDiscoverySectionTitleKey}) => {
    const icon = DISCOVERY_SECTION_ICON[title];
    return (
        <View style={styles.discoverySectionTitleRow}>
            <Icon name={icon.name} type="ionicon" color={icon.color} size={22} style={styles.discoverySectionTitleIcon} />
            <Text style={[styles.defaultSectionTitle, {marginBottom: 4}]}>{title}</Text>
        </View>
    );
};

type MITDateScheduleNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'MITDateSchedule'>;

type MITDateScheduleRouteProp = RouteProp<NoBottomTabStackParams, 'MITDateSchedule'>;

type Props = {
    navigation: MITDateScheduleNavigationProp;
    route: MITDateScheduleRouteProp;
};

type SelectedInvitee = {
    id: string;
    username: string;
    badge: string;
    profilePicture: string;
    description?: string;
};

const MITDateSchedule = ({route, navigation}: Props) => {
    const loggedInUser = useAuthStore(state => state.user);
    const id: string | undefined = route.params?.id ?? null;
    const [movie, setMovie] = useState<IMovie | null>(null);
    const [user, setUser] = useState<IUserProfile | undefined>(undefined);
    const [data, setData] = useState<IUserProfile[] | []>([]);

    // Interstitial setup
    const interstitialRef = useRef<InterstitialAd | null>(null);
    const [adLoaded, setAdLoaded] = useState(false);

    const PROD_IDS = Platform.select({
            android: 'ca-app-pub-8264001768347242/2150819252', // <-- your real ANDROID id
            ios: 'ca-app-pub-8264001768347242/1708251538', // <-- your real iOS id (make a separate unit in AdMob)
        });

        const interstitialUnitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_IDS;

    const TICKET_DISPLAY_MS = 2000; // show ticket 2s after ad closes
    const ticketTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lightTravelAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(lightTravelAnim, {
                toValue: 1,
                duration: 1700,
                useNativeDriver: true,
            }),
        );
        loop.start();
        return () => {
            loop.stop();
            lightTravelAnim.stopAnimation();
            lightTravelAnim.setValue(0);
        };
    }, [lightTravelAnim]);

    useEffect(() => {
        if (!interstitialUnitId) return; // guard if iOS id not set yet
        const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });
        interstitialRef.current = ad;

        const offLoaded = ad.addAdEventListener(AdEventType.LOADED, () => setAdLoaded(true));
        const offClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            setAdLoaded(false);

            // ensure ticket is visible after the ad
            setShowSendMIT(true);

            if (ticketTimerRef.current) clearTimeout(ticketTimerRef.current);
            ticketTimerRef.current = setTimeout(() => {
                setShowSendMIT(false);
                setIsSelectionDisabled(true);
                navigateToMITHubOneWay();
            }, TICKET_DISPLAY_MS);

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
            if (ticketTimerRef.current) clearTimeout(ticketTimerRef.current);
        };
    }, [interstitialUnitId, navigation]);

    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                if (id) {
                    const fetchedMovie: IMovie | null = await findMovieById(id);
                    if (fetchedMovie) {
                        setMovie(fetchedMovie);
                    }
                }
            } catch (error) {
                console.error('Error fetching movie data:', error);
            }
        };

        fetchMovieData();
    }, [id]);

    const userID: string | undefined = route.params?.userId ?? null;

    useFocusEffect(
        React.useCallback(() => {
            const fetchUserData = async () => {
                try {
                    if (userID) {
                        const fetchedUser: IUserProfile | undefined = await findAUser({id: userID});
                        if (fetchedUser) {
                            setUser(fetchedUser);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };

            if (userID) {
                fetchUserData();
            }
        }, [userID, setUser]),
    );

    const [textInputFocused, setTextInputFocused] = useState(false);
    const textInputRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    const showcaseProfiles = [
        {
            id: 'jasmine',
            name: 'Jasmine',
            match: '82% Match',
            desc: 'Loves thrillers & late night vibes',
            badge: 'SUPERHERO',
            profilePicture: 'https://i.pravatar.cc/200?img=47',
        },
        {
            id: 'alex',
            name: 'Alex',
            match: '78% Match',
            desc: 'Horror movie fan',
            badge: 'HERO',
            profilePicture: 'https://i.pravatar.cc/200?img=12',
        },
        {
            id: 'mia',
            name: 'Mia',
            match: '78% Match',
            desc: 'Night owl & chill seeker',
            badge: 'GUARDIAN',
            profilePicture: 'https://i.pravatar.cc/200?img=32',
        },
    ] as const;

    const archetypeProfiles = [
        {
            id: 'mystic',
            name: 'Mystic',
            match: 'Archetype Match',
            desc: 'Loves cozy mysteries',
            badge: 'HERO',
            profilePicture: 'https://i.pravatar.cc/200?img=15',
        },
        {
            id: 'rebel',
            name: 'Rebel',
            match: 'Archetype Match',
            desc: 'Adventurous and spontaneous',
            badge: 'GUARDIAN',
            profilePicture: 'https://i.pravatar.cc/200?img=26',
        },
        {
            id: 'nightowl',
            name: 'Night Owl',
            match: 'Archetype Match',
            desc: 'Likes late-night thrillers',
            badge: 'SUPERHERO',
            profilePicture: 'https://i.pravatar.cc/200?img=31',
        },
    ] as const;

    type DiscoveryCardSelection =
        | {kind: 'showcase'; id: string}
        | {kind: 'archetype'; id: string};

    const [discoverySelection, setDiscoverySelection] = useState<DiscoveryCardSelection | null>(null);
    const [selectedInvitee, setSelectedInvitee] = useState<SelectedInvitee | null>(null);
    const [selectedFromSearch, setSelectedFromSearch] = useState(false);

    const shouldShowSearchResults = searchQuery.trim().length > 1;

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        const trimmedText = text.trim();
        if (trimmedText.length > 1) {
            searchForUsers(text).then(res => {
                if (res.length > 0) {
                    setData(res);
                } else {
                    setData([]);
                }
            });
        } else {
            setData([]);
            if (trimmedText.length === 0) {
                setSelectedFromSearch(false);
            }
        }
    };

    const [scheduleIsShown, setScheduleIsShown] = useState(false);

    const [selectedUserName, setSelectedUserName] = useState('');
    const [selectedAkcruBadgeAkcruit, setSelectedAkcruBadgeAkcruit] = useState('');
    const [selectedAkcruBadgeGuardian, setSelectedAkcruBadgeGuardian] = useState('');
    const [selectedAkcruBadgeHero, setSelectedAkcruBadgeHero] = useState('');
    const [selectedAkcruBadgeSuperHero, setSelectedAkcruBadgeSuperHero] = useState('');
    const [selectedUserPicture, setSelectedUserPicture] = useState('');
    const [selectedInfluencer, setSelectedInfluencer] = useState('');
    const [selectedUser, setSelectedUser] = useState(false);
    const [selectedBorderColor, setSelectedBorderColor] = useState('');

    const applySelectedInvitee = (username: string, badge: string, profilePicture: string) => {
        //console.log('Item with username', username, badge, 'pressed!');
        //console.log('Item with movie title', movie?.title, movie?.year, 'pressed!');
        const borderColor = selectAvatarBorderColor(badge);

        setSelectedUserName(username);
        setSelectedAkcruBadgeAkcruit(badge);
        setSelectedAkcruBadgeGuardian(badge);
        setSelectedAkcruBadgeHero(badge);
        setSelectedAkcruBadgeSuperHero(badge);
        setSelectedUserPicture(profilePicture);
        setSelectedUser(true);

        setSelectedBorderColor(borderColor);
    };

    const handlePress = (username: string, badge: string, profilePicture: string) => {
        applySelectedInvitee(username, badge, profilePicture);
        setScheduleIsShown(true);
    };

    const handleSendDiscoveryInvite = () => {
        if (!selectedInvitee) {
            Alert.alert(
                'No user selected',
                'Please tap a profile above to choose who you want to invite, then try again.',
                [{text: 'OK'}],
            );
            return;
        }
        applySelectedInvitee(selectedInvitee.username, selectedInvitee.badge, selectedInvitee.profilePicture);
        setScheduleIsShown(true);
    };

    const getDiscoveryInviteUserName = (): string | null => {
        return selectedInvitee?.username ?? null;
    };

    const preFilledInviteeFromRoute = useRef(false);
    useEffect(() => {
        preFilledInviteeFromRoute.current = false;
    }, [userID]);
    useEffect(() => {
        if (preFilledInviteeFromRoute.current || !userID || !user?.username) {
            return;
        }
        if (String(user.id) !== String(userID)) {
            return;
        }
        preFilledInviteeFromRoute.current = true;
        setSelectedInvitee({
            id: user.id,
            username: user.username,
            badge: user.badge ?? '',
            profilePicture: user.profilePicture ?? '',
            description: user.description,
        });
        handlePress(user.username, user.badge ?? '', user.profilePicture ?? '');
    }, [user, userID]);

    // Scheduling starts from tomorrow; today and past dates are not available.
    const getMinSelectableDate = (): Date => {
        const minDate = new Date();
        minDate.setHours(0, 0, 0, 0);
        minDate.setDate(minDate.getDate() + 1);
        return minDate;
    };
    const minSelectableDate = getMinSelectableDate();
    const [selectedDate, setSelectedDate] = useState<Date>(() => getMinSelectableDate());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [selectedTimeZone, setSelectedTimeZone] = useState('');
    const [kickoffMessage, setKickoffMessage] = useState("Hey! Ready for our movie night? 🍿");
    const [isDateTimeSelected, setIsDateTimeSelected] = useState(false);
    const [isSelectionDisabled, setIsSelectionDisabled] = useState(false);
    const [isSendingInvite, setIsSendingInvite] = useState(false);
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
    const isAtMinSelectableMonth =
        currentMonth === minSelectableDate.getMonth() &&
        currentYear === minSelectableDate.getFullYear();

    const handlePreviousMonth = () => {
        if (isAtMinSelectableMonth) {
            return;
        }
        const previousMonth = new Date(currentYear, currentMonth - 1);
        setSelectedDate(previousMonth);
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(currentYear, currentMonth + 1);
        setSelectedDate(nextMonth);
    };

    const handleDateChange = (day: number) => {
        const updatedDate = new Date(currentYear, currentMonth, day);
        setSelectedDate(updatedDate);
    };

    const handleTimeChange = (hours: number, minutes: number) => {
        const updatedTime = new Date(selectedTime);
        updatedTime.setHours(hours);
        updatedTime.setMinutes(minutes);
        setSelectedTime(updatedTime);
    };

    const handleTimeZoneChange = (timeZone: string) => {
        setSelectedTimeZone(timeZone);
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
    const [showInviteResultModal, setShowInviteResultModal] = useState(false);
    const [inviteResultMessage, setInviteResultMessage] = useState('');
    const [showSendMITVideoOverlay, setShowSendMITVideoOverlay] = useState(false);
    const pendingInviteSuccessFlowRef = useRef<(() => void) | null>(null);
    const [showCinematicAnimationModal, setShowCinematicAnimationModal] = useState(false);
    const [animationStage, setAnimationStage] = useState(0);
    const animationTimersRef = useRef<NodeJS.Timeout[]>([]);
    const burstScaleAnim = useRef(new Animated.Value(0.2)).current;
    const burstOpacityAnim = useRef(new Animated.Value(0)).current;
    const ticketScaleAnim = useRef(new Animated.Value(0.6)).current;
    const ticketOpacityAnim = useRef(new Animated.Value(0)).current;
    const ticketTravelProgressAnim = useRef(new Animated.Value(0)).current;
    const ticketRotateAnim = useRef(new Animated.Value(0)).current;
    const confirmOpacityAnim = useRef(new Animated.Value(0)).current;
    const [leftHexCenterX, setLeftHexCenterX] = useState<number>(SIZES.ScreenWidth * 0.2);
    const [rightHexCenterX, setRightHexCenterX] = useState<number>(SIZES.ScreenWidth * 0.8);
    const [leftHexCenterY, setLeftHexCenterY] = useState<number>(46);
    const [rightHexCenterY, setRightHexCenterY] = useState<number>(46);
    const lightTranslateX = lightTravelAnim.interpolate({
        inputRange: [0, 1],
        // -50 offsets half travel icon size (100) so icon center aligns with hex center.
        outputRange: [leftHexCenterX - 50, rightHexCenterX - 50],
    });
    const lightTranslateY = lightTravelAnim.interpolate({
        inputRange: [0, 1],
        // -50 offsets half travel icon size (100) so icon center aligns with hex center.
        outputRange: [leftHexCenterY - 35, rightHexCenterY - 35],
    });
    const lightOpacity = lightTravelAnim.interpolate({
        inputRange: [0, 0.08, 0.88, 1],
        outputRange: [0.15, 1, 1, 0.15],
    });
    const sparkScale = lightTravelAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.85, 1.25, 0.85],
    });
    const sparkRotate = lightTravelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    const ticketOverlayRotation = ticketRotateAnim.interpolate({
        inputRange: [0, 0.14, 0.28, 0.42, 0.58, 0.74, 0.88, 1],
        outputRange: ['-18deg', '-6deg', '10deg', '24deg', '42deg', '26deg', '8deg', '-10deg'],
    });
    const ticketOverlayTranslateX = ticketTravelProgressAnim.interpolate({
        // Fullscreen ribbon sweep: move across the whole screen in one run.
        inputRange: [0, 0.14, 0.28, 0.42, 0.58, 0.74, 0.88, 1],
        outputRange: [
            SIZES.ScreenWidth * 0.05,
            SIZES.ScreenWidth * 0.28,
            SIZES.ScreenWidth * 0.58,
            SIZES.ScreenWidth * 0.78,
            SIZES.ScreenWidth * 0.58,
            SIZES.ScreenWidth * 0.34,
            SIZES.ScreenWidth * 0.62,
            SIZES.ScreenWidth * 0.86,
        ],
    });
    const ticketOverlayTranslateY = ticketTravelProgressAnim.interpolate({
        // Fullscreen vertical coverage (top to lower region).
        inputRange: [0, 0.14, 0.28, 0.42, 0.58, 0.74, 0.88, 1],
        outputRange: [
            SIZES.ScreenHeight * 0.14,
            SIZES.ScreenHeight * 0.08,
            SIZES.ScreenHeight * 0.2,
            SIZES.ScreenHeight * 0.34,
            SIZES.ScreenHeight * 0.52,
            SIZES.ScreenHeight * 0.62,
            SIZES.ScreenHeight * 0.68,
            SIZES.ScreenHeight * 0.7,
        ],
    });
    const cinematicStageTitle =
        animationStage === 1
            ? 'Tap Initiation'
            : animationStage === 2
              ? 'Energy Burst'
              : animationStage === 3
                ? 'Ticket Formation'
                : animationStage === 4
                  ? 'Target Lock'
                  : animationStage === 5
                    ? 'Delivery'
                    : animationStage === 6
                      ? 'Confirmation'
                      : 'MIT Invite Animation';

    const clearAnimationTimers = () => {
        animationTimersRef.current.forEach(timerId => clearTimeout(timerId));
        animationTimersRef.current = [];
    };

    const resetCinematicAnimationValues = () => {
        burstScaleAnim.stopAnimation();
        burstOpacityAnim.stopAnimation();
        ticketScaleAnim.stopAnimation();
        ticketOpacityAnim.stopAnimation();
        ticketTravelProgressAnim.stopAnimation();
        ticketRotateAnim.stopAnimation();
        confirmOpacityAnim.stopAnimation();
        burstScaleAnim.setValue(0.2);
        burstOpacityAnim.setValue(0);
        ticketScaleAnim.setValue(0.6);
        ticketOpacityAnim.setValue(0);
        ticketTravelProgressAnim.setValue(0);
        ticketRotateAnim.setValue(0);
        confirmOpacityAnim.setValue(0);
    };

    const stageTimeout = (callback: () => void, delayMs: number) => {
        const timeoutId = setTimeout(callback, delayMs);
        animationTimersRef.current.push(timeoutId);
    };

    const navigateToMITHubOneWay = () => {
        navigation.replace('UserMITHubScreen', {index: 1});
    };

    const runCinematicAnimationPreview = (onComplete?: (() => void) | unknown) => {
        clearAnimationTimers();
        resetCinematicAnimationValues();
        setAnimationStage(1);
        setShowCinematicAnimationModal(true);

        Animated.sequence([
            Animated.parallel([
                Animated.timing(burstScaleAnim, {
                    toValue: 1.35,
                    duration: 520,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(burstOpacityAnim, {
                    toValue: 1,
                    duration: 420,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(burstOpacityAnim, {
                toValue: 0,
                duration: 420,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(ticketScaleAnim, {
                    toValue: 1.06,
                    duration: 560,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
                Animated.timing(ticketOpacityAnim, {
                    toValue: 1,
                    duration: 520,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(ticketTravelProgressAnim, {
                    toValue: 1,
                    duration: 2200,
                    easing: Easing.inOut(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(ticketRotateAnim, {
                    toValue: 1,
                    duration: 2200,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(confirmOpacityAnim, {
                toValue: 1,
                duration: 560,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start(({finished}) => {
            if (finished) {
                stageTimeout(() => {
                    setShowCinematicAnimationModal(false);
                    setAnimationStage(0);
                    if (typeof onComplete === 'function') {
                        onComplete();
                    }
                }, 900);
            }
        });

        stageTimeout(() => setAnimationStage(2), 700);
        stageTimeout(() => setAnimationStage(3), 1450);
        stageTimeout(() => setAnimationStage(4), 2450);
        stageTimeout(() => setAnimationStage(5), 3850);
        stageTimeout(() => setAnimationStage(6), 4650);
    };

    const handleInviteSuccessFlow = () => {
        setIsSendingInvite(false);
        setIsDateTimeSelected(true);
        setShowSendMIT(true);

        if (adLoaded && interstitialRef.current) {
            interstitialRef.current.show();
        } else {
            if (ticketTimerRef.current) clearTimeout(ticketTimerRef.current);
            ticketTimerRef.current = setTimeout(() => {
                setShowSendMIT(false);
                setIsSelectionDisabled(true);
                navigateToMITHubOneWay();
            }, TICKET_DISPLAY_MS);

            interstitialRef.current?.load?.();
        }
    };

    const completeSendMITVideoAndContinue = () => {
        setShowSendMITVideoOverlay(false);
        const onComplete = pendingInviteSuccessFlowRef.current;
        pendingInviteSuccessFlowRef.current = null;
        if (onComplete) {
            onComplete();
        }
    };

    const playSendMITVideoThen = (onComplete: () => void) => {
        pendingInviteSuccessFlowRef.current = onComplete;
        setShowSendMITVideoOverlay(true);
    };

    useEffect(() => {
        return () => {
            clearAnimationTimers();
        };
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

    const handleSetDateTime = async () => {
        if (
            !selectedDate ||
            !selectedTime ||
            !selectedTimeZone?.trim() ||
            !movie?.id ||
            !selectedUserName?.trim()
        ) {
            return;
        }

        const formattedSelectedDateTimeInISO = combineDateAndTime(selectedDate, selectedTime, selectedTimeZone);
        if (!formattedSelectedDateTimeInISO) {
            return;
        }

        setIsSelectionDisabled(true);
        setIsSendingInvite(true);
        try {
            const response = await createAMITInvite({
                movieId: movie.id,
                username: selectedUserName.trim(),
                startDate: formattedSelectedDateTimeInISO,
                timezone: selectedTimeZone,
            });

            if (response.success) {
//                runCinematicAnimationPreview(handleInviteSuccessFlow);
                playSendMITVideoThen(handleInviteSuccessFlow);
            } else {
                setIsSelectionDisabled(false);
                setIsSendingInvite(false);
                const failedMessage =
                    (response as {message?: string; data?: {message?: string}})?.message ??
                    (response as {message?: string; data?: {message?: string}})?.data?.message ??
                    'Unable to send invite right now. Please try again.';
                setInviteResultMessage(failedMessage);
                setShowInviteResultModal(true);
            }
        } catch {
            setIsSelectionDisabled(false);
            setIsSendingInvite(false);
            setInviteResultMessage('Unable to send invite right now. Please try again.');
            setShowInviteResultModal(true);
        }
    };

    return (
        <View style={{flex: 1, backgroundColor: COLORS.BLACK}}>
            {showSendMIT ? (
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: COLORS.BLACK,
                        marginTop: '10%',
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
                            source={{uri: movie?.portraitURL}}
                            style={styles.ticketImage}
                            resizeMode="cover">
                            <LinearGradient colors={['transparent', COLORS.AKCRUBLUE]} style={styles.linearGradient}>
                                <View style={[styles.ticketCircle, {position: 'absolute', bottom: -40, left: -40}]} />
                                <View style={[styles.ticketCircle, {position: 'absolute', bottom: -40, right: -40}]} />
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
                                {movie?.title}
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
                <View style={{flex: 1}}>
                    {!scheduleIsShown ? (
                        <View style={styles.discoveryScreenWrap}>
                            <View style={styles.backbutton}>
                                <Header />
                            </View>

                            <View style={{marginHorizontal: 15}}>
                                <BackButton navigation={navigation} />
                            </View>

                            <View style={styles.backbutton}>
                                <View style={{alignItems: 'center'}}>
                                    <View style={styles.searchinput}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Icon
                                                name="magnify"
                                                type="material-community"
                                                color={COLORS.AKCRUBLUE}
                                                size={28}
                                                style={{marginRight: 10}}
                                            />
                                            <TextInput
                                                placeholder="Search for user"
                                                placeholderTextColor={COLORS.DARKGREY}
                                                autoCorrect={false}
                                                autoFocus={false}
                                                value={searchQuery}
                                                ref={textInputRef}
                                                onFocus={() => {
                                                    setTextInputFocused(true);
                                                }}
                                                onBlur={() => {
                                                    setTextInputFocused(false);
                                                }}
                                                onChangeText={handleSearch}
                                                style={{color: COLORS.LIGHTGREY, width: '100%'}}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <ScrollView style={{flex: 1}} contentContainerStyle={styles.discoveryScrollContent}>
                            <View style={{marginHorizontal: 15, marginBottom: 70}}>
                                {shouldShowSearchResults ? (
                                    <View style={styles.defaultDiscoveryWrap}>
                                        {data.length > 0 ? (
                                            (() => {
                                                const item = data[0];
                                                return (
                                                <Pressable
                                                    key={item.id}
                                                    onPress={() =>
                                                        {
                                                            setDiscoverySelection(null);
                                                            setSelectedInvitee({
                                                                id: item.id,
                                                                username: item.username,
                                                                badge: item.badge ?? '',
                                                                profilePicture: item.profilePicture ?? '',
                                                                description: item.description,
                                                            });
                                                            setSelectedFromSearch(true);
                                                            setSearchQuery('');
                                                            setData([]);
                                                        }
                                                    }
                                                    onLongPress={() =>
                                                        navigation.navigate('ViewUserScreen', {
                                                            userID: item.id,
                                                            imageURL: item.profilePicture ?? '',
                                                        })
                                                    }
                                                    style={styles.defaultProfileGradient}>
                                                    <LinearGradient
                                                        colors={['#66D6FF', '#6D4DFF', '#D27BFF']}
                                                        start={{x: 0, y: 0}}
                                                        end={{x: 1, y: 1}}
                                                        style={{borderRadius: 13}}>
                                                        <View style={styles.defaultProfileInner}>
                                                            <HexAvatar
                                                                source={
                                                                    item.profilePicture
                                                                        ? {uri: item.profilePicture}
                                                                        : imageindex.Akcruplaceholder
                                                                }
                                                                size={MULTISIZES.Xlarge60}
                                                                borderThickness={5}
                                                                bordercolor={selectAvatarBorderColor(item.badge ?? '')}
                                                            />
                                                            <View style={styles.defaultProfileInfo}>
                                                                <Text style={styles.defaultProfileName}>
                                                                    {item.username}
                                                                </Text>
                                                                <Text style={styles.defaultProfileMatch}>
                                                                    Archetype Match
                                                                </Text>
                                                                <Text style={styles.defaultProfileDesc}>
                                                                    {item.description?.trim() || 'Tap to schedule invite'}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </LinearGradient>
                                                </Pressable>
                                                );
                                            })()
                                        ) : (
                                            <Text style={styles.defaultSuggestionText}>No user found</Text>
                                        )}
                                    </View>
                                ) : (
                                    <View style={styles.defaultDiscoveryWrap}>
                                        {selectedInvitee && selectedFromSearch ? (
                                            <View style={styles.defaultProfileGradientPressed}>
                                                <View style={styles.profileCardSelectedScale}>
                                                    <LinearGradient
                                                        colors={['#66D6FF', '#6D4DFF', '#D27BFF']}
                                                        start={{x: 0, y: 0}}
                                                        end={{x: 1, y: 1}}
                                                        style={styles.profileCardGradientBorderOuter}>
                                                        <View style={styles.profileCardGradientBorderInner}>
                                                            <View style={styles.defaultProfileInner}>
                                                                <HexAvatar
                                                                    source={
                                                                        selectedInvitee.profilePicture
                                                                            ? {uri: selectedInvitee.profilePicture}
                                                                            : imageindex.Akcruplaceholder
                                                                    }
                                                                    size={MULTISIZES.Xlarge60 + 6}
                                                                    borderThickness={3}
                                                                    imageZoom={1.12}
                                                                    bordercolor={selectAvatarBorderColor(
                                                                        selectedInvitee.badge,
                                                                    )}
                                                                />
                                                                <View style={styles.defaultProfileInfo}>
                                                                    <Text style={styles.defaultProfileName}>
                                                                        {selectedInvitee.username}
                                                                    </Text>
                                                                    <Text style={styles.defaultProfileMatch}>
                                                                        Selected Invitee
                                                                    </Text>
                                                                    <Text style={styles.defaultProfileDesc}>
                                                                        {selectedInvitee.description?.trim() ||
                                                                            'Ready to send movie invite'}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </LinearGradient>
                                                </View>
                                            </View>
                                        ) : null}
                                        <DiscoverySectionTitle title="Your Matches" />
                                        {showcaseProfiles.map(profile => {
                                            const isSelected =
                                                discoverySelection?.kind === 'showcase' &&
                                                discoverySelection.id === profile.id;
                                            return (
                                                <Pressable
                                                    key={profile.id}
                                                    onPress={() => {
                                                        setDiscoverySelection({kind: 'showcase', id: profile.id});
                                                        setSelectedFromSearch(false);
                                                        setSelectedInvitee({
                                                            id: profile.id,
                                                            username: profile.name,
                                                            badge: profile.badge,
                                                            profilePicture: profile.profilePicture,
                                                            description: profile.desc,
                                                        });
                                                    }}
                                                    style={[
                                                        styles.defaultProfileGradient,
                                                        isSelected && styles.defaultProfileGradientPressed,
                                                    ]}>
                                                    {isSelected ? (
                                                        <View style={styles.profileCardSelectedScale}>
                                                            <LinearGradient
                                                                colors={['#66D6FF', '#6D4DFF', '#D27BFF']}
                                                                start={{x: 0, y: 0}}
                                                                end={{x: 1, y: 1}}
                                                                style={styles.profileCardGradientBorderOuter}>
                                                                <View style={styles.profileCardGradientBorderInner}>
                                                                    <View style={styles.defaultProfileInner}>
                                                                        <HexAvatar
                                                                            source={{uri: profile.profilePicture}}
                                                                            size={MULTISIZES.Xlarge60 + 6}
                                                                            borderThickness={3}
                                                                            imageZoom={1.12}
                                                                            bordercolor={selectAvatarBorderColor(
                                                                                profile.badge,
                                                                            )}
                                                                        />
                                                                        <View style={styles.defaultProfileInfo}>
                                                                            <Text style={styles.defaultProfileName}>
                                                                                {profile.name}
                                                                            </Text>
                                                                            <Text style={styles.defaultProfileMatch}>
                                                                                {profile.match}
                                                                            </Text>
                                                                            <Text style={styles.defaultProfileDesc}>
                                                                                {profile.desc}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            </LinearGradient>
                                                        </View>
                                                    ) : (
                                                        <LinearGradient
                                                            colors={['#66D6FF', '#6D4DFF', '#D27BFF']}
                                                            start={{x: 0, y: 0}}
                                                            end={{x: 1, y: 1}}
                                                            style={{borderRadius: 13}}>
                                                            <View style={styles.defaultProfileInner}>
                                                                <HexAvatar
                                                                    source={{uri: profile.profilePicture}}
                                                                    size={MULTISIZES.Xlarge60}
                                                                    borderThickness={5}
                                                                    bordercolor={selectAvatarBorderColor(
                                                                        profile.badge,
                                                                    )}
                                                                />
                                                                <View style={styles.defaultProfileInfo}>
                                                                    <Text style={styles.defaultProfileName}>
                                                                        {profile.name}
                                                                    </Text>
                                                                    <Text style={styles.defaultProfileMatch}>
                                                                        {profile.match}
                                                                    </Text>
                                                                    <Text style={styles.defaultProfileDesc}>
                                                                        {profile.desc}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </LinearGradient>
                                                    )}
                                                </Pressable>
                                            );
                                        })}

                                        <DiscoverySectionTitle title="Your Archetype" />
                                        {archetypeProfiles.map(profile => {
                                            const isSelected =
                                                discoverySelection?.kind === 'archetype' &&
                                                discoverySelection.id === profile.id;
                                            return (
                                                <Pressable
                                                    key={profile.id}
                                                    onPress={() => {
                                                        setDiscoverySelection({kind: 'archetype', id: profile.id});
                                                        setSelectedFromSearch(false);
                                                        setSelectedInvitee({
                                                            id: profile.id,
                                                            username: profile.name,
                                                            badge: profile.badge,
                                                            profilePicture: profile.profilePicture,
                                                            description: profile.desc,
                                                        });
                                                    }}
                                                    style={[
                                                        styles.defaultProfileGradient,
                                                        isSelected && styles.defaultProfileGradientPressed,
                                                    ]}>
                                                    {isSelected ? (
                                                        <View style={styles.profileCardSelectedScale}>
                                                            <LinearGradient
                                                                colors={['#66D6FF', '#6D4DFF', '#D27BFF']}
                                                                start={{x: 0, y: 0}}
                                                                end={{x: 1, y: 1}}
                                                                style={styles.profileCardGradientBorderOuter}>
                                                                <View style={styles.profileCardGradientBorderInner}>
                                                                    <View style={styles.defaultProfileInner}>
                                                                        <HexAvatar
                                                                            source={{uri: profile.profilePicture}}
                                                                            size={MULTISIZES.Xlarge60 + 6}
                                                                            borderThickness={3}
                                                                            imageZoom={1.12}
                                                                            bordercolor={selectAvatarBorderColor(
                                                                                profile.badge,
                                                                            )}
                                                                        />
                                                                        <View style={styles.defaultProfileInfo}>
                                                                            <Text style={styles.defaultProfileName}>
                                                                                {profile.name}
                                                                            </Text>
                                                                            <Text style={styles.defaultProfileMatch}>
                                                                                {profile.match}
                                                                            </Text>
                                                                            <Text style={styles.defaultProfileDesc}>
                                                                                {profile.desc}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            </LinearGradient>
                                                        </View>
                                                    ) : (
                                                        <LinearGradient
                                                            colors={['#66D6FF', '#6D4DFF', '#D27BFF']}
                                                            start={{x: 0, y: 0}}
                                                            end={{x: 1, y: 1}}
                                                            style={{borderRadius: 13}}>
                                                            <View style={styles.defaultProfileInner}>
                                                                <HexAvatar
                                                                    source={{uri: profile.profilePicture}}
                                                                    size={MULTISIZES.Xlarge60}
                                                                    borderThickness={5}
                                                                    bordercolor={selectAvatarBorderColor(
                                                                        profile.badge,
                                                                    )}
                                                                />
                                                                <View style={styles.defaultProfileInfo}>
                                                                    <Text style={styles.defaultProfileName}>
                                                                        {profile.name}
                                                                    </Text>
                                                                    <Text style={styles.defaultProfileMatch}>
                                                                        {profile.match}
                                                                    </Text>
                                                                    <Text style={styles.defaultProfileDesc}>
                                                                        {profile.desc}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </LinearGradient>
                                                    )}
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                            </ScrollView>
                            {!shouldShowSearchResults && (
                                <View style={styles.discoveryBottomDock}>
                                    <LinearGradient
                                        colors={['#4CC9FF', '#5B44FF', '#C86DFF']}
                                        start={{x: 0, y: 0}}
                                        end={{x: 1, y: 1}}
                                        style={styles.defaultInviteBar}>
                                        <View style={styles.defaultInviteInner}>
                                            {!selectedInvitee ? (
                                                <Text style={styles.defaultInviteText}>
                                                    Select a profile, then tap Send Movie Invite
                                                </Text>
                                            ) : (
                                                <View style={styles.defaultInviteHintRow}>
                                                    <Text style={styles.defaultInviteHintPrefix}>Invite :</Text>
                                                    <Icon
                                                        name="heart"
                                                        type="ionicon"
                                                        size={18}
                                                        color="#F472B6"
                                                        style={{marginRight: 6}}
                                                    />
                                                    <Text
                                                        style={[styles.defaultInviteHintUser, {marginRight: 10}]}
                                                        numberOfLines={1}>
                                                        @{getDiscoveryInviteUserName() ?? '—'}
                                                    </Text>
                                                    <Icon
                                                        name="film-outline"
                                                        type="ionicon"
                                                        size={18}
                                                        color="#7DD3FC"
                                                        style={{marginRight: 6}}
                                                    />
                                                    <Text style={styles.defaultInviteHintMovie} numberOfLines={2}>
                                                        {movie?.title ?? '—'}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </LinearGradient>
                                    <View style={{alignItems: 'center'}}>
                                        <AkcruButtons.SmallButton
                                            variant="auth"
                                            btnname={'Send Movie Invite'}
                                            color={COLORS.AKCRUBLUE}
                                            onPress={handleSendDiscoveryInvite}
                                            authButtonWidth={SIZES.ScreenWidth - 30}
                                            authLeftImage={{uri: MIT_SEND_INVITE_TICKET_ICON_URL}}
                                            authImagePosition="right"
                                            disabled={!selectedInvitee}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : (
                        <ImageBackground source={imageindex.FLickFlirtBG} style={styles.scheduleBg} resizeMode="cover">
                            <LinearGradient
                                colors={['rgba(5,3,20,0.88)', 'rgba(14,8,34,0.78)', 'rgba(5,3,20,0.92)']}
                                style={styles.scheduleOverlay}>
                                <ScrollView contentContainerStyle={styles.scheduleContent}>

                                    <Text style={styles.scheduleTitle}>Schedule Invite...</Text>
                                    <LinearGradient
                                        colors={['#6DE5FF', '#965CFF', '#FF75E4']}
                                        start={{x: 0, y: 0}}
                                        end={{x: 1, y: 1}}
                                        style={styles.schedulePairOuter}>
                                        <LinearGradient
                                            colors={['transparent', '#5EDBFF', '#D883FF', 'transparent']}
                                            start={{x: 0, y: 0.5}}
                                            end={{x: 1, y: 0.5}}
                                            style={styles.schedulePairBeam}
                                        />
                                        <Animated.View
                                            pointerEvents="none"
                                            style={[
                                                styles.scheduleTravelGlow,
                                                {
                                                    opacity: lightOpacity,
                                                    transform: [
                                                        {translateX: lightTranslateX},
                                                        {translateY: lightTranslateY},
                                                        {scale: sparkScale},
                                                        {rotate: sparkRotate},
                                                    ],
                                                },
                                            ]}>
                                            <Image source={imageindex.mitTicketImage} style={styles.scheduleTravelIcon} />
                                        </Animated.View>
                                        <View style={styles.schedulePairInner}>
                                            <View
                                                style={styles.schedulePairUser}
                                                onLayout={event => {
                                                    const {x, width} = event.nativeEvent.layout;
                                                    setLeftHexCenterX(x + width / 2);
                                                }}>
                                                <View
                                                    onLayout={event => {
                                                        const {y, height} = event.nativeEvent.layout;
                                                        setLeftHexCenterY(y + height / 2);
                                                    }}>
                                                    <HexAvatar
                                                        source={
                                                            loggedInUser?.profilePicture
                                                                ? {uri: loggedInUser.profilePicture}
                                                                : imageindex.Akcruplaceholder
                                                        }
                                                        size={MULTISIZES.Xlarge60 + 6}
                                                        borderThickness={3}
                                                        imageZoom={1.1}
                                                        bordercolor={
                                                            loggedInUser?.badge
                                                                ? selectAvatarBorderColor(loggedInUser.badge)
                                                                : COLORS.AKCRUBLUE
                                                        }
                                                    />
                                                </View>
                                                <Text style={styles.scheduleUserName}>
                                                    {loggedInUser?.username || 'You'}
                                                </Text>
                                                {loggedInUser?.badge === 'AKCRUIT' && <AkcruLevels.AkcruBadgeAkcruit />}
                                                {loggedInUser?.badge === 'GUARDIAN' && <AkcruLevels.AkcruBadgeGuardian />}
                                                {loggedInUser?.badge === 'HERO' && <AkcruLevels.AkcruBadgeHero />}
                                                {loggedInUser?.badge === 'SUPERHERO' && <AkcruLevels.AkcruBadgeSuperHero />}
                                            </View>
                                            <View
                                                style={styles.schedulePairUser}
                                                onLayout={event => {
                                                    const {x, width} = event.nativeEvent.layout;
                                                    setRightHexCenterX(x + width / 2);
                                                }}>
                                                <View
                                                    onLayout={event => {
                                                        const {y, height} = event.nativeEvent.layout;
                                                        setRightHexCenterY(y + height / 2);
                                                    }}>
                                                    <HexAvatar
                                                        source={
                                                            selectedUserPicture
                                                                ? {uri: selectedUserPicture}
                                                                : imageindex.Akcruplaceholder
                                                        }
                                                        size={MULTISIZES.Xlarge60 + 6}
                                                        borderThickness={3}
                                                        bordercolor={selectedBorderColor || '#C4B5FD'}
                                                    />
                                                </View>
                                                <Text style={styles.scheduleUserName} numberOfLines={1}>
                                                    {selectedUserName || 'Invitee'}
                                                </Text>
                                                {selectedAkcruBadgeAkcruit === 'AKCRUIT' && <AkcruLevels.AkcruBadgeAkcruit />}
                                                {selectedAkcruBadgeGuardian === 'GUARDIAN' && (
                                                    <AkcruLevels.AkcruBadgeGuardian />
                                                )}
                                                {selectedAkcruBadgeHero === 'HERO' && <AkcruLevels.AkcruBadgeHero />}
                                                {selectedAkcruBadgeSuperHero === 'SUPERHERO' && (
                                                    <AkcruLevels.AkcruBadgeSuperHero />
                                                )}
                                            </View>
                                        </View>
                                    </LinearGradient>

                                    <Text style={styles.scheduleFieldLabel}>Select Date...</Text>
                                    <View style={styles.schedulePickerRow}>
                                        <TouchableOpacity
                                            onPress={handlePreviousMonth}
                                            style={styles.scheduleArrowButton}
                                            disabled={isAtMinSelectableMonth}>
                                            <Icon name="chevron-back" type="ionicon" color="#D7CBFF" size={18} />
                                        </TouchableOpacity>
                                        <Text style={styles.scheduleMonthText}>
                                            {months[currentMonth]} {currentYear}
                                        </Text>
                                        <TouchableOpacity onPress={handleNextMonth} style={styles.scheduleArrowButton}>
                                            <Icon name="chevron-forward" type="ionicon" color="#D7CBFF" size={18} />
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.datePickerContainer}>
                                            {[...Array(daysInMonth)].map((_, index) => {
                                                const day = index + 1;
                                                const isSelected = selectedDate.getDate() === day;
                                                const currentDay = new Date(currentYear, currentMonth, day);
                                                const currentDayOfWeek = currentDay.getDay();
                                                const isSelectable = currentDay >= minSelectableDate;
                                                if (!isSelectable) {
                                                    return null;
                                                }
                                                return (
                                                    <TouchableOpacity
                                                        key={day}
                                                        onPress={() => handleDateChange(day)}
                                                        style={[
                                                            styles.dayButton,
                                                            isSelected && styles.dayButtonSelected,
                                                            (isSelectionDisabled || !isSelectable) && styles.disabledButton,
                                                        ]}
                                                        disabled={isSelectionDisabled || !isSelectable}>
                                                        <Text style={styles.dayOfWeekText}>{daysOfWeek[currentDayOfWeek]}</Text>
                                                        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                                                            {day}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>

                                    <Text style={styles.scheduleFieldLabel}>Choose a Time & Zone...</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.timePickerContainer}>
                                            {[...Array(24 * 4)].map((_, index) => {
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
                                                const ampmHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                                                const ampmSuffix = hours >= 12 ? 'PM' : 'AM';
                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => handleTimeChange(hours, minutes)}
                                                        style={[
                                                            styles.timeButton,
                                                            isSelected && styles.timeButtonSelected,
                                                            (isSelectionDisabled || isPastTime) && styles.disabledButton,
                                                        ]}
                                                        disabled={isSelectionDisabled || isPastTime}>
                                                        <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>
                                                            {ampmHours < 10 ? `0${ampmHours}` : ampmHours}:
                                                            {minutes === 0 ? '00' : minutes} {ampmSuffix}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.timeZonePickerContainer}>
                                            {timeZones.map(timeZone => {
                                                const isSelected = selectedTimeZone === timeZone;
                                                return (
                                                    <TouchableOpacity
                                                        key={timeZone}
                                                        onPress={() => handleTimeZoneChange(timeZone)}
                                                        style={[
                                                            styles.timeZoneButton,
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
                                            })}
                                        </View>
                                    </ScrollView>

                                    <Text style={styles.scheduleFieldLabel}>Say something to kick things off...</Text>
                                    <LinearGradient
                                        colors={['#6DE5FF', '#8A56FF', '#FF75E4']}
                                        start={{x: 0, y: 0}}
                                        end={{x: 1, y: 1}}
                                        style={styles.kickoffOuter}>
                                        <View style={styles.kickoffInner}>
                                            <TextInput
                                                value={kickoffMessage}
                                                onChangeText={setKickoffMessage}
                                                style={styles.kickoffInput}
                                                placeholder="Hey! Ready for our movie night?"
                                                placeholderTextColor="#AFA1DD"
                                                multiline
                                            />
                                        </View>
                                    </LinearGradient>

                                    <View style={styles.scheduleSendWrap}>
                                        <AkcruButtons.SmallButton
                                            variant="auth"
                                            btnname={'Send Invite'}
                                            color={COLORS.AKCRUBLUE}
                                            onPress={handleSetDateTime}
                                            loading={isSendingInvite}
                                            authButtonWidth={SIZES.ScreenWidth - 80}
                                            authLeftImage={{uri: MIT_SEND_INVITE_TICKET_ICON_URL}}
                                            authImagePosition="right"
                                            disabled={
                                                !selectedDate ||
                                                !selectedTime ||
                                                !selectedTimeZone?.trim() ||
                                                !movie?.id ||
                                                !selectedUserName?.trim() ||
                                                isSelectionDisabled
                                            }
                                        />
                                    </View>
                                </ScrollView>
                            </LinearGradient>
                        </ImageBackground>
                    )}
                </View>
            )}
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
            <Modal animationType="fade" transparent={true} visible={showCinematicAnimationModal}>
                <View style={styles.cinematicModalBackdrop}>
                    <LinearGradient
                        colors={['rgba(9, 5, 30, 0.95)', 'rgba(32, 12, 60, 0.92)', 'rgba(9, 5, 30, 0.95)']}
                        style={styles.cinematicFullScreenLayer}>
                        <Text style={styles.cinematicTitle}>{cinematicStageTitle}</Text>
                        <Text style={styles.cinematicStageText}>Stage {animationStage || 1} of 6</Text>
                        <View style={styles.cinematicMotionCanvas}>
                            <Animated.View
                                pointerEvents="none"
                                style={[
                                    styles.cinematicBurst,
                                    {
                                        opacity: burstOpacityAnim,
                                        transform: [{scale: burstScaleAnim}],
                                    },
                                ]}
                            />
                            <Animated.View
                                style={[
                                    styles.cinematicTicketWrap,
                                    {
                                        opacity: ticketOpacityAnim,
                                        transform: [
                                            {translateX: ticketOverlayTranslateX},
                                            {translateY: ticketOverlayTranslateY},
                                            {scale: ticketScaleAnim},
                                            {rotate: ticketOverlayRotation},
                                        ],
                                    },
                                ]}>
                                <Image source={imageindex.mitTicketImage} style={styles.cinematicTicketImage} />
                            </Animated.View>
                        </View>
                        <Animated.View style={[styles.cinematicConfirmFloat, {opacity: confirmOpacityAnim}]}>
                            <Text style={styles.cinematicConfirmTitle}>Invite Sent</Text>
                            <Text style={styles.cinematicConfirmSubtitle}>Waiting for response...</Text>
                        </Animated.View>
                    </LinearGradient>
                </View>
            </Modal>
            <Modal animationType="fade" transparent={true} visible={showInviteResultModal}>
                <OTPResultModal
                    closeModal={() => setShowInviteResultModal(false)}
                    type="failed"
                    message={inviteResultMessage}
                />
            </Modal>
        </View>
    );
};

export default MITDateSchedule;
