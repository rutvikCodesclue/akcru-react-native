//src\screens\CenterButtonScreens\PurchaseAD\VerifyPurchase\index.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, StyleSheet, Alert, Modal, TouchableOpacity} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {verifyAdPurchaseSession} from '../../../../lib/api/adPurchase.lib';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import {COLORS, FONTS} from '../../../../../assets/constants';

type NavProp = StackNavigationProp<NoBottomTabStackParams, 'AdPurchaseSuccessScreen'>;

const AdPurchaseSuccessScreen = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute();
    const {session_id} = (route.params || {}) as {session_id?: string};

    const [verifying, setVerifying] = useState(true);

    const [successVisible, setSuccessVisible] = useState(false);
    const [errorVisible, setErrorVisible] = useState(false);

    useEffect(() => {
        if (!session_id) {
            // Alert.alert('Error', 'Missing session ID.');
            navigation.goBack();
            return;
        }

        (async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await verifyAdPurchaseSession(session_id);
                setSuccessVisible(true);
            } catch (err) {
                Alert.alert('Verification Failed', 'We could not verify your purchase.');
                setErrorVisible(true);
            } finally {
                setVerifying(false);
                navigation.goBack(); // or navigate to confirmation screen
            }
        })();
    }, [navigation, session_id]);

    const handleClose = () => {
        setSuccessVisible(false);
        setErrorVisible(false);
        navigation.goBack();
    };

    return (
        <>
            <View style={styles.container}>
                <ActivityIndicator size="large" />
                <Text style={styles.text}>{verifying ? 'Verifying your purchase...' : 'Redirecting...'}</Text>
            </View>
            {/* Success Modal */}
            <Modal transparent visible={successVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🎉 Purchased!</Text>
                        <Text style={styles.modalMessage}>Your AD purchase was confirmed.</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleClose}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Error Modal */}
            <Modal transparent visible={errorVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>❌ Verification Failed</Text>
                        <Text style={styles.modalMessage}>We could not verify your purchase.</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleClose}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    text: {marginTop: 16, fontSize: 16, color: '#444'},
    modalOverlay: {
        flex: 1,
        backgroundColor: COLORS.OVERLAY_BLACK_50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: COLORS.AKCRUBACKGROUND,
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalTitle: {
        ...FONTS.Title2,
        textAlign: 'center',
        marginBottom: 12,
    },
    modalMessage: {
        ...FONTS.Username,
        textAlign: 'center',
        marginBottom: 12,
    },
    modalButton: {
        marginTop: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        backgroundColor: COLORS.AKCRUBLUE,
    },
    modalButtonText: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
        textAlign: 'center',
    },
});

export default AdPurchaseSuccessScreen;
