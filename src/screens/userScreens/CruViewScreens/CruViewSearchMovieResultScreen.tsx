import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image
} from "react-native";
import React, { useEffect, useState } from "react";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import CruViewSearchInput from "../../../components/CruViewSearchInput/CruViewSearchInput";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MOVIE_GENRES } from "../../../../assets/constants/Data";
import { Icon } from "@rneui/base";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import { Akcru_Content } from "../../../../assets/constants/ListData";

type CruViewSearchMovieResultScreenNavigationProp = StackNavigationProp<
  UserProfileStackParams,
  'CruViewSearchMovieResultScreen'
>;

type CruViewSearchMovieResultScreenRouteProp = RouteProp<
  UserProfileStackParams,
  'CruViewSearchMovieResultScreen'
>;

type Props = {
  navigation: CruViewSearchMovieResultScreenNavigationProp;
  route: CruViewSearchMovieResultScreenRouteProp;
};

const AllMovies = Akcru_Content[0];

const CruViewSearchMovieResultScreen = ({navigation, route}: Props) => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [filteredMovies, setFilteredMovies] = useState([]);

  useEffect(() => {
    if (route.params && route.params.genre) {
      handleGenrePress(route.params.genre);
    }
  }, [route.params]);

  const handleGenrePress = genre => {
    setSelectedGenre(genre);
    const filtered = AllMovies.movies.filter(movie =>
      movie.genre.includes(genre),
    );
    setFilteredMovies(filtered);
  };

  const renderItem = ({item, index}) => {
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
            <Icon
              name="chevron-back"
              type="ionicon"
              size={20}
              color={COLORS.LIGHTGREY}
            />
            <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
          </View>
        </TouchableOpacity>
        <CruViewSearchInput />
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
              ItemSeparatorComponent={() => (
                <Text style={{color: COLORS.DARKGREY}}> | </Text>
              )}
            />
          </View>
        </View>
      </View>

      <View>
        <View style={{alignItems: 'center'}}>
          <FlatList
            data={filteredMovies.length > 0 ? filteredMovies : AllMovies.movies}
            horizontal={false}
            numColumns={3}
            showsHorizontalScrollIndicator={false}
            ListFooterComponent={<View style={{marginBottom: 500}}></View>}
            renderItem={({item, index}) => (
              <View>
                <TouchableOpacity
                  onPress={() => {
                    console.log('id:', item.id);
                    console.log('movie:', item.name);
                    navigation.navigate('CruViewMovieDetailScreen', {
                      id: item.id,
                      movie: item.id,
                    });
                  }}>
                  <Image
                    source={{uri: item.portrait_poster}}
                    style={{
                      width: SIZES.ScreenWidth / 3.5,
                      height: SIZES.ScreenWidth / 2.35,
                      borderRadius: 5,
                      margin: 5,
                      resizeMode: 'cover',
                    }}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
};

;
export default CruViewSearchMovieResultScreen;
