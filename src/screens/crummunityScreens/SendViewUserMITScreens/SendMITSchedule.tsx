import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    SafeAreaView,
    Image,
    ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AkcruLevels from '../../../components/akcruBadges';
import Header from '../../../components/header';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import AkcruButtons from '../../../components/akcruButtons';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';
import {IMovie, IUserProfile} from '../../../../types';
import {findMovieById} from '../../../lib/api/movies.lib';
import {useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {
    capitalizeFirstLetterOfString,
    combineDateAndTime,
    formatMovieDuration,
    selectAvatarBorderColor,
} from '../../../util/util';
import {findAUser} from '../../../lib/api/user.lib';
import {createAMITInvite} from '../../../lib/api/mit.lib';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientTabsParams} from '../../../navigation/ClientTabNavigator';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {ROOM_VALIDATION_CHECK_TIME} from '../../../util/config';
import HexAvatar from '../../../components/HexAvatar';
import {MULTISIZES} from '../../../../assets/constants/theme';
import BackButton from '../../../components/General/backbutton';

type SendMITScheduleNavigationProp = StackNavigationProp<CrummunityStackParams, 'SendMITSchedule'>;

type SendMITScheduleRouteProp = RouteProp<CrummunityStackParams, 'SendMITSchedule'>;

type Props = {
    navigation: SendMITScheduleNavigationProp;
    route: SendMITScheduleRouteProp;
};

