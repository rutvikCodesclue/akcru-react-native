/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
  Alert,
  Linking,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';


import RootNavigator from './src/navigation/RootNavigator';
import { COLORS, FONTS } from './assets/constants';
import { FB_API_KEY, FB_APP_ID, FB_MESSAGING_SENDER_ID } from '@env';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import notifee from '@notifee/react-native';
import {AndroidColor} from '@notifee/react-native';
import {getPushToken} from './lib/pushNotifications'

// // Extracting Firebase configuration from google-services.json
// const firebaseConfig = {
//     apiKey: FB_API_KEY, // Your API key
//     authDomain: "akcru-app.firebaseapp.com", // Constructed using project_id
//     projectId: "akcru-app",
//     storageBucket: "akcru-app.appspot.com",
//     messagingSenderId: FB_MESSAGING_SENDER_ID, // Your project number
//     appId: FB_APP_ID, // Your mobilesdk_app_id
//     // Optional, if available: measurementId: "<your-measurement-id>"
// };

// Initialize Firebase
// if (!firebase.apps.length) {
//     firebase.initializeApp(firebaseConfig);
// }

function App(): JSX.Element {
    // Deep link handling function
    // const handleDeepLink = (event: { url: string; }) => {
    //     const url = event.url;
    //     console.log('Received deep link URL:', url);

    //     // Manually extract access token and type from the URL
    //     const accessTokenMatch = url.match(/access_token=([^&]+)/);
    //     const typeMatch = url.match(/type=([^&]+)/);
    //     const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
    //     const type = typeMatch ? typeMatch[1] : null;

    //     if (navigationRef.current && 'navigate' in navigationRef.current) {
    //         navigationRef.current.navigate('ResetPassword', {accessToken});
    //     }

    //     // Handle other types of deep links as needed
    // };

    // useEffect(() => {
    //     // Handle the initial URL
    //     Linking.getInitialURL()
    //         .then(url => {
    //             if (url) {
    //                 handleDeepLink({url});
    //             }
    //         })
    //         .catch(err => console.error('An error occurred', err));

    //     // Add event listener for new incoming links
    //     const urlEventListener = Linking.addEventListener('url', handleDeepLink);

    //     // Cleanup the event listener
    //     return () => {
    //         urlEventListener.remove();
    //     };
    // }, []);

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
            onDisplayNotification()
        });
        // Register background handler
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
        });

        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background state:', remoteMessage.data);
        });

        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log('Notification caused app to open from quit state:', remoteMessage.data);
                }
            });
        getPushToken();
        return unsubscribe;
    }, []);

    // async function pushNotifications() {
    //     let fcmToken = await messaging().getToken();
    //     if (fcmToken) {
    //         console.log('fcmToken log:', fcmToken);
    //     }
    // }

        
            async function onDisplayNotification() {
                // Request permissions (required for iOS)
                await notifee.requestPermission();
                getPushToken();
                // Create a channel (required for Android)
                const channelId = await notifee.createChannel({
                    id: 'default',
                    name: 'Default Channel',
                });

                // Display a notification
                await notifee.displayNotification({
                    title: 'Notification Title',
                    body: 'Main body content of the notification',
                    android: {
                        channelId,
                        // smallIcon: "AkcruHexLogo.png", // optional, defaults to 'ic_launcher'.
                        // pressAction is needed if you want the notification to open the app when pressed
                        pressAction: {
                            id: 'default',
                        },
                    },
                });
            }
        


    return (
        <View style={styles.container}>
            <StatusBar barStyle={'light-content'} backgroundColor={COLORS.AKCRUBACKGROUND} />
            <RootNavigator />
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.AKCRUBACKGROUND
    
  },
});

export default App;
