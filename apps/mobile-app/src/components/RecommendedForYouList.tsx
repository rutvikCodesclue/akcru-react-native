import { View, FlatList } from "react-native";
import React from "react";
import { RECOMMENDED_FOR_YOU } from "../../constants/Data";
import BasicMovieCard from "./BasicMovieCard";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClientStackParams } from "../navigation/ClientStack";



const RecommendedForYouList = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();
  return (
    <View>
      <FlatList
        data={RECOMMENDED_FOR_YOU}
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

export default RecommendedForYouList;
