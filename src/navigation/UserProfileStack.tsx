import {View, Text} from 'react-native';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import UserProfileScreen from '../screens/userScreens/UserProfileScreen';
import UserMITHubScreen from '../screens/userScreens/UserMITHubScreen';
import UserSearchResultScreen from '../screens/crummunityScreens/UserSearchResultScreen';
import ViewUserScreen from '../screens/crummunityScreens/ViewUserScreen';
import UserCruChatScreen from '../screens/userScreens/UserCruChatScreen';
import CruViewMovieDetailScreen from '../screens/userScreens/CruViewScreens/CruViewMovieDetailScreen';
import CruViewSearchMovieResultScreen from '../screens/userScreens/CruViewScreens/CruViewSearchMovieResultScreen';
import CruViewSearchMovieScreen from '../screens/userScreens/CruViewScreens/CruViewSearchMovieScreen';
import ChooseMITScreen from '../screens/userScreens/MITChoice/ChooseMITScreen';
import DeclineMITScreen from '../screens/userScreens/MITDecline';
import AcceptMITScreen from '../screens/userScreens/MITAccept';
import EditProfile from '../screens/userScreens/EditProfileScreen';
import StartCRUViewDate from '../screens/userScreens/StartCruView';
import StartMITDate from '../screens/userScreens/StartMITDate';
import AccountSettings from '../screens/userScreens/AccountSettings';
import EditCru from '../screens/userScreens/EditCru';
import VideoTestScreen from '../screens/userScreens/VideoTestScreen';

import ClientTabNavigator from './ClientTabNavigator';
import {COLORS, SIZES} from '../../assets/constants';

export type UserProfileStackParams = {
  // UserProfileWalletTab: any;
  // UserProfileCruInvites: any;
  // UserProfileDatesTab: any;
  // UserProfileDetailsTab: any;
  //   SearchMovieScreen: any;
  //   ClientTabNavigator: any;
  //   SearchMovieResultScreen: any;
  UserCruChatScreen: any;
  UserProfileScreen: any;
  //   UserProfileDetailsTab: any;
  ViewUserScreen: any;
  UserSearchResultScreen: any;
    ChooseMITScreen: any;
  UserMITHubScreen: any;
    DeclineMITScreen: any;
    AcceptMITScreen: any;
    StartCRUViewDate: any;
    StartMITDate: any;
  CruViewSearchMovieScreen: any;
  CruViewSearchMovieResultScreen: any;
  CruViewMovieDetailScreen: any;
  //   SendMITViewUser: any;
    EditProfile: any;
    AccountSettings: any;
    EditCru: any;
    VideoTestScreen: any;
};

const UserProfile = createStackNavigator<UserProfileStackParams>();

export function UserProfileStack() {
  return (
    <UserProfile.Navigator
      screenOptions={{
        animationEnabled: true,
        cardOverlayEnabled: true,
        cardStyle: {backgroundColor: COLORS.AKCRUBACKGROUND},
      }}>
      <UserProfile.Screen
        name="VideoTestScreen"
        component={VideoTestScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="UserMITHubScreen"
        component={UserMITHubScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="UserSearchResultScreen"
        component={UserSearchResultScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="ViewUserScreen"
        component={ViewUserScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="UserCruChatScreen"
        component={UserCruChatScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="CruViewMovieDetailScreen"
        component={CruViewMovieDetailScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="CruViewSearchMovieResultScreen"
        component={CruViewSearchMovieResultScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="CruViewSearchMovieScreen"
        component={CruViewSearchMovieScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="ChooseMITScreen"
        component={ChooseMITScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="AcceptMITScreen"
        component={AcceptMITScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="DeclineMITScreen"
        component={DeclineMITScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="EditProfile"
        component={EditProfile}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="AccountSettings"
        component={AccountSettings}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="EditCru"
        component={EditCru}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="StartMITDate"
        component={StartMITDate}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="StartCRUViewDate"
        component={StartCRUViewDate}
        options={() => ({
          headerShown: false,
        })}
      />
      {/* 

      <UserProfile.Screen
        name="SearchMovieResultScreen"
        component={SearchMovieResultScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="SearchMovieScreen"
        component={SearchMovieScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="UserProfileDetailsTab"
        component={UserProfileDetailsTab}
        options={() => ({
          headerShown: false,
        })}
      />
     
      

      
      

      <UserProfile.Screen
        name="SendMITViewUser"
        component={SendMITViewUser}
        options={() => ({
          headerShown: false,
        })}
      />
       */}
      {/* <UserProfile.Screen
        name="UserProfileWalletTab"
        component={UserProfileWalletTab}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="UserProfileCruInvites"
        component={UserProfileCruInvites}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="UserProfileDatesTab"
        component={UserProfileDatesTab}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="UserProfileDetailsTab"
        component={UserProfileDetailsTab}
        options={() => ({
          headerShown: false,
        })}
      /> */}
    </UserProfile.Navigator>
  );
}
