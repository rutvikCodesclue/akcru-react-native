import { View, Text } from "react-native";
import React from "react";

import { Icon } from "@rneui/base";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  MovieHomeScreen,

  UserProfileScreen,
  CruChewScreen,
  MovieDetailScreen,
  SearchMovieScreen,
  SearchMovieResultScreen,

  ViewUserScreen
} from "../screens";
import { COLORS, SIZES } from "../../constants";

import { ClientStack } from "./ClientStack";
import { UserProfileStack } from "./UserProfileStack";
import { CrummunityStack } from "./CrummunityStack";


export type ClientTabsParams = {
  SearchMovieScreen: any;
  UserProfileScreen: any;
  SearchMovieResultScreen: any;
  MovieHomeScreen: any;
  MovieDetailScreen: any;
  CruChewScreen: any;
  ClientStack: any;
  UserProfileStack: any;
  CrummunityStack: any;
  ViewUserScreen: any;
};

const ClientTabs = createBottomTabNavigator<ClientTabsParams>();


export default function ClientTabNavigator() {
  return (
    <ClientTabs.Navigator
      sceneContainerStyle={{ backgroundColor: COLORS.AKCRUBACKGROUND }}
      initialRouteName="ClientStack"
      screenOptions={{
        tabBarStyle: {
          position: "absolute",
          backgroundColor: COLORS.TRANSDARKGREY,
          height: 60,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        },
        tabBarActiveTintColor: COLORS.AKCRUBLUE,
        tabBarInactiveTintColor: COLORS.LIGHTGREY,
        tabBarShowLabel: false,
      }}
    >
      <ClientTabs.Screen
        name="ClientStack"
        component={ClientStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon
              name="home-outline"
              type="ionicon"
              color={color}
              size={SIZES.SmallIcon}
            />
          ),
        }}
      />
      <ClientTabs.Screen
        name="CrummunityStack"
        component={CrummunityStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon
              name="people-outline"
              type="ionicon"
              color={color}
              size={SIZES.SmallIcon}
            />
          ),
        }}
      />
      <ClientTabs.Screen
        name="ViewUserScreen"
        component={ViewUserScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon
              name="eye-outline"
              type="ionicon"
              color={color}
              size={SIZES.SmallIcon}
            />
          ),
        }}
      />
      <ClientTabs.Screen
        name="CruChewScreen"
        component={CruChewScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon
              name="fast-food-outline"
              type="ionicon"
              color={color}
              size={SIZES.SmallIcon}
            />
          ),
        }}
      />
      <ClientTabs.Screen
        name="UserProfileStack"
        component={UserProfileStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon
              name="person-outline"
              type="ionicon"
              color={color}
              size={SIZES.SmallIcon}
            />
          ),
        }}
      />
    </ClientTabs.Navigator>
  );
}
