import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React from "react";
import GenreCard from "./GenreCard";
import { MOVIE_GENRES } from "../../constants/Data";
import { FONTS, SIZES } from "../../constants";
import { AuthStackParams } from "../navigation/AuthNavigation";
import { ClientStackParams } from "../navigation/ClientStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";



const MovieGenresList = () => {

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParams>>();

  return (
    <View
      style={{
        alignItems: "center",
        width: SIZES.ScreenWidth,
        alignSelf: "center",
      }}
    >
      <FlatList
        data={MOVIE_GENRES}
        horizontal={false}
        numColumns={2}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View>
            <GenreCard
              photo={item.photo}
              genre={item.genre}
              onPress= {() => navigation.navigate("SearchMovieResultScreen", {item: item.genre})}
            />
          </View>
        )}
      />
    </View>
  );
};

export default MovieGenresList;
