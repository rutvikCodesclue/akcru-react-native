import {View, Text, StyleSheet, Image, Platform} from 'react-native';
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
import AkcruCenterButton from '../components/AkcruCenterButton/AkcruCenterButton';
import { UseTabMenu } from '../context/TabContext';
import { TabContextProvider } from '../context/TabContext';
import AkcruButtonStack from './AkcruButtonStack';
import TabContainer from '../components/TabContainer/TabContainer';
import imageindex from '../../assets/images/imageindex';

export type ClientTabsParams = {
    UserProfileStack: any;
    ClientStack: any;
    CruChewStack: any;
    CrummunityStack: any;
    PurchaseMITScreen: any;
    AkcruButtonStack: any;
    TabContainer: any;
    AkcruCenterButton: any;
};

const ClientTabs = createBottomTabNavigator<ClientTabsParams>();

export default function ClientTabNavigator() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ClientTabsParams>>();

    const {opened, toggleOpened} = UseTabMenu();

  return (
      <ClientTabs.Navigator
          sceneContainerStyle={{backgroundColor: COLORS.AKCRUBACKGROUND}}
          initialRouteName="ClientStack"
          screenOptions={{
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: COLORS.AKCRUBLUE,
              tabBarInactiveTintColor: COLORS.LIGHTGREY,
              tabBarShowLabel: false,
          }}>
          <ClientTabs.Screen
              name="ClientStack"
              component={ClientStack}
              options={{
                  tabBarItemStyle: {
                     
                  },
                  headerShown: false,
                  tabBarIcon: ({color}) => (
                      <View style={styles.tabIconContainer}>
                          <Icon name="home-outline" type="ionicon" color={color} size={SIZES.SmallIcon} />
                      </View>
                  ),
              }}
              listeners={{
                  tabPress: e => opened && e.preventDefault(),
              }}
          />
          <ClientTabs.Screen
              name="CrummunityStack"
              component={CrummunityStack}
              options={{
                  tabBarItemStyle: {
                    
                  },
                  headerShown: false,
                  tabBarIcon: ({color}) => (
                      <View style={styles.tabIconContainer}>
                          <Icon name="people-outline" type="ionicon" color={color} size={SIZES.SmallIcon} />
                      </View>
                  ),
              }}
              listeners={{
                  tabPress: e => opened && e.preventDefault(),
              }}
          />
          <ClientTabs.Screen
              name="AkcruButtonStack"
              component={AkcruButtonStack}
              options={{
                  tabBarItemStyle: {
                      height: 0,
                  },
                  //   tabBarButton: () => <AkcruCenterButton opened={opened} toggleOpened={toggleOpened} />,
                  headerShown: false,
                  tabBarIcon: ({color}) => (
                      <View style={styles.tabIconContainer}>
                          <View style={{marginTop: -15}}>
                              {/* <AkcruControlBtn/> */}
                              <AkcruCenterButton opened={opened} toggleOpened={toggleOpened} />
                          </View>
                      </View>
                  ),
              }}
          />
          <ClientTabs.Screen
              name="CruChewStack"
              component={CruChewStack}
              options={{
                  tabBarItemStyle: {
                    
                  },
                  headerShown: false,
                  tabBarIcon: ({color}) => (
                      <View style={styles.tabIconContainer}>
                          <Icon name="fast-food-outline" type="ionicon" color={color} size={SIZES.SmallIcon} />
                      </View>
                  ),
              }}
              listeners={{
                  tabPress: e => opened && e.preventDefault(),
              }}
          />
          <ClientTabs.Screen
              name="UserProfileStack"
              component={UserProfileStack}
              options={{
                  tabBarItemStyle: {
            
                  },
                  headerShown: false,
                  tabBarIcon: ({color}) => (
                      <View style={styles.tabIconContainer}>
                          <Icon name="person-outline" type="ionicon" color={color} size={SIZES.SmallIcon} />
                      </View>
                  ),
              }}
              listeners={{
                  tabPress: e => opened && e.preventDefault(),
              }}
          />
      </ClientTabs.Navigator>
  );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        padding: 0,

        bottom: Platform.OS === 'ios' ? 50 : 10,
        height: 60,
        borderRadius: 16,
        backgroundColor: COLORS.TRANSDARKGREY,
        borderTopColor: 'transparent',
        shadowColor: COLORS.FADEDBLACK,
        shadowOffset: {
            height: 6,
            width: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        marginHorizontal: '3%',
        alignSelf: 'center'
    },
    tabIconContainer: {
        position: 'absolute',
        top: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '95%',
        
    },
});
