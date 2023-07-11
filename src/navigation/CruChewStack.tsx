import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import CruChewOrder from "../screens/crummunityScreens/CruChewScreens/CruChewOrder";
import CruChewScreen from "../screens/crummunityScreens/CruChewScreens/CruChewScreen";
import {COLORS, SIZES} from '../../assets/constants';
import ClientTabNavigator from "./ClientTabNavigator";
import { ClientStack } from "./ClientStack";


export type CruChewStackParams = {
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