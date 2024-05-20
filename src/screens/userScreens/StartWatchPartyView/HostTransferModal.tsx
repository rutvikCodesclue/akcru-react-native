import {Text, View, TouchableOpacity, Modal} from 'react-native';
import React from 'react';
import {FONTS, COLORS} from '../../../../assets/constants';

interface Props {
    showTransferConfirmation: any;
    selectedMemeberForHost: any;
    handleCancelTransfer: any;
    handleTransfer: any;
}

const HostTransferModal = ({showTransferConfirmation, selectedMemeberForHost, handleCancelTransfer, handleTransfer}: Props) => {
    return (
        <Modal animationType="fade" transparent={true} visible={showTransferConfirmation}>
            <View
                style={{
                    zIndex: 100,
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
                    }}>
                    <View style={{alignItems: 'center'}}>
                        <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm Host Transfer</Text>
                        <Text style={{marginBottom: 20, ...FONTS.Title3}}>
                            {`Are you sure you want to transfer hosting privileges to "${selectedMemeberForHost?.user.username}"`}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                        <TouchableOpacity
                            onPress={handleCancelTransfer}
                            style={{
                                backgroundColor: 'red',
                                padding: 10,
                                borderRadius: 5,
                            }}>
                            <Text style={{...FONTS.Title3}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleTransfer}
                            style={{
                                backgroundColor: 'green',
                                padding: 10,
                                borderRadius: 5,
                            }}>
                            <Text style={{...FONTS.Title3}}>Transfer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
};

export default HostTransferModal;