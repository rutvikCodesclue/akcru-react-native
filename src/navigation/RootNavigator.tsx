import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthStack from './AuthNavigation';
import {TabContextProvider} from '../context/TabContext';

export default function RootNavigator() {
  return (
    <TabContextProvider>
      <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
    </TabContextProvider>
    
  );
}
