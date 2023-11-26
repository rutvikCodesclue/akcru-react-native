import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import { COLORS } from '../../assets/constants';
import ClientTabNavigator from './ClientTabNavigator';
import { ClientStack } from './ClientStack';
import PurchaseMITScreen from '../screens/CenterButtonScreens/PurchaseMIT';
import FlickFlirtScreen from '../screens/CenterButtonScreens/FlickFlirt';
import AkcruNetworkScreen from '../screens/CenterButtonScreens/AkcruNetwork';

import AkcruCenterButton from '../components/AkcruCenterButton/AkcruCenterButton';

export type AkcruButtonStackParams = {
    PurchaseMITScreen: any;
    FlickFlirtScreen: any;
    AkcruNetworkScreen: any;
    ClientTabNavigator: any;
  
    AkcruCenterButton: any;
};

const AkcruBtn = createStackNavigator<AkcruButtonStackParams>();

export default function AkcruButtonStack() {
    return (
        <AkcruBtn.Navigator
            screenOptions={{
                animationEnabled: true,
                cardOverlayEnabled: true,
                cardStyle: {backgroundColor: COLORS.AKCRUBACKGROUND},
            }}>
            {/* <AkcruBtn.Screen
                name="AkcruCenterButton"
                component={AkcruCenterButton}
                options={{
                    headerShown: false,
                }}
            /> */}
            <AkcruBtn.Screen
                name="PurchaseMITScreen"
                component={PurchaseMITScreen}
                options={{
                    headerShown: false,
                }}
            />
            <AkcruBtn.Screen
                name="FlickFlirtScreen"
                component={FlickFlirtScreen}
                options={{
                    headerShown: false,
                }}
            />
            <AkcruBtn.Screen
                name="AkcruNetworkScreen"
                component={AkcruNetworkScreen}
                options={{
                    headerShown: false,
                }}
            />
        </AkcruBtn.Navigator>
    );
}
