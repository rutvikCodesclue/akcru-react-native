import React from 'react';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import AuthStack from './AuthNavigation';
import {TabContextProvider} from '../context/TabContext';

// export const navigationRef = createNavigationContainerRef();
import {navigationRef} from '../util/RootNavigation';

export default function RootNavigator() {
    return (
        <TabContextProvider>
            <NavigationContainer ref={navigationRef}>
                <AuthStack />
            </NavigationContainer>
        </TabContextProvider>
    );
}
