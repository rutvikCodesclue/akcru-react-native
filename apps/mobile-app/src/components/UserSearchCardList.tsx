import { StyleSheet, Text, View, FlatList } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CrummunityStackParams } from "../navigation/CrummunityStack";
import { FAKE_USER_PROFILES } from "../../constants/Mockusers";
import UserSearchCard from "./UserSearchCard";

const UserSearchCardList = () => {

    const navigation =
      useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

  return (
    <View>
      <FlatList
        data={FAKE_USER_PROFILES}
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        numColumns={2}
        scrollEnabled={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{margin: 5}}>
            <UserSearchCard
              userPicture={item.userPicture}
              userName={item.userName}
              onPress={() =>
                navigation.navigate("ViewUserScreen", {
                  userID: index,
                })
              }
              influencer={item.influencer}
              userID={item.userID}
              akcruBadge={item.akcruBadge}
            />
          </View>
        )}
      />
    </View>
  );
};

export default UserSearchCardList;

const styles = StyleSheet.create({});
