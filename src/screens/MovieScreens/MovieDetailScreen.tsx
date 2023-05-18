import { View, Text, ScrollView } from "react-native";
import React from "react";
import {
  Header,
  MovieDetailScreenCard,
  RecommendedForYouList,
} from "../../components";
import { FONTS } from "../../../constants";
import { MOVIES } from "../../../constants/Data";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { ClientStackParams } from "../../navigation/ClientStack";
import { AkcruDollarAmount } from "../../../constants/Mockusers";

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
    id: movieid,
  } = MOVIES[id ?? 0];

  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View>
          <Header ADAmount={46789} />
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
        </View>
      </ScrollView>
    </View>
  );
}
