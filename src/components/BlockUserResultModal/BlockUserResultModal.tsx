import {View, Text, TouchableOpacity, Pressable} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {Icon} from '@rneui/base';

type BlockUserResultModalProps = {
    closeModal: () => void;
    type: any;
    resultMessage: string;
};

const BlockUserResultModal = ({closeModal, type, resultMessage}: BlockUserResultModalProps) => {
    const getMessage = () => {
        switch (type) {
            case 'success':
                return {
                    title: 'Success!',
                    message: resultMessage,
                    color: COLORS.GREEN,
                };
            case 'failed':
                return {
                    title: 'Failed',
                    message: resultMessage,
                    color: COLORS.CATREDLGT,
                };
            case 'error':
                return {
                    title: 'Error',
                    message: resultMessage,
                    color: COLORS.MIDORANGE,
                };
            default:
                return {title: '', message: '', color: COLORS.BLACK};
        }
    };

    const {title, message, color} = getMessage();

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
                    backgroundColor: COLORS.AKCRUBACKGROUND,
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
                        color={color}
                    />
                </View>
                <Text
                    style={{
                        ...FONTS.Title3,
                        marginBottom: 5,
                        textAlign: 'center',
                        fontSize: 20,
                        color: color,
                    }}>
                    {title}
                </Text>
                <Text
                    style={{
                        ...FONTS.Title3,
                        marginBottom: 10,
                        textAlign: 'center',
                    }}>
                    {message}
                </Text>
            </View>
        </Pressable>
    );
};


export default BlockUserResultModal;
