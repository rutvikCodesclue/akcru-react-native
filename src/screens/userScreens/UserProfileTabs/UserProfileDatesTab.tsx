import { View, Text, StyleSheet, ScrollView } from "react-native";
import React, { useEffect } from "react";
import styles from "./styles";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import UserDatesCard from "../../../components/UserDateCard";
import { JENNY_SCHEDULE } from "../../../../assets/constants/Mockusers";
import { getMyCRUViews } from "../../../lib/api/cru.lib";

const UserProfileDatesTab = () => {
  useEffect(() => {
    getMyCRUViews().then((res) => {
      console.log(res);
    })
  }, []);

  return (
    <View style={{ marginHorizontal: SIZES.marginhorizontal }}>
      <ScrollView>
        <View>
          <Text style={styles.titleText1}>YOUR SCHEDULE</Text>
        </View>
        <View style={{marginBottom: 75}}>
          {JENNY_SCHEDULE.map((item) => (
            <View key={item.id} style={{marginBottom: 10}}>
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
                dateID={item.dateID} id={""}              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default UserProfileDatesTab;

