import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import { Signin, MovieHomeScreen, SearchMovieScreen, MovieDetailScreen, SearchMovieResultScreen } from "../screens";
import { COLORS } from "../../constants";
import ClientTabNavigator from "./ClientTabNavigator";
import { ClientStack } from "./ClientStack";


export type AuthStackParams = {
  Signin: any;
  MovieHomeScreen: any;
  ClientTabNavigator: any;
  ClientStack: any;
  SearchMovieScreen: any;
  SearchMovieResultScreen: any;
  MovieDetailScreen: any;
};

const Auth = createStackNavigator<AuthStackParams>();

export default function AuthStack() {
  return (
    <Auth.Navigator
      screenOptions={{
        animationEnabled: true,
        cardOverlayEnabled: true,
        cardStyle: { backgroundColor: COLORS.AKCRUBACKGROUND },
      }}
    >
      <Auth.Screen
        name="Signin"
        component={Signin}
        options={{
          headerShown: false,
          gestureDirection: "horizontal",
        }}
      />
      <Auth.Screen
        name="ClientTabNavigator"
        component={ClientTabNavigator}
        options={{
          headerShown: false,
          gestureDirection: "horizontal",
        }}
      />
      <Auth.Screen
        name="ClientStack"
        component={ClientStack}
        options={{
          headerShown: false,
          gestureDirection: "horizontal",
        }}
      />
      <Auth.Screen
        name="SearchMovieScreen"
        component={SearchMovieScreen}
        options={{
          headerShown: false,
          gestureDirection: "horizontal",
        }}
      />
      <Auth.Screen
        name="SearchMovieResultScreen"
        component={SearchMovieResultScreen}
        options={{
          headerShown: false,
          gestureDirection: "horizontal",
        }}
      />
    </Auth.Navigator>
  );
};