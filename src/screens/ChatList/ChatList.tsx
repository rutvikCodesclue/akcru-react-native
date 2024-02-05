import React, { useState,  useEffect } from "react";
import { FlatList, SafeAreaView, TouchableOpacity, View } from "react-native";
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

import {COLORS, FONTS} from '../../../assets/constants';
type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ChatList'>;
type Props = {
  route: ViewUserFollowListRouteProp;
};
const ChatList = ( {route}: Props) => {
    const [chatUsersData, setChatUsersData] = useState<IChatUser []>([])
    const {user} = useAuthStore();
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    useEffect(()=>{
        getTextMessage();
    },[])


  const getTextMessage =  async()=>{
    const response  =   await  getUsers()
    setChatUsersData(response!);
  }
  const renderItem = ({item, index}: {item: IChatUser; index: number}) => {
    return (

      // userId': string ,'mItInviteId':string
      <TouchableOpacity
        onPress={ ()=>{


            var receiverUserId = "";
            if(user?.id == item.creatorId){
               receiverUserId = item.inviteeId;
            }else{
              receiverUserId = item.creatorId
            }
            navigation.navigate('ViewChat',{'mItInviteId': item.id, 'userId':receiverUserId})
        }}
      style={{marginHorizontal: 10,marginBottom:10}}>
            <UserCruChatCard
                userID={item.id}
                userName= {item.movie.title}
                CruChatDate ={ new Date( item.lastMessageAt).toLocaleDateString()}
                CruChatTime ={ new Date( item.lastMessageAt).toLocaleTimeString() }
                CRUChat={item.lastMessage}
                avatarbordercolor={""}
                userPicture={item.movie.portraitURL!}
            />
            </TouchableOpacity>
    );
  };
      
    return (
        <SafeAreaView style={{flex: 1, paddingBottom:100}}>
             <View style={{zIndex: 20}}>
                <Header />
            </View>
            <View style={{marginHorizontal: 15, marginBottom: 10, zIndex: 21}}>
                        <TouchableRipple onPress={() => navigation.pop()}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                            </View>
                        </TouchableRipple>
                    </View>

            <FlatList
              data={chatUsersData}
              keyExtractor={item => item.id}
              renderItem={renderItem}
           
            />
        </SafeAreaView>
    );
};

export default ChatList;
