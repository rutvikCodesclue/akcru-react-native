import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import BasicMovieCard from "../../../components/BasicMovieCard";
import SendMITSearchInput from "./SendMITSearchInput";
import Header from "../../../components/header";
import { RouteProp } from "@react-navigation/native";
import { ClientStackParams } from "../../../navigation/ClientStack";
import { StackNavigationProp } from "@react-navigation/stack";
import { MOVIE_GENRES } from "../../../../assets/constants/Data";
import { Icon } from "@rneui/base";
import { CrummunityStackParams } from "../../../navigation/CrummunityStack";
import { FAKE_USER_PROFILES } from "../../../../assets/constants/Mockusers";
import { Akcru_Content } from "../../../../assets/constants/ListData";
import filter from 'lodash/filter';
import { IMovie } from "../../../../types";
import { findMovies } from "../../../lib/api/movies.lib";

type SendMITSearchResultNavigationProp = StackNavigationProp<
  CrummunityStackParams,
  "SendMITSearchResult"
>;

type SendMITSearchResultRouteProp = RouteProp<
  CrummunityStackParams,
  "SendMITSearchResult"
>;

type Props = {
  navigation: SendMITSearchResultNavigationProp;
  route: SendMITSearchResultRouteProp;
};
const AllMovies = Akcru_Content[0];

const SendMITSearchResult = ({ navigation, route }: Props) => {
const userID: number | undefined = route.params?.userID ?? null;
const userprofile: string | undefined = route.params?.userName ?? null;

   const [selectedGenre, setSelectedGenre] = useState("");
   const [filteredMovies, setFilteredMovies] = useState<IMovie[]>([]);

   useEffect(() => {
     if (route.params && route.params.genre) {
       handleGenrePress(route.params.genre);
     }
   }, [route.params]);

   const handleGenrePress = async (genre: string) => {
       setSelectedGenre(genre);

       let movies: IMovie[] = [];
       if (genre === 'All') {
           movies = await findMovies();
       } else {
           movies = await findMovies(genre);
       }

       if (movies.length === 0) {
           console.log('No movies found...');

           setFilteredMovies([]);
           return;
       }

       // console.log('Found movies: ', movies);
       setFilteredMovies(movies);
       return;
   };




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

  const renderItem = ({item, index}: {item: any; index: number}) => {
      const isActive = item.genre === selectedGenre;
      return (
          <View style={{marginHorizontal: 10}}>
              <Text
                  style={[
                      {
                          ...FONTS.Title2,
                          color: isActive ? COLORS.AKCRUBLUE : COLORS.DARKGREY,
                      },
                  ]}
                  onPress={() => handleGenrePress(item.genre)}>
                  {item.genre}
              </Text>
          </View>
      );
  };

  return (
      <View>
          <ScrollView stickyHeaderIndices={[0]}>
              {/* <View>
          <Header />
        </View> */}
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
                  <SendMITSearchInput />
                  <View
                      style={{
                          backgroundColor: COLORS.TAGCOLOR,
                          height: 30,
                          borderRadius: 5,
                          marginBottom: 10,
                          marginHorizontal: 15,
                          justifyContent: 'center',
                      }}>
                      <View>
                          <FlatList
                              data={MOVIE_GENRES}
                              horizontal={true}
                              showsHorizontalScrollIndicator={false}
                              keyExtractor={item => item.id}
                              renderItem={renderItem}
                              ItemSeparatorComponent={() => <Text style={{color: COLORS.DARKGREY}}> | </Text>}
                          />
                      </View>
                  </View>
              </View>

              <View style={{marginBottom: 75}}>
                  <View
                      style={{
                          alignItems: 'center',
                          width: SIZES.ScreenWidth,
                          alignSelf: 'center',
                      }}>
                      <FlatList
                          data={filteredMovies}
                          horizontal={false}
                          showsHorizontalScrollIndicator={false}
                          numColumns={3}
                          scrollEnabled={false}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({item, index}) => (
                              <View style={{marginVertical: 4}}>
                                  <BasicMovieCard
                                      image={item.portraitURL}
                                      onPress={() => {
                                          navigation.navigate('SendMITSchedule', {
                                              id: item.id,
                                              movie: item.title,
                                              userID,
                                          });
                                          handlePressMIT(userID, userName, akcruBadge, userPicture, influencer);
                                      }}
                                  />
                              </View>
                          )}
                      />
                  </View>
              </View>
              <View></View>
          </ScrollView>
      </View>
  );
};

export default SendMITSearchResult;
