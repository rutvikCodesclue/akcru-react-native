import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/contentScreens/Home';
import SearchMovieScreen from '../screens/contentScreens/SearchMovieScreen';

import ViewUserScreen from '../screens/crummunityScreens/ViewUserScreen';
import ViewUserDetailScreen from '../screens/crummunityScreens/ViewUserDetailScreen';
import {
    SendMITViewUser,
    SendMITSearchResult,
    SendMITSchedule,
    SendMITSearchInput,
} from '../screens/crummunityScreens/SendViewUserMITScreens';
import {COLORS} from '../../assets/constants';
import {CruInviteAccept, CruInviteDecline} from '../screens/userScreens/CruInviteResponse';
import UserNotifications from '../screens/userScreens/UserNotifications';
import AkcruButtonStack from './AkcruButtonStack';
import AkcruNetworkScreen from '../screens/CenterButtonScreens/AkcruNetwork';
import FlickFlirtScreen from '../screens/CenterButtonScreens/FlickFlirt';
import PurchaseMITScreen from '../screens/CenterButtonScreens/PurchaseMIT';
import AkcruCenterButton from '../components/AkcruCenterButton/AkcruCenterButton';
import AwardScreen from '../screens/CenterButtonScreens/Awards';

export type ClientStackParams = {
    HomeScreen: any;
    ContentSwipe: any;

    SearchMovieScreen: any;

    ViewUserScreen: any;
    ViewUserDetailScreen: any;
    SendMITViewUser: any;
    SendMITSearchResult: any;
    SendMITSchedule: any;
    SendMITSearchInput: any;
    CruInviteAccept: any;
    CruInviteDecline: any;
    UserNotifications: any;
    AkcruButtonStack: any;
    AkcruNetworkScreen: any;
    FlickFlirtScreen: any;
    PurchaseMITScreen: any;
    AkcruCenterButton: any;
    AwardScreen: any;
};

const ClientSearch = createStackNavigator<ClientStackParams>();

export function ClientStack() {
    return (
        <ClientSearch.Navigator
            screenOptions={{
                animationEnabled: true,
                cardOverlayEnabled: true,
                cardStyle: {backgroundColor: COLORS.AKCRUBACKGROUND},
            }}>
            <ClientSearch.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <ClientSearch.Screen
                name="SearchMovieScreen"
                component={SearchMovieScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            {/* <ClientSearch.Screen
              name="SearchMovieResultScreen"
              component={SearchMovieResultScreen}
              options={() => ({
                  headerShown: false,
              })}
          /> */}
            {/* <ClientSearch.Screen
              name="ContentDetailScreen"
              component={ContentDetailScreen}
              options={() => ({
                  headerShown: false,
              })}
          /> */}
            {/* <ClientSearch.Screen
              name="MITDateSchedule"
              component={MITDateSchedule}
              options={() => ({
                  headerShown: false,
              })}
          /> */}
            <ClientSearch.Screen
                name="ViewUserScreen"
                component={ViewUserScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <ClientSearch.Screen
                name="ViewUserDetailScreen"
                component={ViewUserDetailScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <ClientSearch.Screen
                name="SendMITViewUser"
                component={SendMITViewUser}
                options={() => ({
                    headerShown: false,
                })}
            />
            <ClientSearch.Screen
                name="SendMITSearchResult"
                component={SendMITSearchResult}
                options={() => ({
                    headerShown: false,
                })}
            />
            <ClientSearch.Screen
                name="SendMITSchedule"
                component={SendMITSchedule}
                options={() => ({
                    headerShown: false,
                })}
            />
            <ClientSearch.Screen
                name="SendMITSearchInput"
                component={SendMITSearchInput}
                options={() => ({
                    headerShown: false,
                })}
            />
            <ClientSearch.Screen
                name="CruInviteAccept"
                component={CruInviteAccept}
                options={() => ({
                    headerShown: false,
                })}
            />
            <ClientSearch.Screen
                name="CruInviteDecline"
                component={CruInviteDecline}
                options={() => ({
                    headerShown: false,
                })}
            />
            <ClientSearch.Screen
                name="UserNotifications"
                component={UserNotifications}
                options={() => ({
                    headerShown: false,
                })}
            />
            <ClientSearch.Screen
                name="AkcruButtonStack"
                component={AkcruButtonStack}
                options={{
                    headerShown: false,
                }}
            />
            <ClientSearch.Screen
                name="AkcruNetworkScreen"
                component={AkcruNetworkScreen}
                options={{
                    headerShown: false,
                }}
            />
            <ClientSearch.Screen
                name="PurchaseMITScreen"
                component={PurchaseMITScreen}
                options={{
                    headerShown: false,
                }}
            />
            <ClientSearch.Screen
                name="FlickFlirtScreen"
                component={FlickFlirtScreen}
                options={{
                    headerShown: false,
                }}
            />
            <ClientSearch.Screen
                name="AkcruCenterButton"
                component={AkcruCenterButton}
                options={{
                    headerShown: false,
                }}
            />
            <ClientSearch.Screen
                name="AwardScreen"
                component={AwardScreen}
                options={{
                    headerShown: false,
                }}
            />
        </ClientSearch.Navigator>
    );
}
