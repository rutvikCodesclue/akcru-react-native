import { View, FlatList } from "react-native";
import React from "react";
import { TRENDING_NOW } from "../../constants/Data";
import BasicMovieCard from "./BasicMovieCard";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClientStackParams } from "../navigation/ClientStack";
import { AuthStackParams } from "../navigation/AuthNavigation";

const TrendingNowList = () => {

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParams>>();
  return (
    <View>
      <FlatList
        data={TRENDING_NOW}
        horizontal={true}
        showsHorizontalScrollIndicator={true}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View>
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
};

export default TrendingNowList;
