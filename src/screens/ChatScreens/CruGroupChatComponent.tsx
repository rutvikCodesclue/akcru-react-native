import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, Image, TextInput} from 'react-native';
import {Bubble, GiftedChat, IMessage} from 'react-native-gifted-chat';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import HexAvatar from '../../components/HexAvatar';
import {getCruMessages, saveTextMessage, updateMessageStatus} from '../../lib/api/rooms.lib';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import useAuthStore from '../../stores/auth.store';
import {selectAvatarBorderColor} from '../../util/util';
import {supabase} from '../../../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';
import playMessageSound from '../../util/playMessageSound';
import uuid from 'react-native-uuid';
import styles from './CruGroupChatStyles';
import {COLORS} from '../../../assets/constants';

const CruGroupChatComponent = ({cru, members}: any) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const cruId = cru.id || null;
    const [membersData, setMembersData] = useState({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageMessageText, setImageMessageText] = useState('');

    const {user} = useAuthStore();
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);
    const [parentChannel, setParentChannel] = useState<RealtimeChannel | null>(null);

    useEffect(() => {
        initializeMembersData();
        fetchMessages(cruId!);
        setupChannels(cruId);

        return () => {
            cleanupChannels();
        };
    }, []);

    const initializeMembersData = () => {
        const data = {
            [user.id]: {
                profilePicture: user?.profilePicture,
                username: user?.username,
            },
            [cru?.creator?.id]: {
                profilePicture: cru?.creator?.profilePicture,
                username: cru?.creator?.username,
            },
            ...members.reduce((acc, member) => {
                acc[member.id] = {
                    profilePicture: member.profilePicture,
                    username: member.username,
                };
                return acc;
            }, {}),
        };
        setMembersData(data);
    };

    const setupChannels = (cruId: string) => {
        const channelA = supabase
            .channel(cruId)
            .on('broadcast', {event: 'groupchat'}, messageReceived)
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    setChannel(channelA);
                }
            });

        const channelP = supabase
            .channel('parent-cru-chat')
            .on('broadcast', {event: 'parent-cru-chat'}, () => null)
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    setParentChannel(channelP);
                }
            });
    };

    const cleanupChannels = () => {
        if (channel) channel.unsubscribe();
        if (parentChannel) parentChannel.unsubscribe();
        setChannel(null);
        setParentChannel(null);
    };

    const fetchMessages = async (cruId: string) => {
        const response = await getCruMessages(cruId);
        const chatMessages: IMessage[] = response!.map(item => ({
            _id: item.id,
            text: item.content,
            image: item.imageUrl,
            user: {
                _id: item.senderId,
                name: membersData[item.senderId]?.username || 'Unknown User',
            },
            createdAt: new Date(item.createdAt),
        }));

        if (chatMessages.length > 0) {
            updateMessageStatus([chatMessages[0]._id]);
            setMessages(chatMessages);
        }
    };

    const messageReceived = (payload: any) => {
        if (payload.payload.senderId === user.id) return;

        const newMessage: IMessage = {
            _id: payload.payload.msgId,
            text: payload.payload.message,
            user: {_id: payload.payload.senderId, name: membersData[payload.payload.senderId].username},
            createdAt: Date.now(),
        };
        playMessageSound();
        setMessages(previousMessages => GiftedChat.append(previousMessages, [newMessage]));
        updateMessageStatus([payload.payload.msgId]);
    };

    const handleImagePick = () => {
        launchImageLibrary({mediaType: 'photo'}, response => {
            if (!response.didCancel && !response.errorMessage && response.assets?.length > 0) {
                const imageUri = response.assets[0].uri;
                setSelectedImage(imageUri);
                setImageMessageText('');
            }
        });
    };

    const onSendImage = () => {
        if (!selectedImage && !imageMessageText) return;

        const msgId = uuid.v4();
        const message: IMessage = {
            _id: msgId,
            text: imageMessageText,
            image: selectedImage,
            user: {_id: user.id, name: user.username},
            createdAt: new Date(),
        };

        if (channel) {
            channel.send({
                type: 'broadcast',
                event: 'groupchat',
                payload: {image: selectedImage, text: imageMessageText, senderId: user.id, cruId, msgId},
            });
            parentChannel.send({
                type: 'broadcast',
                event: 'parent-cru-chat',
                payload: {image: selectedImage, text: imageMessageText, senderId: user.id, cruId, msgId},
            });
        }

        setMessages(previousMessages => GiftedChat.append(previousMessages, [message]));
        saveTextMessage(cruId, imageMessageText, user.id!, 'true', msgId, selectedImage);
        playMessageSound();
        resetImageSelection();
    };

    const onSendText = (messages: IMessage[] = []) => {
        if (!channel || messages.length === 0) return;

        const msgId = uuid.v4();
        const textMessage = messages[0].text!;
        channel.send({
            type: 'broadcast',
            event: 'groupchat',
            payload: {message: textMessage, senderId: user.id, cruId, msgId},
        });
        parentChannel.send({
            type: 'broadcast',
            event: 'parent-cru-chat',
            payload: {message: textMessage, senderId: user.id, cruId, msgId},
        });
        playMessageSound();
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        saveTextMessage(cruId, textMessage, user.id!, 'true', msgId, null);
    };

    const resetImageSelection = () => {
        setSelectedImage(null);
        setImageMessageText('');
    };

    const handleAvatarPress = (user: any) => {
        navigation.navigate('ViewUserScreen', {userID: user._id});
    };

    return (
        <View style={styles.container}>
            {selectedImage ? (
                <View style={styles.fullScreen}>
                    <Image source={{uri: selectedImage}} style={styles.selectedImage} />
                    <TextInput
                        placeholder="Type a message..."
                        value={imageMessageText}
                        onChangeText={setImageMessageText}
                        style={styles.textInput}
                    />
                    <TouchableOpacity onPress={onSendImage} style={styles.sendButton}>
                        <Icon name="send" size={30} color={COLORS.AKCRUBLUE} />
                    </TouchableOpacity>
                </View>
            ) : (
                <GiftedChat
                    messages={messages}
                    onSend={onSendText}
                    user={{_id: user?.id!, name: user?.username}}
                    textInputProps={{
                        style: {
                            color: COLORS.BLACK,
                            width: '85%',
                            padding: 10,
                            paddingLeft: 42,
                        },
                    }}
                    renderUsernameOnMessage={true}
                    showUserAvatar={true}
                    renderAvatar={props => (
                        <TouchableOpacity onPress={() => handleAvatarPress(props.currentMessage?.user)}>
                            <HexAvatar
                                size={45}
                                bordercolor={selectAvatarBorderColor(
                                    props.currentMessage?.user?._id === user?.id
                                        ? user?.badge ?? 'AKCRUIT'
                                        : 'OTHER_USER_BADGE',
                                )}
                                source={{uri: membersData[props.currentMessage?.user?._id]?.profilePicture}}
                            />
                        </TouchableOpacity>
                    )}
                    renderBubble={props => (
                        <Bubble
                            {...props}
                            wrapperStyle={{
                                right: {backgroundColor: COLORS.AKCRUBLUE},
                                left: {backgroundColor: COLORS.CATPURPDRK},
                            }}
                        />
                    )}
                />
            )}
            <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerButton}>
                <Icon name="photo" size={30} color={COLORS.AKCRUBLUE} />
            </TouchableOpacity>
        </View>
    );
};

export default CruGroupChatComponent;
