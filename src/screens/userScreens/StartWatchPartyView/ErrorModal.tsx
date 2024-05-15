import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../../assets/constants';

const ErrorModal = ({errorMessage, onClose}) => {
    return (
        <Modal animationType="fade" transparent={true} visible={true}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.okButton}>
                        <Text style={styles.okButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    errorMessage: {
        ...FONTS.Title3,
        marginBottom: 20,
        textAlign: 'center',
    },
    okButton: {
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    okButtonText: {
        ...FONTS.Title3,
        color: COLORS.WHITE,
    },
});

export default ErrorModal;
