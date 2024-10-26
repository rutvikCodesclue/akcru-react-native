import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ViewUserDetailScreen from '../screens/crummunityScreens/ViewUserDetailScreen';
import CruChewOrder from '../screens/crummunityScreens/CruChewScreens/CruChewOrder';
import CruChewScreen from '../screens/crummunityScreens/CruChewScreens/CruChewScreen';
import {
    SendMITSchedule,
    SendMITSearchResult,
    SendMITViewUser,
    SendMITSearchInput,
} from '../screens/crummunityScreens/SendViewUserMITScreens';
import CrusaderScreen from '../screens/crummunityScreens/CrusaderScreen';
import {COLORS} from '../../assets/constants';

export type CrusaderStackParams = {
    CrummunityScreen: any;
    UserSearchResultScreen: any;
    ViewUserDetailScreen: any;
    PurchaseMITScreen: any;
    SendMITViewUser: any;
    SendMITSearchInput: any;
    SendMITSearchResult: any;
    SendMITSchedule: any;
    CruChewScreen: any;
    CruChewOrder: any;
    CrusaderScreen: any;
    AkcruNetworkScreen: any;
    FlickFlirtScreen: any;
};

const Crusader = createStackNavigator<CrusaderStackParams>();

export function CrusaderStack() {
    return (
        <Crusader.Navigator
            screenOptions={{
                animationEnabled: true,
                cardOverlayEnabled: true,
                cardStyle: {backgroundColor: COLORS.AKCRUBACKGROUND},
            }}>
            <Crusader.Screen
                name="CrusaderScreen"
                component={CrusaderScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <Crusader.Screen
                name="ViewUserDetailScreen"
                component={ViewUserDetailScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <Crusader.Screen
                name="SendMITViewUser"
                component={SendMITViewUser}
                options={() => ({
                    headerShown: false,
                })}
            />
            <Crusader.Screen
                name="SendMITSearchResult"
                component={SendMITSearchResult}
                options={() => ({
                    headerShown: false,
                })}
            />
            <Crusader.Screen
                name="SendMITSchedule"
                component={SendMITSchedule}
                options={() => ({
                    headerShown: false,
                })}
            />
            <Crusader.Screen
                name="SendMITSearchInput"
                component={SendMITSearchInput}
                options={() => ({
                    headerShown: false,
                })}
            />
            <Crusader.Screen
                name="CruChewScreen"
                component={CruChewScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <Crusader.Screen
                name="CruChewOrder"
                component={CruChewOrder}
                options={() => ({
                    headerShown: false,
                })}
            />
        </Crusader.Navigator>
    );
}
