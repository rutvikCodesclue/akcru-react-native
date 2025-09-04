import React, {useEffect, useRef} from 'react';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import AuthStack, {AuthStackParams} from './AuthNavigation';
import {TabContextProvider} from '../context/TabContext';
import {Alert, Linking} from 'react-native';
import {verifyAdPurchaseSession} from '../lib/api/adPurchase.lib';
import { PostHogProvider } from 'posthog-react-native'
import {POSTHOG_API_KEY} from '@env';
import {navigationRef} from '../util/RootNavigation';

export default function RootNavigator(params: any) {

    useEffect(() => {
        const handleUrl = async (event: {url: string}) => {
            const url = event.url;
            if (url.startsWith('akcruapp://ad-success')) {
                const sessionId = new URL(url).searchParams.get('session_id');
                if (sessionId) {
                    try {
                        await verifyAdPurchaseSession(sessionId);
                        Alert.alert('Success', 'Your AD purchase was verified!');
                        console.log('Deep link verification successful');
                        if (navigationRef.isReady()) {
                            navigationRef.navigate('NoBottomStack', {
                                screen: 'AdPurchaseSuccessScreen',
                                params: {sessionId},
                            });
                        }
                    } catch (err) {
                        Alert.alert('Verification Failed', 'Could not verify your purchase.');
                        console.error('Deep link verification error:', err);
                    }
                }
            }
        };

        const sub = Linking.addEventListener('url', handleUrl);

        // If app was launched from a deep link (cold start)
        Linking.getInitialURL().then(url => {
            if (url && url.startsWith('akcruapp://ad-success')) {
                handleUrl({url});
            }
        });

        return () => sub.remove();
    }, []);

    return (
        <TabContextProvider>
            <NavigationContainer
                ref={navigationRef}
                linking={{
                    prefixes: ['akcruapp://'],
                    config: {
                        screens: {
                            NoBottomStack: {
                                screens: {
                                    AdPurchaseSuccessScreen: 'ad-success',
                                },
                            },
                        },
                    },
                }}>
            <PostHogProvider apiKey={POSTHOG_API_KEY} options={{
            host: "https://us.i.posthog.com",
            
            // check https://posthog.com/docs/session-replay/installation?tab=React+Native
            // for more config and to learn about how we capture sessions on mobile
            // and what to expect
            enableSessionReplay: true,
            sessionReplayConfig: {
                // Whether text inputs are masked. Default is true.
                // Password inputs are always masked regardless
                maskAllTextInputs: false,
                // Whether images are masked. Default is true.
                maskAllImages: false,
                // Capture logs automatically. Default is true.
                // Android only (Native Logcat only)
                captureLog: true,
                // Whether network requests are captured in recordings. Default is true
                // Only metric-like data like speed, size, and response code are captured.
                // No data is captured from the request or response body.
                // iOS only
                captureNetworkTelemetry: true,
                // Deboucer delay used to reduce the number of snapshots captured and reduce performance impact. Default is 1000ms
                androidDebouncerDelayMs: 1000,
                // Deboucer delay used to reduce the number of snapshots captured and reduce performance impact. Default is 1000ms
                iOSdebouncerDelayMs: 1000,
            },
        }}>
                <AuthStack params={params} />
                </PostHogProvider>
            </NavigationContainer>
        </TabContextProvider>
    );
}
