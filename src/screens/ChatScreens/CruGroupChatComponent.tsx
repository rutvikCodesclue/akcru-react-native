import {useNavigation} from '@react-navigation/native';
import React, {Fragment, useEffect, useState} from 'react';
import {View, TouchableOpacity, Image, TextInput, TouchableWithoutFeedback, Alert, Text} from 'react-native';
import {Bubble, GiftedChat, IMessage} from 'react-native-gifted-chat';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import HexAvatar from '../../components/HexAvatar';
import {getCruMessages, saveTextMessage, updateMessageStatus, deleteMessage} from '../../lib/api/rooms.lib';
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
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<any[]>([]);

    const {user} = useAuthStore();
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);
    const [parentChannel, setParentChannel] = useState<RealtimeChannel | null>(null);

    
    
    membersData[user.id] = {
        profilePicture: user?.profilePicture,
        username: user?.username,
    };

    membersData[cru?.creator?.id] = {
        profilePicture: cru?.creator?.profilePicture,
        username: cru?.creator?.username,
    };

    members.forEach(member => {
        membersData[member.id] = {
            profilePicture: member.profilePicture,
            username: member.username,
        };
    });

    useEffect(() => {
        fetchMessages(cruId!);
        setupChannels(cruId);

        return () => {
            cleanupChannels();
        };
    }, []);

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
            // content: item.content,
            isCru: item.isCru,
            image:  item.imageUrl,
            user: {
                _id: item.senderId,
                name: membersData[item.senderId] ? membersData[item.senderId].username : 'Unknown User',	            },
            createdAt: new Date(item.createdAt),
        }));

        if (chatMessages.length > 0) {
            updateMessageStatus([chatMessages[0]._id]);
            setMessages(chatMessages);
        }
    };

    const messageReceived = (payload: any) => {
        if (payload.payload.senderId === user.id) return;

        const senderData = membersData[payload.payload.senderId];
        const senderName = senderData ? senderData.username : 'Unknown';

        const newMessage: IMessage = {
            _id: payload.payload.msgId,
            text: payload.payload.text,
            image: payload.payload.image,
            user: {_id: payload.payload.senderId, name: senderName},
            createdAt: new Date(),
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

    const onSendImage = async() => {
        if (!selectedImage && !imageMessageText) return;
        
        const msgId = uuid.v4();

        try {
            resetImageSelection();
            const response = await saveTextMessage(cruId, imageMessageText, user.id!, 'true', msgId, selectedImage);

            const imageUrl = response.data.imageUrl;
            const message: IMessage = {
                _id: msgId,
                text: imageMessageText,
                isCru: 'true',
                image: imageUrl,
                user: {_id: user.id, name: user.username},
                createdAt: new Date(),
            };

            if (channel) {
                channel.send({
                    type: 'broadcast',
                    event: 'groupchat',
                    payload: {image: imageUrl, text: imageMessageText, senderId: user.id, cruId, msgId},
                });
                parentChannel.send({
                    type: 'broadcast',
                    event: 'parent-cru-chat',
                    payload: {
                        image: imageUrl,
                        text: imageMessageText,
                        senderId: user.id,
                        cruId,
                        isCru: 'true',
                        msgId,
                    },
                });
            }

        setMessages(previousMessages => GiftedChat.append(previousMessages, [message]));
        playMessageSound();
    } catch (error) {
        console.error('Error sending image message:', error);
      }
    };

    const onSendText = async (messages: IMessage[] = []) => {
        if (!channel) return;

        const msgId = uuid.v4();
        const textMessage = messages[0].text!;
        const newMessage: IMessage = {
            _id: msgId,
            text: textMessage,
            user: {_id: user.id, name: user.username},
            createdAt: new Date(),
        };

        // Update local messages immediately
        setMessages(previousMessages => GiftedChat.append(previousMessages, [newMessage]));

        // Send the message
        await Promise.all([
            channel.send({
                type: 'broadcast',
                event: 'groupchat',
                payload: {text: textMessage, senderId: user.id, cruId, msgId},
            }),
            parentChannel.send({
                type: 'broadcast',
                event: 'parent-cru-chat',
                payload: {text: textMessage, senderId: user.id, cruId, msgId},
            }),
        ]);

        playMessageSound();
        saveTextMessage(cruId, textMessage, user.id!, 'true', msgId, null);
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
            // Check if the message is from the current user
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

                            // Update the UI immediately for a better user experience
                            setMessages(prevMessages =>
                                prevMessages.filter(message => !selectedMessages.includes(message._id as string)),
                            );

                            // Perform deletion from the server
                            await Promise.all(selectedMessages.map(id => deleteMessage(id)));

                            // Reset selection mode after deletion
                            setSelectedMessages([]);
                            setIsSelectionMode(false);

                            // Re-fetch messages to ensure local state is in sync
                            fetchMessages(cruId);
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
                            <View
                                style={{
                                    // flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    columnGap: 5,
                                }}>
                                <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerButton}>
                                    <Icon name="photo" size={30} color={COLORS.AKCRUBLUE} />
                                </TouchableOpacity>
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
                        </View>
                    ) : (
                        <GiftedChat
                            renderActions={() => (
                                <TouchableOpacity onPress={handleImagePick} style={{padding: 5}}>
                                    <Icon name="photo" size={30} color={COLORS.AKCRUBLUE} />
                                </TouchableOpacity>
                            )}
                            messages={messages}
                            onSend={onSendText}
                            user={{_id: user?.id!, name: user?.username}}
                            onPress={(context, message) => handleMessagePress(message)}
                            onLongPress={(context, message) => handleLongPress(message)}
                            textInputProps={{
                                style: {
                                    color: COLORS.BLACK,
                                    flex: 1,
                                    fontSize: 16,
                                    paddingVertical: 12,
                                    paddingHorizontal: 10,
                                },
                            }}
                            alwaysShowSend
                            renderSend={props => (
                                <TouchableOpacity
                                    onPress={() => {
                                        if ('onSend' in props && typeof props.onSend === 'function') {
                                            props.onSend(messages, true);
                                        } else {
                                            onSendText(messages);
                                        }
                                    }}
                                    style={{padding: 5, display: props.text?.trim().length === 0 ? 'none' : 'flex'}}>
                                    <Icon name="send" size={30} color={COLORS.AKCRUBLUE} />
                                </TouchableOpacity>
                            )}
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
                                        right: {
                                            backgroundColor: selectedMessages.includes(props.currentMessage._id)
                                                ? COLORS.AKCRUBACKGROUND // Change this to your desired selected color
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
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default CruGroupChatComponent;
