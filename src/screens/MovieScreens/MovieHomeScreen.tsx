import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { Header, CategoriesList, TopAkcruWatchList, TrendingNowList, NewOnAkcruList, RecommendedForYouList, MovieHomeScreenHero } from '../../components';
//import { ResizeMode, Video } from 'expo-av';
import styles from '../LoginScreens/Styles/styles';
import { FONTS } from '../../../constants';
import { AkcruDollarAmount } from '../../../constants/Mockusers';




const MovieHomeScreen = () => {

  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View>
          <Header ADAmount={AkcruDollarAmount[0].ADAmount} />
        </View>
        <View>
          <MovieHomeScreenHero />
        </View>
        <View style={{ marginTop: 10 }}>
          <CategoriesList />
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ ...FONTS.Title2, marginVertical: 10 }}>
            Top Akcru Watchlist
          </Text>
        </View>
        <View>
          <TopAkcruWatchList />
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ ...FONTS.Title2, marginVertical: 10 }}>
            Trending Now
          </Text>
        </View>
        <View>
          <TrendingNowList />
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ ...FONTS.Title2, marginVertical: 10 }}>
            New On Akcru
          </Text>
        </View>
        <View>
          <NewOnAkcruList />
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ ...FONTS.Title2, marginVertical: 10 }}>
            Recommended for you
          </Text>
        </View>
        <View style={{ marginBottom: 75 }}>
          <RecommendedForYouList />
        </View>
      </ScrollView>
    </View>
  );
}

export default MovieHomeScreen