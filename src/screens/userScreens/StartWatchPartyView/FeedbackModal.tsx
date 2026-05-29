import React from 'react';
import {Modal, View, Text, StyleSheet} from 'react-native';
import {FONTS, COLORS} from '../../../../assets/constants';
import {FeedBackModalProps} from './WatchPartyProps';

const modalContent = (type: string) => {
    let title = 'Default Title';
    let description = 'Default description';

    if (type === 'unmuteRequestSent') {
        title = 'Unmute Request Sent';
        description = 'Waiting for the host to approve your unmute request.';
    } else if (type === 'hostNotInRoom') {
        title = 'Host Not In Room Yet';
        description = 'The watch pary host is not in the room. Please wait for them to join';
    }

    return [title, description];
};

const FeedBackModal = ({modalType}: FeedBackModalProps) => {
    const [title, description] = modalContent(modalType);

    return (
        <Modal visible={true} animationType="fade" transparent={true}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.textContainer}>
                        <Text style={[FONTS.Title3, styles.feedbackTitle]}>{title}</Text>
                        <Text style={[FONTS.paragraph2, styles.feedbackMessage]}>{description}</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.OVERLAY_BLACK_50,
    },
    modalContainer: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        padding: 20,
        borderRadius: 10,
        marginHorizontal: '5%',
    },
    textContainer: {
        alignItems: 'center',
    },
    feedbackTitle: {
        marginBottom: 10,
    },
    feedbackMessage: {
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default FeedBackModal;
