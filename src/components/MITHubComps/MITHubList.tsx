import {  View, FlatList } from 'react-native'
import React from 'react'
import MITHubCard from './MITHubCard'
import { JENNY_INVITES } from '../../../assets/constants/Mockusers'
import { UserProfileStackParams } from '../../navigation/UserProfileStack'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'


const MITHubList = () => {

const navigation =
  useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  return (
    <View style={{marginTop: 10, marginBottom: 75}}>
      <FlatList
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
      />
    </View>
  );
}

export default MITHubList