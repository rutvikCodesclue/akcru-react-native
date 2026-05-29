import {View, Text, TouchableOpacity, Pressable} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {Icon} from '@rneui/base';

type ResetPasswordResultModalProps = {
    closeModal: () => void;
    messageheader: string;
    messageheadercolor: string;
    message: string;
    iconname: string;
    iconcolor: string;
};

const ResetPasswordResultModal = ({
    closeModal,
    message,
    messageheader,
    messageheadercolor,
    iconcolor,
    iconname,
}: ResetPasswordResultModalProps) => {
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
                    backgroundColor: COLORS.WHITE,
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
                        color: messageheadercolor,
                    }}>
                    {messageheader}
                </Text>
                <Text
                    style={{
                        ...FONTS.Title3,
                        marginBottom: 10,
                        color: COLORS.CATGREENDRK,
                        textAlign: 'center',
                    }}>
                    {message}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                    <Text
                        style={{
                            ...FONTS.Title2,
                            marginBottom: 10,
                            textAlign: 'center',
                            color: COLORS.MIDORANGE,
                        }}>
                        Close
                    </Text>
                </TouchableOpacity>
            </View>
        </Pressable>
    );
};

export default ResetPasswordResultModal;
