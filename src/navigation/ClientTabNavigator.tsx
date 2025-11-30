import {View, StyleSheet, Platform} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';

import {Icon} from '@rneui/base';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {COLORS, SIZES} from '../../assets/constants';

import {ClientStack} from './ClientStack';
import {CrummunityStack} from './CrummunityStack';
import {UserProfileStack} from './UserProfileStack';
import AkcruCenterButton from '../components/AkcruCenterButton/AkcruCenterButton';
import {UseTabMenu} from '../context/TabContext';
import AkcruButtonStack from './AkcruButtonStack';
import FlickFlirtScreen from '../screens/CenterButtonScreens/FlickFlirt';
import {API} from '../clients/api.client';
import {DeviceEventEmitter} from 'react-native';
import {isTablet} from '../../assets/constants/theme';

export type ClientTabsParams = {
    UserProfileStack: any;
    ClientStack: any;
    CruChewStack: any;
    CrummunityStack: any;
    PurchaseMITScreen: any;
    AkcruButtonStack: any;
    TabContainer: any;
    AkcruCenterButton: any;
    ShowTestScreen: any;
    CrusaderStack: any;
    FlickFlirtScreen: any;
};

const ClientTabs = createBottomTabNavigator<ClientTabsParams>();

export default function ClientTabNavigator() {
    const {opened, toggleOpened} = UseTabMenu();
    const [hasMatches, setHasMatches] = useState(false);

    const fetchMatches = useCallback(() => {
        API.get('v1/flickflirt/matches')
            .then(res => {
                // normalize payload
                const payload = res?.data ?? res;
                const ok: boolean = !!payload.success;
                const matches: any[] = Array.isArray(payload.matches) ? payload.matches : [];
                setHasMatches(ok && matches.length > 0);
            })
            .catch(err => {
                console.error('fetchMatches error:', err);
                setHasMatches(false);
            });
    }, []);
    // fetch once on mount
    useEffect(fetchMatches, [fetchMatches]);

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('matchesUpdated', fetchMatches);
        return () => sub.remove();
    }, [fetchMatches]);

    const closeCenterButtonIfOpen = (e: any) => {
        if (opened) {
            e.preventDefault();
            toggleOpened();
        }
    };

    return (
        <ClientTabs.Navigator
            sceneContainerStyle={{backgroundColor: COLORS.AKCRUBACKGROUND}}
            initialRouteName="CrummunityStack"
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
                    tabBarItemStyle: {},
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <View style={styles.tabIconContainer}>
                            <Icon
                                name="home-outline"
                                type="ionicon"
                                color={color}
                                size={isTablet() ? 30 : SIZES.SmallIcon}
                            />
                        </View>
                    ),
                }}
                listeners={{
                    tabPress: closeCenterButtonIfOpen,
                }}
            />
            <ClientTabs.Screen
                name="CrummunityStack"
                component={CrummunityStack}
                options={{
                    tabBarItemStyle: {},
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <View style={styles.tabIconContainer}>
                            <Icon
                                name="people-outline"
                                type="ionicon"
                                color={color}
                                size={isTablet() ? 30 : SIZES.SmallIcon}
                            />
                        </View>
                    ),
                }}
                listeners={{
                    tabPress: closeCenterButtonIfOpen,
                }}
            />
            <ClientTabs.Screen
                name="AkcruButtonStack"
                component={AkcruButtonStack}
                options={{
                    tabBarItemStyle: {
                        height: 0,
                    },

                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <View style={styles.tabIconContainer}>
                            <View style={{marginTop: isTablet() ? -20 : -15}}>
                                <AkcruCenterButton opened={opened} toggleOpened={toggleOpened} />
                            </View>
                        </View>
                    ),
                }}
            />
            <ClientTabs.Screen
                name="FlickFlirtScreen"
                component={FlickFlirtScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <View style={styles.tabIconContainer}>
                            <Icon
                                name="heart-multiple-outline"
                                type="material-community"
                                color={color}
                                size={isTablet() ? 30 : SIZES.SmallIcon}
                            />
                            {hasMatches && <View style={styles.redDot} />}
                        </View>
                    ),
                }}
                listeners={{
                    tabPress: () => {
                        fetchMatches();
                    },
                    focus: fetchMatches,
                }}
            />
            <ClientTabs.Screen
                name="UserProfileStack"
                component={UserProfileStack}
                options={{
                    tabBarItemStyle: {},
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <View style={styles.tabIconContainer}>
                            <Icon
                                name="person-outline"
                                type="ionicon"
                                color={color}
                                size={isTablet() ? 30 : SIZES.SmallIcon}
                            />
                        </View>
                    ),
                }}
                listeners={{
                    tabPress: closeCenterButtonIfOpen,
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
        height: isTablet() ? 80 : 60,
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
        alignSelf: 'center',
    },
    tabIconContainer: {
        position: 'absolute',
        top: isTablet() ? 20 : 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: isTablet() ? '120%' : '95%',
    },
    redDot: {
        position: 'absolute',
        top: 0,
        right: 20,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
    },
});
