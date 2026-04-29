import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
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
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
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
import { handleError } from '../../util/handleError';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useKeyboardBottomInset} from '../../hooks/useKeyboardBottomInset';
import LinearGradient from 'react-native-linear-gradient';

const CruChatComponent = ({route}: any) => {
    const insets = useSafeAreaInsets();
    const keyboardBottomInset = useKeyboardBottomInset();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const userID: string | undefined = route.params?.userId ?? null;
    const {profilePicture} = route.params;
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<any[]>([]);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageMessageText, setImageMessageText] = useState('');
    const [text, setText] = useState('');
    const initialMessage: string = route.params?.initialMessage ?? '';
    const {user} = useAuthStore();

    const mItInviteId: string | undefined = route.params?.mItInviteId ?? null;
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    useEffect(() => {
        fetchMessages(mItInviteId!);
        setupChannels(mItInviteId!);

        return () => {
            cleanupChannels();
        };
    }, []);

    useEffect(() => {
        if (initialMessage && initialMessage.trim().length > 0) {
            setText(initialMessage);
        }
    }, [initialMessage]);


    const setupChannels = (cruId: string) => {
        const channelA = supabase.channel(mItInviteId);
        channelA
            .on('broadcast', {event: 'test'}, messageReceived)
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    setChannel(channelA);
                }
            });
    }

    const cleanupChannels = () => {
        if (channel) channel.unsubscribe();
        setChannel(null);
    };

    const fetchMessages = async (mItInviteId: string) => {
        try {
        const response = await getMitMessages(mItInviteId!);

        const chatMessages: IMessage[] = response!.map(item => ({
                _id: item.id,
                text: item.content,
                image: item.imageUrl,
                isCru: item.isCru,
                user: {
                    _id: item.senderId,
                    name: route.params.username,
                },
                createdAt: new Date(item.createdAt),
            }));

            if (chatMessages.length > 0) {
                updateMessageStatus([chatMessages[0]._id]);
                setMessages(chatMessages);
        }
        } catch (error) {
            console.error("Error fetching messages.", error);

            handleError('Failed to fetch messages. Please try again.');
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
        // if (payload.payload.senderId === userID) return;

        const newMessage: IMessage = {
            _id: payload.payload.msgId || uuid.v4(),
            text: payload.payload.text,
            image: payload.payload.image,
            isCru: payload.payload.isCru,
            user: {_id: userID!, name: route.params.username },
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

        try {
            resetImageSelection();
            const response = await saveTextMessage(mItInviteId, imageMessageText, userID!, 'false', msgId, selectedImage);
            const imageUrl = response.data.imageUrl;

            const message: IMessage = {
                _id: msgId,
                text: imageMessageText,
                isCru: 'false',
                image: imageUrl,
                user: {_id: user.id, name: user.username},
                createdAt: new Date(),
            };

            if (channel) {
                channel.send({
                    type: 'broadcast',
                    event: 'test',
                    payload: {
                        image: imageUrl,
                        text: imageMessageText,
                        senderId: user.id,
                        mItInviteId,
                        isCru: 'false',
                        msgId,
                        deleteid:"",
                    },
                });
            }
            setMessages(previousMessages => GiftedChat.append(previousMessages, [message]));
            // await deleteMessage(msgId); // Use appropriate method to delete

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
        const isCru = 'false';
        if (!channel || messages.length === 0) return;

        const msgId = uuid.v4();
        const textMessage = messages[0].text!;

        const newMessage: IMessage = {
            _id: msgId,
            text: textMessage,
            user: {_id: user.id, name: user.username},
            createdAt: new Date(),
        };
        setMessages(previousMessages => GiftedChat.append(previousMessages, [newMessage]));

        try {
            await channel.send({
                type: 'broadcast',
                event: 'test',
                payload: {text: textMessage, senderId: user.id, mItInviteId, isCru: 'false', msgId, image: null, deleteid:""},
            });

            playMessageSound();
            // Update local messages immediately
            saveTextMessage(mItInviteId, textMessage, userID!, 'false', msgId, null);
            // Immediately delete the message after sending
            // await deleteMessage(msgId); // Use appropriate method to delete
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

                            const payload = {image: "", text: "", senderId: "", mItInviteId, msgId:"", deleteid:selectedMessages[0]}
                            channel?.send(
                                {
                                    type: 'broadcast',
                                    event: 'test',
                                    payload: payload,
                                }
                            )

                            // Perform deletion from the server
                            await Promise.all(selectedMessages.map(id => deleteMessage(id)));

                            // Reset selection mode after deletion
                            setSelectedMessages([]);
                            setIsSelectionMode(false);

                            // Re-fetch messages to ensure local state is in sync
                            fetchMessages(mItInviteId);
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
            <View style={{flex: 1, backgroundColor: COLORS.BLACK}}>
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
                            behavior={Platform.OS === 'android' ? 'height' : undefined}
                            enabled={Platform.OS === 'android'}>
                        <View
                            style={{
                                flex: 1,
                                minHeight: 0,
                                paddingBottom:
                                    keyboardBottomInset + Math.max(insets.bottom, 8),
                            }}>
                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                style={{flex: 1}}
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
                                    paddingBottom: 8,
                                    width: '100%',
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
                        </KeyboardAvoidingView>
                    ) : (
                        <GiftedChat
                            messages={messages}
                            onSend={onSendText}
                            user={{_id: user?.id!, name: user?.username}}
                            messagesContainerStyle={{backgroundColor: COLORS.BLACK}}
                            listViewProps={{
                                style: {backgroundColor: COLORS.BLACK},
                                contentContainerStyle: {backgroundColor: COLORS.BLACK},
                            }}
                            onPress={(context, message) => handleMessagePress(message)}
                            onLongPress={(context, message) => handleLongPress(message)}
                            renderActions={() => (
                                <TouchableOpacity onPress={handleImagePick} style={{padding: Platform.OS=="android"?10:5}}>
                                    <Icon name="photo" size={30} color={COLORS.AKCRUBLUE} />
                                </TouchableOpacity>
                            )}
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
                            renderUsernameOnMessage={false}
                            showUserAvatar={true}
                            renderAvatar={props => (
                                <TouchableOpacity onPress={() => handleAvatarPress(props.currentMessage?.user)}>
                                    <HexAvatar
                                        size={38}
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
                                <View
                                    style={{
                                        maxWidth: '84%',
                                        alignSelf:
                                            props.currentMessage?.user?._id === user?.id
                                                ? 'flex-end'
                                                : 'flex-start',
                                        marginVertical: 2,
                                    }}>
                                    <LinearGradient
                                        colors={
                                            props.currentMessage?.user?._id === user?.id
                                                ? ['#705D28', '#B57C3C', '#9763E0']
                                                : ['#67D8FF', '#8F6DFF', '#D288FF']
                                        }
                                        start={{x: 0, y: 0}}
                                        end={{x: 1, y: 1}}
                                        style={{borderRadius: 18, padding: 1}}>
                                        <View
                                            style={{
                                                borderRadius: 17,
                                                backgroundColor: selectedMessages.includes(props.currentMessage._id)
                                                    ? 'rgba(40,40,40,0.95)'
                                                    : 'rgba(8, 6, 16, 0.92)',
                                                overflow: 'hidden',
                                                paddingHorizontal: 10,
                                                paddingTop: 7,
                                                paddingBottom: 5,
                                            }}>
                                            {props.currentMessage?.text ? (
                                                <Text style={{color: COLORS.WHITE, fontSize: 15, lineHeight: 20}}>
                                                    {props.currentMessage.text}
                                                </Text>
                                            ) : null}
                                            <Text
                                                style={{
                                                    color: 'rgba(255,255,255,0.72)',
                                                    fontSize: 11,
                                                    marginTop: 2,
                                                    textAlign:
                                                        props.currentMessage?.user?._id === user?.id
                                                            ? 'right'
                                                            : 'left',
                                                }}>
                                                {new Date(props.currentMessage?.createdAt || Date.now()).toLocaleTimeString([], {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                })}
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </View>
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

export default CruChatComponent;
