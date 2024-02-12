
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
import StartMITDate from '../screens/userScreens/StartMITDate';
import AccountSettings from '../screens/userScreens/AccountSettings';
import EditCru from '../screens/userScreens/EditCru';
import FollowList from '../screens/userScreens/FollowList';
import EditWatchList from '../screens/userScreens/EditWatchList';
import {COLORS, SIZES} from '../../assets/constants';
import UserNotifications from '../screens/userScreens/UserNotifications';
import WatchPartyPreview from '../screens/userScreens/WatchPartyPreview';
import ContentDetailScreen from '../screens/contentScreens/contentDetailScreen';
import ViewUserDetailScreen from '../screens/crummunityScreens/ViewUserDetailScreen';
import UserWalletSearch from '../screens/userScreens/UserWalletSearch';
import Help from '../screens/userScreens/Help';
import UserProfileWalletTab from '../screens/userScreens/UserProfileTabs/UserProfileWalletTab';
import ViewUserFollowList from '../screens/userScreens/ViewUserFollowList';
import { CruChat } from '../screens/ChatScreens';
import { ChatList } from '../screens/ChatList';

export type UserProfileStackParams = {
    UserCruChatScreen: any;
    UserProfileScreen: any;
    ViewUserScreen: any;
    UserSearchResultScreen: any;
    ChooseMITScreen: any;
    UserMITHubScreen: any;
    DeclineMITScreen: any;
    AcceptMITScreen: any;
    RoomPreview: any;
    StartMITDate: any;
    CruViewSearchMovieScreen: any;
    CruViewSearchMovieResultScreen: any;
    CruViewMovieDetailScreen: any;
    EditProfile: any;
    AccountSettings: any;
    EditCru: any;
    FollowList: any;
    UserNotifications: any;
    EditWatchList: any;
    WatchPartyPreviewScreen: any;
    ContentDetailScreen: any;
    ViewUserDetailScreen: any;
    Help: any;
    UserWalletSearch: any;
    UserProfileWalletTab: any;
    AkcruButtonStack: any;
    AkcruNetworkScreen: any;
    PurchaseMITScreen: any;
    FlickFlirtScreen: any;
    ViewUserFollowList: any;
    // ViewChat :{'userId': string ,'mItInviteId':string, 'profilePicture':string, 'username':string};
    ChatList: any;
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
              name="ViewUserDetailScreen"
              component={ViewUserDetailScreen}
              options={() => ({
                  headerShown: false,
              })}
          />
          <UserProfile.Screen
              name="ViewUserFollowList"
              component={ViewUserFollowList}
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
              name="WatchPartyPreview"
              component={WatchPartyPreview}
              options={() => ({
                  headerShown: false,
              })}
          />

          <UserProfile.Screen
              name="FollowList"
              component={FollowList}
              options={() => ({
                  headerShown: false,
              })}
          />
          <UserProfile.Screen
              name="UserNotifications"
              component={UserNotifications}
              options={() => ({
                  headerShown: false,
              })}
          />
          <UserProfile.Screen
              name="EditWatchList"
              component={EditWatchList}
              options={() => ({
                  headerShown: false,
              })}
          />
          <UserProfile.Screen
              name="ContentDetailScreen"
              component={ContentDetailScreen}
              options={() => ({
                  headerShown: false,
              })}
          />
          <UserProfile.Screen
              name="Help"
              component={Help}
              options={() => ({
                  headerShown: false,
              })}
          />
          <UserProfile.Screen
              name="UserWalletSearch"
              component={UserWalletSearch}
              options={() => ({
                  headerShown: false,
              })}
          />
          <UserProfile.Screen
              name="UserProfileWalletTab"
              component={UserProfileWalletTab}
              options={() => ({
                  headerShown: false,
              })}
          />
          {/* <UserProfile.Screen
              name="ViewChat"
              component={CruChat}
              options={() => ({
                  headerShown: false,
              })}
          /> */}
          <UserProfile.Screen
              name="ChatList"
              component={ChatList}
              options={() => ({
                  headerShown: false,
              })}
          />
      </UserProfile.Navigator>
  );
}
