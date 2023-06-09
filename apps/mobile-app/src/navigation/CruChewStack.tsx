import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import { Signin, MovieHomeScreen, SearchMovieScreen, MovieDetailScreen, SearchMovieResultScreen, CruChewOrder, CruChewScreen } from "../screens";
import { COLORS } from "../../constants";
import ClientTabNavigator from "./ClientTabNavigator";
import { ClientStack } from "./ClientStack";


export type CruChewStackParams = {
  Signin: any;
  MovieHomeScreen: any;
  ClientTabNavigator: any;
  ClientStack: any;
  SearchMovieScreen: any;
  SearchMovieResultScreen: any;
  MovieDetailScreen: any;
  CruChewOrder: any;
  CruChewScreen: any;
};

const CruChew = createStackNavigator<CruChewStackParams>();

export default function CruChewStack() {
  return (
    <CruChew.Navigator
      screenOptions={{
        animationEnabled: true,
        cardOverlayEnabled: true,
        cardStyle: { backgroundColor: COLORS.AKCRUBACKGROUND },
      }}
    >
      <CruChew.Screen
        name="CruChewScreen"
        component={CruChewScreen}
        options={{
          headerShown: false,
          gestureDirection: "horizontal",
        }}
      />
      <CruChew.Screen
        name="CruChewOrder"
        component={CruChewOrder}
        options={{
          headerShown: false,
          gestureDirection: "horizontal",
        }}
      />
    </CruChew.Navigator>
  );
};