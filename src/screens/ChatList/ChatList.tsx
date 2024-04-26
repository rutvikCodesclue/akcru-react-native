import React, { useState,  useEffect } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, TouchableOpacity, View } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Icon } from "@rneui/base";
import { Text, TouchableRipple } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useAuthStore from "../../stores/auth.store";
import Header from "../../components/header";
import UserCruChatCard from "../../components/UserCruChatCard";
import { getUsers } from "../../lib/api/rooms.lib";
import { IChatUser } from "../../../types";
import { UserProfileStackParams } from "../../navigation/UserProfileStack";

import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import { NoBottomTabStackParams } from "../../navigation/NoBottomTabStack";
type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ChatList'>;
type Props = {
  route: ViewUserFollowListRouteProp;
};

// type NavigationParams = {
//     mItInviteId: string;
//     userId: string;
//     creatorProfilePicture?: string;
//     inviteeProfilePicture?: string;
// };

type NavigationParams = {
    mItInviteId: string;
    userId: string;
    profilePicture: string;
    username: string; // Added username
};

const ChatList = ( {route}: Props) => {
    const [chatUsersData, setChatUsersData] = useState<IChatUser []>([])
    const [isListLoaded, setIsListLoaded] = useState(false);
    
    const {user} = useAuthStore();
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    useEffect(()=>{
        getTextMessage();
        
    },[])


  const getTextMessage =  async()=>{
    const response  =   await  getUsers()
    setChatUsersData(response!);
    setIsListLoaded(true);
  }

  const renderItem = ({item}: {item: IChatUser}) => {
      // Determine receiver user details based on the current user's role in the chat
      const isCurrentUserCreator = user?.id === item.creatorId;
      const receiverUserId = isCurrentUserCreator ? item.inviteeId : item.creatorId;
      const receiverProfilePicture = isCurrentUserCreator ? item.invitee?.profilePicture : item.creator?.profilePicture;
      const receiverUsername = isCurrentUserCreator ? item.invitee?.username : item.creator?.username;

      return (
          <TouchableOpacity
             

              onPress={() => {
                  navigation.navigate('ViewChat', {
                      mItInviteId: item.id,
                      userId: receiverUserId,
                      profilePicture: receiverProfilePicture,
                      username: receiverUsername, // Pass the receiver's username
                  });
              }}
              style={{marginHorizontal: 10, marginBottom: 10}}>
              <UserCruChatCard
                  userID={item.id}
                  userName={receiverUsername} // Display the receiver's username
                  movie={item.movie.title}
                  moviePoster={item.movie.landscapeURL}
                  CruChatDate={new Date(item.lastMessageAt).toLocaleDateString()}
                  CruChatTime={new Date(item.lastMessageAt).toLocaleTimeString()}
                  CRUChat={item.lastMessage}
                  avatarbordercolor={''}
                  userPicture={receiverProfilePicture} // Use the receiver's profile picture
              />
          </TouchableOpacity>
      );
  };


    return (
        <SafeAreaView style={{flex: 1}}>
            {isListLoaded ? (
                <FlatList
                    stickyHeaderIndices={[0]}
                    ListHeaderComponent={
                        <View>
                            <View style={{zIndex: 20, backgroundColor: COLORS.AKCRUBACKGROUND}}>
                                <Header />
                            </View>
                            <View
                                style={{
                                    marginBottom: 10,
                                    zIndex: 21,
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    paddingBottom: 10,
                                }}>
                                <TouchableRipple onPress={() => navigation.pop()}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginHorizontal: 15,
                                        }}>
                                        <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                        <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                    </View>
                                </TouchableRipple>
                            </View>
                        </View>
                    }
                    ListFooterComponent={<View style={{height: SIZES.ScreenHeight * 0.1}} />}
                    data={chatUsersData}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                />
            ) : (
                <View
                    style={{
                        height: SIZES.ScreenHeight,
                        width: SIZES.ScreenWidth,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                </View>
            )}
        </SafeAreaView>
    );
};

export default ChatList;
