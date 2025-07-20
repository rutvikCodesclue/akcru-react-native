import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import AkcruButtons from '../akcruButtons';

interface Props {
    visible: boolean;
    onClose: () => void;
    onRent: () => void;
    onBuy: () => void;
    rentalLabel?: string;
    buyLabel?: string;
}

export default function ContentPurchaseModal({visible, onClose, onRent, onBuy, rentalLabel, buyLabel}: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Purchase Content</Text>

                    {rentalLabel && (
                        <TouchableOpacity style={styles.optionRow} onPress={onRent}>
                            <Text style={styles.optionText}>{rentalLabel}</Text>
                        </TouchableOpacity>
                    )}

                    {buyLabel && (
                        <TouchableOpacity style={styles.optionRow} onPress={onBuy}>
                            <Text style={styles.optionText}>{buyLabel}</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.modalButtonsRow}>
                        <AkcruButtons.SmallButton btnname="Cancel" onPress={onClose} color={COLORS.CATPURPDRK} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: COLORS.AKCRUBACKGROUND,
        borderRadius: 8,
        padding: 20,
    },
    modalTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        textAlign: 'center',
        marginBottom: 15,
    },
    optionRow: {
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        borderRadius: 4,
        marginBottom: 10,
    },
    optionText: {
        ...FONTS.Title3,
        color: COLORS.WHITE,
        textAlign: 'center',
    },
    modalButtonsRow: {
        marginTop: 20,
        alignItems: 'center',
    },
});
