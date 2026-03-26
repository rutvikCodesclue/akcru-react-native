import {useFocusEffect, NavigationProp, ParamListBase} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {clientTabBarStyle} from '../../navigation/clientTabBarStyle';

const TAB_ROUTE_NAMES = new Set([
    'ClientStack',
    'CrummunityStack',
    'AkcruButtonStack',
    'FlickFlirtScreen',
    'UserProfileStack',
]);

function findBottomTabNavigator(navigation: NavigationProp<ParamListBase>) {
    let parent = navigation.getParent();
    while (parent) {
        const state = parent.getState();
        if (!state || !('routes' in state) || !Array.isArray(state.routes)) {
            parent = parent.getParent();
            continue;
        }
        const routeNames = state.routes.map((r: {name: string}) => r.name);
        const isTab =
            ('type' in state && (state as {type?: string}).type === 'tab') ||
            (routeNames.length > 0 && routeNames.every((n: string) => TAB_ROUTE_NAMES.has(n)));
        if (isTab) {
            return parent;
        }
        parent = parent.getParent();
    }
    return undefined;
}

/** Hides the app bottom tab bar while this screen is focused (e.g. chat flows). */
export function useHideBottomTabBarWhileFocused(navigation: NavigationProp<ParamListBase>) {
    useFocusEffect(
        useCallback(() => {
            const tabNav = findBottomTabNavigator(navigation);
            tabNav?.setOptions({
                tabBarStyle: {display: 'none'},
            });
            return () => {
                tabNav?.setOptions({
                    tabBarStyle: clientTabBarStyle,
                });
            };
        }, [navigation]),
    );
}
