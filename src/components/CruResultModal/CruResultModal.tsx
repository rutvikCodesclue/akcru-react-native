import {View, Text, Pressable} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {Icon} from '@rneui/themed';

type CruResultModalProps = {
    closeModal: () => void;
    type: string;
    message: string;
    iconname: string;
    iconcolor: string;
};

const CruResultModal = ({closeModal, message, iconcolor, iconname, type}: CruResultModalProps) => {
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

export default CruResultModal;
