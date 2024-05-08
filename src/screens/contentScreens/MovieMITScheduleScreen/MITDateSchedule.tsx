import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    SafeAreaView,
    Image,
    FlatList,
    TextInput,
    ImageBackground,
    ActivityIndicator,
} from 'react-native';
import styles from './styles';
import React, {useState, useRef, useEffect} from 'react';
import Header from '../../../components/header';
import MITUserSearchCard from './MITUserCard';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants/index';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {findAUser} from '../../../lib/api/user.lib';
import {searchForUsers} from '../../../lib/api/user.lib';
import {ClientStackParams} from '../../../navigation/ClientStack';
import {IMovie, IUserProfile} from '../../../../types';
import {findMovieById} from '../../../lib/api/movies.lib';
import {Avatar, Icon} from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import {capitalizeFirstLetterOfString, combineDateAndTime, formatMovieDuration, selectAvatarBorderColor} from '../../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import AkcruLevels from '../../../components/akcruBadges';
import AkcruButtons from '../../../components/akcruButtons';
import {createAMITInvite} from '../../../lib/api/mit.lib';
import HexAvatar from '../../../components/HexAvatar';
import { MULTISIZES } from '../../../../assets/constants/theme';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';

type MITDateScheduleNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'MITDateSchedule'>;

type MITDateScheduleRouteProp = RouteProp<NoBottomTabStackParams, 'MITDateSchedule'>;

type Props = {
    navigation: MITDateScheduleNavigationProp;
    route: MITDateScheduleRouteProp;
};

