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
import WatchPartyPreviewScreen from '../screens/userScreens/WatchPartyPreview';
import AkcruButtonStack from './AkcruButtonStack';
import FlickFlirtScreen from '../screens/CenterButtonScreens/FlickFlirt';
import AkcruNetworkScreen from '../screens/CenterButtonScreens/AkcruNetwork';
import PurchaseMITScreen from '../screens/CenterButtonScreens/PurchaseMIT';
import TrailerPlayer from '../screens/contentScreens/PlayTrailerContent';
import PostScreen from '../screens/crummunityScreens/PostScreen';

export type NoBottomTabStackParams = {
    ContentSwipe: any;
    ClientTabNavigator: any;
    ClientStack: any;
    ContentPlayer: any;
    ContentDetailScreen: any;
    StartMITDate: any;
    StartWatchPartyView: any;
    WatchPartyPreviewScreen: any;
    Signin: any;
    AkcruButtonStack:any;
    FlickFlirtScreen:any;
    AkcruNetworkScreen:any;
    PurchaseMITScreen:any;
    TrailerPlayer: any;
    PostScreen: any;
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
              component={WatchPartyPreviewScreen}
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
      </NoBottom.Navigator>
  );
}
