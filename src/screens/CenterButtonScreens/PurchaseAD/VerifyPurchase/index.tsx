//src\screens\CenterButtonScreens\PurchaseAD\VerifyPurchase\index.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {verifyAdPurchaseSession} from '../../../../lib/api/adPurchase.lib';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';

type NavProp = StackNavigationProp<NoBottomTabStackParams, 'AdPurchaseSuccessScreen'>;

const AdPurchaseSuccessScreen = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute();
    const {session_id} = (route.params || {}) as {session_id?: string};

    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        if (!session_id) {
            Alert.alert('Error', 'Missing session ID.');
            navigation.goBack();
            return;
        }

        (async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await verifyAdPurchaseSession(session_id);
                Alert.alert('Success', 'Your AD purchase was confirmed!');
            } catch (err) {
                Alert.alert('Verification Failed', 'We could not verify your purchase.');
                console.error('Verification error:', err);
            } finally {
                setVerifying(false);
                navigation.goBack(); // or navigate to confirmation screen
            }
        })();
    }, [navigation, session_id]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
            <Text style={styles.text}>{verifying ? 'Verifying your purchase...' : 'Redirecting...'}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    text: {marginTop: 16, fontSize: 16, color: '#444'},
});

export default AdPurchaseSuccessScreen;
