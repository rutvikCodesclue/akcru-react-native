// screens/ClientEntryDecider.tsx
import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import useAuthStore from '../../stores/auth.store';
import {COLORS} from '../../../assets/constants';

type Props = NativeStackScreenProps<ClientStackParams, 'ClientEntryDecider'>;

export default function ClientEntryDecider({navigation, route}: Props) {
    const {user, hydrateUser} = useAuthStore();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!user) await hydrateUser();
            } finally {
                if (mounted) setReady(true);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [user, hydrateUser]);

    useEffect(() => {
        if (!ready) return;

        // Optional override from ContentSwipe (e.g., "Skip to Homepage")
        if (route.params?.force === 'home') {
            navigation.reset({index: 0, routes: [{name: 'HomeScreen'}]});
            return;
        }
        if (route.params?.force === 'flick') {
            navigation.reset({index: 0, routes: [{name: 'FlickFlirtScreen'}]});
            return;
        }

        // Your real gate: pick one flag you trust
        // Option A: use new-visit flag
        const goFlick = user?.isNewVisitFlick === true;

        // Option B: or lack of prefs means new
        // const goFlick = !user?.hasSetFlirtPref;

        navigation.reset({
            index: 0,
            routes: [{name: goFlick ? 'FlickFlirtScreen' : 'HomeScreen'}],
        });
    }, [ready, route.params, navigation, user]);

    return (
        <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.AKCRUBACKGROUND}}>
            <ActivityIndicator />
        </View>
    );
}
