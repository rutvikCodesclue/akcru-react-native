import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Bubble, GiftedChat, IMessage} from 'react-native-gifted-chat';
import {COLORS} from '../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {TouchableRipple} from 'react-native-paper';
import HexAvatar from '../../components/HexAvatar';
import {getTextMessages, saveTextMessage} from '../../lib/api/rooms.lib';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import useAuthStore from '../../stores/auth.store';
import {selectAvatarBorderColor} from '../../util/util';
import _ from 'lodash';
import {supabase} from '../../../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';
import playMessageSound from '../../util/playMessageSound';

const CruChatComponent = ({route}: any) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const userID: string | undefined = route.params?.userId ?? null;
    const {profilePicture} = route.params;
    const {user} = useAuthStore();

    const mItInviteId: string | undefined = route.params?.mItInviteId ?? null;
    const [channelll, setChannel] = useState<RealtimeChannel | null>(null);

    useEffect(() => {
        intializeChat();
        const channelA = supabase.channel(mItInviteId);
        channelA
            .on('broadcast', {event: 'test'}, payload => messageReceived(payload))
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    setChannel(channelA);
                }
            });

        return () => {
            channelA.unsubscribe();
            setChannel(null);
        };
    }, []);

    function messageReceived(payload: any) {
        if (payload.payload.senderId === userID) {
            return;
        }

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
    };

    const onSend = (messages: IMessage[] = []) => {
        if (channelll === null) {
            return;
        }

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
                                backgroundColor: COLORS.AKCRUBLUE,
                            },
                            left: {
                                backgroundColor: COLORS.CATPURPDRK,
                            },
                        }}
                        textStyle={{
                            right: {
                                color: COLORS.WHITE,
                            },
                            left: {
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
