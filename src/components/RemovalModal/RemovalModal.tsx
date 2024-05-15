import {View, Text, Pressable} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {Icon} from '@rneui/base';

type RemovalModalProps = {
    closeModal: () => void;
    type: any;
};

const RemovalModal = ({closeModal, type}: RemovalModalProps) => {
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
                    {type === 'success' ? 'Movie removed successfully' : 'Failed to remove movie'}
                </Text>
            </View>
        </Pressable>
    );
};

export default RemovalModal;
