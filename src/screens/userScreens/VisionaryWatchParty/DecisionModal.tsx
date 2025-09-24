import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {FONTS, COLORS} from '../../../../assets/constants';
import {DecisionModalProps} from './WatchPartyProps';

const modalContent = (type: string, username: string | undefined) => {
    let title = 'Default Title';
    let description = 'Default description';

    if (type === 'unmuteRequest') {
        title = 'Permission to Unmute Mic';
        description = `${username} is requesting to unmute themselves. Do you accept the request?`;
    } else if (type === 'confirmHostTransfer') {
        title = 'Confirm Host Transfer';
        description = `Are you sure you want to make ${username}} the watch party host?`;
    } else if (type === 'leaveRoom') {
        title = 'Confirm Leaving Watch Party';
        description = 'Are you sure that you want to leave this watch party session?';
    } else if (type === 'hostLeaveRoom') {
        title = 'Confirm Leaving Watch Party';
        description =
            'Leaving the watch party session as host will end the session for everyone. Assign another guest as the watch party host.';
    } else if (type === 'endRoom') {
        title = 'Confirm Leave And End Watch Party';
        description = 'Are you sure you want to leave and end this watch party session for everyone?';
    }
    return [title, description];
};

const DecisionModal = ({modalType, username, setShowDecisionModal, handleAccept}: DecisionModalProps) => {
    let [title, description] = modalContent(modalType, username);

    return (
        <Modal animationType="fade" transparent={true} visible={true}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.description}>{description}</Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowDecisionModal(false);
                            }}
                            style={styles.declineButton}>
                            <Text style={styles.buttonText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setShowDecisionModal(false);
                                handleAccept();
                            }}
                            style={styles.acceptButton}>
                            <Text style={styles.buttonText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DecisionModal;

// Define styles for the modal
const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        ...FONTS.Title3,
        marginBottom: 10,
    },
    description: {
        ...FONTS.paragraph1,
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    declineButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    acceptButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        ...FONTS.Title3,
        color: 'white', // Assuming white text for buttons, adjust as needed
    },
});
