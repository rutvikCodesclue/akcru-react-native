import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import { COLORS } from '../../assets/constants';
import Signin from '../screens/loginScreens/Signin';
import ForgotPassword from '../screens/loginScreens/resetPassword/ForgotPassword';
import ResetPassword from '../screens/loginScreens/resetPassword/ResetPassword';
import Signup from '../screens/loginScreens/Signup';
import ClientTabNavigator from './ClientTabNavigator';
import NoBottomStack from './NoBottomTabStack';
import OnBoard1 from '../screens/loginScreens/Onboarding/OnBoard1';
import OnBoard2 from '../screens/loginScreens/Onboarding/OnBoard2';
import OnBoard3 from '../screens/loginScreens/Onboarding/OnBoard3';
import OTPVerification from '../screens/loginScreens/OTPVerification';
import TestScreen from '../screens/userScreens/TestScreen/TestScreen';
import PhoneForgotPassword from '../screens/loginScreens/resetPassword/PhoneForgotPassword';

export type AuthStackParams = {
    Signin: any;
    Signup: any;
    ForgotPassword: any;
    PhoneForgotPassword: any;
    ClientTabNavigator: any;
    NoBottomStack: any;
    OnBoard1: any;
    OnBoard2: any;
    OnBoard3: any;
    OTPVerification: any;
    TestScreen: any;
    ResetPassword: {
        accessToken?: string;
        email?: string;
        phoneNumber?: string;
    };
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
              name="PhoneForgotPassword"
              component={PhoneForgotPassword}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <Auth.Screen
              name="ResetPassword"
              component={ResetPassword}
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
              name="OnBoard1"
              component={OnBoard1}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <Auth.Screen
              name="OnBoard2"
              component={OnBoard2}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <Auth.Screen
              name="OnBoard3"
              component={OnBoard3}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />

          <Auth.Screen
              name="ClientTabNavigator"
              component={ClientTabNavigator}
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
          <Auth.Screen
              name="OTPVerification"
              component={OTPVerification}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />

          <Auth.Screen
              name="TestScreen"
              component={TestScreen}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
      </Auth.Navigator>
  );
}
