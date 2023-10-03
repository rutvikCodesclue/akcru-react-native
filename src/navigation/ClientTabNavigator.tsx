import {View, Text, StyleSheet} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';

import {Icon} from '@rneui/base';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {COLORS, SIZES} from '../../assets/constants';
import {useNavigation} from '@react-navigation/native';

import {ClientStack} from './ClientStack';
import { CrummunityStack } from './CrummunityStack';
import CruChewStack from './CruChewStack';
import { UserProfileStack } from './UserProfileStack';

import PurchaseMITScreen from '../screens/userScreens/PurchaseMIT';
import {Animated, Easing} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { AkcruControlBtn } from '../../assets/svg';
import TestScreen from '../screens/userScreens/TestScreen';

export type ClientTabsParams = {
    UserProfileStack: any;
    ClientStack: any;
    CruChewStack: any;
    CrummunityStack: any;
    TestScreen: any;
    PurchaseMITScreen: any;
};

const ClientTabs = createBottomTabNavigator<ClientTabsParams>();

export default function ClientTabNavigator() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ClientTabsParams>>();

  const [animation] = useState(new Animated.Value(0));

  

  // useEffect(() => {
  //   const floatUpAnimation = Animated.timing(animation, {
  //     toValue: 1,
  //     duration: 300,
  //     useNativeDriver: true,
  //   });

  //   const floatDownAnimation = Animated.timing(animation, {
  //     toValue: 0,
  //     duration: 300,
  //     useNativeDriver: true,
  //   });

  //   // Execute the float up animation when the tab is focused
  //   const focusListener = navigation.addListener('focus', () => {
  //     floatUpAnimation.start();
  //   });

  //   // Execute the float down animation when the tab loses focus
  //   const blurListener = navigation.addListener('blur', () => {
  //     floatDownAnimation.start();
  //   });

  //   return () => {
  //     focusListener.remove();
  //     blurListener.remove();
  //   };
  // }, []);

  const floatingStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -26], // Adjust the translateY value to control the floating effect
        }),
      },
    ],
  };

  return (
      <ClientTabs.Navigator
          sceneContainerStyle={{backgroundColor: COLORS.AKCRUBACKGROUND}}
          initialRouteName="ClientStack"
          screenOptions={{
              tabBarStyle: {
                  position: 'absolute',
                  backgroundColor: COLORS.TRANSDARKGREY,
                  height: SIZES.ScreenHeight / 12,
                  borderTopRightRadius: 10,
                  borderTopLeftRadius: 10,
              },
              tabBarActiveTintColor: COLORS.AKCRUBLUE,
              tabBarInactiveTintColor: COLORS.LIGHTGREY,
              tabBarShowLabel: false,
          }}>
          <ClientTabs.Screen
              name="ClientStack"
              component={ClientStack}
              options={{
                  headerShown: false,
                  tabBarIcon: ({color}) => (
                      <Icon name="home-outline" type="ionicon" color={color} size={SIZES.SmallIcon} />
                  ),
              }}
          />
          {/* <ClientTabs.Screen
              name="CrummunityStack"
              component={CrummunityStack}
              options={{
                  headerShown: false,
                  tabBarIcon: ({color}) => (
                      <Icon name="people-outline" type="ionicon" color={color} size={SIZES.SmallIcon} />
                  ),
              }}
          /> */}
          {/* <ClientTabs.Screen
              name="PurchaseMITScreen"
              component={PurchaseMITScreen}
              options={{
                  headerShown: false,
                  tabBarIcon: ({}) => (
                      <Animated.View>
                          <AkcruControlBtn />
                      </Animated.View>
                  ),
              }}
          /> */}
          <ClientTabs.Screen
              name="CruChewStack"
              component={CruChewStack}
              options={{
                  headerShown: false,
                  tabBarIcon: ({color}) => (
                      <Icon name="fast-food-outline" type="ionicon" color={color} size={SIZES.SmallIcon} />
                  ),
              }}
          />
          <ClientTabs.Screen
              name="UserProfileStack"
              component={UserProfileStack}
              options={{
                  headerShown: false,
                  tabBarIcon: ({color}) => (
                      <Icon name="person-outline" type="ionicon" color={color} size={SIZES.SmallIcon} />
                  ),
              }}
          />
      </ClientTabs.Navigator>
  );
}
