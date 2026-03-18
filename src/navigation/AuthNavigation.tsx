import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../assets/constants';
import Signin from '../screens/loginScreens/Signin';
import ForgotPassword from '../screens/loginScreens/resetPassword/ForgotPassword';
import ResetPassword from '../screens/loginScreens/resetPassword/ResetPassword';
import ClientTabNavigator from './ClientTabNavigator';
import NoBottomStack from './NoBottomTabStack';
import OTPVerification from '../screens/loginScreens/OTPVerification';
import OTPVerificationSignup from '../screens/loginScreens/OTPVerificationSignup';
import PhoneForgotPassword from '../screens/loginScreens/resetPassword/PhoneForgotPassword';
import Welcome from '../screens/loginScreens/Welcome';
import OnboardEmail from '../screens/loginScreens/Onboard/OnboardEmail';
import OnboardPhone from '../screens/loginScreens/Onboard/OnboardPhone';
import OnboardUsername from '../screens/loginScreens/Onboard/OnboardUsername';
import OnboardName from '../screens/loginScreens/Onboard/OnboardName';
import OnboardDOB from '../screens/loginScreens/Onboard/OnboardDOB';
import OnboardGender from '../screens/loginScreens/Onboard/OnboardGender';
import OnboardArchetype from '../screens/loginScreens/Onboard/OnboardArchetype';
import OnboardProfilePicture from '../screens/loginScreens/Onboard/OnboardProfilePicture';
import OnboardEmailOrPassword from '../screens/loginScreens/Onboard/OnboardEmailOrPassword';
import OnboardDescription from '../screens/loginScreens/Onboard/OnboardDescription';
import OnboardContactList from '../screens/loginScreens/Onboard/OnboardContactList';
import OnboardCruName from '../screens/loginScreens/Onboard/OnboardCruName';
import OnboardBuildCru from '../screens/loginScreens/Onboard/OnboardBuildCru';
import OnboardCruBuilder from '../screens/loginScreens/Onboard/OnboardCruBuilder';
import ViewUserScreen from '../screens/crummunityScreens/ViewUserScreen';

export type AuthStackParams = {
    Welcome: any;
    Signin: any;
    ForgotPassword: any;
    PhoneForgotPassword: any;
    ClientTabNavigator: any;
    NoBottomStack: any;
    OTPVerification: any;
    OTPVerificationSignup: any;
    ResetPassword: {
        accessToken?: string;
        email?: string;
        phoneNumber?: string;
    };
    OnboardEmail: any;
    OnboardPhone: any;
    OnboardUsername: any;
    OnboardName: any;
    OnboardDOB: any;
    OnboardContactList: any;
    OnboardGender: any;
    OnboardArchetype: any;
    OnboardProfilePicture: any;
    OnboardEmailOrPassword: any;
    OnboardDescription: any;
    OnboardCruName: any;
    OnboardBuildCru: any;
    OnboardCruBuilder: any;
    ViewUserScreen: any;
    FlickFlirt: any;
};

const Auth = createStackNavigator<AuthStackParams>();

export default function AuthStack(params: any) {
    return (
        <Auth.Navigator
            screenOptions={{
                animationEnabled: true,
                cardOverlayEnabled: true,
                cardStyle: {backgroundColor: COLORS.AKCRUBACKGROUND},
            }}>
            <Auth.Screen
                name="Welcome"
                component={Welcome}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
                initialParams={params}
            />
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
                name="OnboardEmail"
                component={OnboardEmail}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardPhone"
                component={OnboardPhone}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardUsername"
                component={OnboardUsername}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardName"
                component={OnboardName}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardDOB"
                component={OnboardDOB}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardContactList"
                component={OnboardContactList}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardGender"
                component={OnboardGender}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardProfilePicture"
                component={OnboardProfilePicture}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardArchetype"
                component={OnboardArchetype}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardEmailOrPassword"
                component={OnboardEmailOrPassword}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardDescription"
                component={OnboardDescription}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardCruName"
                component={OnboardCruName}
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
                name="OTPVerificationSignup"
                component={OTPVerificationSignup}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardBuildCru"
                component={OnboardBuildCru}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="OnboardCruBuilder"
                component={OnboardCruBuilder}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
            <Auth.Screen
                name="ViewUserScreen"
                component={ViewUserScreen}
                options={{
                    headerShown: false,
                    gestureDirection: 'horizontal',
                }}
            />
        </Auth.Navigator>
    );
}
