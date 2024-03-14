import {RouteProp, useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {Bubble, GiftedChat, IMessage} from 'react-native-gifted-chat';
import {COLORS, FONTS} from '../../../assets/constants';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RealtimeChannel} from '@supabase/supabase-js';
import _ from 'lodash';
import {Text, TouchableRipple} from 'react-native-paper';
import {supabase} from '../../../lib/supabase';
import HexAvatar from '../../components/HexAvatar';
import Header from '../../components/header';
import {getTextMessages, saveTextMessage} from '../../lib/api/rooms.lib';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import useAuthStore from '../../stores/auth.store';
import {selectAvatarBorderColor} from '../../util/util';

type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ViewChat'>;

type Props = {
    route: ViewUserFollowListRouteProp;
};

const CruChat = ({route}: Props) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const userID: string | undefined = route.params?.userId ?? null;
    const {creatorProfilePicture, inviteeProfilePicture} = route.params;

    const {user} = useAuthStore();
    const mItInviteId: string | undefined = route.params?.mItInviteId ?? null;

    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    useEffect(() => {
        getTextMessage(mItInviteId!);
        const channelA = supabase.channel(mItInviteId!);
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
    }, [mItInviteId]);

    function messageReceived(payload: any) {
        if (payload.payload.senderId === userID) return;

        var messsages: IMessage[] = [];
        const iMessage: IMessage = {
            _id: _.uniqueId(),
            text: payload.payload.message,
            user: {_id: userID!},
            createdAt: Date.now(),
        };
        messsages.push(iMessage);
        setMessages(previousMessages => GiftedChat.append(previousMessages, messsages));
    }

    const getTextMessage = async (roomId: string) => {
        const response = await getTextMessages(roomId);
        setMessages(response!);
    };

    const onSend = (messages: IMessage[] = []) => {
        if (channel === null) return; // console.log('Channel not found');

        channel.send({
            type: 'broadcast',
            event: 'test',
            payload: {message: messages[0]!.text!, senderId: userID},
        });

        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        saveTextMessage(mItInviteId, messages[0]!.text!, userID!);
    };

    const handleAvatarPress = (user: any) => {
        navigation.navigate('ViewUserScreen', {userID: user._id});
    };

    return (
        <SafeAreaView style={{flex: 1, paddingBottom: 10}}>
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
                                            : creatorProfilePicture || inviteeProfilePicture,
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
        </SafeAreaView>
    );
};

export default CruChat;
