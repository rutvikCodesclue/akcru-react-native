import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
    ImageBackground,
    Platform,
    StyleSheet,
    ActivityIndicator,
    Modal,
} from 'react-native';
import styles from './styles';
import React, {useState, useRef, useEffect} from 'react';
import Header from '../../../components/header';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants/index';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
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
import AkcruLevels from '../../../components/akcruBadges';
import AkcruButtons from '../../../components/akcruButtons';
import {createAMITInvite} from '../../../lib/api/mit.lib';
import HexAvatar from '../../../components/HexAvatar';
import {isTablet, MULTISIZES} from '../../../../assets/constants/theme';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import BackButton from '../../../components/General/backbutton';

import {InterstitialAd, AdEventType, TestIds} from 'react-native-google-mobile-ads';
import SearchUserCard from './SearchUserCard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../../navigation/ClientStack';
import { createVisionaryRoom } from '../../../lib/api/visionary.lib';

type MITDateScheduleNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'MITDateSchedule'>;

type MITDateScheduleRouteProp = RouteProp<NoBottomTabStackParams, 'MITDateSchedule'>;

type Props = {
    navigation: MITDateScheduleNavigationProp;
    route: MITDateScheduleRouteProp;
};

const VisionaryRoomSchedule = ({route, navigation}: Props) => {
    const [loading, setLoading] = useState(false);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const id: string | undefined = route.params?.id ?? null;
    const [movie, setMovie] = useState<IMovie | null>(null);
    const [user, setUser] = useState<IUserProfile | undefined>(undefined);
    const [data, setData] = useState<IUserProfile[] | []>([]);

    const navigation2 = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

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

            if (ticketTimerRef.current) clearTimeout(ticketTimerRef.current);
            ticketTimerRef.current = setTimeout(() => {
                setIsSelectionDisabled(true);
                navigation.navigate('UserProfileStack', {screen: 'UserMITHubScreen'});
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
                setLoading(true)
                if (id) {
                    const fetchedMovie: IMovie | null = await findMovieById(id);
                    if (fetchedMovie) {
                        setMovie(fetchedMovie);
                    }
                }
            } catch (error) {
                console.error('Error fetching movie data:', error);
            } finally {
                setLoading(false)
            }
        };

        fetchMovieData();
    }, [id]);

    const today = new Date()
    today.setHours(0, 0, 0, 0);
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedTime, setSelectedTime] = useState(today);
    const [selectedTimeZone, setSelectedTimeZone] = useState('');
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
    
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const handlePreviousMonth = () => {
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

    const handleSubmit = async () => {
        try {
            setIsSelectionDisabled(true);
            setLoading(true);

            if (selectedDate && selectedTime && selectedTimeZone && movie) {
                const formattedSelectedDateTimeInISO = combineDateAndTime(selectedDate, selectedTime, selectedTimeZone);

                if (formattedSelectedDateTimeInISO) {
                    const data = await createVisionaryRoom(
                        movie.id, 
                        formattedSelectedDateTimeInISO,
                        selectedTimeZone,
                    );

                    if (data) {
                        setModalMessage(
                            'Your visionary room has been requested successfully. Once approved by an admin, you will be notified.',
                        );
                    } else {
                        setModalMessage('Oops! Something went wrong. Please try again.');
                    }

                    setShowResponseModal(true);
                }
            }
        } catch (error) {
            console.error('Error creating visionary room: ', error);
            setModalMessage('Something went wrong. Please try again later.');
            setShowResponseModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            {loading && (
                <View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: COLORS.OVERLAY_BLACK_40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                    }}>
                    <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                </View>
            )}
            <ScrollView stickyHeaderIndices={[0]}>
                <View
                    style={{
                        backgroundColor: COLORS.AKCRUBACKGROUND,
                        paddingBottom: 20,
                    }}>
                    <Header />
                    <View style={styles.topcontainer}>
                        <BackButton navigation={navigation} />
                    </View>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <Text style={styles.choosedate}>Schedule Visionary Room</Text>
                </View>

                <View style={{paddingHorizontal: 15, marginTop: 10}}>
                    <View style={{flexDirection: 'row'}}>
                        <Image
                            source={{uri: movie?.portraitURL}}
                            style={{
                                width: SIZES.ScreenWidth / 2.5,
                                height: SIZES.ScreenWidth / 1.7,
                                borderRadius: 5,
                            }}
                        />
                        <View style={{width: SIZES.ScreenWidth / 2, marginLeft: 10}}>
                            <Text style={{...FONTS.paragraph1}}>{movie?.description}</Text>
                            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                                <Text
                                    style={{
                                        ...FONTS.Title2,
                                        color: COLORS.AKCRUBLUE,
                                        fontSize: 12,
                                        marginVertical: 10,
                                    }}>
                                    <Text style={{color: COLORS.DARKGREY}}>Cast:</Text>{' '}
                                    {movie?.actors && movie?.actors.map(actor => actor.name).join(', ')}
                                </Text>
                            </View>
                            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                                <Text
                                    style={{
                                        ...FONTS.Title2,
                                        color: COLORS.AKCRUBLUE,
                                        fontSize: 12,
                                    }}>
                                    <Text style={{color: COLORS.DARKGREY}}>Directors:</Text>{' '}
                                    {movie?.director && movie?.director.map(director => director.name).join(', ')}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={{marginTop: 10}}>
                        <Text style={{...FONTS.Title3}}>{movie?.title}</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                marginVertical: 5,
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignSelf: 'center',
                                    marginRight: 20,
                                }}>
                                <Text
                                    style={{
                                        ...FONTS.paragraph2,
                                        color: COLORS.LIGHTGREY,
                                        marginRight: 10,
                                    }}>
                                    {movie?.year}
                                </Text>
                                <Text style={{...FONTS.paragraph2, color: COLORS.LIGHTGREY}}>
                                    {formatMovieDuration(movie?.duration ?? 0)}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                }}>
                                <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                <Text style={styles.drawfonttag}>
                                    {capitalizeFirstLetterOfString(movie?.genres[0] ?? '')}
                                </Text>
                                <Text style={styles.drawfonttag}>
                                    {capitalizeFirstLetterOfString(movie?.genres[1] ?? '')}
                                </Text>
                                <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{marginTop: 20, marginBottom: 90}}>
                    <Text style={styles.choosedate}>Choose date</Text>
                    <View style={styles.container}>
                        <View style={styles.monthContainer}>
                            <TouchableOpacity onPress={handlePreviousMonth} style={styles.arrowButton}>
                                <Text style={styles.arrowbuttonstyle}>{'<'}</Text>
                            </TouchableOpacity>
                            <Text style={styles.monthText}>
                                {months[currentMonth]} {currentYear}
                            </Text>
                            <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
                                <Text style={styles.arrowbuttonstyle}>{'>'}</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.datePickerContainer}>
                                {[...Array(daysInMonth)].map((_, index) => {
                                    const day = index + 1;
                                    const isSelected = selectedDate.getDate() === day;
                                    const currentDate = new Date();
                                    currentDate.setHours(0, 0, 0, 0); // normalize to start of today
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

                        <View style={{flexDirection: 'row', marginBottom: 10}}>
                            <Text style={{...FONTS.Title2}}>Choose Date: </Text>
                            <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>
                                {' '}
                                {selectedDate.toLocaleDateString()}
                            </Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.timePickerContainer}>
                                {[...Array(24 * 4)].map((_, index) => {
                                    const hours = Math.floor(index / 4);
                                    const minutes = (index % 4) * 15;
                                    const isSelected =
                                        selectedTime.getHours() === hours && selectedTime.getMinutes() === minutes;

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
                        <View style={{flexDirection: 'row', marginBottom: 10}}>
                            <Text style={{...FONTS.Title2}}>Choose Time: </Text>
                            <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>
                                {' '}
                                {selectedTime.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        </View>
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
                        <View style={{flexDirection: 'row', marginBottom: 30}}>
                            <Text style={{...FONTS.Title2}}>Choose Time Zone:{'  '}</Text>
                            <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>{selectedTimeZone}</Text>
                        </View>
                        <View style={{alignItems: 'center'}}>
                            <AkcruButtons.CustomButton
                                btnname={'Create Visionary Room'}
                                color={COLORS.AKCRUBLUE}
                                onPress={handleSubmit}
                                disabled={
                                    !selectedDate || !selectedTime || !selectedTimeZone || isSelectionDisabled
                                }
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
            <Modal visible={showResponseModal} transparent={true} animationType="fade" onRequestClose={() => {}}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: COLORS.OVERLAY_BLACK_60,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            backgroundColor: COLORS.AKCRUBACKGROUND,
                            borderRadius: 10,
                            padding: 20,
                            width: '80%',
                            alignItems: 'center',
                        }}>
                        <Text style={{...FONTS.Title2, marginBottom: 15, textAlign: 'center'}}>
                            Visionary Room Request
                        </Text>
                        <Text
                            style={{
                                ...FONTS.paragraph1,
                                color: COLORS.LIGHTGREY,
                                textAlign: 'center',
                                marginBottom: 20,
                            }}>
                            {modalMessage}
                        </Text>

                        <TouchableOpacity
                            style={{
                                backgroundColor: COLORS.AKCRUBLUE,
                                borderRadius: 5,
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                            }}
                            onPress={() => {
                                setIsSelectionDisabled(false);
                                setShowResponseModal(false);
                                navigation2.navigate('HomeScreen');
                            }}>
                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default VisionaryRoomSchedule;
