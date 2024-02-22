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
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import notifee from '@notifee/react-native';
import {AndroidColor} from '@notifee/react-native';
import {getPushToken, requestUserPermission} from './lib/pushNotifications'
import useAuthStore from './src/stores/auth.store';


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
const userId = useAuthStore(state => state.user?.id);



 useEffect(() => {
     // Subscribe to foreground message handling
     const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
         console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
         onDisplayNotification(remoteMessage);
     });

     // Handle background messages
     messaging().setBackgroundMessageHandler(async remoteMessage => {
         console.log('Message handled in the background!', remoteMessage);
         
     });

     // Handle notification clicks
     messaging().onNotificationOpenedApp(remoteMessage => {
         console.log('Notification caused app to open from background state:', remoteMessage.data);
     });

     // Handle the initial notification when the app is opened from a quit state
     messaging()
         .getInitialNotification()
         .then(remoteMessage => {
             if (remoteMessage) {
                 console.log('Notification caused app to open from quit state:', remoteMessage.data);
             }
         });

     // Handle token refresh
     const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
         if (userId) {
             getPushToken(userId); // This function needs to update the token on your server
         }
     });

     // Initial token registration
     if (userId) {
         getAndSendToken(userId);
     }

     // Cleanup subscriptions
     return () => {
         unsubscribeForeground();
         unsubscribeTokenRefresh();
     };
 }, [userId]);

 const getAndSendToken = async (userId: string) => {
     const token = await messaging().getToken();
     if (token) {
         getPushToken(userId); // This function needs to update the token on your server
     }
 };

 async function onDisplayNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
     await notifee.requestPermission();
     const channelId = await notifee.createChannel({
         id: 'default',
         name: 'Default Channel',
     });

     await notifee.displayNotification({
         title: remoteMessage.notification?.title || 'Notification Title',
         body: remoteMessage.notification?.body || 'Main body content of the notification',
         android: {
             channelId,
             smallIcon: 'ic_launcher_round',
             pressAction: {
                 id: 'default',
             },
         },
     });
 }


            
        
            // useEffect(() => {
            //     // Handle foreground messages
            //     const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
            //         console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
            //         // Display a notification based on the content of the FCM message
            //         onDisplayNotification(remoteMessage);
            //     });

            //     // Handle background messages and notification clicks
            //     messaging().setBackgroundMessageHandler(async remoteMessage => {
            //         console.log('Message handled in the background!', remoteMessage);
            //         // Handling for background messages if needed
            //     });

            //     messaging().onNotificationOpenedApp(remoteMessage => {
            //         console.log('Notification caused app to open from background state:', remoteMessage.data);
            //         // Navigate to a specific screen based on the notification
            //     });

            //     messaging()
            //         .getInitialNotification()
            //         .then(remoteMessage => {
            //             if (remoteMessage) {
            //                 console.log('Notification caused app to open from quit state:', remoteMessage.data);
            //                 // Handle the initial notification, e.g., navigate to a specific screen
            //             }
            //         });

            //     // getPushToken(userId);

            //     // Cleanup
            //     return () => {
            //         unsubscribeForeground();
            //     };
            // }, []);

            // async function onDisplayNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
            //     // Request permissions (required for iOS)
            //     await notifee.requestPermission();

            //     // Create a channel (required for Android)
            //     const channelId = await notifee.createChannel({
            //         id: 'default',
            //         name: 'Default Channel',
            //     });

            //     // Customize the notification based on `remoteMessage` if needed
            //     // For example, use remoteMessage.notification.title and remoteMessage.notification.body
            //     await notifee.displayNotification({
            //         title: remoteMessage.notification?.title || 'Notification Title',
            //         body: remoteMessage.notification?.body || 'Main body content of the notification',
            //         android: {
            //             channelId,
            //             smallIcon: 'ic_launcher_round', // Specify your icon's resource name here
            //             pressAction: {
            //                 id: 'default',
            //                 launchActivity: 'default',
            //             },
            //         },
            //     });
            // }

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
