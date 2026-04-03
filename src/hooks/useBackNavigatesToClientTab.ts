import {useCallback, useEffect} from 'react';
import {BackHandler} from 'react-native';
import {CommonActions, useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {NoBottomTabStackParams} from '../navigation/NoBottomTabStack';

/**
 * Android hardware back, iOS swipe-back, and programmatic back: land on main tab stack (home).
 */
export function useBackNavigatesToClientTab() {
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
            const sub = BackHandler.addEventListener('hardwareBackPress', () => {
                goHome();
                return true;
            });
            return () => sub.remove();
        }, [goHome]),
    );

    useEffect(() => {
        const unsub = navigation.addListener('beforeRemove', e => {
            const type = e.data?.action?.type;
            if (type === 'RESET' || type === 'NAVIGATE' || type === 'REPLACE') {
                return;
            }
            if (type === 'POP' || type === 'GO_BACK' || type === 'POP_TO_TOP') {
                e.preventDefault();
                goHome();
            }
        });
        return unsub;
    }, [navigation, goHome]);

    return goHome;
}
