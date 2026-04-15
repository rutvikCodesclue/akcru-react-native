import {View, Text, TouchableOpacity, Pressable} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {Icon} from '@rneui/base';

type OTPResultModalProps = {
    closeModal: () => void;
    type: string;
    message?: string;
};

const OTPResultModal = ({closeModal, type, message}: OTPResultModalProps) => {
    return (
        <Pressable
            onPress={closeModal}
            style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <View
                style={{
                    backgroundColor: COLORS.WHITE,
                    padding: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginHorizontal: 15,
                    width: '75%',
                }}>
                <View>
                    <Icon
                        name={type === 'success' ? 'checkmark-circle' : 'close-circle'}
                        type="ionicon"
                        size={80}
                        color={type === 'success' ? COLORS.PURPLE : COLORS.CATREDLGT}
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
                        color: COLORS.AKCRUBACKGROUND,
                        textAlign: 'center',
                    }}>
                    {type === 'success'
                        ? 'Thank you for verifying your Email'
                        : message || 'Something went wrong, please check the code that was sent and retry'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                    <Text
                        style={{
                            ...FONTS.Title2,
                            marginBottom: 10,
                            textAlign: 'center',
                            color: COLORS.MIDORANGE,
                        }}>
                        {type === 'success' ? 'Next' : 'Close'}
                    </Text>
                </TouchableOpacity>
            </View>
        </Pressable>
    );
};

export default OTPResultModal;
