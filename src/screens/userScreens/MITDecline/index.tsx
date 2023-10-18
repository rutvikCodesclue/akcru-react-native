import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
  SafeAreaView,
} from "react-native";
import styles from "./styles";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Icon, Avatar } from "@rneui/base";
import Header from "../../../components/header";
import AkcruLevels from "../../../components/akcruBadges";
import LinearGradient from "react-native-linear-gradient";
import { DIGITAL_PASS } from "../../../../assets/constants/Mockusers";
import imageindex from "../../../../assets/images/imageindex";
import { JENNY_INVITES } from "../../../../assets/constants/Mockusers";
import BottomSheet, {
  BottomSheetHandleProps,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import { StackNavigationProp } from "@react-navigation/stack";
import { IMovie, IUserProfile } from "../../../../types";
import { capitalizeFirstLetterOfString, formatMovieDuration, getShortenedTimezone } from "../../../util/util";
import moment from "moment";

type ChooseMITScreenNavigationProp = StackNavigationProp<
  UserProfileStackParams,
  "ChooseMITScreen"
>;

type ChooseMITScreenRouteProp = RouteProp<
  UserProfileStackParams,
  "ChooseMITScreen"
>;

type Props = {
  navigation: ChooseMITScreenNavigationProp;
  route: ChooseMITScreenRouteProp;
};

const DeclineMITScreen = ({ navigation, route }: Props) => {
 const MITID: number | undefined = route.params?.MITID ?? null;
 const inviteeName: string | undefined = route.params?.inviteeName ?? null;

 // Access other passed parameters in a similar way
 const movie: IMovie | null = route.params?.movie ?? null;
 const creator: IUserProfile | null = route.params?.creator ?? null;
 const inviteDate: string | undefined = route.params?.inviteDate ?? null;
 const akcruBadge: any = route.params?.akcruBadge ?? null;
 const schedule: string | undefined = route.params?.schedule ?? null;
 const timezone: string | undefined = route.params?.timezone ?? null;

  useEffect(() => {
      const timer = setTimeout(() => {
          // Navigate to UserProfileScreen
          navigation.navigate('UserProfileScreen');
      }, 4000); // 4000 milliseconds (4 seconds)

      // Clear the timer if the component unmounts
      return () => clearTimeout(timer);
  }, []);

  return (
      <SafeAreaView style={{flex: 1}}>
          <View style={styles.sheetcontainer}>
              <ScrollView stickyHeaderIndices={[0]}>
                  <View>
                      <Header />
                  </View>
                  <View>
                      <ImageBackground
                          source={{uri: DIGITAL_PASS[0].SuperHeroPass}}
                          resizeMode="cover"
                          style={{height: SIZES.ScreenHeight / 4, marginTop: -60}}>
                          <LinearGradient
                              // Background Linear Gradient
                              colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                              style={{
                                  position: 'absolute',
                                  left: 0,
                                  right: 0,
                                  top: 0,
                                  height: SIZES.ScreenHeight / 4,
                              }}
                          />
                          <View style={styles.topcontainer}>
                              {/* <TouchableOpacity onPress={() => navigation.navigate('ChooseMITScreen')}>
                                  <View
                                      style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                      }}>
                                      <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                      <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                  </View>
                              </TouchableOpacity> */}
                              <View>
                                  <Text
                                      style={{
                                          ...FONTS.Title3,
                                          color: COLORS.CATPURPLGT,
                                          fontSize: 16,
                                          textAlign: 'center',
                                          paddingTop: '10%',
                                      }}>
                                      NO DATE
                                  </Text>
                              </View>
                          </View>
                      </ImageBackground>

                      <View
                          style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: -50,
                              marginHorizontal: 15,
                              marginBottom: 20,
                          }}>
                          <View style={{flexDirection: 'row'}}>
                              <View style={{marginRight: 8}}>
                                  <Avatar
                                      rounded
                                      size={70}
                                      source={{
                                          uri: creator?.profilePicture,
                                      }}
                                      avatarStyle={{
                                          borderWidth: 2,
                                          borderColor: COLORS.AKCRUBLUE,
                                      }}
                                  />
                                  <View />
                                  <View
                                      style={{
                                          backgroundColor: 'green',
                                          height: 12,
                                          width: 12,
                                          borderRadius: 8,
                                          position: 'absolute',
                                          right: 8,
                                      }}
                                  />

                                  {/* {!privateaccount ? (
                                      online ? (
                                          <View
                                              style={{
                                                  backgroundColor: 'green',
                                                  height: 12,
                                                  width: 12,
                                                  borderRadius: 8,
                                                  position: 'absolute',
                                                  right: 8,
                                              }}
                                          />
                                      ) : (
                                          <View
                                              style={{
                                                  backgroundColor: 'red',
                                                  height: 12,
                                                  width: 12,
                                                  borderRadius: 8,
                                                  position: 'absolute',
                                                  right: 8,
                                              }}
                                          />
                                      )
                                  ) : null} */}
                              </View>
                              <View style={{width: SIZES.ScreenWidth / 2.5}}>
                                  <Text style={{...FONTS.Title2}}>{creator?.username}</Text>
                                  {akcruBadge === 'AKCRUIT' && (
                                      <View>
                                          <AkcruLevels.AkcruBadgeAkcruit />
                                      </View>
                                  )}
                                  {akcruBadge === 'GUARDIAN' && (
                                      <View>
                                          <AkcruLevels.AkcruBadgeGuardian />
                                      </View>
                                  )}
                                  {akcruBadge === 'HERO' && (
                                      <View>
                                          <AkcruLevels.AkcruBadgeHero />
                                      </View>
                                  )}
                                  {akcruBadge === 'SUPERHERO' && (
                                      <View>
                                          <AkcruLevels.AkcruBadgeSuperHero />
                                      </View>
                                  )}
                              </View>
                          </View>
                          <View style={{marginVertical: 20}}>
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
                                          height: 60,
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                      }}>
                                      <Text style={{...FONTS.Title3, fontSize: 14}}>{creator?.followerCount}</Text>
                                      <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>Followers</Text>
                                  </View>
                              </View>
                          </View>
                      </View>
                      <View
                          style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                          }}>
                          <Image source={imageindex.LrgMIT} style={{width: 55, height: 25}} />
                          <Text
                              style={{
                                  ...FONTS.Title3,
                                  color: COLORS.CATREDLGT,
                                  textAlign: 'center',
                                  fontSize: 16,
                                  marginLeft: 10,
                              }}>
                              DECLINE
                          </Text>
                      </View>
                      <View>
                          <View style={styles.bottomcontainer}>
                              <View style={{alignItems: 'center', marginBottom: 10}}>
                                  <View style={{marginTop: 10}}>
                                      <View style={{flexDirection: 'row', width: '75%'}}>
                                          <View style={{marginRight: 10}}>
                                              <Image source={{uri: movie?.portraitURL}} style={styles.poster} />
                                          </View>
                                          <View style={{}}>
                                              <Text style={{...FONTS.Title2}}>{movie?.title}</Text>
                                              <View
                                                  style={{
                                                      flexDirection: 'row',
                                                      marginBottom: 5,
                                                      alignItems: 'center',
                                                  }}>
                                                  <Text style={{...FONTS.Title2, fontSize: 12}}>{movie?.year}</Text>
                                                  <Text style={{...FONTS.Title2, fontSize: 12, marginHorizontal: 10}}>
                                                      {formatMovieDuration(movie?.duration)}
                                                  </Text>
                                              </View>
                                              <View style={{flexDirection: 'row', marginVertical: 5}}>
                                                  <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                                  <Text style={styles.drawfonttag}>
                                                      {capitalizeFirstLetterOfString(movie?.genres[0])}
                                                  </Text>

                                                  <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                                              </View>
                                          </View>
                                      </View>
                                  </View>
                              </View>

                              <Text
                                  style={{
                                      ...FONTS.paragraph1,
                                      fontSize: 12,
                                      textAlign: 'center',
                                  }}>
                                  We will notify "{creator?.firstName}" you have DECLINED to watch "{movie?.title}" on:
                              </Text>
                              <View style={{alignItems: 'center', marginTop: 30}}>
                                  <View style={styles.datebox}>
                                      <Text style={styles.datetext}>
                                          {' '}
                                          {moment(schedule).tz(timezone).format('ddd, MMM Do')}{' '}
                                      </Text>
                                      <Text style={styles.datetext}>@ </Text>
                                      <Text style={styles.datetext}>
                                          {/* render UTC Time w/ moment */}
                                          {moment(schedule).tz(timezone).format('h:mm A')}{' '}
                                          {getShortenedTimezone(timezone)}
                                      </Text>
                                      {/* <Text style={styles.datetext}>@ {MITTime}</Text> */}
                                  </View>
                              </View>
                          </View>
                      </View>
                  </View>
              </ScrollView>
          </View>
      </SafeAreaView>
  );
};

export default DeclineMITScreen;
