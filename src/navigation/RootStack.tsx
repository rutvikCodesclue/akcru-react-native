// navigation/RootStack.tsx
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthStack from './AuthNavigation';
import NoBottomTabStack from './NoBottomTabStack';

const RootStack = createNativeStackNavigator();

export default function RootStackNavigator() {
    return (
        <RootStack.Navigator screenOptions={{headerShown: false}}>
            <RootStack.Screen name="AuthStack" component={AuthStack} />
            <RootStack.Screen name="AppStack" component={NoBottomTabStack} />
        </RootStack.Navigator>
    );
}
