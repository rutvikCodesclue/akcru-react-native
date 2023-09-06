import { View, Text, ScrollView } from "react-native";
import React from "react";
import styles from "./styles";
import {SIZES} from '../../../../assets/constants';
import UserDatesCard from "../../../components/UserDateCard";
import { getMyCRUViews } from "../../../lib/api/cru.lib";
import { ICruView, IMITInvite } from "../../../../types";
import useAuthStore from "../../../stores/auth.store";
import { formatMovieDuration } from "../../../util/util";
import { capitalizeFirstLetterOfString } from "../../../util/util";
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClientStackParams } from "../../../navigation/ClientStack";
import { getMyMITInvites } from "../../../lib/api/mit.lib";
import { isAfter, isBefore } from "date-fns";


const UserProfileDatesTab = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();
  const user = useAuthStore.getState().user
  const [myEvents, setMyEvents] = React.useState<(ICruView | IMITInvite)[]>([]);


  useFocusEffect(
    React.useCallback(() => {
      // get CRUViews and MITs and merge them
      const fetchMyEvents = async () => {
        try {
            const myCRUViews = await getMyCRUViews({ upcoming: true })
            const myMITs = await getMyMITInvites({ accepted: true })

            if (myCRUViews && myMITs) {
              let events = [...myCRUViews, ...myMITs] 
              // sort invites by date (newest to oldest) and set state
              setMyEvents(events.sort((a, b) => {
                let date1 = new Date(a.startDate);
                let date2 = new Date(b.startDate);
                
                if (isAfter(date1, date2)) {
                  return 1;
                }
                if (isBefore(date1, date2)) {
                  return -1;
                }
                return 0;
              }));
            }

        } catch (error) {
          console.error('Error getting my Events:', error);
        }
      };
      fetchMyEvents();
    }, [])
  );

  // render CRUViews and MITs (when MITs are implemented)
  const _renderMyEvents = () => {
    return myEvents.map((item) => {
        if (item instanceof Object && 'cru' in item) {
          // item is a CRUView
          // scheduleWith  is either the CRU creator or yourself
          const scheduleWith = item.cru.creatorId === user?.id  ? "your CRU" : `${item.cru.creator.firstName}'s CRU`
          return (
            <View key={item.id} style={{marginBottom: 10}}>
                <UserDatesCard
                    id={item.id}
                    cruId={item.cru.id}
                    isHost={item.cru.creatorId === user?.id}
                    movieId={item.movie.id}
                    moviePoster={item.movie.portraitURL}
                    movieName={item.movie.title}
                    length={formatMovieDuration(item.movie.duration)} // FIXME: make this render in hours and minutes
                    movieYear={item.movie.year}
                    movieRated={item.movie.rated}
                    movieGenre={capitalizeFirstLetterOfString(item.movie.genres[0])}
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
        } else {
          // item is a MITInvite
          // scheduleWith  is either the MIT creator
          const scheduleWith = `${item.creator.firstName} (${item.creator.username})`
          return (
              <View key={item.id} style={{marginBottom: 10}}>
                  <UserDatesCard
                      type="MITInvite"
                      id={item.id}
                      cruId={item.id}
                      isHost={item.creator.id === user?.id}
                      movieId={item.movie.id}
                      moviePoster={item.movie.portraitURL}
                      movieName={item.movie.title}
                      length={formatMovieDuration(item.movie.duration)} // FIXME: make this render in hours and minutes
                      movieYear={item.movie.year}
                      movieRated={item.movie.rated}
                      movieGenre={capitalizeFirstLetterOfString(item.movie.genres[0])}
                      movieRating={item.movie.rating}
                      scheduleDate={item.startDate}
                      scheduleTime={item.startDate}
                      scheduleWith={scheduleWith}
                      onPressin={() =>
                          navigation.navigate('ContentDetailScreen', {
                              id: item.movie.id,
                              movie: item.movie.title,
                          })
                      }
                  />
              </View>
          );
        }
        
      })
  }

  return (
    <View style={{ marginHorizontal: SIZES.marginhorizontal }}>
      <ScrollView>
        <View>
          <Text style={styles.titleText1}>YOUR SCHEDULE</Text>
        </View>
        <View style={{marginBottom: 75}}>
          {_renderMyEvents()}
        </View>
      </ScrollView>
    </View>
  );
};

export default UserProfileDatesTab;