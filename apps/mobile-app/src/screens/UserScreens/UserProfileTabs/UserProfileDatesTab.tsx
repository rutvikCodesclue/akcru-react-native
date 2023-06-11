import { View, Text, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { FONTS, SIZES, COLORS } from "../../../../constants";
import { UserDatesCard } from "../../../components";
import { JENNY_SCHEDULE } from "../../../../constants/Mockusers";

const UserProfileDatesTab = () => {
  return (
    <View style={{ marginHorizontal: SIZES.marginhorizontal }}>
      <ScrollView>
        <View>
          <Text style={styles.titleText1}>YOUR SCHEDULE</Text>
        </View>
        <View style={{marginBottom: 75}}>
          {JENNY_SCHEDULE.map((item) => (
            <View key={item.dateID} style={{marginBottom: 10}}>
              <UserDatesCard
                moviePoster={item.moviePoster}
                movieName={item.movieName}
                length={item.length}
                movieYear={item.movieYear}
                movieRated={item.movieRated}
                movieGenre={item.movieGenre}
                movieRating={item.movieRating}
                scheduleDate={item.scheduleDate}
                scheduleTime={item.scheduleTime}
                scheduleWith={item.scheduleWith}
                dateID={item.dateID}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default UserProfileDatesTab;

const styles = StyleSheet.create({
  titleText1: {
    ...FONTS.Title2,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  paragraphText: {
    ...FONTS.Title2,
    color: COLORS.LIGHTGREY,
    fontSize: 12,
  },
});
