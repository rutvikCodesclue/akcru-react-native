import React from 'react';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import AuthStack from './AuthNavigation';
import {TabContextProvider} from '../context/TabContext';

export const navigationRef = createNavigationContainerRef();

export default function RootNavigator() {
    return (
        <TabContextProvider>
            <NavigationContainer>
                <AuthStack />
            </NavigationContainer>
        </TabContextProvider>
    );
}