const MITDateSchedule = ({route, navigation}: Props) => {
    const id: string | undefined = route.params?.id ?? null;
    const [movie, setMovie] = useState<IMovie | null>(null);
    const [user, setUser] = useState<IUserProfile | undefined>(undefined);
    const [data, setData] = useState<IUserProfile[] | []>([]);

    // Fetch movie data based on the provided ID
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

    const userID: string | undefined = route.params?.userId ?? null; // Define userID here

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
    ); // Include setUser as a dependency

    const [textInputFocused, setTextInputFocused] = useState(false);
    const textInputRef = useRef(null);

    const handleSearch = (text: any) => {
        if (text.length > 1) {
            // send search request to backend when text is 2 or more characte
            searchForUsers(text).then(res => {
                if (res.length > 0) {
                    setData(res);
                }
            });
        }
    };

    //console.log('Movie title:', movie?.title); // Log movie URL for debugging
    //console.log('Movie title:', movie?.year); // Log movie URL for debugging

    const [scheduleIsShown, setScheduleIsShown] = useState(false);

    const [selectedUserName, setSelectedUserName] = useState('');
    const [selectedAkcruBadgeAkcruit, setSelectedAkcruBadgeAkcruit] = useState('');
    const [selectedAkcruBadgeGuardian, setSelectedAkcruBadgeGuardian] = useState('');
    const [selectedAkcruBadgeHero, setSelectedAkcruBadgeHero] = useState('');
    const [selectedAkcruBadgeSuperHero, setSelectedAkcruBadgeSuperHero] = useState('');
    const [selectedUserPicture, setSelectedUserPicture] = useState('');
    const [selectedInfluencer, setSelectedInfluencer] = useState('');
    const [selectedUser, setSelectedUser] = useState(false);
    const [selectedBorderColor, setSelectedBorderColor] = useState('')
    

    const handlePress = (username, badge, profilePicture) => {
        //console.log('Item with username', username, badge, 'pressed!');
        //console.log('Item with movie title', movie?.title, movie?.year, 'pressed!');
        const borderColor = selectAvatarBorderColor(badge);

        setScheduleIsShown(true);
        setSelectedUserName(username);
        setSelectedAkcruBadgeAkcruit(badge);
        setSelectedAkcruBadgeGuardian(badge);
        setSelectedAkcruBadgeHero(badge);
        setSelectedAkcruBadgeSuperHero(badge);
        setSelectedUserPicture(profilePicture);
        setSelectedUser(true);
        // setSelectedInfluencer(influencer);
        setSelectedBorderColor(borderColor);
    };

    //Scheduling date states
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [selectedTimeZone, setSelectedTimeZone] = useState('');
    const [isDateTimeSelected, setIsDateTimeSelected] = useState(false);
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

    const handleSetDateTime = async () => {
        if (selectedDate && selectedTime && selectedTimeZone && movie && selectedUserName) {
            const formattedSelectedDateTimeInISO = combineDateAndTime(selectedDate, selectedTime, selectedTimeZone);

            //console.log('sending MIT');
            //console.log('selectedDate:', selectedDate);
            //console.log('selectedTime:', selectedTime);
            //console.log('selectedMovie:', movie?.title);
            //console.log('selectedTimeZone:', selectedTimeZone);
            //console.log('selectedUser:', user);

            //console.log('DATE SENT TO API:', selectedDate.toISOString());

            if (formattedSelectedDateTimeInISO) {
                // Call API to send MIT Invite
                const response = await createAMITInvite({
                    movieId: movie.id,
                    username: selectedUserName,
                    startDate: formattedSelectedDateTimeInISO,
                    timezone: selectedTimeZone,
                });
                //console.log('response:', response);

                if (response) {
                    setIsDateTimeSelected(true);
                    setIsSelectionDisabled(true);
                    setShowSendMIT(true); // on successfull send MIT, show MIT sent screen
                }
            }
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showSendMIT) {
            timer = setTimeout(() => {
                setShowSendMIT(false);
                setIsSelectionDisabled(true);

                navigation.navigate('UserProfileStack', {
                    screen: 'UserMITHubScreen',
                });
            }, 4000);
        }

        return () => clearTimeout(timer);
    }, [showSendMIT]);

    return (
        <View>
            {showSendMIT ? (
                <View style={{flex: 1}}>
                    <ImageBackground
                        source={{
                            uri: 'https://akcru.com/wp-content/uploads/2023/05/creepymit.png',
                        }}
                        resizeMode="cover"
                        style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <Text
                                style={{
                                    ...FONTS.Title3,
                                    width: 200,
                                    textAlign: 'center',
                                    paddingBottom: 20,
                                }}>
                                Your Movie Invite Ticket was sent
                            </Text>
                            <Image
                                source={imageindex.LrgMIT}
                                style={{
                                    width: 140,
                                    height: 75,
                                }}
                            />
                            <Text
                                style={{
                                    ...FONTS.Title3,
                                    width: 200,
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
                    </ImageBackground>
                </View>
            ) : (
                <View>
                    {!scheduleIsShown ? (
                        <ScrollView stickyHeaderIndices={[0]}>
                            <View style={styles.backbutton}>
                                <Header />
                                <TouchableOpacity
                                    style={{marginHorizontal: 15, marginBottom: 10}}
                                    onPress={() => navigation.pop()}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                        <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                    </View>
                                </TouchableOpacity>
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

                            <View style={{marginHorizontal: 15, marginBottom: 70}}>
                                <FlatList
                                    data={data}
                                    horizontal={false}
                                    showsHorizontalScrollIndicator={false}
                                    scrollEnabled={false}
                                    keyExtractor={item => item.id}
                                    renderItem={({item, index}) => (
                                        <View style={{marginVertical: 5}}>
                                            <MITUserSearchCard
                                                userPicture={item.profilePicture}
                                                userName={item.username}
                                                onPress={() => {
                                                    navigation.navigate('ViewUserScreen', {
                                                        userID: item.id,
                                                    });
                                                    setTextInputFocused(true);
                                                }}
                                                //   influencer={item.influencer}
                                                userID={item.id}
                                                akcruBadge={item.badge}
                                                userDesc={item.description}
                                                onPressOut={() =>
                                                    handlePress(item.username, item.badge, item.profilePicture)
                                                }
                                                influencerStatus={item.influencerStatus}
                                                companyStatus={item.companyStatus}
                                                ownerStatus={item.ownerStatus}
                                                firstName={item.firstName}
                                            />
                                        </View>
                                    )}
                                />
                            </View>
                        </ScrollView>
                    ) : (
                        <ScrollView stickyHeaderIndices={[0]}>
                            <View
                                style={{
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    paddingBottom: 20,
                                }}>
                                <Header />
                                <View style={styles.topcontainer}>
                                    <TouchableOpacity onPress={() => navigation.pop()}>
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
                            {/* Start of Scheduling render */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                <Text style={styles.choosedate}>Schedule Movie Invite Ticket</Text>
                                <Image source={imageindex.MITticket} />
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
                                                {movie?.director &&
                                                    movie?.director.map(director => director.name).join(', ')}
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
                                                {formatMovieDuration(movie?.duration)}
                                            </Text>
                                        </View>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                            }}>
                                            <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                            <Text style={styles.drawfonttag}>
                                                {capitalizeFirstLetterOfString(movie?.genres[0])}
                                            </Text>
                                            <Text style={styles.drawfonttag}>
                                                {capitalizeFirstLetterOfString(movie?.genres[1])}
                                            </Text>
                                            <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
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

                                        padding: 10,
                                    }}>
                                    <LinearGradient
                                        // Background Linear Gradient
                                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: SIZES.ScreenWidth / 1.8,
                                            borderRadius: 5,
                                        }}
                                    />
                                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                        <View>
                                            <HexAvatar
                                                source={
                                                    selectedUserPicture
                                                        ? {uri: selectedUserPicture}
                                                        : imageindex.Akcruplaceholder
                                                }
                                                size={MULTISIZES.Xlarge43}
                                                bordercolor={selectedBorderColor}
                                            />
                                        </View>
                                        <View style={{marginLeft: 10}}>
                                            <Text style={{...FONTS.Title2}}>{selectedUserName}</Text>
                                            {selectedAkcruBadgeAkcruit === 'AKCRUIT' && (
                                                <View>
                                                    <AkcruLevels.AkcruBadgeAkcruit />
                                                </View>
                                            )}
                                            {selectedAkcruBadgeGuardian === 'GUARDIAN' && (
                                                <View>
                                                    <AkcruLevels.AkcruBadgeGuardian />
                                                </View>
                                            )}
                                            {selectedAkcruBadgeHero === 'HERO' && (
                                                <View>
                                                    <AkcruLevels.AkcruBadgeHero />
                                                </View>
                                            )}
                                            {selectedAkcruBadgeSuperHero === 'SUPERHERO' && (
                                                <View>
                                                    <AkcruLevels.AkcruBadgeSuperHero />
                                                </View>
                                            )}
                                        </View>
                                        <View>
                                            {selectedInfluencer && (
                                                <Icon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.AKCRUBLUE}
                                                    size={20}
                                                    style={{marginLeft: 5}}
                                                />
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <View style={{marginLeft: 10}}>
                                    <Image source={imageindex.MITticket} />
                                </View>
                            </View>
                            {/* Calendar */}
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

                                    {/* Day picker */}

                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.datePickerContainer}>
                                            {[...Array(daysInMonth)].map((_, index) => {
                                                const day = index + 1;
                                                const isSelected = selectedDate.getDate() === day;
                                                const currentDate = new Date();
                                                const currentDay = new Date(currentYear, currentMonth, day);
                                                const currentDayOfWeek = currentDay.getDay();

                                                // Allow selection for current day and future days
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

                                    {/* Time picker */}
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
                                            {!isDateTimeSelected ? (
                                                <View style={{alignItems: 'center'}}>
                                                    <AkcruButtons.SmallButton
                                                        btnname={'Send MIT'}
                                                        color={COLORS.AKCRUBLUE}
                                                        onPress={handleSetDateTime}
                                                        disabled={!selectedDate || !selectedTime || !selectedTimeZone}
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
                                                        to {selectedUserName} to watch:
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            ...FONTS.Title2,
                                                            color: COLORS.AKCRUBLUE,
                                                            textAlign: 'center',
                                                        }}>
                                                        "{movie?.title}"
                                                    </Text>
                                                    <View>
                                                        <View
                                                            style={{
                                                                flexDirection: 'row',
                                                                justifyContent: 'center',
                                                            }}>
                                                            <View style={{margin: 10}}>
                                                                <Image
                                                                    source={{uri: movie?.portraitURL}}
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
                                                                You will be notified if your MIT has been ACCEPTED or
                                                                DECLINED
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </View>
            )}
        </View>
    );
};

export default MITDateSchedule;
