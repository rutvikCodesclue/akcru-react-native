import {Text, View, Modal} from 'react-native';
import React from 'react';
import {FONTS, COLORS} from '../../../../assets/constants';

const AwaitingMicPermModal = () => {
    return (
        <Modal animationType="fade" transparent={true}>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                <View
                    style={{
                        backgroundColor: COLORS.AKCRUBACKGROUND,
                        padding: 20,
                        borderRadius: 10,
                        marginHorizontal: '5%',
                    }}>
                    <View style={{alignItems: 'center'}}>
                        <Text style={{...FONTS.Title3, marginBottom: 10}}>Unmute Request Sent</Text>
                        <Text style={{marginBottom: 20, ...FONTS.paragraph2, textAlign: 'center'}}>
                            Waiting for the host to approve your unmute request.
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AwaitingMicPermModal;
