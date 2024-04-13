import {
    HMSAudioTrackSettings,
    HMSCameraFacing,
    HMSConfig,
    HMSMessage,
    HMSPeer,
    HMSSDK,
    HMSTrack,
    HMSTrackSettings,
    HMSTrackSettingsInitState,
    HMSTrackUpdate,
    HMSUpdateListenerActions,
    HMSVideoTrackSettings,
} from '@100mslive/react-native-hms';
``;
import {RouteProp, useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {Bubble, GiftedChat, IMessage} from 'react-native-gifted-chat';
import {COLORS, FONTS} from '../../../assets/constants';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Text, TouchableRipple} from 'react-native-paper';
import HexAvatar from '../../components/HexAvatar';
import Header from '../../components/header';
import {createChatRoom, getTextMessages, getTextMessagesGroup, saveTextMessage, updateMessageStatus} from '../../lib/api/rooms.lib';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import useAuthStore from '../../stores/auth.store';
import {selectAvatarBorderColor} from '../../util/util';
import _, {uniqueId} from 'lodash';
import {supabase} from '../../../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';
import playMessageSound from '../../util/playMessageSound';
import uuid from 'react-native-uuid';

const generateUUID = () => {
  const uuidval = uuid.v4();
  return uuidval;
};

const CruGroupChatComponent = ({cru, members}: any) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const cruId = cru.id || null;
    const [membersdata, setMembersData] = useState({});
   


    // const userID: string | undefined = route.params?.userId ?? null;
    // const {creatorProfilePicture, inviteeProfilePicture, profilePicture} = route.params;
    const {user} = useAuthStore();
    

    var roomId = '';
    const hmsInstanceRef = useRef<HMSSDK | null>(null);

    const [channelll, setChannel] = useState<RealtimeChannel | null>(null);
    const [channelP, setChannelP] = useState<RealtimeChannel | null>(null);
    membersdata[user.id] = {
        profilePicture: user?.profilePicture,
        username: user?.username
    };
    
    membersdata[cru?.creator?.id] = {
        profilePicture: cru?.creator?.profilePicture,
        username: cru?.creator?.username
    };
    
    members.forEach(member => {
        membersdata[member.id] = {
            profilePicture: member.profilePicture,
            username: member.username
        };
    });


    useEffect(() => {
        
        getTextMessage(cruId!);
        const channelA = supabase.channel(cruId);
        channelA
            .on('broadcast', {event: 'groupchat'}, payload => messageReceived(payload))
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    setChannel(channelA);
                }
            });

        const channelP = supabase.channel('parent-cru-chat');
        channelP
            .on('broadcast', {event: 'parent-cru-chat'}, payload => null)
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    setChannelP(channelP);
                }
            });
    

        return () => {
            channelA.unsubscribe();
            channelP.unsubscribe();
            setChannelP(null);
            setChannel(null);
        };
    }, []);

    // Simple function to log any messages we receive
    function messageReceived(payload: any) {
        // console.log('RECEIVED MESSAGE', payload);
        if (payload.payload.senderId === user.id) return;
        var messsages: IMessage[] = [];
        console.log('msgId', payload.payload.msgId)
        const iMessage: IMessage = {
            _id: payload.payload.msgId,
            text: payload.payload.message,
            user: {_id: payload.payload.senderId!, name:membersdata[payload.payload.senderId!]['username']},
            createdAt: Date.now(),
        };
        playMessageSound();
        messsages.push(iMessage);
        setMessages(previousMessages => GiftedChat.append(previousMessages, messsages));
        updateMessageStatus([payload.payload.msgId])

    }

   
    const getTextMessage = async (cruId: string) => {

        const response = await getTextMessagesGroup(cruId);
        var chatMessage : IMessage[] = []

        response!.forEach(  (item) => {

            const senderId = item.senderId
            const iMessage : IMessage = {
                _id: item.id,
                text: item.content,
                user: { _id: item.senderId, name:membersdata[senderId] ? membersdata[senderId].username : 'Unknown User'},
                createdAt: new  Date(item.createdAt),
            };
            chatMessage.push(iMessage);
        })
        updateMessageStatus([chatMessage[0]._id])
        setMessages(chatMessage!);
    };

 

    const onSend = (messages: IMessage[] = []) => {
        if (channelll === null) return; // console.log('Channel not found');
        const msgId = generateUUID();
        channelll.send({
            type: 'broadcast',
            event: 'groupchat',
            payload: {message: messages[0]!.text!, senderId: user.id,cruId: cruId, msgId: msgId},
        });
        channelP.send({
            type: 'broadcast',
            event: 'parent-cru-chat',
            payload: {message: messages[0]!.text!, senderId: user.id,cruId: cruId, msgId: msgId},
        });
        playMessageSound();
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        saveTextMessage(cruId, messages[0]!.text!, user.id!,true, msgId);
        // updateMessageStatus([messages[0]._id])


    };

    const handleAvatarPress = (user: any) => {
        // Navigate to the user's profile screen
        navigation.navigate('ViewUserScreen', {userID: user._id});
    };

    return (
        
            <View style={{flex: 1, backgroundColor: COLORS.AKCRUBACKGROUND}}>
                <GiftedChat
                    messages={messages}
                    onSend={messages => onSend(messages)}
                    user={{
                        _id: user?.id!,
                        name: user?.username,
                    }}
                    textInputProps={{
                        style: {
                            color: COLORS.BLACK,
                            width: '85%',
                            padding: 10,
                        },
                    }}
                    renderUsernameOnMessage={true}
                    showUserAvatar={true}
                    renderAvatar={props => (
                        <TouchableRipple onPress={() => handleAvatarPress(props.currentMessage?.user)}>
                            <HexAvatar
                                size={45}
                                bordercolor={selectAvatarBorderColor(
                                    props.currentMessage?.user?._id === user?.id
                                        ? user?.badge ?? 'AKCRUIT'
                                        : 'OTHER_USER_BADGE',
                                )}
                                source={{
                                    uri:
                                        props.currentMessage?.user?._id === user?.id
                                            ? user?.profilePicture
                                            :membersdata[props.currentMessage?.user?._id]['profilePicture'],
                                }}
                                {...props}
                            />
                        </TouchableRipple>
                    )}
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
            </View>
    );
};

export default CruGroupChatComponent;
