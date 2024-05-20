import {Text, View, Modal} from 'react-native';
import React from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import {FONTS, COLORS} from '../../../../assets/constants';

interface Props {
    leaveRoom: any; 
    _handleRoomLeave: any;
    handleCancelLeaveRoom: any;
}

const LeaveRoomModal = ({leaveRoom, _handleRoomLeave, handleCancelLeaveRoom}: Props) => {
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
                    }}>
                    <View style={{alignItems: 'center'}}>
                        <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm leaving Watch Party</Text>
                        <Text style={{marginBottom: 20, ...FONTS.paragraph2, textAlign: 'center'}}>
                            Are you sure you want to leave this watch party session?
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            marginHorizontal: '5%',
                        }}>
                        <AkcruButtons.SmallButton
                            onPress={_handleRoomLeave}
                            color={COLORS.PINK}
                            btnname="Leave Room"
                        />
                        <AkcruButtons.SmallButton
                            onPress={handleCancelLeaveRoom}
                            color={COLORS.PURPLE}
                            btnname="Cancel"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default LeaveRoomModal;