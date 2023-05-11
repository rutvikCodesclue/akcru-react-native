import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { SearchMovieScreen, SearchMovieResultScreen, MovieDetailScreen, MovieHomeScreen } from '../screens';
import ClientTabNavigator from './ClientTabNavigator';
import { COLORS } from '../../constants';

export type ClientStackParams = {
  SearchMovieScreen: any;
  ClientTabNavigator: any;
  SearchMovieResultScreen: any;
  MovieDetailScreen: any;
  MovieHomeScreen: any;
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
    </ClientSearch.Navigator>
  );
}
