import React, { useState, useCallback, useRef, useEffect } from "react";
import { SafeAreaView, View } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import { Icon } from "@rneui/base";
import {
  HMSAudioTrackSettings,
  HMSCameraFacing,
  HMSConfig,
    HMSMessage,
    HMSMessageRecipient,
    HMSMessageRecipientType,
    HMSPIPListenerActions,
    HMSPeer,
    HMSRemotePeer,
    HMSRole,
    HMSSDK,
    HMSTrack,
    HMSTrackSettings,
    HMSTrackSettingsInitState,
    HMSTrackUpdate,
    HMSUpdateListenerActions,
    HMSVideoTrackSettings,
  } from '@100mslive/react-native-hms';
import {COLORS, FONTS} from '../../../assets/constants';

import { Text, TouchableRipple } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserProfileStackParams } from "../../navigation/UserProfileStack";
import useAuthStore from "../../stores/auth.store";
import { createChatRoom, getTextMessages, saveTextMessage } from "../../lib/api/rooms.lib";
import Header from "../../components/header";


type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ViewChat'>;

type Props = {
  route: ViewUserFollowListRouteProp;
};

const CruChat = ( {route}: Props) => {
    const [messages, setMessages] = useState<IMessage []>([])
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const userID: string | undefined = route.params?.userId ?? null;
    const {user} = useAuthStore();
    const mItInviteId : string | undefined = route.params?.mItInviteId ?? null;
    var roomId =""
    const hmsInstanceRef = useRef<HMSSDK | null>(null);
    useEffect(()=>{
      intializeChat();
      return () =>  {
        hmsInstanceRef.current != null ?? hmsInstanceRef.current?.removeAllListeners();
        hmsInstanceRef.current != null ?? hmsInstanceRef.current?.leave();
      }
    },[])



const getTrackSettings = () => {
  let audioSettings = new HMSAudioTrackSettings({
    initialState:HMSTrackSettingsInitState.MUTED
  });

  let videoSettings = new HMSVideoTrackSettings({
    initialState: HMSTrackSettingsInitState.MUTED,
    cameraFacing: HMSCameraFacing.FRONT,
    forceSoftwareDecoder: true,
  });
  return new HMSTrackSettings({
      video: videoSettings,
      audio: audioSettings,
    });
  };
  const getTextMessage =  async(roomId:string)=>{
    const response  =   await  getTextMessages(roomId)
    console.log(JSON.stringify(response));
    setMessages(response!);
  }

    const intializeChat = async()=>{
      const trackSettings = getTrackSettings();
      const hmsInstance = await HMSSDK.build({trackSettings});
      const fetchRoomInfo =  await  createChatRoom(userID!,mItInviteId!);
      const chatId = fetchRoomInfo.room.roomId;
      roomId =chatId;
         const token =  fetchRoomInfo.roomAuthToken.token // await hmsInstance.getAuthTokenByRoomCode(fetchRoomInfo.room.roomId);
          console.log('TOKENEEEEE'+token);
         const hmsConfig = new HMSConfig({
            authToken: token,
            username: user?.username!,
          });
          hmsInstance.addEventListener(HMSUpdateListenerActions.ON_JOIN, onJoinSuccess);
          hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);
          
          //  const localPeer = await hmsInstance.getLocalPeer();
          //  localPeer.audioTrack!.mute  =false;
          //  To Mute Video of local peer - other peers will stop seeing video
          hmsInstance.join(hmsConfig);
          hmsInstance.onMessageListener = onMessageListener
          hmsInstanceRef.current = hmsInstance;
          getTextMessage(mItInviteId!)
      /**
       * Create `HMSConfig` with the above auth token and username
       */
    }

    const onTrackListener = ({
      track,
      peer,
      type
  }: {
      track: HMSTrack,
      peer: HMSPeer,
      type: HMSTrackUpdate
  }) => {
      // gets triggered when track is added, removed, muted, unmuted, degraded and restored back.
      // use these objects to update your local and remote peers.
  };
  

   


  const onMessageListener = (data: HMSMessage) => {
    
    var messsages: IMessage [] = []
       const iMessage : IMessage = {
                _id: userID,
                text: data.message,
                user: { _id: userID,},
                createdAt: data.time,
            };
            messsages.push(iMessage);
      setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messsages),
    )
    //   setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    // {"recipient":{"recipientType":"BROADCAST","recipientRoles":[]},"id":"12345","message":"New B","time":"1706874142551","type":"chat","messageId":"00252e6a-193e-4a1d-9dc6-ecb6fc87f08f","sender":{"name":"meddy4333","peerID":"bbdcd233-9ae6-4d47-98e4-bd992dd5845a"}}
  //  getTextMessage(mItInviteId!);
};
  

    const onReceiverMessage = (data :HMSMessage)=>
    {

      var messsages: IMessage [] = []
      const iMessage : IMessage = {
               _id: userID,
               text: data.message,
               user: { _id: userID,},
               createdAt: data.time,
           };
           messsages.push(iMessage);
     setMessages(previousMessages =>
     GiftedChat.append(previousMessages, messsages),
   )

    }


    const onJoinSuccess = async(a :any)=>
    {
      hmsInstanceRef.current!.addEventListener(HMSUpdateListenerActions.ON_MESSAGE, onReceiverMessage);
      hmsInstanceRef.current!.addEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE, onTrackListener);
      console.log('SUCCESSSS'+ JSON.stringify(a));
    }

    const onError = (e :any ) =>{
      console.log('FAILLL'+JSON.stringify(e));
    }
   

    /*
    const allMessages = useHMSStore(selectHMSMessages); // get all messages
    const broadcastMessages = useHMSStore(selectBroadcastMessages); // get all broadcasted messages
    const groupMessagesByRole = useHMSStore(selectMessagesByRole('host')); // get conversation with the host role
    const directMessages = useHMSStore(selectMessagesByPeerID('')); // get private conversation with peer
    */




    const onSend = useCallback( async (messages : IMessage[] = []) => {
      hmsInstanceRef.current!.sendBroadcastMessage(messages[0]!.text!,'chat');
      setMessages(previousMessages =>
          GiftedChat.append(previousMessages, messages),
        )
        saveTextMessage(mItInviteId,messages[0]!.text!, userID!,);
      }, [])
      
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
              <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                  _id:user?.id!,
                  name: user?.username
                }}
               />  
        </SafeAreaView>
    );
};

export default CruChat;
