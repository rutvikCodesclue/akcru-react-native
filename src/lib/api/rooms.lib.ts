import { IMessage } from "react-native-gifted-chat";
import { IChatType, IChatUser } from "../../../types";
import { API } from "../../clients/api.client";
import useAuthStore from "../../stores/auth.store";

export const getMyRoom = async () => {
    try {
        // GET /v1/rooms/me
        const { data } = await API.get(`/v1/rooms/me`, {});
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const getMyMITRoom = async () => {
    try {
        // GET /v1/rooms/me
        const { data } = await API.get(`/v1/rooms/mit/me`);
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const createRoom = async () => {
    try {
        // GET /v1/rooms/create
        const { data } = await API.post(`/v1/rooms/create`, {});
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const saveTextMessage = async (roomId:string,content:string, receiverId: string): Promise< undefined> => {
    try {
        // POST /v1/cru/me/add-user
        const param = {roomId,content, receiverId};


        const {data} = await API.post(`/v1/realtime/create-room-message`,param);
        return data;
    } catch (error) {
    }
};


export const getUsers = async(): Promise<IChatUser[]| undefined> =>{
    try {
        // POST /v1/cru/me/add-user
        const {data} = await API.post(`/v1/rooms/chats`,{});
        // console.log('getUsers:',data);
        return data.room;
    } catch (error) {
        console.error(error);
    }
}
export const getTextMessages  = async (roomId:String): Promise<  IMessage[]| undefined> => {
    try {
        // POST /v1/cru/me/add-user
        const {data} = await API.get(`/v1/rooms/messages/${roomId}`);
        const messages: IChatType[] = data.messages;
        var chatMessage : IMessage[] = []
        messages.forEach(  (item) => {
            const iMessage : IMessage = {
                _id: item.id,
                text: item.content,
                user: { _id: item.senderId,},
                createdAt: new  Date(item.createdAt),
            };
            chatMessage.push(iMessage);
        })
        return chatMessage;
    } catch (error) {
        console.error(error);
    }
}

export const createChatRoom = async (userId:string,mitInviteId:string) => {
    try {
        const { data } = await API.post(`/v1/rooms/private/create`, {'user2': userId,'mitInviteId':mitInviteId});
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const joinMyRoom = async () => {
    try {
        // POST /v1/rooms/join/me
        const { data } = await API.post(`/v1/rooms/join/me`);
        // return the room auth token to be used for joining the room (as a HOST)
        return data.roomAuthToken.token;
    } catch (error) {
        console.error(error);
    }
}

export const joinMyMITRoom = async () => {
    try {
        // POST /v1/rooms/mit/join/me
        const { data } = await API.post(`/v1/rooms/mit/join/me`);
        // return the room auth token to be used for joining the room (as a HOST)
        return data.roomAuthToken.token;
    } catch (error) {
        console.error(error);
    }
}

export const joinARoom = async (cruId: string) => {
    try {
        // POST /v1/rooms/join
        // same as joinMyRoom, but with specific prisma cruId
        const { data } = await API.post(`/v1/rooms/join`, { cruId });
        // return the room auth token to be used for joining the room (as a MEMBER)
        return data.roomAuthToken.token;
    } catch (error) {
        console.error(error);
    }
}

export const joinMITRoom = async (inviteId: string) => {
    try {
        // POST /v1/rooms/mit/join
        // same as joinARoom, but with specific inviteId
        const { data } = await API.post(`/v1/rooms/mit/join`, { inviteId });
        // return the room auth token to be used for joining the room (as a MEMBER)
        return data.roomAuthToken.token;
    } catch (error) {
        console.error(error);
    }
}