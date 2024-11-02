import {IMessage} from 'react-native-gifted-chat';
import {IChatType, IChatUser} from '../../../types';
import {API} from '../../clients/api.client';

export const getMyRoom = async () => {
    try {
        const {data} = await API.get('/v1/rooms/me', {});
        return data;
    } catch (error) {
        console.error(error);
    }
};

export const getMyMITRoom = async () => {
    try {
        const {data} = await API.get('/v1/rooms/mit/me');
        return data;
    } catch (error) {
        console.error(error);
    }
};

export const createRoom = async () => {
    try {
        const {data} = await API.post('/v1/rooms/create', {});
        return data;
    } catch (error) {
        console.error(error);
    }
};

export const saveTextMessage = async (
    roomId: string,
    content: string,
    receiverId: string,
    isCru: string,
    msgId: string,
    imageUrl: string | null,
) => {
    const formData = new FormData();

    formData.append('roomId', roomId);
    formData.append('content', content);
    formData.append('receiverId', receiverId);
    formData.append('isCru', isCru);
    formData.append('msgId', msgId);

    if (imageUrl) {
        const fileExtension = imageUrl.split('.').pop();
        const file = {
            uri: imageUrl,
            type: `image/${fileExtension}`,
            name: `image_${Date.now()}.${fileExtension}`,
        };
        formData.append('file', file);
    }

    try {
        console.log('form Data:', formData);
        const response = await API.post('/v1/realtime/create-room-message', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('File:', response.data.imageUrl);
        return response;
    } catch (error) {
        console.error('Error saving message:', error);
        throw error; // Rethrow error for upstream handling if necessary
    }
};

export const getUnread = async (cruIds: String[]): Promise<undefined> => {
    try {
        const param = {cruIds};

        const {data} = await API.post('/v1/realtime/get-unread', param);
        return data;
    } catch (error) {}
};

export const updateMessageStatus = async (messageIds: String[]): Promise<undefined> => {
    try {
        const param = {messageIds};

        const {data} = await API.post('/v1/realtime/read_message', param);
        return data;
    } catch (error) {}
};

export const getUsers = async (): Promise<IChatUser[] | undefined> => {
    try {
        const {data} = await API.post('/v1/rooms/chats', {});

        return data.room;
    } catch (error) {
        console.error(error);
    }
};
export const getMitMessages = async (roomId: String): Promise<IMessage[] | undefined> => {
    try {
        const {data} = await API.get(`/v1/rooms/messages/${roomId}`);
        // const messages: IChatType[] = data.messages;
        // console.log('MIT messages data:', data);
        const messages: IChatType[] = data.messages;

        // var chatMessage: IMessage[] = [];
        // messages.forEach(item => {
        //     const iMessage: IMessage = {
        //         _id: item.id,
        //         text: item.content,
        //         user: {_id: item.senderId},
        //         createdAt: new Date(item.createdAt),
        //     };
        //     chatMessage.push(iMessage);
        // });
        return messages;
    } catch (error) {
        console.error(error);
    }
};

export const getCruMessages = async (roomId: String): Promise<IMessage[] | undefined> => {
    try {
        const {data} = await API.get(`/v1/rooms/messages/${roomId}`);
        // console.log('Cru messages data:', data);

        // Assuming data.messages contains the array of messages
        const messages: IChatType[] = data.messages;

        return messages;
    } catch (error) {
        console.error(error);
    }
};

export const createChatRoom = async (userId: string, mitInviteId: string) => {
    try {
        const {data} = await API.post('/v1/rooms/private/create', {user2: userId, mitInviteId: mitInviteId});
        return data;
    } catch (error) {
        console.error(error);
    }
};

export const joinMyRoom = async () => {
    try {
        const {data} = await API.post('/v1/rooms/join/me');

        return data.roomAuthToken.token;
    } catch (error) {
        console.error(error);
    }
};

export const joinMyMITRoom = async () => {
    try {
        const {data} = await API.post('/v1/rooms/mit/join/me');

        return data.roomAuthToken.token;
    } catch (error) {
        console.error(error);
    }
};

export const joinARoom = async (cruId: string) => {
    try {
        const {data} = await API.post('/v1/rooms/join', {cruId});

        return data.roomAuthToken.token;
    } catch (error) {
        console.error(error);
    }
};

export const joinMITRoom = async (inviteId: string) => {
    try {
        const {data} = await API.post('/v1/rooms/mit/join', {inviteId});

        return data.roomAuthToken.token;
    } catch (error) {
        console.error(error);
    }
};

export const deleteMessage = async (messageId: string): Promise<undefined> => {
    try {
        // Make a DELETE request to the API with the messageId
        const {data} = await API.delete(`/v1/rooms/message/${messageId}`);

        return data;
    } catch (error) {
        console.error('Error deleting message:', error);
    }
};
