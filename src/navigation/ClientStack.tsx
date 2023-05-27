
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import {
  PurchaseMITScreen,
  SearchMovieScreen,
  SearchMovieResultScreen,
  MovieDetailScreen,
  MovieHomeScreen,
  UserProfileScreen,
} from "../screens";
import ClientTabNavigator from './ClientTabNavigator';
import { UserProfileDetailsTab } from '../screens/UserScreens/UserProfileTabs';
import { COLORS } from '../../constants';

export type ClientStackParams = {
  SearchMovieScreen: any;
  ClientTabNavigator: any;
  SearchMovieResultScreen: any;
  MovieDetailScreen: any;
  MovieHomeScreen: any;
  UserProfileScreen: any;
  UserProfileDetailsTab: any;
  PurchaseMITScreen: any;
};

const ClientSearch = createStackNavigator<ClientStackParams>();

export function ClientStack () {
  return (
    <ClientSearch.Navigator
      screenOptions={{
        animationEnabled: true,
        cardOverlayEnabled: true,
        cardStyle: { backgroundColor: COLORS.AKCRUBACKGROUND },
      }}
    >
      <ClientSearch.Screen
        name="MovieHomeScreen"
        component={MovieHomeScreen}
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
        name="MovieDetailScreen"
        component={MovieDetailScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <ClientSearch.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <ClientSearch.Screen
        name="UserProfileDetailsTab"
        component={UserProfileDetailsTab}
        options={() => ({
          headerShown: false,
        })}
      />
      <ClientSearch.Screen
        name="PurchaseMITScreen"
        component={PurchaseMITScreen}
        options={() => ({
          headerShown: false,
        })}
      />
    </ClientSearch.Navigator>
  );
}
