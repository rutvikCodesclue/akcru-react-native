import { StyleSheet, Text, View, FlatList } from 'react-native'
import React from 'react'
import { FAKE_USER_PROFILES } from '../../constants/Mockusers';
import CrummunityFeedPostCard from './CrummunityFeedPostCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CrummunityStackParams } from '../navigation/CrummunityStack';

const CrummunityPostList = () => {

  const navigation =
    useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

  return (
    <View>
      <FlatList
        data={FAKE_USER_PROFILES}
        horizontal={false}
        scrollEnabled={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ marginVertical: 5 }}>
            <CrummunityFeedPostCard
              userID={item.userID}
              userPicture={item.userPicture}
              userName={item.userName}
              CrummunityFeedPostLikes={item.CrummunityFeedPostLikes}
              crummunityPost={item.crummunityPost}
              Crummunityreplies={item.Crummunityreplies}
              onPress={() =>
                navigation.navigate("ViewUserScreen", {
                  userID: index
                })
              }
              influencer={item.influencer}
              akcruBadge={item.akcruBadge}
            />
          </View>
        )}
      />
    </View>
  );
}

export default CrummunityPostList

const styles = StyleSheet.create({})