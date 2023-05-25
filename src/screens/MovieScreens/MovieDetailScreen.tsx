import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import {
  Header,
  MovieDetailScreenCard,
  RecommendedForYouList,
  AkcruReviewCard,
  AkcruButtons
} from "../../components";
import { FONTS, COLORS, SIZES } from "../../../constants";
import { MOVIES, TOP_AKCRU_WATCHLIST, NEW_ON_AKCRU } from "../../../constants/Data";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { ClientStackParams } from "../../navigation/ClientStack";
import { FAKE_USER_PROFILES } from "../../../constants/Mockusers";
import { Icon } from "@rneui/base";

type MovieDetailScreenNavigationProp = StackNavigationProp<
  ClientStackParams,
  "MovieDetailScreen"
>;

type MovieDetailScreenRouteProp = RouteProp<
  ClientStackParams,
  "MovieDetailScreen"
>;

type Props = {
  navigation: MovieDetailScreenNavigationProp;
  route: MovieDetailScreenRouteProp;
};

export default function MovieDetailScreen({ navigation, route }: Props) {
  const id: number | undefined = route.params?.id ?? null;
  const movie: string | undefined = route.params?.movie ?? null;

  const {
    name,
    year,
    length,
    rated,
    rating,
    desc,
    actors,
    directors,
    image_url,
    
  } = MOVIES [id ?? 0];

  

  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View>
          <Header />
        </View>

        <View style={{ marginTop: -65 }}>
          
          <MovieDetailScreenCard
            image_url={image_url}
            name={name}
            year={year}
            length={length}
            rated={rated}
            rating={rating}
            desc={desc}
            actors={actors.join(", ")}
            directors={directors.join(", ")}
            id={""}
          />
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ ...FONTS.Title2, marginVertical: 10 }}>
            Recommended for you
          </Text>
        </View>
        <View>
          <RecommendedForYouList />
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ ...FONTS.Title2, marginVertical: 10 }}>
            Akcru Review
          </Text>
          <View style={{ marginBottom: 75 }}>
            <View>
              {FAKE_USER_PROFILES.map((item) => (
                <View key={item.userID} style={{ marginBottom: 10 }}>
                  <AkcruReviewCard
                    userPicture={item.userPicture}
                    userName={item.userName}
                    movieReview={item.movieReview}
                    movieReviewDate={item.movieReviewDate}
                    userID={item.userID}
                  />
                </View>
              ))}
            </View>
            <View style={styles.input}>
              <TextInput
                placeholder={"placeholder"}
                placeholderTextColor={"transparent"}
                style={styles.textinput}
              />
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <AkcruButtons.XSmallButton
                btnname={"POST"}
                onPress={function (): void {}}
                color=""
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    flexDirection: "row",
    borderWidth: 0.8,
    borderColor: COLORS.DARKGREY,
    borderRadius: 5,
    justifyContent: "space-between",
    marginVertical: 10,
    paddingLeft: 10,
    alignItems: 'flex-start',
    height: 150,
  },
  textinput: {
    color: COLORS.LIGHTGREY,
    
  },
  sendbutton: {
    backgroundColor: COLORS.AKCRUBLUE,
    height: 35,
    justifyContent: "center",
    width: 90,
    borderRadius: 5,
    alignItems: "center",
  },
});
