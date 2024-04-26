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
import {createChatRoom, getTextMessages, saveTextMessage} from '../../lib/api/rooms.lib';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import useAuthStore from '../../stores/auth.store';
import {selectAvatarBorderColor} from '../../util/util';
import _, {uniqueId} from 'lodash';
import {supabase} from '../../../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';
import playMessageSound from '../../util/playMessageSound';



const CruChatComponent = ({route}: any) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const userID: string | undefined = route.params?.userId ?? null;
    const {creatorProfilePicture, inviteeProfilePicture, profilePicture} = route.params;
    const {user} = useAuthStore();

    const mItInviteId: string | undefined = route.params?.mItInviteId ?? null;
    var roomId = '';
    const hmsInstanceRef = useRef<HMSSDK | null>(null);

    const [channelll, setChannel] = useState<RealtimeChannel | null>(null);

    useEffect(() => {
        intializeChat();
        const channelA = supabase.channel(mItInviteId);
        channelA
            .on('broadcast', {event: 'test'}, payload => messageReceived(payload))
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    // // console.log('setting channel');
                    setChannel(channelA);
                }
            });

        return () => {
            channelA.unsubscribe();
            setChannel(null);
        };
    }, []);

    // Simple function to log any messages we receive
    function messageReceived(payload: any) {
        // console.log('RECEIVED MESSAGE', payload);
        if (payload.payload.senderId === userID) return;

        var messsages: IMessage[] = [];
        const iMessage: IMessage = {
            _id: _.uniqueId(),
            text: payload.payload.message,
            user: {_id: userID!},
            createdAt: Date.now(),
        };
        playMessageSound();
        messsages.push(iMessage);
        setMessages(previousMessages => GiftedChat.append(previousMessages, messsages));
    }

   
    const getTextMessage = async (mitid: string) => {

        const response = await getTextMessages(mitid);
        setMessages(response!);
    };

    const intializeChat = async () => {
        
        getTextMessage(mItInviteId!);

        /**
         * Create `HMSConfig` with the above auth token and username
         */
    };

    const onTrackListener = ({track, peer, type}: {track: HMSTrack; peer: HMSPeer; type: HMSTrackUpdate}) => {
        // gets triggered when track is added, removed, muted, unmuted, degraded and restored back.
        // use these objects to update your local and remote peers.
    };

    const onMessageListener = (data: HMSMessage) => {
        var messsages: IMessage[] = [];
        const iMessage: IMessage = {
            _id: uniqueId(),
            text: data.message,
            user: {_id: userID},
            createdAt: data.time,
        };
        messsages.push(iMessage);
        setMessages(previousMessages => GiftedChat.append(previousMessages, messsages));
        //   setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
        // {"recipient":{"recipientType":"BROADCAST","recipientRoles":[]},"id":"12345","message":"New B","time":"1706874142551","type":"chat","messageId":"00252e6a-193e-4a1d-9dc6-ecb6fc87f08f","sender":{"name":"meddy4333","peerID":"bbdcd233-9ae6-4d47-98e4-bd992dd5845a"}}
        //  getTextMessage(mItInviteId!);
    };

    const onReceiverMessage = (data: HMSMessage) => {
        // console.log('RECEIVED MESSAGE', data);
        var messsages: IMessage[] = [];
        const iMessage: IMessage = {
            _id: data.messageId,
            text: data.message,
            user: {_id: userID},
            createdAt: data.time,
        };
        messsages.push(iMessage);
        // // console.log('User ID:', userID);
        setMessages(previousMessages => GiftedChat.append(previousMessages, messsages));
    };

    const onJoinSuccess = async (a: any) => {
        // console.log('JOINED' + JSON.stringify(a));
        // hmsInstanceRef.current!.addEventListener(HMSUpdateListenerActions.ON_MESSAGE, onReceiverMessage);
        // hmsInstanceRef.current!.addEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE, onTrackListener);
    };

    const onError = (e: any) => {
        // console.log('FAILED TO JOIN' + JSON.stringify(e));
    };

    /*
    const allMessages = useHMSStore(selectHMSMessages); // get all messages
    const broadcastMessages = useHMSStore(selectBroadcastMessages); // get all broadcasted messages
    const groupMessagesByRole = useHMSStore(selectMessagesByRole('host')); // get conversation with the host role
    const directMessages = useHMSStore(selectMessagesByPeerID('')); // get private conversation with peer
    */
    // // console.log(channelll ? 'Channel found' : 'Channel not found');
    const onSend = (messages: IMessage[] = []) => {
        if (channelll === null) return; // console.log('Channel not found');

        channelll.send({
            type: 'broadcast',
            event: 'test',
            payload: {message: messages[0]!.text!, senderId: userID},
        });
        playMessageSound();
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        saveTextMessage(mItInviteId, messages[0]!.text!, userID!);
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
                                            : profilePicture,
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

export default CruChatComponent;
