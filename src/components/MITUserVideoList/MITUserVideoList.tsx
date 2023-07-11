import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { UserProfileStackParams } from '../../navigation/UserProfileStack';
import { FAKE_USER_PROFILES } from "../../../assets/constants/Mockusers";
import UserVideoBlock from '../UserVideoBlock/UserVideoBlock';

const MITUserVideoList = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  const dataToShow = FAKE_USER_PROFILES.slice(0, 2); // Select the first two items from the list

  return (
    <View>
      <FlatList
        data={dataToShow}
        horizontal={true}
        scrollEnabled={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ margin: 2}}>
            <UserVideoBlock.UserMITVideoBlock
              userID={item.userID}
              userPicture={item.userPicture}
              userName={item.userName}
              onPress={() =>
                navigation.navigate("ViewUserScreen", {
                  userID: index,
                })
              }
              host={item.host}
            />
          </View>
        )}
      />
    </View>
  );
}

export default MITUserVideoList

const styles = StyleSheet.create({})