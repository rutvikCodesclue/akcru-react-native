import {View, Text, Pressable} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {Icon} from '@rneui/base';

type ReportResultModalProps = {
    closeModal: () => void;
    type: any;
};

const ReportResultModal = ({closeModal, type}: ReportResultModalProps) => {
    return (
        <Pressable
            onPress={closeModal}
            style={{
                flex: 1,
                backgroundColor: COLORS.OVERLAY_BLACK_50,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <View
                style={{
                    backgroundColor: COLORS.AKCRUBACKGROUND,
                    padding: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginHorizontal: 15,
                    width: '75%',
                }}>
                <View>
                    <Icon
                        name={type === 'success' ? 'paper-plane' : 'alert-circle'}
                        type="ionicon"
                        size={80}
                        color={type === 'success' ? COLORS.GREEN : COLORS.CATREDLGT}
                    />
                </View>
                <Text
                    style={{
                        ...FONTS.Title3,
                        marginBottom: 5,
                        textAlign: 'center',
                        fontSize: 20,
                        color: type === 'success' ? COLORS.CATGREENDRK : COLORS.CATREDDRK,
                    }}>
                    {type === 'success' ? 'Success!' : 'Failed'}
                </Text>
                <Text
                    style={{
                        ...FONTS.Title3,
                        marginBottom: 10,
                        textAlign: 'center',
                    }}>
                    {type === 'success'
                        ? 'Your report was sent successfully, we will review it and get back to you soon'
                        : 'Something went wrong, please try again later'}
                </Text>
            </View>
        </Pressable>
    );
};

export default ReportResultModal;
