import { View, Text, ScrollView } from "react-native";
import React from "react";
import { SearchInput, MovieGenresList, Header } from "../../components";
import ClientTabNavigator from "../../navigation/ClientTabNavigator";
import { COLORS, FONTS, SIZES } from "../../../constants";
import { AuthStackParams } from "../../navigation/AuthNavigation";
import { ClientStackParams } from "../../navigation/ClientStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";


const SearchMovieScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView stickyHeaderIndices={[0]}>
        <View >
          <SearchInput />
        </View>
        <View>
          <Text
            style={{
              ...FONTS.Title2,
              marginHorizontal: SIZES.marginhorizontal,
              marginVertical: SIZES.marginvertical,
            }}
          >
            Choose Genre
          </Text>
        </View>
        <View style={{marginBottom: 75}}>
          <MovieGenresList />
        </View>
        
      </ScrollView>
    </View>
  );
};

export default SearchMovieScreen;
