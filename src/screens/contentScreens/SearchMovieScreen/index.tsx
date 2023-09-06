import {View, Text, ScrollView, TouchableOpacity, FlatList, SafeAreaView} from 'react-native';
import React, {useEffect} from 'react';
import SearchInput from '../../../components/searchInput';
import GenreCard from '../../../components/GenreCard';
import { COLORS, FONTS, SIZES } from '../../../../assets/constants';
import { ClientStackParams } from '../../../navigation/ClientStack';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import { MOVIE_GENRES } from '../../../../assets/constants/Data';
import {getMovieGenres} from '../../../lib/api/movies.lib';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {IGenreItem} from '../../../../types';

const SearchMovieScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();

      const [genres, setGenres] = React.useState<IGenreItem[]>([]);
      const [loading, setIsLoading] = React.useState(true);

      const fetchGenres = async () => {
          const genres = await getMovieGenres();
          setGenres(genres);
          setIsLoading(false);
      };

  const handleGenrePress = (genre: IGenreItem) => {
      navigation.navigate('SearchMovieResultScreen', {
          genre: capitalizeFirstLetterOfString(genre.genre),
      });
  };

  useEffect(() => {
      fetchGenres();
  }, []);

  return (
      <SafeAreaView style={{flex: 1}}>
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

                  <SearchInput />
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
      </SafeAreaView>
  );
};

export default SearchMovieScreen;
