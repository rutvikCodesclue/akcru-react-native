import {View, Text, FlatList, TouchableOpacity, Image, SafeAreaView} from 'react-native';
import React, {useEffect, useState} from 'react';
import { COLORS, FONTS, SIZES } from '../../../../assets/constants';
import SearchInput from '../../../components/searchInput';
import {RouteProp} from '@react-navigation/native';
import { ClientStackParams } from '../../../navigation/ClientStack';
import {StackNavigationProp} from '@react-navigation/stack';
import { MOVIE_GENRES } from '../../../../assets/constants/Data';
import {Icon} from '@rneui/base';
import { Akcru_Content } from '../../../../assets/constants/ListData';

import {findMovies} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';

// const AllMovies = Akcru_Content[0];

type SearchMovieResultScreenNavigationProp = StackNavigationProp<
  ClientStackParams,
  'SearchMovieResultScreen'
>;

type SearchMovieResultScreenRouteProp = RouteProp<
  ClientStackParams,
  'SearchMovieResultScreen'
>;

type Props = {
  navigation: SearchMovieResultScreenNavigationProp;
  route: SearchMovieResultScreenRouteProp;
};

const SearchMovieResultScreen = ({navigation, route}: Props) => {
  const [selectedGenre, setSelectedGenre] = useState('');
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
          //console.log('No movies found...');

          setFilteredMovies([]);
          return;
      }

      // Sort movies by createdAt in descending order (newest first)
      const sortedMovies = movies.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
      });

      // console.log('Found movies: ', movies);
      setFilteredMovies(sortedMovies);
      return;
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
    <TabContainer>
        <SafeAreaView>
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
                  <SearchInput />
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

              <View>
                  <View style={{alignItems: 'center'}}>
                      <FlatList
                          data={filteredMovies}
                          horizontal={false}
                          numColumns={3}
                          initialNumToRender={filteredMovies.length}
                          showsHorizontalScrollIndicator={false}
                          ListFooterComponent={<View style={{marginBottom: 500}}></View>}
                          renderItem={({item}: {item: IMovie}) => (
                              <View>
                                  <TouchableOpacity
                                      onPress={() => {
                                          //console.log('id:', item.id);
                                          //console.log('movie:', item.title);
                                          navigation.navigate('ContentDetailScreen', {
                                              id: item.id,
                                              movie: item.title,
                                          });
                                      }}>
                                      <Image
                                          source={{uri: item.portraitURL}}
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
      </SafeAreaView>
    </TabContainer>
      
  );
};

export default SearchMovieResultScreen;