export default function SendMITSchedule({route}: Props) {
    const navigation = useNavigation<NativeStackNavigationProp<ClientTabsParams>>();

    const userID: string | undefined = route.params?.userID ?? null;

    const [movie, setMovie] = useState<IMovie | null>(null);
    const [isMovieDataLoaded, setIsMovieDataLoaded] = useState(false);
    const routeParams = useRoute<RouteProp<CrummunityStackParams, 'SendMITSchedule'>>();
    const [loading, setLoading] = useState(true);

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
        if (selectedDate && selectedTime && selectedTimeZone && movie && user) {
            const formattedSelectedDateTimeInISO = combineDateAndTime(selectedDate, selectedTime, selectedTimeZone);

            if (formattedSelectedDateTimeInISO) {
                const response = await createAMITInvite({
                    movieId: movie.id,
                    username: user.username,
                    startDate: formattedSelectedDateTimeInISO,
                    timezone: selectedTimeZone,
                });

                if (response) {
                    setIsDateTimeSelected(true);
                    setIsSelectionDisabled(true);
                    setShowSendMIT(true);
                } 
                else {
                    setIsSelectionDisabled(false);
                }
            }
        }
    }   catch (error) {
            console.error('Error setting date and time:', error);
        }
        setLoading(false);
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

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showSendMIT) {
            timer = setTimeout(() => {
                setShowSendMIT(false);
                setIsSelectionDisabled(true);

                navigation.navigate('UserProfileStack', {
                    screen: 'UserMITHubScreen',
                });
            }, ROOM_VALIDATION_CHECK_TIME);
        }

        return () => clearTimeout(timer);
    }, [showSendMIT]);

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[1]}>
                    {showSendMIT ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: COLORS.AKCRUBACKGROUND,
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
                            <Text
                                style={{
                                    ...FONTS.Title3,
                                    textAlign: 'center',
                                    paddingTop: 20,
                                }}>
                                Don't forget to grab a bite while you watch at CRU Chew
                            </Text>
                            <Image
                                source={imageindex.CruChew3}
                                style={{
                                    width: 120,
                                    height: 120,
                                }}
                            />
                        </View>
                    ) : (
                        <View>
                            {isMovieDataLoaded ? (
                                <View>
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
                                        <Text style={styles.choosedate}>Schedule Movie Invite Ticket</Text>
                                        <Image source={imageindex.MITticket} />
                                    </View>
                                    <View style={{marginHorizontal: 15, marginTop: 10}}>
                                        <View style={{flexDirection: 'row'}}>
                                            <Image
                                                source={{uri: portraitURL}}
                                                style={{
                                                    width: SIZES.ScreenWidth / 2.5,
                                                    height: SIZES.ScreenWidth / 1.7,
                                                    borderRadius: 5,
                                                }}
                                            />
                                            <View style={{width: SIZES.ScreenWidth / 2, marginLeft: 10}}>
                                                <Text style={{...FONTS.paragraph1}}>{description}</Text>
                                                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                                                    <Text
                                                        style={{
                                                            ...FONTS.Title2AkcruBlue,

                                                            marginVertical: 10,
                                                        }}>
                                                        <Text style={{color: COLORS.DARKGREY}}>Cast:</Text>{' '}
                                                        {actors && actors.map(actor => actor.name).join(', ')}
                                                    </Text>
                                                </View>

                                                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                                                    <Text
                                                        style={{
                                                            ...FONTS.Title2AkcruBlue,
                                                            color: COLORS.AKCRUBLUE,
                                                        }}>
                                                        <Text style={{color: COLORS.DARKGREY}}>Directors:</Text>{' '}
                                                        {director && director.map(director => director.name).join(', ')}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{marginTop: 10}}>
                                            <Text style={{...FONTS.Title3}}>{title}</Text>
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
                                                            ...FONTS.paragraph1,
                                                            color: COLORS.LIGHTGREY,
                                                            marginRight: 10,
                                                        }}>
                                                        {year}
                                                    </Text>
                                                    <Text style={{...FONTS.paragraph1, color: COLORS.LIGHTGREY}}>
                                                        {formatMovieDuration(duration)}
                                                    </Text>
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                    }}>
                                                    <Text style={styles.drawfonttag}>{rated}</Text>
                                                    <Text style={styles.drawfonttag}>
                                                        {capitalizeFirstLetterOfString(genres[0])}
                                                    </Text>
                                                    <Text style={styles.drawfonttag}>
                                                        {capitalizeFirstLetterOfString(genres[1])}
                                                    </Text>

                                                    <Text style={styles.drawfonttag}>{rating}/10</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginTop: 35,
                                        }}>
                                        <View
                                            style={{
                                                borderRadius: 5,
                                                backgroundColor: COLORS.TAGCOLOR,
                                                width: SIZES.ScreenWidth / 1.8,
                                                height: SIZES.ScreenHeight / 11.5,
                                                padding: 10,
                                            }}>
                                            <LinearGradient
                                                colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    right: 0,
                                                    top: 0,
                                                    width: SIZES.ScreenWidth / 1.8,
                                                    borderRadius: 5,
                                                    height: SIZES.ScreenHeight / 11.5,
                                                }}
                                            />
                                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                                <View>
                                                    <HexAvatar
                                                        source={{uri: user?.profilePicture}}
                                                        size={MULTISIZES.Xlarge43}
                                                        bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                                    />
                                                </View>
                                                <View style={{marginLeft: 10}}>
                                                    <Text style={{...FONTS.Title2}}>{user?.username}</Text>
                                                    {user?.badge === 'AKCRUIT' && (
                                                        <View>
                                                            <AkcruLevels.AkcruBadgeAkcruit />
                                                        </View>
                                                    )}
                                                    {user?.badge === 'GUARDIAN' && (
                                                        <View>
                                                            <AkcruLevels.AkcruBadgeGuardian />
                                                        </View>
                                                    )}
                                                    {user?.badge === 'HERO' && (
                                                        <View>
                                                            <AkcruLevels.AkcruBadgeHero />
                                                        </View>
                                                    )}
                                                    {user?.badge === 'SUPERHERO' && (
                                                        <View>
                                                            <AkcruLevels.AkcruBadgeSuperHero />
                                                        </View>
                                                    )}
                                                </View>
                                                {/* <View>
                                                {selectedInfluencer && (
                                                    <Icon
                                                        name="ribbon"
                                                        type="ionicon"
                                                        color={COLORS.AKCRUBLUE}
                                                        size={20}
                                                        style={{marginLeft: 5}}
                                                    />
                                                )}
                                            </View> */}
                                            </View>
                                        </View>
                                        <View style={{marginLeft: 10}}>
                                            <Image source={imageindex.MITticket} />
                                        </View>
                                    </View>
                                    <View style={{marginTop: 20, marginBottom: 75}}>
                                        <Text style={styles.choosedate}>Choose date</Text>
                                        <View style={styles.container}>
                                            <View style={styles.monthContainer}>
                                                <TouchableOpacity
                                                    onPress={handlePreviousMonth}
                                                    style={styles.arrowButton}>
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
                                                                    style={[
                                                                        styles.dayText,
                                                                        isSelected && styles.dayTextSelected,
                                                                    ]}>
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
                                                                key={index}
                                                                onPress={() => handleTimeChange(hours, minutes)}
                                                                style={[
                                                                    styles.timeButton,
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
                                                <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>
                                                    {selectedTimeZone}
                                                </Text>
                                            </View>
                                            <View>
                                                <View>
                                                    {!showSendMIT ? (
                                                        <View style={{alignItems: 'center'}}>
                                                            <AkcruButtons.SmallButton
                                                                btnname={'Send MIT'}
                                                                color={COLORS.AKCRUBLUE}
                                                                onPress={handleSetDateTime}
                                                                disabled={
                                                                    !selectedDate || !selectedTime || !selectedTimeZone || isSelectionDisabled
                                                                }
                                                            />
                                                        </View>
                                                    ) : (
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
                                                    )}
                                                </View>
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
            </SafeAreaView>
        </TabContainer>
    );
}
