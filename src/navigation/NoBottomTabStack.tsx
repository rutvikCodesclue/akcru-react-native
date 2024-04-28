import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../assets/constants';
import Signin from '../screens/loginScreens/Signin';
import ForgotPassword from '../screens/loginScreens/resetPassword/ForgotPassword';
import Signup from '../screens/loginScreens/Signup';
import ClientTabNavigator from './ClientTabNavigator';
import {ClientStack} from './ClientStack';
import ContentSwipe from '../screens/contentScreens/contentSwipe';
import ContentPlayer from '../screens/contentScreens/PlayContentScreen';
import ContentDetailScreen from '../screens/contentScreens/contentDetailScreen';
import StartMITDate from '../screens/userScreens/StartMITDate';
import StartWatchPartyView from '../screens/userScreens/StartWatchPartyView';
import WatchPartyPreview from '../screens/userScreens/WatchPartyPreview';
import AkcruButtonStack from './AkcruButtonStack';
import FlickFlirtScreen from '../screens/CenterButtonScreens/FlickFlirt';
import AkcruNetworkScreen from '../screens/CenterButtonScreens/AkcruNetwork';
import PurchaseMITScreen from '../screens/CenterButtonScreens/PurchaseMIT';
import TrailerPlayer from '../screens/contentScreens/PlayTrailerContent';
import PostScreen from '../screens/crummunityScreens/PostScreen';
import {CruChat, CruGroupChat} from '../screens/ChatScreens';
import NewPost from '../screens/crummunityScreens/NewPost';
import NewComment from '../screens/crummunityScreens/NewComment';
import { IComment, IPost } from '../../types';
import ViewUserScreen from '../screens/crummunityScreens/ViewUserScreen';
import BugReport from '../screens/userScreens/BugReport';
import Help from '../screens/userScreens/Help';
import EditProfile from '../screens/userScreens/EditProfileScreen';
import AccountSettings from '../screens/userScreens/AccountSettings';
import Suggestions from '../screens/userScreens/Suggestions';
import Questions from '../screens/userScreens/Questions';
import ReportUser from '../screens/userScreens/ReportUser';
import UserNotification from '../screens/userScreens/UserNotifications/UserNotification';
import BlockedUsers from '../screens/userScreens/BlockedUsers';
import ContactList from '../screens/userScreens/ContactList/ContactList';
import ResumeDetailScreen from '../screens/contentScreens/ResumeDetailScreen';
import ResumePlayer from '../screens/contentScreens/ResumeContentScreen';



export type NoBottomTabStackParams = {
    BlockedUsers: any;
    UserNotification: any;
    ReportUser: any;
    Questions: any;
    Suggestions: any;
    AccountSettings: any;
    EditProfile: any;
    Help: any;
    BugReport: any;
    ContentSwipe: any;
    ClientTabNavigator: any;
    ClientStack: any;
    ContentPlayer: any;
    ContentDetailScreen: any;
    StartMITDate: any;
    StartWatchPartyView: any;
    WatchPartyPreview: any;
    Signin: any;
    AkcruButtonStack: any;
    FlickFlirtScreen: any;
    AkcruNetworkScreen: any;
    PurchaseMITScreen: any;
    TrailerPlayer: any;
    PostScreen: {
        post?: IPost;
        comment?: IComment;
        postId: number;
        // other params if there are any
    };
    ViewChat: {userId: string; mItInviteId: string; profilePicture: string; username: string};
    ViewGroupChat: any;
    NewPost: any;
    NewComment: any;
    ViewUserScreen: {userId: string; profilePicture: string; username: string};
    ContactList: any;
    ResumeDetailScreen: any;
    ResumePlayer: any;
};

const NoBottom = createStackNavigator<NoBottomTabStackParams>();

export default function NoBottomStack() {
  return (
      <NoBottom.Navigator
          screenOptions={{
              animationEnabled: true,
              cardOverlayEnabled: true,
              cardStyle: {backgroundColor: COLORS.AKCRUBACKGROUND},
          }}>
          <NoBottom.Screen
              name="ContentSwipe"
              component={ContentSwipe}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="Signin"
              component={Signin}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="ContentPlayer"
              component={ContentPlayer}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="ResumePlayer"
              component={ResumePlayer}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="TrailerPlayer"
              component={TrailerPlayer}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="ContentDetailScreen"
              component={ContentDetailScreen}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="ResumeDetailScreen"
              component={ResumeDetailScreen}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="ClientStack"
              component={ClientStack}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="ClientTabNavigator"
              component={ClientTabNavigator}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="StartMITDate"
              component={StartMITDate}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="WatchPartyPreview"
              component={WatchPartyPreview}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="StartWatchPartyView"
              component={StartWatchPartyView}
              options={{
                  headerShown: false,
                  gestureEnabled: false,
              }}
          />
          <NoBottom.Screen
              name="PostScreen"
              component={PostScreen}
              options={{
                  headerShown: false,
                  gestureEnabled: false,
              }}
          />
          <NoBottom.Screen
              name="ViewChat"
              component={CruChat}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="ViewGroupChat"
              component={CruGroupChat}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="NewPost"
              component={NewPost}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="ContactList"
              component={ContactList}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="NewComment"
              component={NewComment}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="ViewUserScreen"
              component={ViewUserScreen}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="BugReport"
              component={BugReport}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="Help"
              component={Help}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="EditProfile"
              component={EditProfile}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="AccountSettings"
              component={AccountSettings}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="Suggestions"
              component={Suggestions}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="Questions"
              component={Questions}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="ReportUser"
              component={ReportUser}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="UserNotification"
              component={UserNotification}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
          <NoBottom.Screen
              name="BlockedUsers"
              component={BlockedUsers}
              options={{
                  headerShown: false,
                  gestureDirection: 'horizontal',
              }}
          />
      </NoBottom.Navigator>
  );
}
