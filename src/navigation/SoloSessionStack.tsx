import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../../assets/constants';
import SoloSessionScreen from '../screens/contentScreens/SoloSessionScreen';

export type SoloSessionStackParams = {
    SoloSessionScreen: {vibeId?: string} | undefined;
};

const SoloSession = createStackNavigator<SoloSessionStackParams>();

export function SoloSessionStack() {
    return (
        <SoloSession.Navigator
            screenOptions={{
                animationEnabled: true,
                cardOverlayEnabled: true,
                cardStyle: {backgroundColor: COLORS.AKCRUBACKGROUND},
            }}>
            <SoloSession.Screen
                name="SoloSessionScreen"
                component={SoloSessionScreen}
                initialParams={{vibeId: 'browsing'}}
                options={{headerShown: false}}
            />
        </SoloSession.Navigator>
    );
}
