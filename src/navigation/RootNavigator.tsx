import React, {useEffect, useRef} from 'react';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import AuthStack, {AuthStackParams} from './AuthNavigation';
import {TabContextProvider} from '../context/TabContext';
import {Alert, Linking} from 'react-native';
import {verifyAdPurchaseSession} from '../lib/api/adPurchase.lib';

export default function RootNavigator(params: any) {
    const navigationRef = useRef<NavigationContainerRef<AuthStackParams>>(null);

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
                        navigationRef.current?.navigate('NoBottomStack', {
                            screen: 'AdPurchaseSuccessScreen',
                            params: {sessionId},
                        });
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
                <AuthStack params={params} />
            </NavigationContainer>
        </TabContextProvider>
    );
}
