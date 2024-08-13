import React, {useEffect, useRef, useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';

import RootNavigator from './src/navigation/RootNavigator';
import {COLORS} from './assets/constants';
import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {getPushToken} from './lib/pushNotifications';
import useAuthStore from './src/stores/auth.store';
import Castle from '@castleio/react-native-castle';
import {CASTLE_API_PK} from '@env';
import {LogBox} from 'react-native';
import {NotificationNavigation} from './src/screens/userScreens/UserNotificationTabs/NotificationNavigation';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();
Castle.configureWithPublishableKey(CASTLE_API_PK);

function App(): JSX.Element {
    const userId = useAuthStore(state => state.user?.id);
    const initialNotificationHandled = useRef(false);
    const [isNotifee, setIsNotifee] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [screenName, setScreenName] = useState('ClientTabNavigator');
    const [paramsVal, setParams] = useState(undefined);
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    useEffect(() => {
        async function fetchData() {
            await sleep(1000);
            setIsVisible(true)
          }
          fetchData()
        // Subscribe to foreground message handling
        const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
            onDisplayNotification(remoteMessage);
        });

        // Handle background messages
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
        });

        // Handle notification clicks
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background state:', remoteMessage.data);
            setIsNotifee(true)
            NotificationNavigation(remoteMessage.data, userId);
        });

        // Handle the initial notification when the app is opened from a quit state
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage && !initialNotificationHandled.current) {
                    console.log('Notification caused app to open from quit state:', remoteMessage.data);
                    let notife = NotificationNavigation(remoteMessage.data, userId);
                    setScreenName(notife._j['screenName'])
                    setParams(notife._j['params'])
                    setIsNotifee(true)

                    initialNotificationHandled.current = true;
                }
            });

        // Handle token refresh
        const unsubscribeTokenRefresh = messaging().onTokenRefresh(_ => {
            if (userId) {
                getPushToken(userId);
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
            ios: {
                sound: 'default',
            },
        });

        notifee.onForegroundEvent(({type, detail}) => {
            if (type === EventType.PRESS && detail.pressAction.id === 'default') {
                let screenName, paramsScreen = NotificationNavigation(remoteMessage.data, userId);
                setIsNotifee(true)
                console.log('screenName, paramsScreen', screenName, paramsScreen)
            }
        });
    }

    return (
        <View style={styles.container}>
            {isVisible ? (
                <>
            <StatusBar barStyle={'light-content'} backgroundColor={COLORS.AKCRUBACKGROUND} />

            <RootNavigator isnotifee={isNotifee} screenName={screenName} paramsval={paramsVal}/></>): null
                }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.AKCRUBACKGROUND,
    },
});

export default App;
