import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthStack from './AuthNavigation';

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
}
