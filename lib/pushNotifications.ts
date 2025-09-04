import { FB_API_KEY, FB_APP_ID, FB_MESSAGING_SENDER_ID } from "@env";
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import { API } from "../src/clients/api.client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RootNavigation from '../src/util/RootNavigation';
import { Alert } from 'react-native';

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

// This function now expects `userId` to be passed in directly.
export async function getPushToken(userId: string) {
    let deviceToken = await messaging().getToken();
    // console.log('deviceToken:', deviceToken);
    if (userId && deviceToken) {
        // Send the token to the server
        await sendTokenToServer(userId, deviceToken);
    } else {
        console.error('FCM Token or User ID is undefined', {userId, deviceToken});
    }
    return 
}

// Example function to send the token to your server
export const sendTokenToServer = async (userId: string, deviceToken: string): Promise<void> => {
    
    try {
        const response = await API.post(`/v1/auth/storeDeviceToken`, {
            userId,
            deviceToken,
        });
    } catch (error:any) {
        console.error("error response", error.response);
        console.error('Error sending device token to server:', error);
    }
};

export async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
}

// Handle force logout notifications
export const handleForceLogout = async () => {
    try {
        // Import auth store dynamically to avoid circular dependency
        const useAuthStore = (await import('../src/stores/auth.store')).default;
        
        // Clear all stored authentication data
        await AsyncStorage.multiRemove(['access_token', 'deviceToken']);
        
        // Call the logout method to properly clear the session
        await useAuthStore.getState().logout();
        
        // Show alert to user
        Alert.alert(
            'Session Terminated',
            'Your session has been terminated because you logged in from another device.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Navigate to signin screen
                        console.log('Attempting to navigate to Signin screen');
                        console.log('Navigation ref ready:', RootNavigation.navigationRef.isReady());
                        
                        // Try multiple navigation approaches
                        if (RootNavigation.navigationRef.isReady()) {
                            try {
                                // First try to reset the navigation stack to ensure we go to Signin
                                RootNavigation.navigationRef.reset({
                                    index: 0,
                                    routes: [{ name: 'Signin' }],
                                });
                                console.log('Navigation reset to Signin successful');
                            } catch (resetError) {
                                console.warn('Navigation reset failed, trying simple navigate:', resetError);
                                // Fallback to simple navigate
                                try {
                                    RootNavigation.navigate('Signin', {});
                                    console.log('Simple navigation to Signin successful');
                                } catch (navError) {
                                    console.error('All navigation attempts failed:', navError);
                                }
                            }
                        } else {
                            console.warn('Navigation ref not ready, retrying...');
                            // Retry with a delay
                            setTimeout(() => {
                                if (RootNavigation.navigationRef.isReady()) {
                                    RootNavigation.navigate('Signin', {});
                                } else {
                                    console.error('Navigation ref still not ready after retry');
                                }
                            }, 500);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    } catch (error) {
        console.error('Error during force logout:', error);
    }
};

// Setup message listeners for force logout
export const setupForceLogoutListeners = () => {
    // Listen for foreground messages
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground message received:', remoteMessage);
        
        if (remoteMessage.data?.type === 'FORCE_LOGOUT') {
            await handleForceLogout();
        }
    });

    // Listen for background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background message received:', remoteMessage);
        
        if (remoteMessage.data?.type === 'FORCE_LOGOUT') {
            await handleForceLogout();
        }
    });

    // Listen for notifications when app is opened from background
    const unsubscribeNotificationOpen = messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notification opened app:', remoteMessage);
        
        if (remoteMessage.data?.type === 'FORCE_LOGOUT') {
            handleForceLogout();
        }
    });

    return () => {
        unsubscribeForeground();
        unsubscribeNotificationOpen();
    };
};