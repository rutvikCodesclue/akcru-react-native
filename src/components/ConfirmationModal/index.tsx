import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import {AUTH_BUTTON_THEME} from '../../../assets/constants/authTheme';

type ConfirmationModalProps = {
    onPressYes: () => void;
    onPressNo: () => void;
    confirmationText: string;
    variant?: 'default' | 'continueWatching';
    yesLabel?: string;
    noLabel?: string;
};

const ComfirmationModal = ({
    confirmationText,
    onPressNo,
    onPressYes,
    variant = 'default',
    yesLabel = 'Yes',
    noLabel = 'No',
}: ConfirmationModalProps) => {
    const isContinueWatching = variant === 'continueWatching';
    const modalContent = (
        <>
            <Text style={[styles.message, isContinueWatching && styles.messageContinue]}>
                {confirmationText}
            </Text>
            <View style={styles.buttonRow}>
                {isContinueWatching ? (
                    <TouchableOpacity style={styles.yesButtonContinueTouchable} onPress={onPressYes}>
                        <LinearGradient
                            colors={['#7DD3FC', COLORS.AKCRUBLUE, COLORS.PINK, '#C026D3']}
                            locations={[0, 0.32, 0.68, 1]}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.yesButtonGradientBorder}>
                            <View style={styles.yesButtonInner}>
                                <Text style={styles.buttonText}>{yesLabel}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.button, styles.yesButton]} onPress={onPressYes}>
                        <Text style={styles.buttonText}>{yesLabel}</Text>
                    </TouchableOpacity>
                )}
                {isContinueWatching ? (
                    <TouchableOpacity style={styles.noButtonContinueTouchable} onPress={onPressNo}>
                        <LinearGradient
                            colors={AUTH_BUTTON_THEME.colors}
                            start={AUTH_BUTTON_THEME.start}
                            end={AUTH_BUTTON_THEME.end}
                            style={styles.noButtonGradient}>
                            <Text style={[styles.buttonText, styles.noButtonText]}>{noLabel}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.button, styles.noButton]} onPress={onPressNo}>
                        <Text style={[styles.buttonText, styles.noButtonText]}>No</Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );

    return (
        <View style={styles.overlay}>
            {isContinueWatching ? (
                <LinearGradient
                    colors={['#7DD3FC', COLORS.AKCRUBLUE, COLORS.PINK, '#C026D3']}
                    locations={[0, 0.32, 0.68, 1]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.modalGradientBorder}>
                    <View style={[styles.modal, styles.modalContinue]}>
                        {modalContent}
                    </View>
                </LinearGradient>
            ) : (
                <View style={styles.modal}>
                    {modalContent}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    modal: {
        width: '100%',
        maxWidth: 460,
        backgroundColor: COLORS.AKCRUBACKGROUND,
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalContinue: {
        backgroundColor: COLORS.BLACK,
        borderRadius: 14,
    },
    modalGradientBorder: {
        width: '100%',
        maxWidth: 460,
        borderRadius: 14,
        padding: 1.5,
    },
    message: {
        ...FONTS.Title3,
        textAlign: 'center',
        marginBottom: 14,
    },
    messageContinue: {
        color: COLORS.WHITE,
        fontSize: 20,
        lineHeight: 26,
        marginBottom: 16,
    },
    buttonRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        gap: 12,
    },
    button: {
        minWidth: 96,
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    yesButton: {
        backgroundColor: COLORS.PURPLE,
    },
    yesButtonContinueTouchable: {
        minWidth: 96,
        borderRadius: 8,
        overflow: 'hidden',
    },
    yesButtonGradientBorder: {
        borderRadius: 8,
        padding: 1.2,
    },
    yesButtonInner: {
        backgroundColor: COLORS.BLACK,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 96,
        paddingVertical: 10,
        paddingHorizontal: 22,
    },
    noButton: {
        backgroundColor: COLORS.DARKAKCRUBLUE,
    },
    noButtonContinueTouchable: {
        minWidth: 96,
        borderRadius: 8,
        overflow: 'hidden',
    },
    noButtonGradient: {
        minWidth: 96,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 22,
    },
    buttonText: {
        ...FONTS.Title3,
        color: COLORS.WHITE,
    },
    noButtonText: {
        color: COLORS.WHITE,
    },
});

export default ComfirmationModal;
