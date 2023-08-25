import { View, Text, StyleSheet, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import UserDatesCard from "../../../components/UserDateCard";
import { JENNY_SCHEDULE } from "../../../../assets/constants/Mockusers";
import { getMyCRUViews } from "../../../lib/api/cru.lib";
import { set } from "lodash";
import { ICruView, IMovie } from "../../../../types";
import useAuthStore from "../../../stores/auth.store";
import { formatMovieDuration } from "../../../util/util";
import { capitalizeFirstLetterOfString } from "../../../util/util";
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClientStackParams } from "../../../navigation/ClientStack";


const UserProfileDatesTab = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();
  const user = useAuthStore.getState().user
  const [myCRUViews, setMyCRUViews] = React.useState<ICruView[]>([]);


  useFocusEffect(
    React.useCallback(() => {
      // TODO: change this to get CRUViews and MITs and merge them (when MITs are implemented)
      // FIXME: change this to only show upcoming CRUViews
      const fetchMyCRUViews = async () => {
        try {
            const myCRUViews = await getMyCRUViews()
            if (myCRUViews) {
              setMyCRUViews(myCRUViews);
            }
        } catch (error) {
          console.error('Error getting my CRU Views:', error);
        }
      };
      fetchMyCRUViews();
    }, [])
  );

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
                    length={formatMovieDuration(item.movie.duration)} // FIXME: make this render in hours and minutes
                    movieYear={item.movie.year}
                    movieRated={item.movie.rated}
                    movieGenre={capitalizeFirstLetterOfString(item.movie.genres[0])}
                    movieGenre2={capitalizeFirstLetterOfString(item.movie.genres[1])}
                    movieRating={item.movie.rating}
                    scheduleDate={item.startDate}
                    scheduleTime={item.startDate}
                    scheduleWith={scheduleWith}
                    type="CRUView"
                    onPressin={() =>
                        navigation.navigate('ContentDetailScreen', {
                            id: item.movie.id,
                            movie: item.movie.title,
                        })
                    }
                />
            </View>
        );
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

