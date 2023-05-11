import { View, Text, FlatList } from 'react-native'
import React from 'react'
import { MOVIES } from '../../constants/Data'
import BasicMovieCard from './BasicMovieCard'
import { SIZES, FONTS, COLORS } from '../../constants'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ClientStackParams } from '../navigation/ClientStack'

const SearchMovieResultList = () => {

  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();
  return (
    <View
      style={{
        alignItems: "center",
        width: SIZES.ScreenWidth,
        alignSelf: "center",
      }}
    >
      <FlatList
        data={MOVIES}
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        numColumns={3}
        scrollEnabled={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ marginVertical: 4 }}>
            <BasicMovieCard
              image={item.image_url}
              onPress={() => {
                navigation.navigate("MovieDetailScreen", {
                  id: index,
                  movie: item.name,
                });
              }}
            />
          </View>
        )}
      />
    </View>
  );
}

export default SearchMovieResultList