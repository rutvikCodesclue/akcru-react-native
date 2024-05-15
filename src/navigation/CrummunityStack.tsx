import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import CrummunityScreen from '../screens/crummunityScreens/CrummunityScreen';
import UserSearchResultScreen from '../screens/crummunityScreens/UserSearchResultScreen';
import ViewUserDetailScreen from '../screens/crummunityScreens/ViewUserDetailScreen';
import CruChewOrder from '../screens/crummunityScreens/CruChewScreens/CruChewOrder';
import CruChewScreen from '../screens/crummunityScreens/CruChewScreens/CruChewScreen';
import {
    SendMITSchedule,
    SendMITSearchResult,
    SendMITViewUser,
    SendMITSearchInput,
} from '../screens/crummunityScreens/SendViewUserMITScreens';
import {COLORS} from '../../assets/constants';

export type CrummunityStackParams = {
    CrummunityScreen: any;
    UserSearchResultScreen: any;

    ViewUserDetailScreen: any;
    PurchaseMITScreen: any;

    SendMITViewUser: any;
    SendMITSearchInput: any;
    SendMITSearchResult: any;
    SendMITSchedule: any;
    CruChewScreen: any;
    CruChewOrder: any;

    AkcruNetworkScreen: any;
    FlickFlirtScreen: any;
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
            {/* <Crummunity.Screen
              name="PostScreen"
              component={PostScreen}
              options={() => ({
                  headerShown: false,
              })}
          /> */}
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
            {/* <Crummunity.Screen
              name="ViewUserScreen"
              component={ViewUserScreen}
              options={() => ({
                  headerShown: false,
              })}
          /> */}
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
