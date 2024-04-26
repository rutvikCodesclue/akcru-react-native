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
import Castle from "@castleio/react-native-castle";

import { CASTLE_API_PK, DEV_API_URL } from "@env";
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();
Castle.configureWithPublishableKey(CASTLE_API_PK);


function App(): JSX.Element {
    

const userId = useAuthStore(state => state.user?.id);



 useEffect(() => {
     // Subscribe to foreground message handling
     const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
         //console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
         onDisplayNotification(remoteMessage);
     });

     // Handle background messages
     messaging().setBackgroundMessageHandler(async remoteMessage => {
         //console.log('Message handled in the background!', remoteMessage);
         
     });

     // Handle notification clicks
     messaging().onNotificationOpenedApp(remoteMessage => {
         //console.log('Notification caused app to open from background state:', remoteMessage.data);
     });

     // Handle the initial notification when the app is opened from a quit state
     messaging()
         .getInitialNotification()
         .then(remoteMessage => {
             if (remoteMessage) {
                 //console.log('Notification caused app to open from quit state:', remoteMessage.data);
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
