import {  View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import MITHubCard from './MITHubCard'
import { JENNY_INVITES } from '../../../assets/constants/Mockusers'
import { UserProfileStackParams } from '../../navigation/UserProfileStack'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { getMyMITs } from '../../lib/api/mit.lib'
import { IMITInvite } from '../../../types'


const MITHubList = () => {
  const [currentMITS, setCurrentMITS] = useState< IMITInvite[] | []>([]);

const navigation =
  useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  useFocusEffect(
    React.useCallback(() => {
        // This code will run when the screen comes into focus (e.g., when navigating to this screen)
        getMyMITs().then((res) => {
          console.log("my mits: ", res);
          if (res) {
            setCurrentMITS(res);
          }
        });
        return () => {
          // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
        };
    }, [])
  );

  return (
    <View style={{marginTop: 10, marginBottom: 75}}>
      <FlatList
        data={currentMITS}
        horizontal={false}
        scrollEnabled={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ marginVertical: 5 }}>
            <MITHubCard
              inviteeName={`${item.invitee.firstName} ${item.invitee.lastName}`}
              inviteePicture={item.invitee.profilePicture ?? ''}
              MITDate={item.startDate}
              MITMoviechoice={item.movie.title}
              onPressIn={() => navigation.navigate("ViewUserScreen", {
                userID: index
              })}

              onPress={() => navigation.navigate("ChooseMITScreen", {
                MITID: index,
              })}
              // influencer={item.influencer}
              akcruBadge={item.invitee.badge} 
              />
          </View>
        )}
      />
      {/* <FlatList
        data={JENNY_INVITES}
        horizontal={false}
        scrollEnabled={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ marginVertical: 5 }}>
            <MITHubCard
              inviteeName={item.inviteeName}
              inviteePicture={item.inviteePicture}
              MITDate={item.MITDate}
              MITMoviechoice={item.MITMoviechoice}
              onPressIn={() => navigation.navigate("ViewUserScreen", {
                userID: index
              })}

              onPress={() => navigation.navigate("ChooseMITScreen", {
                MITID: index,
              })}
              influencer={item.influencer}
              akcruBadge={item.akcruBadge} avatarboardercolor={item.avatarbordercolor}            />
          </View>
        )}
      /> */}
    </View>
  );
}

export default MITHubList