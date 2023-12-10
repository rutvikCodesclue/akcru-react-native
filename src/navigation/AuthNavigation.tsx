import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import { COLORS } from '../../assets/constants';
import Signin from '../screens/loginScreens/Signin';
import ForgotPassword from '../screens/loginScreens/resetPassword';
import Signup from '../screens/loginScreens/Signup';
import ClientTabNavigator from './ClientTabNavigator';
import { ClientStack } from './ClientStack';
import NoBottomStack from './NoBottomTabStack';
import OnBoard1 from '../screens/loginScreens/Onboarding/OnBoard1';
import OnBoard2 from '../screens/loginScreens/Onboarding/OnBoard2';
import OnBoard3 from '../screens/loginScreens/Onboarding/OnBoard3';
import AkcruButtonStack from './AkcruButtonStack';
import AkcruNetworkScreen from '../screens/CenterButtonScreens/AkcruNetwork';
import PurchaseMITScreen from '../screens/CenterButtonScreens/PurchaseMIT';
import FlickFlirtScreen from '../screens/CenterButtonScreens/FlickFlirt';
import AkcruCenterButton from '../components/AkcruCenterButton/AkcruCenterButton';



export type AuthStackParams = {
    Signin: any;
    Signup: any;
    ForgotPassword: any;
    ClientTabNavigator: any;
    ClientStack: any;
    NoBottomStack: any;
    OnBoard1: any;
    OnBoard2: any;
    OnBoard3: any;
    AkcruButtonStack: any;
    AkcruNetworkScreen: any;
    PurchaseMITScreen: any;
    FlickFlirtScreen: any;
    AkcruCenterButton: any;
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
          {/* <Auth.Screen
              name="AkcruButtonStack"
              component={AkcruButtonStack}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <Auth.Screen
              name="AkcruNetworkScreen"
              component={AkcruNetworkScreen}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <Auth.Screen
              name="PurchaseMITScreen"
              component={PurchaseMITScreen}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <Auth.Screen
              name="FlickFlirtScreen"
              component={FlickFlirtScreen}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <Auth.Screen
              name="AkcruCenterButton"
              component={AkcruCenterButton}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          /> */}
      </Auth.Navigator>
  );
}
