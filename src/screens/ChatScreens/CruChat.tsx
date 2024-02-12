import React, { useState, useCallback, useRef, useEffect } from "react";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Avatar, Bubble, GiftedChat, IMessage, Send } from 'react-native-gifted-chat'
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
    HMSMessageType,
} from '@100mslive/react-native-hms';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';

import { Text, TouchableRipple } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserProfileStackParams } from "../../navigation/UserProfileStack";
import useAuthStore from "../../stores/auth.store";
import { createChatRoom, getTextMessages, saveTextMessage } from "../../lib/api/rooms.lib";
import Header from "../../components/header";
import HexAvatar from "../../components/HexAvatar";
import { selectAvatarBorderColor } from "../../util/util";
import HexAvatar2 from "../../components/HexAvatar2";


type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ViewChat'>;

type Props = {
  route: ViewUserFollowListRouteProp;
};

const CruChat = ( {route}: Props) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const userID: string | undefined = route.params?.userId ?? null;
    // const {creatorProfilePicture, inviteeProfilePicture} = route.params;
    const {mItInviteId, userId, profilePicture, username} = route.params;
    const [isChatLoaded, setIsChatLoaded] = useState(false);

    const {user} = useAuthStore();
    // const mItInviteId: string | undefined = route.params?.mItInviteId ?? null;
    var roomId = '';
    const hmsInstanceRef = useRef<HMSSDK | null>(null);
    useEffect(() => {
        intializeChat();
        return () => {
            hmsInstanceRef.current != null ?? hmsInstanceRef.current?.removeAllListeners();
            hmsInstanceRef.current != null ?? hmsInstanceRef.current?.leave();
        };
    }, []);

    const getTrackSettings = () => {
        let audioSettings = new HMSAudioTrackSettings({
            initialState: HMSTrackSettingsInitState.MUTED,
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
    const getTextMessage = async (roomId: string) => {
        const response = await getTextMessages(roomId);
        // console.log('response: ', JSON.stringify(response));
        setMessages(response!);
        setIsChatLoaded(true);
    };

    const intializeChat = async () => {
        const trackSettings = getTrackSettings();
        const hmsInstance = await HMSSDK.build({trackSettings});
        const fetchRoomInfo = await createChatRoom(userID!, mItInviteId!);
        const chatId = fetchRoomInfo.room.roomId;
        roomId = chatId;
        const token = fetchRoomInfo.roomAuthToken.token; // await hmsInstance.getAuthTokenByRoomCode(fetchRoomInfo.room.roomId);
        console.log('TOKENEEEEE' + token);
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
        hmsInstance.onMessageListener = onMessageListener;
        hmsInstanceRef.current = hmsInstance;
        getTextMessage(mItInviteId!);
        /**
         * Create `HMSConfig` with the above auth token and username
         */
    };

    const onTrackListener = ({track, peer, type}: {track: HMSTrack; peer: HMSPeer; type: HMSTrackUpdate}) => {
        // gets triggered when track is added, removed, muted, unmuted, degraded and restored back.
        // use these objects to update your local and remote peers.
    };

    const onMessageListener = useCallback((data: HMSMessage) => {
        const incomingMessage: IMessage = {
            _id: userID,
            // _id: data.sender?.peerID,
            text: data.message,
            createdAt: new Date(data.time),
            user: {
                _id: userID,
                // _id: data.sender?.peerID,
                avatar: data.sender?.profilePicture, // Ensure this is correctly set
            },
        };
        setMessages(previousMessages => GiftedChat.append(previousMessages, [incomingMessage]));
        getTextMessage(mItInviteId!);
    }, []);


    //   const onMessageListener = (data: HMSMessage) => {

    //     var messsages: IMessage [] = []
    //        const iMessage : IMessage = {
    //                 _id: userID,
    //                 text: data.message,
    //                 user: { _id: userID,},
    //                 createdAt: data.time,
    //             };
    //             messsages.push(iMessage);
    //       setMessages(previousMessages =>
    //       GiftedChat.append(previousMessages, messsages),
    //     )
    //     //   setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    //     // {"recipient":{"recipientType":"BROADCAST","recipientRoles":[]},"id":"12345","message":"New B","time":"1706874142551","type":"chat","messageId":"00252e6a-193e-4a1d-9dc6-ecb6fc87f08f","sender":{"name":"meddy4333","peerID":"bbdcd233-9ae6-4d47-98e4-bd992dd5845a"}}
    //   //  getTextMessage(mItInviteId!);
    // };

    const onReceiverMessage = (data: HMSMessage) => {
        var messsages: IMessage[] = [];
        const iMessage: IMessage = {
            _id: userID,
            text: data.message,
            user: {_id: userID},
            createdAt: data.time,
        };
        messsages.push(iMessage);
        console.log('User ID:', userID);
        setMessages(previousMessages => GiftedChat.append(previousMessages, messsages));
    };

    const onJoinSuccess = async (a: any) => {
        hmsInstanceRef.current!.addEventListener(HMSUpdateListenerActions.ON_MESSAGE, onReceiverMessage);
        hmsInstanceRef.current!.addEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE, onTrackListener);
        console.log('SUCCESSSS' + JSON.stringify(a));
    };

    const onError = (e: any) => {
        console.log('FAILLL' + JSON.stringify(e));
    };

    /*
    const allMessages = useHMSStore(selectHMSMessages); // get all messages
    const broadcastMessages = useHMSStore(selectBroadcastMessages); // get all broadcasted messages
    const groupMessagesByRole = useHMSStore(selectMessagesByRole('host')); // get conversation with the host role
    const directMessages = useHMSStore(selectMessagesByPeerID('')); // get private conversation with peer
    */

   const onSend = useCallback(async (messages: IMessage[] = []) => {
       hmsInstanceRef
           .current!.sendBroadcastMessage(messages[0]!.text!, HMSMessageType.CHAT)
           .catch(error => console.error('Error sending message:', error));
       console.log('SENDING MESSAGE' + messages[0]!.text);
       setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
       saveTextMessage(mItInviteId, messages[0]!.text!, userID!);
   }, []);


    // const onSend = useCallback(
    //     async (messages: IMessage[] = []) => {
    //         const sendMessage = async (attempt = 1) => {
    //             try {
    //                 await hmsInstanceRef.current!.sendBroadcastMessage(messages[0]!.text!, HMSMessageType.CHAT);
    //                 console.log('SENDING MESSAGE: ' + messages[0]!.text);
    //                 setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
    //                 await saveTextMessage(mItInviteId, messages[0]!.text!, userID!);
    //             } catch (error) {
    //                 console.error('Attempt ' + attempt + ' failed:', error);
    //                 if (attempt < 3) {
    //                     // Retry up to 3 times
    //                     setTimeout(() => sendMessage(attempt + 1), 2000); // Wait 2 seconds before retrying
    //                 } else {
    //                     // Handle the failure after all retries
    //                     console.error('Message sending failed after 3 attempts.');
    //                     // Optionally, inform the user about the failure
    //                 }
    //             }
    //         };
    //         sendMessage();
    //     },
    //     [mItInviteId, userID],
    // );




    const handleAvatarPress = (user: any) => {
        // Navigate to the user's profile screen
        navigation.navigate('ViewUserScreen', {userID: user._id});
    };

    return (
        <SafeAreaView style={{flex: 1}}>
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
            <View style={{flex: 1, backgroundColor: COLORS.AKCRUBACKGROUND}}>
                {isChatLoaded ? (
                    <GiftedChat
                        messages={messages}
                        onSend={messages => onSend(messages)}
                        user={{
                            _id: user?.id!,
                            name: user?.username,
                        }}
                        textInputProps={{
                            style: {
                                color: COLORS.BLACK, // Set the color of the text inside the input area
                                width: '85%', // Adjust the width based on typing status
                                // You can add more custom styles here if needed
                            },
                        }}
                        renderUsernameOnMessage={true}
                        showUserAvatar={true}
                        renderAvatar={props => {
                            // Determine the appropriate avatar URL based on the message sender
                            const avatarURL =
                                props.currentMessage?.user._id === user?.id
                                    ? user?.profilePicture // Current user's profile picture
                                    : profilePicture; // Counterpart's profile picture passed through navigation

                            console.log('Avatar URL:', avatarURL);

                            return (
                                <TouchableRipple onPress={() => handleAvatarPress(props.currentMessage?.user)}>
                                    <HexAvatar
                                        size={45}
                                        bordercolor={selectAvatarBorderColor(
                                            props.currentMessage?.user._id === user?.id
                                                ? user?.badge ?? 'AKCRUIT'
                                                : 'OTHER_USER_BADGE',
                                        )}
                                        source={{uri: avatarURL}}
                                        {...props}
                                    />
                                </TouchableRipple>
                            );
                        }}
                        renderBubble={props => (
                            <Bubble
                                {...props}
                                wrapperStyle={{
                                    right: {
                                        // Change the background color for messages sent by the current user
                                        backgroundColor: COLORS.AKCRUBLUE,
                                    },
                                    left: {
                                        // Change the background color for messages sent by other users
                                        backgroundColor: COLORS.CATPURPDRK,
                                    },
                                }}
                                textStyle={{
                                    right: {
                                        // Text color for messages sent by the current user
                                        color: COLORS.WHITE,
                                    },
                                    left: {
                                        // Text color for messages sent by other users
                                        color: COLORS.WHITE,
                                    },
                                }}
                            />
                        )}
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
            </View>
        </SafeAreaView>
    );
};

export default CruChat;
