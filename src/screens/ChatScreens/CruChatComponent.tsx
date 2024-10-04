import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, Image, TextInput, TouchableWithoutFeedback, Alert, Text} from 'react-native';
import {Bubble, GiftedChat, IMessage} from 'react-native-gifted-chat';
import {COLORS} from '../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HexAvatar from '../../components/HexAvatar';
import {getMitMessages, saveTextMessage, updateMessageStatus, deleteMessage} from '../../lib/api/rooms.lib';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import useAuthStore from '../../stores/auth.store';
import {selectAvatarBorderColor} from '../../util/util';
import uuid from 'react-native-uuid';
import styles from './CruGroupChatStyles';
import {supabase} from '../../../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';
import playMessageSound from '../../util/playMessageSound';

const CruChatComponent = ({route}: any) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const userID: string | undefined = route.params?.userId ?? null;
    const {profilePicture} = route.params;
    const [membersData, setMembersData] = useState({});
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<any[]>([]);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageMessageText, setImageMessageText] = useState('');
    const {user} = useAuthStore();

    const mItInviteId: string | undefined = route.params?.mItInviteId ?? null;
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    useEffect(() => {
        initializeChat(mItInviteId);
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

    const initializeChat = async mItInviteId => {
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
            user: {_id: payload.payload.senderId, name: membersData[payload.payload.senderId]?.username},
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

    const onSendImage = async () => {
        if (!selectedImage && !imageMessageText) return;

        const msgId = uuid.v4();
        const message: IMessage = {
            _id: msgId,
            text: imageMessageText,
            isCru: 'false',
            image: selectedImage,
            user: {_id: user.id, name: user.username},
            createdAt: new Date(),
        };

        if (channel) {
            channel.send({
                type: 'broadcast',
                event: 'test',
                payload: {
                    image: selectedImage,
                    text: imageMessageText,
                    senderId: user.id,
                    mItInviteId,
                    isCru: 'false',
                    msgId,
                },
            });
        }

        // Update messages immediately after sending
        setMessages(previousMessages => GiftedChat.append(previousMessages, [message]));

        try {
            saveTextMessage(mItInviteId, imageMessageText, user.id!, 'false', msgId, selectedImage);

            // Immediately delete the message after sending
            await deleteMessage(msgId); // Use appropriate method to delete
        } catch (error) {
            console.error('Error saving image message:', error);
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
            await channel.send({
                type: 'broadcast',
                event: 'test',
                payload: {message: textMessage, senderId: user.id, mItInviteId, isCru: 'false', msgId, image: null},
            });

            playMessageSound();

            // Update local messages immediately
            setMessages(previousMessages => GiftedChat.append(previousMessages, messages));

            const response = await saveTextMessage(mItInviteId, textMessage, user.id!, 'false', msgId, null);

            // Immediately delete the message after sending
            await deleteMessage(msgId); // Use appropriate method to delete
        } catch (error) {
            console.error('Error sending text message:', error.response ? error.response.data : error.message);
        }
    };

    const resetImageSelection = () => {
        setSelectedImage(null);
        setImageMessageText('');
    };

    const handleAvatarPress = (user: any) => {
        navigation.navigate('ViewUserScreen', {userID: user._id});
    };

    const handleMessagePress = (message: IMessage) => {
        if (isSelectionMode) {
            if (selectedMessages.includes(message._id)) {
                setSelectedMessages(selectedMessages.filter(id => id !== message._id));
            } else {
                setSelectedMessages([...selectedMessages, message._id]);
            }
        }
    };

    const handleLongPress = (message: IMessage) => {
        if (!isSelectionMode && message.user._id === user.id) {
            setIsSelectionMode(true);
            setSelectedMessages([message._id]);
        }
    };

    const handleScreenPress = () => {
        if (selectedMessages.length > 0) {
            setSelectedMessages([]);
            setIsSelectionMode(false);
        }
    };

    const deleteMessages = async () => {
        Alert.alert(
            'Delete Messages',
            'Are you sure you want to delete the selected messages?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const messagesToDelete = messages.filter(msg => selectedMessages.includes(msg._id));
                            if (messagesToDelete.length === 0) return;

                            // Update the UI immediately
                            setMessages(prevMessages =>
                                prevMessages.filter(message => !selectedMessages.includes(message._id as string)),
                            );

                            // Perform deletion from the server
                            await Promise.all(selectedMessages.map(id => deleteMessage(id)));

                            // Reset selection mode after deletion
                            setSelectedMessages([]);
                            setIsSelectionMode(false);

                            // Re-fetch messages to ensure local state is in sync
                            initializeChat(mItInviteId);
                        } catch (error) {
                            console.error('Error deleting messages:', error);
                            Alert.alert('Error', 'Failed to delete messages. Please try again.');
                        }
                    },
                    style: 'destructive',
                },
            ],
            {cancelable: true},
        );
    };

    return (
        <TouchableWithoutFeedback onPress={handleScreenPress}>
            <View style={{flex: 1, backgroundColor: COLORS.AKCRUBACKGROUND}}>
                {selectedMessages.length > 0 && (
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            padding: 10,
                            backgroundColor: COLORS.AKCRUBLUE,
                        }}>
                        <Text style={{color: COLORS.WHITE, fontSize: 18}}>{selectedMessages.length} Selected</Text>
                        <TouchableOpacity onPress={deleteMessages}>
                            <Icon name="delete" type="material" color={COLORS.WHITE} size={25} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.container}>
                    {selectedImage ? (
                        <View style={styles.fullScreen}>
                            <TouchableOpacity onPress={resetImageSelection} style={styles.crossButton}>
                                <Icon name="close" size={30} color={COLORS.AKCRUBLUE} />
                            </TouchableOpacity>
                            <Image source={{uri: selectedImage}} style={styles.selectedImage} />
                            <TextInput
                                placeholder="Type a message..."
                                value={imageMessageText}
                                placeholderTextColor={'black'}
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
                            onPress={(context, message) => handleMessagePress(message)}
                            onLongPress={(context, message) => handleLongPress(message)}
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
                                        source={{
                                            uri:
                                                props.currentMessage?.user?._id === user?.id
                                                    ? user?.profilePicture
                                                    : profilePicture,
                                        }}
                                        {...props}
                                    />
                                </TouchableOpacity>
                            )}
                            renderBubble={props => (
                                <Bubble
                                    {...props}
                                    wrapperStyle={{
                                        right: {
                                            backgroundColor: selectedMessages.includes(props.currentMessage._id)
                                                ? COLORS.AKCRUBACKGROUND
                                                : COLORS.AKCRUBLUE,
                                        },
                                        left: {
                                            backgroundColor: COLORS.CATPURPDRK,
                                        },
                                    }}
                                    textStyle={{
                                        right: {color: COLORS.WHITE},
                                        left: {color: COLORS.WHITE},
                                    }}
                                />
                            )}
                        />
                    )}
                    <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerButton}>
                        <Icon name="photo" size={30} color={COLORS.AKCRUBLUE} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default CruChatComponent;
