import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, TextInput } from 'react-native';
import { Bubble, GiftedChat, IMessage } from 'react-native-gifted-chat';
import { COLORS } from '../../../assets/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HexAvatar from '../../components/HexAvatar';
import { getMitMessages, saveTextMessage, updateMessageStatus } from '../../lib/api/rooms.lib';
import { UserProfileStackParams } from '../../navigation/UserProfileStack';
import useAuthStore from '../../stores/auth.store';
import { selectAvatarBorderColor } from '../../util/util';
import uuid from 'react-native-uuid';
import styles from './CruGroupChatStyles';
import { supabase } from '../../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import playMessageSound from '../../util/playMessageSound';

const CruChatComponent = ({ route }: any) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const userID: string | undefined = route.params?.userId ?? null;

    const [membersData, setMembersData] = useState({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageMessageText, setImageMessageText] = useState('');
    const { user } = useAuthStore();

    const mItInviteId: string | undefined = route.params?.mItInviteId ?? null;
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    useEffect(() => {
        initializeChat();
        const channelA = supabase.channel(mItInviteId);
        channelA
            .on('broadcast', { event: 'test' }, payload => messageReceived(payload))
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

    const initializeChat = async () => {
        const response = await getMitMessages(mItInviteId!);
        const chatMessages: IMessage[] = response.map(item => ({
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
            _id: payload.payload.msgId || uuid.v4(),
            text: payload.payload.message,
            isCru: payload.payload.isCru,
            user: { _id: payload.payload.senderId, name: membersData[payload.payload.senderId]?.username },
            createdAt: Date.now(),
        };

        playMessageSound();
        setMessages(previousMessages => GiftedChat.append(previousMessages, [newMessage]));
        updateMessageStatus([payload.payload.msgId]);
    };

    const handleImagePick = () => {
        launchImageLibrary({ mediaType: 'photo' }, response => {
            if (!response.didCancel && !response.errorMessage && response.assets?.length > 0) {
                const imageUri = response.assets[0].uri;
                setSelectedImage(imageUri);
                setImageMessageText('');
            }
        });
    };

    const onSendImage = async () => {
        if (!selectedImage && !imageMessageText) return;

        const msgId = uuid.v4();
        const message: IMessage = {
            _id: msgId,
            text: imageMessageText,
            isCru: 'false',
            image: selectedImage,
            user: { _id: user.id, name: user.username },
            createdAt: new Date(),
        };

        if (channel) {
            channel.send({
                type: 'broadcast',
                event: 'test',
                payload: { image: selectedImage, text: imageMessageText, senderId: user.id, mItInviteId, isCru: 'false', msgId },
            });
        }

        setMessages(previousMessages => GiftedChat.append(previousMessages, [message]));

        try {
            const response = await saveTextMessage(mItInviteId, imageMessageText, user.id!, 'false', msgId, selectedImage);
            console.log("Image message saved successfully:", response);
        } catch (error) {
            console.error("Error saving image message:", error);
        }

        playMessageSound();
        resetImageSelection();
    };

    const onSendText = async (messages: IMessage[] = []) => {
        const isCru = 'false';
        if (!channel || messages.length === 0) return;

        const msgId = uuid.v4();
        const textMessage = messages[0].text!;

        try {
            console.log("Sending text message:", { mItInviteId, textMessage, userId: user.id, isCru: 'false', msgId, image: null });

            // Send message through the channel
            // Change this line
            channel.send({
                type: 'broadcast',
                event: 'test',
                payload: { message: textMessage, senderId: user.id, mItInviteId, isCru: 'false', msgId, image: null },
            });


            playMessageSound();
            console.log("before setMessages");

            // Update local messages
            setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
            console.log("after setMessages");

            // Log parameters being sent to saveTextMessage
            console.log("Saving text message with params:", { mItInviteId, textMessage, receiverId: user.id!, isCru: 'false', msgId, imageUrl: null });

            // Save the message to the backend
            const response = await saveTextMessage(mItInviteId, textMessage, user.id!, 'false', msgId, null);

            console.log("Text message saved successfully:", response);
        } catch (error) {
            // Improved error handling
            console.error("Error sending text message:", error.response ? error.response.data : error.message);
        }
    };




    const resetImageSelection = () => {
        setSelectedImage(null);
        setImageMessageText('');
    };

    const handleAvatarPress = (user: any) => {
        navigation.navigate('ViewUserScreen', { userID: user._id });
    };

    return (
        <View style={styles.container}>
            {selectedImage ? (
                <View style={styles.fullScreen}>
                    <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
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
                    user={{ _id: user?.id!, name: user?.username }}
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
                                source={{ uri: membersData[props.currentMessage?.user?._id]?.profilePicture }}
                            />
                        </TouchableOpacity>
                    )}
                    renderBubble={props => (
                        <Bubble
                            {...props}
                            wrapperStyle={{
                                right: { backgroundColor: COLORS.AKCRUBLUE },
                                left: { backgroundColor: COLORS.CATPURPDRK },
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

export default CruChatComponent;
