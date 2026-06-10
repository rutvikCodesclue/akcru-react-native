import React, {useEffect, useRef} from 'react';
import {StatusBar, StyleSheet, View, Platform} from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import {COLORS} from './assets/constants';
import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {getPushToken, setupForceLogoutListeners} from './lib/pushNotifications';
import {sessionValidationService} from './lib/sessionValidationService';
import useAuthStore from './src/stores/auth.store';
import Castle from '@castleio/react-native-castle';
import {CASTLE_API_PK} from '@env';
import {LogBox} from 'react-native';
import {NotificationNavigation} from './src/screens/userScreens/UserNotificationTabs/NotificationNavigation';
import NoInternetAlert from './src/components/errorHandling/NoInternetAlert';
import {useNetInfo} from '@react-native-community/netinfo';
import useWatchTimeStore from './src/stores/watchTime.store';
import mobileAds from 'react-native-google-mobile-ads';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {handleDelayedAppTrackingFlow, TrackingStatus} from './lib/appTrackingTransparency';
import {isTablet} from './assets/constants/theme';
import Purchases from 'react-native-purchases';
import {syncRevenueCatAppUserId} from './src/lib/revenueCatPurchaseContext';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();
Castle.configureWithPublishableKey(CASTLE_API_PK);

function App(): JSX.Element {
    const userId = useAuthStore(state => state.user?.id);

    const initialNotificationHandled = useRef(false);
    const {isInternetReachable: isConnected} = useNetInfo();

    useEffect(() => {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        if (Platform.OS === 'ios') {
            Purchases.configure({ apiKey: process.env.REVENUE_CAT_API_KEY_IOS || "" });
        } else if (Platform.OS === 'android') {
            Purchases.configure({ apiKey: process.env.REVENUE_CAT_API_KEY_ANDROID || "" });
        }

        const initializeAdsAndTracking = async () => {
            try {
                console.log('Initializing mobile ads first...');
                // Initialize mobile ads first
                await mobileAds().initialize();
                console.log('Mobile ads initialized successfully');

                // Then request App Tracking Transparency permission with delay (iOS 14.5+)
                // Delay helps ensure the app is fully loaded before showing the ATT prompt
                console.log('Starting delayed ATT request...');
                const trackingResult = await handleDelayedAppTrackingFlow(3000); // 3 second delay
                console.log('App Tracking Permission Status:', trackingResult.status);
                console.log('Can Track User:', trackingResult.canTrack);

                // Configure ads based on tracking permission
                if (!trackingResult.canTrack) {
                    console.log('Tracking not authorized - ads will be non-personalized');
                } else {
                    console.log('Tracking authorized - ads can be personalized');
                }
            } catch (error) {
                console.error('Error initializing ads and tracking:', error);
                // Fallback: still initialize ads even if tracking fails
                try {
                    await mobileAds().initialize();
                    console.log('Fallback: Mobile ads initialized without ATT');
                } catch (adsError) {
                    console.error('Error initializing ads as fallback:', adsError);
                }
            }
        };

        initializeAdsAndTracking();
    }, []);

    const loadRewardInterval = useWatchTimeStore(state => state.loadRewardInterval);
    useEffect(() => {
        loadRewardInterval();
    }, [loadRewardInterval]);

    useEffect(() => {
        void syncRevenueCatAppUserId(userId);
    }, [userId]);

    useEffect(() => {
        if (userId) {
            async function registerAppWithFCM() {
                try {
                    await messaging().registerDeviceForRemoteMessages();

                    const token = await messaging().getToken();

                    return token;
                } catch (error) {
                    console.error('Error in FCM registration:', error);
                    return null;
                }
            }
            const checkIfRegistered = async () => {
                const token = await messaging().getToken();
                if (!token) {
                    await registerAppWithFCM();
                }
            }
            checkIfRegistered();
            const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
                // Handle force logout messages
                if (remoteMessage.data?.type === 'FORCE_LOGOUT') {
                    const { handleForceLogout } = await import('./lib/pushNotifications');
                    await handleForceLogout();
                    return;
                }

                // Handle regular notifications
                onDisplayNotification(remoteMessage);
            });

            // Handle background messages
            messaging().setBackgroundMessageHandler(async remoteMessage => {
                console.log('Message handled in the background!', remoteMessage);

                // Handle force logout in background
                if (remoteMessage.data?.type === 'FORCE_LOGOUT') {
                    const { handleForceLogout } = await import('./lib/pushNotifications');
                    await handleForceLogout();
                }
            });

            // Handle notification clicks
            messaging().onNotificationOpenedApp(remoteMessage => {
                console.log('Notification caused app to open from background state:', remoteMessage.data);

                // Handle force logout when app opened from notification
                if (remoteMessage.data?.type === 'FORCE_LOGOUT') {
                    import('./lib/pushNotifications').then(({ handleForceLogout }) => {
                        handleForceLogout();
                    });
                    return;
                }

                NotificationNavigation(remoteMessage.data, userId);
            });

            // Handle the initial notification when the app is opened from a quit state
            messaging()
                .getInitialNotification()
                .then(remoteMessage => {
                    if (remoteMessage && !initialNotificationHandled.current) {
                        console.log('Notification caused app to open from quit state:', remoteMessage.data);

                        // Handle force logout from quit state
                        if (remoteMessage.data?.type === 'FORCE_LOGOUT') {
                            import('./lib/pushNotifications').then(({ handleForceLogout }) => {
                                handleForceLogout();
                            });
                            initialNotificationHandled.current = true;
                            return;
                        }

                        NotificationNavigation(remoteMessage.data, userId);
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
            getAndSendToken(userId);

            // Initialize session validation service
            if (userId) {
                sessionValidationService.initialize();
            }

            return () => {
                unsubscribeForeground();
                unsubscribeTokenRefresh();
                // Cleanup session validation service
                sessionValidationService.destroy();
            };
        }

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
            if (type === EventType.PRESS && detail.pressAction?.id === 'default') {
                NotificationNavigation(remoteMessage.data, userId);
            }
        });
    }

    return (
        <GestureHandlerRootView style={styles.gestureRoot}>
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>
                    <NoInternetAlert />
                    <StatusBar
                        barStyle={'light-content'}
                        backgroundColor={COLORS.AKCRUBACKGROUND}
                        translucent={false} // Keep this false to maintain your current design
                    />
                    <RootNavigator />
                </SafeAreaView>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    gestureRoot: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.AKCRUBACKGROUND,
        // iPad-specific adjustments
        ...(isTablet() && {
            paddingHorizontal: 20,
            paddingTop: 10,
        }),
    },
});

export default App;
