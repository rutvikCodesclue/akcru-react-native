import { View, FlatList } from "react-native";
import React from "react";
import { NEW_ON_AKCRU } from "../../constants/Data";
import LargeMovieCard from "./LargeMovieCard";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClientStackParams } from "../navigation/ClientStack";

const NewOnAkcruList = () => {

  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();
  return (
    <View>
      <FlatList
        data={NEW_ON_AKCRU}
        horizontal={true}
        showsHorizontalScrollIndicator={true}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View>
            <LargeMovieCard
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

export default NewOnAkcruList;
