import {View, Text, ScrollView, TouchableOpacity, FlatList} from 'react-native';
import React from 'react';

import SearchInput from '../../../components/searchInput';
import GenreCard from '../../../components/GenreCard';
import { COLORS, FONTS, SIZES } from '../../../../assets/constants';

import { ClientStackParams } from '../../../navigation/ClientStack';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import { MOVIE_GENRES } from '../../../../assets/constants/Data';

const SearchMovieScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();

  const handleGenrePress = genre => {
    navigation.navigate('SearchMovieResultScreen', {
      genre: genre,
    });
  };

  return (
    <View style={{flex: 1}}>
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
              data={MOVIE_GENRES}
              horizontal={false}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={item => item.id}
              renderItem={({item, index}) => (
                <View>
                  <GenreCard
                    photo={item.photo}
                    genre={item.genre}
                    onPress={() => handleGenrePress(item.genre)}
                  />
                </View>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SearchMovieScreen;
