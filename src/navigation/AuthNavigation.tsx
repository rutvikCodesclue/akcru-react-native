import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import { COLORS } from '../../assets/constants';
import Signin from '../screens/loginScreens/Signin';
import ForgotPassword from '../screens/loginScreens/resetPassword';
import Signup from '../screens/loginScreens/Signup';
import ClientTabNavigator from './ClientTabNavigator';
import { ClientStack } from './ClientStack';
import NoBottomStack from './NoBottomTabStack';



export type AuthStackParams = {
  Signin: any;
  Signup: any;
  ForgotPassword: any;
  ClientTabNavigator: any;
  ClientStack: any;
  NoBottomStack: any;
};

const Auth = createStackNavigator<AuthStackParams>();

export default function AuthStack() {
  return (
    <Auth.Navigator
      screenOptions={{
        animationEnabled: true,
        cardOverlayEnabled: true,
        cardStyle: {backgroundColor: COLORS.AKCRUBACKGROUND},
      }}>
      <Auth.Screen
        name="Signin"
        component={Signin}
        options={{
          headerShown: false,
          gestureDirection: 'horizontal',
        }}
      />
      <Auth.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{
          headerShown: false,
          gestureDirection: 'horizontal',
        }}
      />
      <Auth.Screen
        name="Signup"
        component={Signup}
        options={{
          headerShown: false,
          gestureDirection: 'horizontal',
        }}
      />
      <Auth.Screen
        name="NoBottomStack"
        component={NoBottomStack}
        options={{
          headerShown: false,
          gestureDirection: 'horizontal',
        }}
      />
    </Auth.Navigator>
  );
}
