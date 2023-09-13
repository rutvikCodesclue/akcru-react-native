import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ContentSwipe from '../screens/contentScreens/contentSwipe';
import ClientTabNavigator from './ClientTabNavigator';
import HomeScreen from '../screens/contentScreens/Home';
import SearchMovieResultScreen from '../screens/contentScreens/SearchMovieResultScreen';
import SearchMovieScreen from '../screens/contentScreens/SearchMovieScreen';
import ContentDetailScreen from '../screens/contentScreens/contentDetailScreen';
import MITDateSchedule from '../screens/contentScreens/MovieMITScheduleScreen/MITDateSchedule';
import ViewUserScreen from '../screens/crummunityScreens/ViewUserScreen';
import ViewUserDetailScreen from '../screens/crummunityScreens/ViewUserDetailScreen';
import { SendMITViewUser, SendMITSearchResult, SendMITSchedule, SendMITSearchInput } from '../screens/crummunityScreens/SendViewUserMITScreens';
import {COLORS} from '../../assets/constants';
import { supabaseRealtime } from '../../lib/supabase';

export type ClientStackParams = {
    HomeScreen: any;
    ContentSwipe: any;
    SearchMovieResultScreen: any;
    SearchMovieScreen: any;
    ContentDetailScreen: any;
    MITDateSchedule: any;
    ViewUserScreen: any;
    ViewUserDetailScreen: any;
    SendMITViewUser: any;
    SendMITSearchResult: any;
    SendMITSchedule: any;
    SendMITSearchInput: any;
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
          {/* <ClientSearch.Screen
        name="ContentSwipe"
        component={ContentSwipe}
        options={() => ({
          headerShown: false,
        })}
      /> */}
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
          <ClientSearch.Screen
              name="SearchMovieResultScreen"
              component={SearchMovieResultScreen}
              options={() => ({
                  headerShown: false,
              })}
          />
          <ClientSearch.Screen
              name="ContentDetailScreen"
              component={ContentDetailScreen}
              options={() => ({
                  headerShown: false,
              })}
          />
          <ClientSearch.Screen
              name="MITDateSchedule"
              component={MITDateSchedule}
              options={() => ({
                  headerShown: false,
              })}
          />
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
        
      </ClientSearch.Navigator>
  );
}
