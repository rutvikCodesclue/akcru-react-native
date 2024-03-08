import {View, Text, TouchableOpacity, Pressable} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {Icon} from '@rneui/themed';

type DateResultModalProps = {
    closeModal: () => void;
    type: string;
    message: string;
    iconname: string;
    iconcolor: string;
};

const DateResultModal = ({closeModal, message, iconcolor, iconname, type}: DateResultModalProps) => {
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
                    <Icon name={iconname} type="ionicon" size={80} color={iconcolor} />
                </View>
                <Text
                    style={{
                        ...FONTS.Title3,
                        marginBottom: 5,
                        textAlign: 'center',
                        fontSize: 20,
                        color: COLORS.MIDORANGE,
                    }}>
                    {type}
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

export default DateResultModal;
