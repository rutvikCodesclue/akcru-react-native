import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {COLORS, FONTS} from '../../../assets/constants';
import AkcruButtons from '../akcruButtons';
import {useNavigation} from '@react-navigation/native';

interface Props {
    visible: boolean;
    onClose: () => void;
    onRent: () => void;
    onBuy: () => void;
    rentalLabel?: string;
    buyLabel?: string;
    canRent: boolean;
    canBuy: boolean;
    balance: number;
    rentalPrice: number; // ← new
    buyPrice: number;
}

export default function ContentPurchaseModal({
    visible,
    onClose,
    onRent,
    onBuy,
    rentalLabel,
    buyLabel,
    canRent,
    canBuy,
    balance,
    rentalPrice,
    buyPrice,
}: Props) {
    const nav = useNavigation();

    if (!visible) {
        return null;
    }

    const shortageRent = rentalPrice - balance;
    const shortageBuy = buyPrice - balance;

    const goTopUp = () => {
        // if your PurchaseAdScreen lives in a sibling stack, you might need:
        // nav.getParent()?.navigate('AkcruButtonStack', { screen: 'PurchaseAdScreen' });
        // but if it's registered at the same level, this will work:
        nav.getParent()?.navigate('AkcruButtonStack', {screen: 'PurchaseAdScreen'});
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Choose an option</Text>
                    <Text style={styles.balance}>Your balance: {balance} AD</Text>

                    {rentalLabel && (
                        <>
                            <TouchableOpacity
                                style={[styles.button, !canRent && styles.disabledButton]}
                                onPress={() => {
                                    if (canRent) onRent();
                                    else goTopUp();
                                }}
                                activeOpacity={0.7}>
                                <Text style={styles.btnText}>
                                    {canRent ? rentalLabel : `Need ${rentalPrice} AD to rent`}
                                </Text>
                            </TouchableOpacity>
                            {/* {!canRent && <Text style={styles.hint}>Cost: {rentalPrice.toString()} AD</Text>} */}
                        </>
                    )}

                    {buyLabel && (
                        <>
                            <TouchableOpacity
                                style={[styles.button, !canBuy && styles.disabledButton]}
                                onPress={() => {
                                    if (canBuy) onBuy();
                                    else goTopUp();
                                }}
                                activeOpacity={0.7}>
                                <Text style={styles.btnText}>{canBuy ? buyLabel : `Need ${buyPrice} AD to buy`}</Text>
                            </TouchableOpacity>
                            {/* {!canBuy && <Text style={styles.hint}>Cost: {buyPrice.toString()} AD</Text>} */}
                        </>
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
        color: COLORS.PINK,
        textAlign: 'center',
        marginBottom: 5,
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
    disabledButton: {
        backgroundColor: COLORS.DARKERGREY,
    },
    btnText: {
        ...FONTS.Title3,
        color: COLORS.WHITE,
        textAlign: 'center',
    },
    hint: {
        ...FONTS.Title3,
        textAlign: 'center',
        color: COLORS.DARKGREY,
        marginBottom: 8,
    },
    button: {
        backgroundColor: COLORS.AKCRUBLUE,
        paddingVertical: 12,
        borderRadius: 6,
        marginVertical: 8,
    },
    balance: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        textAlign: 'center',
        marginBottom: 15,
    },
});
