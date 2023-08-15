import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,

  Image,
  ImageBackground
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../../../components/header";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import AkcruButtons from "../../../components/akcruButtons";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";

import { Icon } from "@rneui/base";
import imageindex from "../../../../assets/images/imageindex";
import styles from "./styles";
import { findMovieById } from "../../../lib/api/movies.lib";
import { IMovie } from "../../../../types";
import { API } from "../../../clients/api.client";
import { createACRUView, getMyCRU } from "../../../lib/api/cru.lib";
import { formatMovieDuration } from "../../../util/util";


type CruViewMovieDetailScreenNavigationProp = StackNavigationProp<
  UserProfileStackParams,
  'CruViewMovieDetailScreen'
>;

type CruViewDetailScreenRouteProp = RouteProp<
  UserProfileStackParams,
  'CruViewMovieDetailScreen'
>;

type Props = {
  navigation: CruViewMovieDetailScreenNavigationProp;
  route: CruViewDetailScreenRouteProp;
};

export default function CruViewMovieDetailScreen({ navigation, route }: Props) {
  const id: number | undefined = route.params?.id ?? null;
  // const movie: string | undefined = route.params?.movie ?? null;
  
  const [loaded, setIsLoaded] = useState(false);
  const [movie, setMovie] = useState<IMovie | null>(null);

  const fetchMovie = async (id: string) => {
    const movie = await findMovieById(String(id));
    setMovie(movie);
    setIsLoaded(true);
  }

  useEffect(() => {
    fetchMovie(String(id));
  }, []);

  const renderActorsList = (actors: Object[]) => {
    let actorsList = ""
    actors.map((actor, index) => {
      if (index === actors.length - 1) {
        actorsList += actor["name"];
      } else {
        actorsList += actor["name"] + ", ";
      }
    });

    return actorsList;
  }
  const renderDirectorsList = (directors: Object[]) => {
    let directorsList = ""
    directors.map((director, index) => {
      if (index === directors.length - 1) {
        directorsList += director["name"];
      } else {
        directorsList += director["name"] + ", ";
      }
    });

    return directorsList;
  }


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
  console.log("updatedDate from handleDateChange", updatedDate);
  
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

const handleSetDateTime = async () => {
  if (selectedDate && selectedTime && selectedTimeZone) {
    setIsDateTimeSelected(true);
    setIsSelectionDisabled(true);
    
    // TODO: Send CRU View to server
    const createdCruView = await createACRUView({ 
      movieId: String(movie?.id), 
      startTime: selectedTime.toISOString(), 
      timezone: selectedTimeZone
    });


    setShowSendCRUView(true);
    // TODO: Move to the CRU View confirmation screen
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

const [showSendCRUView, setShowSendCRUView] = useState(false);

useEffect(() => {
  let timer;
  if (showSendCRUView) {
    timer = setTimeout(() => {
      setShowSendCRUView(false);
      setIsSelectionDisabled(true);
    }, 4000);
  }

  return () => clearTimeout(timer);
}, [showSendCRUView]);

  return (
    <SafeAreaView>
      { showSendCRUView ? (
        <View style={{ flex: 1 }}>
          <ImageBackground
            source={{
              uri: "https://akcru.com/wp-content/uploads/2023/05/creepymit.png",
            }}
            resizeMode="cover"
            style={{ width: SIZES.ScreenWidth, height: SIZES.ScreenHeight }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  ...FONTS.Title3,
                  width: 200,
                  textAlign: "center",
                  paddingBottom: 20,
                }}
              >
                Your CRU View is set
              </Text>
              <Image
                source={imageindex.CruLarge}
                style={{
                  width: 275,
                  height: 120,
                }}
              />
              <Text
                style={{
                  ...FONTS.Title3,
                  width: 200,
                  textAlign: "center",
                  paddingTop: 20,
                }}
              >
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
          <ScrollView stickyHeaderIndices={[0]}>
            <View>
              <Header />
            </View>
            <View style={styles.topcontainer}>
              <TouchableOpacity onPress={() => navigation.pop()}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    name="chevron-back"
                    type="ionicon"
                    size={20}
                    color={COLORS.LIGHTGREY}
                  />
                  <Text style={{ ...FONTS.Title3, marginLeft: 5 }}>Back</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={styles.choosedate}>Schedule CRU View</Text>
              <Icon
                name="calendar"
                type="ionicon"
                size={20}
                color={COLORS.LIGHTGREY}
              />
            </View>
            <View style={{ marginHorizontal: 15, marginTop: 10 }}>
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={{ uri: movie?.portraitURL }}
                  style={{
                    width: SIZES.ScreenWidth / 2.5,
                    height: SIZES.ScreenWidth / 1.7,
                    borderRadius: 5,
                  }}
                />
                <View style={{ width: SIZES.ScreenWidth / 2, marginLeft: 10 }}>
                  <Text style={{ ...FONTS.Title2, fontSize: 12 }}>{movie?.description}</Text>
                  <Text
                    style={{
                      ...FONTS.Title2,
                      color: COLORS.AKCRUBLUE,
                      fontSize: 12,
                      marginVertical: 10,
                    }}
                  >
                    Cast: {loaded ? renderActorsList(movie?.actors) : null}
                  </Text>
                  <Text
                    style={{
                      ...FONTS.Title2,
                      color: COLORS.AKCRUBLUE,
                      fontSize: 12,
                    }}
                  >
                    Directors: {loaded ? renderDirectorsList(movie?.director): null}
                  </Text>
                </View>
              </View>
              <View style={{ marginTop: 10 }}>
                <Text style={{ ...FONTS.Title3 }}>{movie?.title}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    marginVertical: 5,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignSelf: "center",
                      marginRight: 20,
                    }}
                  >
                    <Text
                      style={{
                        ...FONTS.Title2,
                        color: COLORS.LIGHTGREY,
                        marginRight: 10,
                      }}
                    >
                      {movie?.year}
                    </Text>
                    <Text style={{ ...FONTS.Title2, color: COLORS.LIGHTGREY }}>
                      {formatMovieDuration(movie?.duration)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                    <Text style={styles.drawfonttag}>{movie?.genres[0]}</Text>

                    <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={{ marginTop: 20, marginBottom: 75 }}>
              <Text style={styles.choosedate}>Choose date</Text>
              <View style={styles.container}>
                <View style={styles.monthContainer}>
                  <TouchableOpacity
                    onPress={handlePreviousMonth}
                    style={styles.arrowButton}
                  >
                    <Text style={styles.arrowbuttonstyle}>{"<"}</Text>
                  </TouchableOpacity>
                  <Text style={styles.monthText}>
                    {months[currentMonth]} {currentYear}
                  </Text>
                  <TouchableOpacity
                    onPress={handleNextMonth}
                    style={styles.arrowButton}
                  >
                    <Text style={styles.arrowbuttonstyle}>{">"}</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.datePickerContainer}>
                    {[...Array(daysInMonth)].map((_, index) => {
                      const day = index + 1;
                      const isSelected = selectedDate.getDate() === day;
                      const currentDayOfWeek = new Date(
                        currentYear,
                        currentMonth,
                        day
                      ).getDay();
                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => handleDateChange(day)}
                          style={[
                            styles.dayButton,
                            isSelected && styles.dayButtonSelected,
                            isSelectionDisabled && styles.disabledButton,
                          ]}
                          disabled={isSelectionDisabled}
                        >
                          <Text style={styles.dayOfWeekText}>
                            {daysOfWeek[currentDayOfWeek]}
                          </Text>
                          <Text
                            style={[
                              styles.dayText,
                              isSelected && styles.dayTextSelected,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <Text style={{ ...FONTS.Title2 }}>Choose Date: </Text>
                  <Text style={{ ...FONTS.Title2, color: COLORS.MIDORANGE }}>
                    {" "}
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
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleTimeChange(hours, minutes)}
                          style={[
                            styles.timeButton,
                            isSelected && styles.timeButtonSelected,
                            isSelectionDisabled && styles.disabledButton,
                          ]}
                          disabled={isSelectionDisabled}
                        >
                          <Text
                            style={[
                              styles.timeText,
                              isSelected && styles.timeTextSelected,
                            ]}
                          >
                            {hours < 10 ? `0${hours}` : hours}:
                            {minutes === 0 ? "00" : minutes}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <Text style={{ ...FONTS.Title2 }}>Choose Time: </Text>
                  <Text style={{ ...FONTS.Title2, color: COLORS.MIDORANGE }}>
                    {" "}
                    {selectedTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.timeZonePickerContainer}>
                    {timeZones.map((timeZone) => {
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
                          disabled={isSelectionDisabled}
                        >
                          <Text
                            style={[
                              styles.timeZoneText,
                              isSelected && styles.timeZoneTextSelected,
                            ]}
                          >
                            {timeZone}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
                <View style={{ flexDirection: "row", marginBottom: 30 }}>
                  <Text style={{ ...FONTS.Title2 }}>
                    Choose Time Zone:{"  "}
                  </Text>
                  <Text style={{ ...FONTS.Title2, color: COLORS.MIDORANGE }}>
                    {selectedTimeZone}
                  </Text>
                </View>
                <View>
                  <View>
                    {!isDateTimeSelected ? (
                      <View style={{ alignItems: "center" }}>
                        <AkcruButtons.SmallButton
                          btnname={"Set Date"}
                          color={COLORS.MIDORANGE}
                          onPress={handleSetDateTime}
                          disabled={
                            !selectedDate || !selectedTime || !selectedTimeZone
                          }
                        />
                      </View>
                    ) : (
                      <View>
                        <Text
                          style={{
                            ...FONTS.Title2,
                            color: COLORS.MIDORANGE,
                            textAlign: "center",
                          }}
                        >
                          Your CRU View is all set to watch:
                        </Text>
                        <Text
                          style={{
                            ...FONTS.Title2,
                            color: COLORS.MIDORANGE,
                            textAlign: "center",
                          }}
                        >
                          "{movie?.title}"
                        </Text>
                        <View>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "center",
                            }}
                          >
                            <View style={{ margin: 10 }}>
                              <Image
                                source={{ uri: movie?.portraitURL }}
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
                                {" "}
                                {selectedTime.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Text>
                              <Text style={styles.selectedDateTimeText}>
                                {selectedTimeZone}
                              </Text>
                            </View>
                          </View>

                          <View
                            style={{ alignItems: "center", marginBottom: 20 }}
                          ></View>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
