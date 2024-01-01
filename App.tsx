/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
  Linking,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';


import RootNavigator, {navigationRef} from './src/navigation/RootNavigator';
import { COLORS, FONTS } from './assets/constants';

function App(): JSX.Element {
    // Deep link handling function
    const handleDeepLink = (event: { url: string; }) => {
        const url = event.url;
        console.log('Received deep link URL:', url);

        // Manually extract access token and type from the URL
        const accessTokenMatch = url.match(/access_token=([^&]+)/);
        const typeMatch = url.match(/type=([^&]+)/);
        const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
        const type = typeMatch ? typeMatch[1] : null;

        if (navigationRef.current && 'navigate' in navigationRef.current) {
            navigationRef.current.navigate('ResetPassword', {accessToken});
        }

        // Handle other types of deep links as needed
    };

    useEffect(() => {
        // Handle the initial URL
        Linking.getInitialURL()
            .then(url => {
                if (url) {
                    handleDeepLink({url});
                }
            })
            .catch(err => console.error('An error occurred', err));

        // Add event listener for new incoming links
        const urlEventListener = Linking.addEventListener('url', handleDeepLink);

        // Cleanup the event listener
        return () => {
            urlEventListener.remove();
        };
    }, []);

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
