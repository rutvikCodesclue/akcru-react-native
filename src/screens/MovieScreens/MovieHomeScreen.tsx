import { View, Text, ScrollView } from "react-native";
import React, { useRef, useState } from "react";
import {
  Header,
  CategoriesList,
  TopAkcruWatchList,
  TrendingNowList,
  NewOnAkcruList,
  RecommendedForYouList,
  HomeScreenHeroCard,
  BasicMovieCard,
} from "../../components";
//import { ResizeMode, Video } from 'expo-av';
import styles from "../LoginScreens/Styles/styles";
import { FONTS, COLORS, SIZES } from "../../../constants";

import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import {
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClientStackParams } from "../../navigation/ClientStack";
import { TOP_AKCRU_WATCHLIST } from "../../../constants/Data";

const MovieHomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();

  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View>
          <Header />
        </View>
        <View style={{ marginTop: -50 }}>
          <HomeScreenHeroCard />
        </View>
        <View style={{ marginTop: 10, marginHorizontal: 15 }}>
          <CategoriesList />
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ ...FONTS.Title2, marginVertical: 10 }}>
            Top Akcru Watchlist
          </Text>
        </View>
        {/* <View>
          <FlatList
            data={TOP_AKCRU_WATCHLIST}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View>
                <BasicMovieCard
                  image={item.image_url}
                  onPress={() => {
                    navigation.navigate("MovieDetailScreen", {
                      tawid: index,
                    });
                  }}
                />
              </View>
            )}
          />
        </View> */}
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
};

export default MovieHomeScreen;
