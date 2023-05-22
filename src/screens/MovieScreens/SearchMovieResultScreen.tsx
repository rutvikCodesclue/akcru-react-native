import { View, Text, ScrollView } from 'react-native'
import React from 'react';
import { COLORS, FONTS, SIZES } from '../../../constants';
import { SearchMovieResultList, SearchInput, Header } from '../../components';
import { RouteProp } from '@react-navigation/native';
import { ClientStackParams } from '../../navigation/ClientStack';
import { StackNavigationProp } from '@react-navigation/stack';
import { NEW_ON_AKCRU } from '../../../constants/Data';
import { AkcruDollarAmount } from '../../../constants/Mockusers';


type SearchMovieResultScreenNavigationProp = StackNavigationProp<
  ClientStackParams,
  "SearchMovieResultScreen"
>;

type SearchMovieResultScreenRouteProp = RouteProp<
  ClientStackParams,
  "SearchMovieResultScreen"
>;

type Props = {
  navigation: SearchMovieResultScreenNavigationProp;
  route: SearchMovieResultScreenRouteProp;
};


const SearchMovieResultScreen = ({ navigation, route }: Props) => {

  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View>
          <Header />
        </View>
        <View
          style={{ marginHorizontal: SIZES.marginhorizontal, marginBottom: 10 }}
        >
          <Text style={{ ...FONTS.Title2 }}>
            {NEW_ON_AKCRU.length} results for {route.params?.item}:
          </Text>
        </View>
        <View style={{ marginBottom: 75 }}>
          <SearchMovieResultList />
        </View>
        <View></View>
      </ScrollView>
    </View>
  );
};

export default SearchMovieResultScreen