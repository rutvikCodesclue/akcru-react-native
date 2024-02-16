import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import CrummunityScreen from '../screens/crummunityScreens/CrummunityScreen';
import UserSearchResultScreen from '../screens/crummunityScreens/UserSearchResultScreen';
import ViewUserScreen from '../screens/crummunityScreens/ViewUserScreen';
import ViewUserDetailScreen from '../screens/crummunityScreens/ViewUserDetailScreen';
import CruChewOrder from '../screens/crummunityScreens/CruChewScreens/CruChewOrder';
import CruChewScreen from '../screens/crummunityScreens/CruChewScreens/CruChewScreen';
import PurchaseMITScreen from '../screens/userScreens/PurchaseMIT';
import { SendMITSchedule, SendMITSearchResult, SendMITViewUser, SendMITSearchInput } from '../screens/crummunityScreens/SendViewUserMITScreens';
import { COLORS } from '../../assets/constants';
import PostScreen from '../screens/crummunityScreens/PostScreen';
import NewPost from '../screens/crummunityScreens/NewPost';
import NewComment from '../screens/crummunityScreens/NewComment';
import AkcruNetworkScreen from '../screens/CenterButtonScreens/AkcruNetwork';
import FlickFlirtScreen from '../screens/CenterButtonScreens/FlickFlirt';
import { IComment, IPost } from '../../types';

export type CrummunityStackParams = {
    CrummunityScreen: any;
    UserSearchResultScreen: any;
    ViewUserScreen: any;
    ViewUserDetailScreen: any;
    PurchaseMITScreen: any;
    //   AcceptMITScreen: any;
    //   DeclineMITScreen: any;
    //   TestScreen: any;
    SendMITViewUser: any;
    SendMITSearchInput: any;
    SendMITSearchResult: any;
    SendMITSchedule: any;
    CruChewScreen: any;
    CruChewOrder: any;
    PostScreen: {
        post: IPost;
        comment: IComment
        // other params if there are any
    };
    // NewPost: any;
    AkcruNetworkScreen: any;
    FlickFlirtScreen: any;
    // NewComment: any;
};

const Crummunity = createStackNavigator<CrummunityStackParams>();

export function CrummunityStack() {
  return (
      <Crummunity.Navigator
          screenOptions={{
              animationEnabled: true,
              cardOverlayEnabled: true,
              cardStyle: {backgroundColor: COLORS.AKCRUBACKGROUND},
          }}>
          <Crummunity.Screen
              name="CrummunityScreen"
              component={CrummunityScreen}
              options={() => ({
                  headerShown: false,
              })}
          />
          <Crummunity.Screen
              name="PostScreen"
              component={PostScreen}
              options={() => ({
                  headerShown: false,
              })}
          />
          {/* <Crummunity.Screen
              name="NewPost"
              component={NewPost}
              options={() => ({
                  headerShown: false,
              })}
          /> */}
          {/* <Crummunity.Screen
              name="NewComment"
              component={NewComment}
              options={() => ({
                  headerShown: false,
              })}
          /> */}
          <Crummunity.Screen
              name="UserSearchResultScreen"
              component={UserSearchResultScreen}
              options={() => ({
                  headerShown: false,
              })}
          />
          <Crummunity.Screen
              name="ViewUserScreen"
              component={ViewUserScreen}
              options={() => ({
                  headerShown: false,
              })}
          />
          <Crummunity.Screen
              name="ViewUserDetailScreen"
              component={ViewUserDetailScreen}
              options={() => ({
                  headerShown: false,
              })}
          />
          <Crummunity.Screen
              name="SendMITViewUser"
              component={SendMITViewUser}
              options={() => ({
                  headerShown: false,
              })}
          />
          <Crummunity.Screen
              name="SendMITSearchResult"
              component={SendMITSearchResult}
              options={() => ({
                  headerShown: false,
              })}
          />
          <Crummunity.Screen
              name="SendMITSchedule"
              component={SendMITSchedule}
              options={() => ({
                  headerShown: false,
              })}
          />
          <Crummunity.Screen
              name="SendMITSearchInput"
              component={SendMITSearchInput}
              options={() => ({
                  headerShown: false,
              })}
          />
          <Crummunity.Screen
              name="CruChewScreen"
              component={CruChewScreen}
              options={() => ({
                  headerShown: false,
              })}
          />
          <Crummunity.Screen
              name="CruChewOrder"
              component={CruChewOrder}
              options={() => ({
                  headerShown: false,
              })}
          />
          {/* <Crummunity.Screen
              name="AkcruNetworkScreen"
              component={AkcruNetworkScreen}
              options={{
                  headerShown: false,
                 
              }}
          />
          <Crummunity.Screen
              name="PurchaseMITScreen"
              component={PurchaseMITScreen}
              options={{
                  headerShown: false,
                  
              }}
          />
          <Crummunity.Screen
              name="FlickFlirtScreen"
              component={FlickFlirtScreen}
              options={{
                  headerShown: false,
                 
              }}
          /> */}
      </Crummunity.Navigator>
  );
}
