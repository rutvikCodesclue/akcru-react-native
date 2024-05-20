import {Text, View, Modal} from 'react-native';
import React from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import {FONTS, COLORS} from '../../../../assets/constants';

interface Props {
    leaveRoom: any; 
    handleOptionModal: any; 
    handleRoomTermination: any; 
    handleCancelLeaveRoom: any;
}

const HostLeaveRoomModal = ({leaveRoom, handleOptionModal, handleRoomTermination, handleCancelLeaveRoom}: Props) => {
    return (
        <Modal animationType="fade" transparent={true} visible={leaveRoom}>
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
                        <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm leaving Watch Party</Text>
                        <Text style={{marginBottom: 20, ...FONTS.paragraph2, textAlign: 'center'}}>
                            Please assign a new host or terminate the watch party session to leave
                        </Text>
                    </View>

                    <View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                            }}>
                            <AkcruButtons.SmallButton
                                onPress={handleOptionModal}
                                color={COLORS.PINK}
                                btnname="Assign Host"
                            />
                            <AkcruButtons.SmallButton
                                onPress={handleRoomTermination}
                                color={COLORS.PURPLE}
                                btnname="Terminate"
                            />
                        </View>
                        <View style={{alignItems: 'center', paddingTop: 10}}>
                            <AkcruButtons.SmallButton
                                onPress={handleCancelLeaveRoom}
                                color={COLORS.CATREDLGT}
                                btnname="Cancel"
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
};

export default HostLeaveRoomModal;
