import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { UserProfileStackParams } from "../../navigation/UserProfileStack";
import { FAKE_USER_PROFILES } from "../../../assets/constants/Mockusers";
import UserVideoBlock from "../UserVideoBlock/UserVideoBlock";

const CRUUserVideoList = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  const dataToShow = FAKE_USER_PROFILES.slice(0, 6); // Select the first two items from the list

  return (
    <View style={{flex: 1, alignItems: 'center', }}>
      <FlatList
        data={dataToShow}
        horizontal={false}
        scrollEnabled={false}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ margin: 3 }}>
            <UserVideoBlock.UserCRUVideoBlock
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
};

export default CRUUserVideoList;

const styles = StyleSheet.create({});
