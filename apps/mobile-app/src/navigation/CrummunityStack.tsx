import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  CrummunityScreen,
  ViewUserScreen,
  UserSearchResultScreen,
  PurchaseMITScreen,
  AcceptMITScreen,
  DeclineMITScreen,
  TestScreen

  
} from "../screens";
import { COLORS } from "../../constants";

export type CrummunityStackParams = {
  CrummunityScreen: any;
  ViewUserScreen: any;
  UserSearchResultScreen: any;
  PurchaseMITScreen: any;
  AcceptMITScreen: any;
  DeclineMITScreen: any;
  TestScreen: any;
};

const Crummunity = createStackNavigator<CrummunityStackParams>();

export function CrummunityStack() {
  return (
    <Crummunity.Navigator
      screenOptions={{
        animationEnabled: true,
        cardOverlayEnabled: true,
        cardStyle: { backgroundColor: COLORS.AKCRUBACKGROUND },
      }}
    >
      <Crummunity.Screen
        name="CrummunityScreen"
        component={CrummunityScreen}
        options={() => ({
          headerShown: false,
        })}
      />
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
        name="PurchaseMITScreen"
        component={PurchaseMITScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Crummunity.Screen
        name="AcceptMITScreen"
        component={AcceptMITScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Crummunity.Screen
        name="DeclineMITScreen"
        component={DeclineMITScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Crummunity.Screen
        name="TestScreen"
        component={TestScreen}
        options={() => ({
          headerShown: false,
        })}
      />
    </Crummunity.Navigator>
  );
}
