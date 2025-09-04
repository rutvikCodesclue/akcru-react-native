import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../assets/constants';
import {Icon} from '@rneui/base';

interface SessionManagementModalProps {
    visible: boolean;
    onClose: () => void;
    onCloseOtherSessions: () => void;
    onCancel: () => void;
    otherSessionsCount: number;
    loading?: boolean;
}

const SessionManagementModal: React.FC<SessionManagementModalProps> = ({
    visible,
    onClose,
    onCloseOtherSessions,
    onCancel,
    otherSessionsCount,
    loading = false,
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
                // Prevent dismissal by back button on Android - user must choose an option
            }}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Icon
                            name="warning"
                            type="material"
                            color={COLORS.DARKORANGE}
                            size={30}
                        />
                        <Text style={styles.title}>Other Sessions Detected</Text>
                    </View>
                    
                    <Text style={styles.message}>
                        You have {otherSessionsCount} other active session{otherSessionsCount > 1 ? 's' : ''} on different device{otherSessionsCount > 1 ? 's' : ''}.
                        {'\n\n'}
                        For security reasons, you must close all other sessions before logging in on this device. This will automatically log out all other devices.
                        {'\n\n'}
                        Choose an option below to continue:
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={onCloseOtherSessions}
                            disabled={loading}>
                            <Text style={[styles.buttonText, styles.primaryButtonText]}>
                                {loading ? 'Logging Out Other Devices...' : 'Logout Other Devices & Login'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={onCancel}
                            disabled={loading}>
                            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                                Cancel Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 15,
        padding: 25,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        ...FONTS.Title1,
        color: COLORS.BLACK,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
    message: {
        ...FONTS.paragraph2,
        color: COLORS.DARKGREY,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 25,
    },
    buttonContainer: {
        gap: 10,
    },
    button: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.AKCRUBLUE,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.LIGHTGREY,
    },
    buttonText: {
        ...FONTS.Title2,
        fontWeight: '600',
    },
    primaryButtonText: {
        color: COLORS.WHITE,
    },
    secondaryButtonText: {
        color: COLORS.DARKGREY,
    },
});

export default SessionManagementModal;
