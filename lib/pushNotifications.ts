import { FB_API_KEY, FB_APP_ID, FB_MESSAGING_SENDER_ID } from "@env";
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';

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

export async function getPushToken() {
    let fcmToken = await messaging().getToken();
    if (fcmToken) {
        console.log('fcmToken log:', fcmToken);
    }
}