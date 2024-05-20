import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {FONTS, COLORS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';

interface Props {
    handleLeaveRoom: any;
    isStreamOpen: any;
    isHost: any;
    handleOptionModal: any;
}

const TopContainer = ({handleLeaveRoom, isStreamOpen, isHost, handleOptionModal}: Props) => {
    return (
        <View style={styles.topcontainer}>
            <TouchableOpacity onPress={handleLeaveRoom}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                    <Text style={{...FONTS.Title3, marginLeft: 5}}>Leave Room</Text>
                </View>
            </TouchableOpacity>
            {!isStreamOpen && isHost && (
                <>
                    <TouchableOpacity onPress={handleOptionModal}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <Icon
                                name="ellipsis-vertical-circle"
                                type="ionicon"
                                size={23}
                                color={COLORS.LIGHTGREY}
                            />
                        </View>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default TopContainer;

const styles = StyleSheet.create({
    topcontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginBottom: 15,
    },
});

