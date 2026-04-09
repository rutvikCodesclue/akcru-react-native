import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../assets/constants';
import PurchaseMITScreen from '../screens/CenterButtonScreens/PurchaseMIT';
import FlickFlirtScreen from '../screens/CenterButtonScreens/FlickFlirt';
import AkcruNetworkScreen from '../screens/CenterButtonScreens/AkcruNetwork/index';
import AwardScreen from '../screens/CenterButtonScreens/Awards';
import AkcruCenterButton from '../components/AkcruCenterButton/AkcruCenterButton';
import {CrusaderStack} from './CrusaderStack';
import CrusaderScreen from '../screens/CenterButtonScreens/CrusaderScreen';
import PurchaseAdScreen from '../screens/CenterButtonScreens/PurchaseAD';
import UnlockingMatchesScreen from '../screens/CenterButtonScreens/FlickFlirt/UnlockingMatches';
import VisionaryRooms from '../screens/CenterButtonScreens/VisionaryRooms';
import VisionaryRoomsRequests from '../screens/CenterButtonScreens/VisionaryRoomsRequests';

export type AkcruButtonStackParams = {
    PurchaseMITScreen: any;
    FlickFlirtScreen: any;
    AkcruNetworkScreen: any;
    ClientTabNavigator: any;
    AwardScreen: any;
    AkcruCenterButton: any;
    CrusaderStack: any;
    CrusaderScreen: any;
    PurchaseAdScreen: any;
    UnlockingMatches: undefined;
    VisionaryRooms: any;
    VisionaryRoomsRequests: any;
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
            <AkcruBtn.Screen
                name="AkcruCenterButton"
                component={AkcruCenterButton}
                options={{
                    headerShown: false,
                }}
            />
            <AkcruBtn.Screen
                name="CrusaderStack"
                component={CrusaderStack}
                options={{
                    headerShown: false,
                }}
            />
            <AkcruBtn.Screen
                name="PurchaseMITScreen"
                component={PurchaseMITScreen}
                options={{
                    headerShown: false,
                }}
            />
            <AkcruBtn.Screen
                name="PurchaseAdScreen"
                component={PurchaseAdScreen}
                options={{
                    headerShown: false,
                }}
            />
            <AkcruBtn.Screen
                name="UnlockingMatches"
                component={UnlockingMatchesScreen}
                options={{
                    headerShown: false,
                }}
            />
            <AkcruBtn.Screen
                name="CrusaderScreen"
                component={CrusaderScreen}
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
            <AkcruBtn.Screen
                name="VisionaryRooms"
                component={VisionaryRooms}
                options={{
                    headerShown: false,
                }}
            />
            <AkcruBtn.Screen
                name="VisionaryRoomsRequests"
                component={VisionaryRoomsRequests}
                options={{
                    headerShown: false,
                }}
            />
            <AkcruBtn.Screen
                name="AwardScreen"
                component={AwardScreen}
                options={{
                    headerShown: false,
                }}
            />
        </AkcruBtn.Navigator>
    );
}
