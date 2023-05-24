import { View, Text } from "react-native";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  UserCruChatScreen,
  MovieDetailScreen,
  SearchMovieResultScreen,
  SearchMovieScreen,
  UserProfileScreen,
  ViewUserScreen
} from "../screens";
import ClientTabNavigator from "./ClientTabNavigator";
import { UserProfileDetailsTab } from "../screens/UserScreens/UserProfileTabs";
import { COLORS } from "../../constants";

export type UserProfileStackParams = {
  SearchMovieScreen: any;
  ClientTabNavigator: any;
  SearchMovieResultScreen: any;
  MovieDetailScreen: any;
  UserCruChatScreen: any;
  UserProfileScreen: any;
  UserProfileDetailsTab: any;
  ViewUserScreen: any;
};

const UserProfile = createStackNavigator<UserProfileStackParams>();

export function UserProfileStack() {
  return (
    <UserProfile.Navigator
      screenOptions={{
        animationEnabled: true,
        cardOverlayEnabled: true,
        cardStyle: { backgroundColor: COLORS.AKCRUBACKGROUND },
      }}
    >
      <UserProfile.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="MovieDetailScreen"
        component={MovieDetailScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="SearchMovieResultScreen"
        component={SearchMovieResultScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="SearchMovieScreen"
        component={SearchMovieScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="UserProfileDetailsTab"
        component={UserProfileDetailsTab}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="UserCruChatScreen"
        component={UserCruChatScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <UserProfile.Screen
        name="ViewUserScreen"
        component={ViewUserScreen}
        options={() => ({
          headerShown: false,
        })}
      />
    </UserProfile.Navigator>
  );
}
