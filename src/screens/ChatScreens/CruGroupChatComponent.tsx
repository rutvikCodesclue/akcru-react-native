import {useNavigation} from '@react-navigation/native';
import React, {Fragment, useEffect, useState} from 'react';
import {useHideBottomTabBarWhileFocused} from './useHideBottomTabBarWhileFocused';
import {
    View,
    TouchableOpacity,
    Image,
    TextInput,
    TouchableWithoutFeedback,
    Alert,
    Text,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
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
import { handleError } from '../../util/handleError';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useKeyboardBottomInset} from '../../hooks/useKeyboardBottomInset';

const CruGroupChatComponent = ({cru, members}: any) => {
    const insets = useSafeAreaInsets();
    const keyboardBottomInset = useKeyboardBottomInset();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
        useHideBottomTabBarWhileFocused(navigation);
    const cruId = cru.id || null;
    const [membersData, setMembersData] = useState({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageMessageText, setImageMessageText] = useState('');
    const [text, setText] = useState('');
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
        try {
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
    } catch (error) {
        console.log("Error fetching Cru Messages:", error);

        handleError('Failed to fetch Cru messages. Please try again.');
    }
    };

    const messageReceived = (payload: any) => {
        if (payload.payload.deleteid != ""){
            const deletemsgid =payload.payload.deleteid
            setMessages(prevMessages =>
                prevMessages.filter(message => deletemsgid != message._id ),
            );
            return
        }
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
                    payload: {image: imageUrl, text: imageMessageText, senderId: user.id, cruId, msgId, deleteid:""},
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

    const handleSendMessage = () => {
        if (text.trim().length > 0) {
          onSendText([{ text, user: { _id: user.id } }]);
          setText('');
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
                payload: {text: textMessage, senderId: user.id, cruId, msgId, deleteid:""},
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
            'dfgdfgfgdfgAre you sure you want to delete the selected messages?',
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

                            setMessages(prevMessages =>
                                prevMessages.filter(message => !selectedMessages.includes(message._id as string)),
                            );
                            const payload = {image: "", text: "", senderId: "", cruId, msgId:"", deleteid:selectedMessages[0]}
                            channel?.send(
                                {
                                    type: 'broadcast',
                                    event: 'groupchat',
                                    payload: payload,
                                }
                            )

                            await Promise.all(selectedMessages.map(id => deleteMessage(id)));

                            setSelectedMessages([]);
                            setIsSelectionMode(false);

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

    const screenContent = (
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
                            <Icon name="delete" color={COLORS.WHITE} size={25} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.container}>
                    {selectedImage ? (
                        <KeyboardAvoidingView
                            style={{flex: 1}}
                            behavior={Platform.OS === 'android' ? 'height' : 'padding'}
                            enabled={Platform.OS === 'android'}>
                        <View style={{flex: 1}}>
                            <ScrollView
                                style={{flex: 1}}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={{
                                    flexGrow: 1,
                                    padding: 10,
                                    alignItems: 'center',
                                }}>
                                <TouchableOpacity onPress={resetImageSelection} style={styles.crossButton}>
                                    <Icon name="close" size={30} color={COLORS.AKCRUBLUE} />
                                </TouchableOpacity>
                                <Image source={{uri: selectedImage}} style={styles.selectedImage} />
                            </ScrollView>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    columnGap: 5,
                                    paddingHorizontal: 10,
                                    paddingTop: 8,
                                    paddingBottom:
                                        keyboardBottomInset + Math.max(insets.bottom, 8),
                                    width: '100%',
                                }}>
                                <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerButton}>
                                    <Icon name="photo" size={30} color={COLORS.AKCRUBLUE} />
                                </TouchableOpacity>
                                <TextInput
                                    placeholder="Type a message..."
                                    value={imageMessageText}
                                    placeholderTextColor={COLORS.BLACK}
                                    onChangeText={setImageMessageText}
                                    style={styles.textInput}
                                />
                                <TouchableOpacity onPress={onSendImage} style={styles.sendButton}>
                                    <Icon name="send" size={30} color={COLORS.AKCRUBLUE} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        </KeyboardAvoidingView>
                    ) : (
                        <GiftedChat
                            renderActions={() => (
                                <TouchableOpacity onPress={handleImagePick} style={{padding: Platform.OS=="android"?10:5}}>
                                    <Icon name="photo" size={30} color={COLORS.AKCRUBLUE} />
                                </TouchableOpacity>
                            )}
                            messages={messages}
                            onSend={onSendText}
                            user={{_id: user?.id!, name: user?.username}}
                            onPress={(context, message) => handleMessagePress(message)}
                            onLongPress={(context, message) => handleLongPress(message)}
                            textInputProps={{
                                value: text,
                                onChangeText: setText,
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
                                <TouchableOpacity onPress={handleSendMessage} style={{padding: Platform.OS=="android"?10:5}}>
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
                                        rotateFrameDegrees={90}
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
    );

    return selectedImage ? (
        screenContent
    ) : (
        <TouchableWithoutFeedback onPress={handleScreenPress}>{screenContent}</TouchableWithoutFeedback>
    );
};

export default CruGroupChatComponent;
