import {useCallback, useEffect} from 'react';
import {BackHandler} from 'react-native';
import {CommonActions, useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {NoBottomTabStackParams} from '../navigation/NoBottomTabStack';

/**
 * Android hardware back, iOS swipe-back, and programmatic back: land on main tab stack (home).
 */
export function useBackNavigatesToClientTab(options?: {enabled?: boolean}) {
    const enabled = options?.enabled ?? true;
    const navigation = useNavigation<StackNavigationProp<NoBottomTabStackParams>>();

    const goHome = useCallback(() => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{name: 'ClientTabNavigator'}],
            }),
        );
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            if (!enabled) {
                return undefined;
            }

            const sub = BackHandler.addEventListener('hardwareBackPress', () => {
                goHome();
                return true;
            });
            return () => sub.remove();
        }, [enabled, goHome]),
    );

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const unsub = navigation.addListener('beforeRemove', e => {
            const type = e.data?.action?.type;
            /** Let normal navigations complete; only skip intercept for these. */
            if (type === 'RESET' || type === 'NAVIGATE' || type === 'REPLACE') {
                return;
            }
            /**
             * Stack back / gesture / OS back can emit POP, GO_BACK, POP_TO_TOP, or other
             * router-specific types — and sometimes no type. If we only handled POP/GO_BACK,
             * the default pop still ran (e.g. back to FlickFlirtPrefAll). Intercept everything else.
             */
            e.preventDefault();
            goHome();
        });
        return unsub;
    }, [enabled, navigation, goHome]);

    return goHome;
}
