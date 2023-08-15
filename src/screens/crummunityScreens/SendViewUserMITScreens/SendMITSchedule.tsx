import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
ImageBackground,
  SafeAreaView,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import AkcruLevels from "../../../components/akcruBadges";
import Header from "../../../components/header";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import AkcruButtons from "../../../components/akcruButtons";
import { CrummunityStackParams } from "../../../navigation/CrummunityStack";
import { Avatar, Icon } from "@rneui/base";
import LinearGradient from "react-native-linear-gradient";
import imageindex from "../../../../assets/images/imageindex";
import { FAKE_USER_PROFILES } from "../../../../assets/constants/Mockusers";
import styles from "./styles";
import { Akcru_Content } from "../../../../assets/constants/ListData";

type SendMITScheduleNavigationProp = StackNavigationProp<
  CrummunityStackParams,
  "SendMITSchedule"
>;

type SendMITScheduleRouteProp = RouteProp<
  CrummunityStackParams,
  "SendMITSchedule"
>;

type Props = {
  navigation: SendMITScheduleNavigationProp;
  route: SendMITScheduleRouteProp;
};

export default function SendMITSchedule({ navigation, route }: Props) {
  const id: number | undefined = route.params?.id ?? null;
  const userID: string | undefined = route.params?.userID ?? null;

  const {
    name,
    year,
    length,
    rated,
    rating,
    desc,
    actors,
    directors,
    portrait_poster,
    youtubetrailer,
    landscape_poster,
    movie_url,
    genre,
  } = Akcru_Content[0].movies[id ?? 0];

  const {
    digitalpass,
    userPicture,
    privateaccount,
    online,
    userName,
    akcruBadge,
    status,
    userFollowerAmount,
    userDesc,
    influencer,
  } = FAKE_USER_PROFILES[userID ?? 0];

  const [scheduleIsShown, setScheduleIsShown] = useState(false);

  const [selectedUserName, setSelectedUserName] = useState(userName);
  const [selectedAkcruBadgeAkcruit, setSelectedAkcruBadgeAkcruit] =
    useState(akcruBadge.akcruit);
  const [selectedAkcruBadgeGuardian, setSelectedAkcruBadgeGuardian] =
    useState(akcruBadge.guardian);
  const [selectedAkcruBadgeHero, setSelectedAkcruBadgeHero] = useState(akcruBadge.hero);
  const [selectedAkcruBadgeSuperHero, setSelectedAkcruBadgeSuperHero] =
    useState(akcruBadge.superhero);
  const [selectedUserPicture, setSelectedUserPicture] = useState(userPicture);
  const [selectedInfluencer, setSelectedInfluencer] = useState(influencer);


  
  

  // const handlePressMIT = (
  //   userID,
  //   userName,
  //   akcruBadge,
  //   userPicture,
  //   influencer
  // ) => {
  //   setScheduleIsShown(true);
  //   setSelectedUserName(userName);
  //   setSelectedAkcruBadgeAkcruit(akcruBadge.akcruit);
  //   setSelectedAkcruBadgeGuardian(akcruBadge.guardian);
  //   setSelectedAkcruBadgeHero(akcruBadge.hero);
  //   setSelectedAkcruBadgeSuperHero(akcruBadge.superhero);
  //   setSelectedUserPicture(userPicture);
  //   setSelectedInfluencer(influencer);
  //   // Add your logic here to handle the onPress1 action
  //   // You can use the userID parameter or any other data from the item

  //   console.log("Item with userID", userID, userName, "pressed!");
  // };

  
 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedTimeZone, setSelectedTimeZone] = useState("");
  const [isDateTimeSelected, setIsDateTimeSelected] = useState(false);
  const [isSelectionDisabled, setIsSelectionDisabled] = useState(false);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

  const handleDateChange = (day) => {
    const updatedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(updatedDate);
  };

  const handleTimeChange = (hours, minutes) => {
    const updatedTime = new Date(selectedTime);
    updatedTime.setHours(hours);
    updatedTime.setMinutes(minutes);
    setSelectedTime(updatedTime);
  };

  const handleTimeZoneChange = (timeZone) => {
    setSelectedTimeZone(timeZone);
  };

  const handleSetDateTime = () => {
    if (selectedDate && selectedTime && selectedTimeZone) {
      setIsDateTimeSelected(true);
      setIsSelectionDisabled(true);
      setShowSendMIT(true);
    }
  };

  const timeZones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];

  const [showSendMIT, setShowSendMIT] = useState(false);

  useEffect(() => {
    let timer;
    if (showSendMIT) {
      timer = setTimeout(() => {
        setShowSendMIT(false);
        setIsSelectionDisabled(true);
      }, 4000);
    }

    return () => clearTimeout(timer);
  }, [showSendMIT]);

  return (
      <SafeAreaView>
          <ScrollView stickyHeaderIndices={[1]}>
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
                                      <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                      <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                  </View>
                              </TouchableOpacity>
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
                                  source={{uri: portrait_poster}}
                                  style={{
                                      width: SIZES.ScreenWidth / 2.5,
                                      height: SIZES.ScreenWidth / 1.7,
                                      borderRadius: 5,
                                  }}
                              />
                              <View style={{width: SIZES.ScreenWidth / 2, marginLeft: 10}}>
                                  <Text style={{...FONTS.Title2, fontSize: 12}}>{desc}</Text>
                                  <Text
                                      style={{
                                          ...FONTS.Title2,
                                          color: COLORS.AKCRUBLUE,
                                          fontSize: 12,
                                          marginVertical: 10,
                                      }}>
                                      Cast: {actors.join(', ')}
                                  </Text>
                                  <Text
                                      style={{
                                          ...FONTS.Title2,
                                          color: COLORS.AKCRUBLUE,
                                          fontSize: 12,
                                      }}>
                                      Directors: {directors.join(', ')}
                                  </Text>
                              </View>
                          </View>
                          <View style={{marginTop: 10}}>
                              <Text style={{...FONTS.Title3}}>{name}</Text>
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
                                              ...FONTS.Title2,
                                              color: COLORS.LIGHTGREY,
                                              marginRight: 10,
                                          }}>
                                          {year}
                                      </Text>
                                      <Text style={{...FONTS.Title2, color: COLORS.LIGHTGREY}}>{length}</Text>
                                  </View>
                                  <View
                                      style={{
                                          flexDirection: 'row',
                                      }}>
                                      <Text style={styles.drawfonttag}>{rated}</Text>
                                      <Text style={styles.drawfonttag}>{genre[0]}</Text>

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
                                  width: SIZES.ScreenWidth / 2,
                                  height: SIZES.ScreenHeight / 11.5,
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
                                      width: SIZES.ScreenWidth / 2,
                                      borderRadius: 5,
                                      height: SIZES.ScreenHeight / 11.5,
                                  }}
                              />
                              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                  <View>
                                      <Avatar
                                          rounded
                                          size={40}
                                          source={{
                                              uri: selectedUserPicture,
                                          }}
                                          avatarStyle={{
                                              borderWidth: 2,
                                              borderColor: COLORS.AKCRUBLUE,
                                          }}
                                      />
                                  </View>
                                  <View style={{marginLeft: 10}}>
                                      <Text style={{...FONTS.Title2}}>{selectedUserName}</Text>
                                      {selectedAkcruBadgeAkcruit && (
                                          <View>
                                              <AkcruLevels.AkcruBadgeAkcruit />
                                          </View>
                                      )}
                                      {selectedAkcruBadgeGuardian && (
                                          <View>
                                              <AkcruLevels.AkcruBadgeGuardian />
                                          </View>
                                      )}
                                      {selectedAkcruBadgeHero && (
                                          <View>
                                              <AkcruLevels.AkcruBadgeHero />
                                          </View>
                                      )}
                                      {selectedAkcruBadgeSuperHero && (
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
                      <View style={{marginTop: 20, marginBottom: 75}}>
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
                                                      (isSelectionDisabled || !isSelectable) && styles.disabledButton,
                                                  ]}
                                                  disabled={isSelectionDisabled || !isSelectable}>
                                                  <Text style={styles.dayOfWeekText}>
                                                      {daysOfWeek[currentDayOfWeek]}
                                                  </Text>
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
                                                      (isSelectionDisabled || isPastTime) && styles.disabledButton,
                                                  ]}
                                                  disabled={isSelectionDisabled || isPastTime}>
                                                  <Text
                                                      style={[styles.timeText, isSelected && styles.timeTextSelected]}>
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
                                                  "{name}"
                                              </Text>
                                              <View>
                                                  <View
                                                      style={{
                                                          flexDirection: 'row',
                                                          justifyContent: 'center',
                                                      }}>
                                                      <View style={{margin: 10}}>
                                                          <Image
                                                              source={{uri: portrait_poster}}
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
                                                          You will be notified if your MIT has been ACCEPTED or DECLINED
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
              )}
          </ScrollView>
      </SafeAreaView>
  );
}


