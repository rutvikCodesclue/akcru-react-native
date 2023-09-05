import {
  Text,
  View,
  Image,
  SafeAreaView,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import LinearGradient from "react-native-linear-gradient";
import { Avatar, Icon } from "@rneui/base";
import SendMITSearchInput from "./SendMITSearchInput";
import GenreCard from "../../../components/GenreCard";
import AkcruLevels from "../../../components/akcruBadges";
import imageindex from "../../../../assets/images/imageindex";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { CrummunityStackParams } from "../../../navigation/CrummunityStack";
import { FAKE_USER_PROFILES } from "../../../../assets/constants/Mockusers";
import { MOVIE_GENRES } from "../../../../assets/constants/Data";
import {getMovieGenres} from '../../../lib/api/movies.lib';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {IGenreItem} from '../../../../types';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type SendMITViewUserNavigationProp = StackNavigationProp<
  CrummunityStackParams,
  "SendMITViewUser"
>;

type SendMITViewUserRouteProp = RouteProp<
  CrummunityStackParams,
  "SendMITViewUser"
>;

type Props = {
  navigation: SendMITViewUserNavigationProp;
  route: SendMITViewUserRouteProp;
};

const SendMITViewUser = ({ route, }: Props) => {
  const userID: number | undefined = route.params?.userID ?? null;
  // const movie: string | undefined = route.params?.id ?? null;

  const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

  const [genres, setGenres] = React.useState<IGenreItem[]>([]);
  const [loading, setIsLoading] = React.useState(true);

  const fetchGenres = async () => {
      const genres = await getMovieGenres();
      setGenres(genres);
      setIsLoading(false);
  };

  const {
    // digitalpass,
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

  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedAkcruBadgeAkcruit, setSelectedAkcruBadgeAkcruit] =
    useState("");
  const [selectedAkcruBadgeGuardian, setSelectedAkcruBadgeGuardian] =
    useState("");
  const [selectedAkcruBadgeHero, setSelectedAkcruBadgeHero] = useState("");
  const [selectedAkcruBadgeSuperHero, setSelectedAkcruBadgeSuperHero] =
    useState("");
  const [selectedUserPicture, setSelectedUserPicture] = useState("");
  const [selectedInfluencer, setSelectedInfluencer] = useState("");

  const handlePressMIT = (
    userID,
    userName,
    akcruBadge,
    userPicture,
    influencer
  ) => {
    setScheduleIsShown(true);
    setSelectedUserName(userName);
    setSelectedAkcruBadgeAkcruit(akcruBadge.akcruit);
    setSelectedAkcruBadgeGuardian(akcruBadge.guardian);
    setSelectedAkcruBadgeHero(akcruBadge.hero);
    setSelectedAkcruBadgeSuperHero(akcruBadge.superhero);
    setSelectedUserPicture(userPicture);
    setSelectedInfluencer(influencer);
    // Add your logic here to handle the onPress1 action
    // You can use the userID parameter or any other data from the item

    console.log("Item with userID", userID, userName, "pressed!");
  };

  const handleGenrePress = (genre: IGenreItem) => {
      navigation.navigate('SendMITSearchResult', {
          genre: capitalizeFirstLetterOfString(genre.genre),
      });
      handlePressMIT(userID, userName, akcruBadge, userPicture, influencer);
  };

  useEffect(() => {
      fetchGenres();
  }, []);

  // const handleGenrePress = (genre) => {
  //   navigation.navigate("SendMITSearchResult", {
  //     genre: genre,
  //     userID,
      
  //   });
  //   handlePressMIT(userID, userName, akcruBadge, userPicture, influencer);
  // };

  return (
      <View>
          <ScrollView stickyHeaderIndices={[0]}>
              <View>
                  <View style={{backgroundColor: COLORS.AKCRUBACKGROUND}}>
                      <TouchableOpacity
                          onPress={() => navigation.pop()}
                          style={{
                              paddingHorizontal: 15,
                              paddingVertical: 10,
                          }}>
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

                  <SendMITSearchInput />
              </View>
              <View>
                  <Text
                      style={{
                          ...FONTS.Title2,
                          marginHorizontal: SIZES.marginhorizontal,
                          marginVertical: SIZES.marginvertical,
                      }}>
                      Choose Genre
                  </Text>
              </View>
              <View style={{marginBottom: 75}}>
                  <View
                      style={{
                          alignItems: 'center',
                          width: SIZES.ScreenWidth,
                          alignSelf: 'center',
                      }}>
                      <FlatList
                          data={loading ? undefined : genres}
                          horizontal={false}
                          numColumns={2}
                          scrollEnabled={false}
                          keyExtractor={item => item.id}
                          renderItem={({item, index}) => (
                              <View>
                                  <GenreCard
                                      photo={item.image}
                                      genre={capitalizeFirstLetterOfString(item.genre)}
                                      onPress={() => handleGenrePress(item)}
                                  />
                              </View>
                          )}
                      />
                  </View>
              </View>
          </ScrollView>

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
                                  uri: userPicture,
                              }}
                              avatarStyle={{
                                  borderWidth: 2,
                                  borderColor: COLORS.AKCRUBLUE,
                              }}
                          />
                      </View>
                      <View style={{marginLeft: 10}}>
                          <Text style={{...FONTS.Title2}}>{userName}</Text>
                          {akcruBadge.akcruit && (
                              <View>
                                  <AkcruLevels.AkcruBadgeAkcruit />
                              </View>
                          )}
                          {akcruBadge.guardian && (
                              <View>
                                  <AkcruLevels.AkcruBadgeGuardian />
                              </View>
                          )}
                          {akcruBadge.hero && (
                              <View>
                                  <AkcruLevels.AkcruBadgeHero />
                              </View>
                          )}
                          {akcruBadge.superhero && (
                              <View>
                                  <AkcruLevels.AkcruBadgeSuperHero />
                              </View>
                          )}
                      </View>
                      <View>
                          {influencer && (
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
      </View>
  );
};

export default SendMITViewUser;
