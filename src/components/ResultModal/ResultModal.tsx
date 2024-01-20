import {View, Text, TouchableOpacity, Pressable} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {Icon} from '@rneui/base';

type ResultModalProps = {
    closeModal: () => void;
    type: any;
};

const ResultModal = ({closeModal, type}: ResultModalProps) => {
    const getMessage = () => {
        switch (type) {
            case 'success':
                return {
                    title: 'Success!',
                    message: 'Movie added to watchlist successfully',
                    color: COLORS.GREEN,
                };
            case 'failed':
                return {
                    title: 'Failed',
                    message: 'Failed to add movie to watchlist',
                    color: COLORS.CATREDLGT,
                };
            case 'alreadyInList':
                return {
                    title: 'Already Added',
                    message: 'You already have this movie in your list',
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


export default ResultModal;
