import React from 'react';
import TestScreen from '../screens/crummunityScreens/testScreen';
import {createStackNavigator} from '@react-navigation/stack';

export type TestScreenParams = {
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

    AkcruNetworkScreen: any;
    FlickFlirtScreen: any;
};

const TestScreens = createStackNavigator<TestScreenParams>();

export function ShowTestScreen() {
    return (
        <TestScreens.Navigator
            screenOptions={{
                animationEnabled: true,
                cardOverlayEnabled: true,
                cardStyle: {backgroundColor: '#000'},
            }}>
            <TestScreens.Screen
                name="TestScreen"
                component={TestScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
        </TestScreens.Navigator>
    );
}
