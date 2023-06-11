import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { SearchInput, MovieGenresList, Header } from "../../components";
import ClientTabNavigator from "../../navigation/ClientTabNavigator";
import { COLORS, FONTS, SIZES } from "../../../constants";
import { AuthStackParams } from "../../navigation/AuthNavigation";
import { ClientStackParams } from "../../navigation/ClientStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "@rneui/base";


const SearchMovieScreen = () => {

  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView stickyHeaderIndices={[0]}>
        <View>
          <View style={{ backgroundColor: COLORS.BLACK }}>
            <TouchableOpacity
              onPress={() => navigation.pop()}
              style={{
                paddingHorizontal: 15,
                paddingVertical: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Icon
                  name="chevron-back"
                  type="ionicon"
                  size={20}
                  color={COLORS.LIGHTGREY}
                />
                <Text style={{ ...FONTS.Title3, marginLeft: 5 }}>Back</Text>
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
            }}
          >
            Choose Genre
          </Text>
        </View>
        <View style={{ marginBottom: 75 }}>
          <MovieGenresList />
        </View>
      </ScrollView>
    </View>
  );
};

export default SearchMovieScreen;
