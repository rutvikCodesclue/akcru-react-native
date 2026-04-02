import {useFocusEffect, NavigationProp, ParamListBase} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {clientTabBarStyle} from '../../navigation/clientTabBarStyle';
import {CLIENT_TAB_NAVIGATOR_ID} from '../../navigation/clientTabNavigatorId';

/** Prefer id-based lookup (RN docs); fall back to walking for older trees. */
function findBottomTabNavigator(navigation: NavigationProp<ParamListBase>) {
    const byId = navigation.getParent(CLIENT_TAB_NAVIGATOR_ID);
    if (byId) {
        return byId;
    }
    let parent = navigation.getParent();
    while (parent) {
        const state = parent.getState() as {type?: string} | undefined;
        const maybeTab = parent as NavigationProp<ParamListBase> & {jumpTo?: (name: string) => void};
        if (state?.type === 'tab' || typeof maybeTab.jumpTo === 'function') {
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
