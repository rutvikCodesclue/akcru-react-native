import { View, Text, StyleSheet, ScrollView } from "react-native";
import React, { useEffect } from "react";
import styles from "./styles";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import UserDatesCard from "../../../components/UserDateCard";
import { JENNY_SCHEDULE } from "../../../../assets/constants/Mockusers";
import { getMyCRUViews } from "../../../lib/api/cru.lib";
import { set } from "lodash";
import { ICruView } from "../../../../types";
import useAuthStore from "../../../stores/auth.store";

const UserProfileDatesTab = () => {
  const user = useAuthStore.getState().user
  const [myCRUViews, setMyCRUViews] = React.useState<ICruView[]>([]);
  useEffect(() => {
    // TODO: change this to get CRUViews and MITs and merge them (when MITs are implemented)
    // FIXME: change this to only show upcoming CRUViews
    getMyCRUViews().then((res) => {
      if (res) {
        setMyCRUViews(res);
      }
    })
  }, []);

  // TODO: change this to render CRUViews and MITs (when MITs are implemented)
  const _renderMyCRUViews = () => {
    return myCRUViews.map((item) => {
        // scheduleWith  is either the CRU creator or yourself
        const scheduleWith = item.cru.creatorId === user?.id  ? "your CRU" : `${item.cru.creator.firstName}'s CRU`
        return (
          <View key={item.id} style={{marginBottom: 10}}>
            <UserDatesCard
              id={item.id}
              movieId={item.movie.id}
              moviePoster={item.movie.portraitURL}
              movieName={item.movie.title}
              length={String(item.movie.duration)} // FIXME: make this render in hours and minutes
              movieYear={item.movie.year}
              movieRated={item.movie.rated}
              movieGenre={item.movie.genres[0]}
              movieRating={item.movie.rating}
              scheduleDate={item.startDate}
              scheduleTime={item.startDate}
              scheduleWith={scheduleWith}
              type="CRUView"
              />
          </View>
        )
      })
  }

  return (
    <View style={{ marginHorizontal: SIZES.marginhorizontal }}>
      <ScrollView>
        <View>
          <Text style={styles.titleText1}>YOUR SCHEDULE</Text>
        </View>
        <View style={{marginBottom: 75}}>
          {_renderMyCRUViews()}
          {/* {JENNY_SCHEDULE.map((item) => (
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
          ))} */}
        </View>
      </ScrollView>
    </View>
  );
};

export default UserProfileDatesTab;

