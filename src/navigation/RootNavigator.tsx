import React from 'react';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import AuthStack from './AuthNavigation';
import {TabContextProvider} from '../context/TabContext';

// Define the deep link prefix
const DEEP_LINK_PREFIX = 'akcruapp://';

const linking = {
    prefixes: [DEEP_LINK_PREFIX],
    config: {
        screens: {
            ResetPassword: 'reset-password',
            OTPVerification: 'otp-verification',
            // Define other screens and paths as needed
        },
    },
};

// Create a navigation ref
export const navigationRef = createNavigationContainerRef();

export default function RootNavigator() {
    return (
        <TabContextProvider>
            <NavigationContainer ref={navigationRef} linking={linking}>
                <AuthStack />
            </NavigationContainer>
        </TabContextProvider>
    );
}
