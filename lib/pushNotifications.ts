import { FB_API_KEY, FB_APP_ID, FB_MESSAGING_SENDER_ID } from "@env";
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import { API } from "../src/clients/api.client";

// // Extracting Firebase configuration from google-services.json
const firebaseConfig = {
    apiKey: FB_API_KEY, // Your API key
    authDomain: "akcru-app.firebaseapp.com", // Constructed using project_id
    projectId: "akcru-app",
    storageBucket: "akcru-app.appspot.com",
    messagingSenderId: FB_MESSAGING_SENDER_ID, // Your project number
    appId: FB_APP_ID, // Your mobilesdk_app_id
    // Optional, if available: measurementId: "<your-measurement-id>"
};
// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// export async function getPushToken() {
//     let fcmToken = await messaging().getToken();
//     if (fcmToken) {
//         console.log('fcmToken log:', fcmToken);
//     }
// }

// This function now expects `userId` to be passed in directly.
export async function getPushToken(userId: string) {
    let deviceToken = await messaging().getToken();
    // console.log('deviceToken:', deviceToken);
    if (userId && deviceToken) {
        // Send the token to the server
        sendTokenToServer(userId, deviceToken);
    } else {
        console.error('FCM Token or User ID is undefined', {userId, deviceToken});
    }
}

// Example function to send the token to your server
export const sendTokenToServer = async (userId: string, deviceToken: string): Promise<void> => {
    // console.log('FCM Token:', deviceToken);
    // console.log('User ID:', userId);
    try {
        const response = await API.post(`/v1/auth/storeDeviceToken`, {
            userId,
            deviceToken,
        });
        // console.log('Device token sent to server:', response.data);
    } catch (error) {
        console.error('Error sending device token to server:', error);
    }
};

export async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        // console.log('Authorization status:', authStatus);
    }
}