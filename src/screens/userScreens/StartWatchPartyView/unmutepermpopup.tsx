import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {SIZES, FONTS, COLORS} from '../../../../assets/constants';

const UnmutePermissionPopup = ({handleCancel, handleUnmute, userdata}) => {
    return (
        <Modal animationType="fade" transparent={true} visible={true}>
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
                        <Text style={{...FONTS.Title3, marginBottom: 10}}>Permission to Unmute</Text>
                        <Text style={{marginBottom: 20, ...FONTS.Title3}}>
                            {userdata.username} is requesting to unmute themselves. Do you accept the request?
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                        <TouchableOpacity
                            onPress={handleCancel}
                            style={{
                                backgroundColor: 'red',
                                padding: 10,
                                borderRadius: 5,
                            }}>
                            <Text style={{...FONTS.Title3}}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleUnmute}
                            style={{
                                backgroundColor: 'green',
                                padding: 10,
                                borderRadius: 5,
                            }}>
                            <Text style={{...FONTS.Title3}}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default UnmutePermissionPopup;

const styles = StyleSheet.create({
    topcontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginBottom: 15,
    },
    poster: {
        width: 70,
        height: 110,
        borderRadius: 5,
    },
    moviecontainer: {
        marginHorizontal: 15,
        padding: 10,
        flexDirection: 'row',
        backgroundColor: '#1C202A',
        borderRadius: 5,
        height: SIZES.ScreenHeight * 0.18,
        alignItems: 'center',
    },
    drawfonttag: {
        ...FONTS.Title2Orange,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 4,
        borderRadius: 4,
        textAlign: 'center',
    },
    input: {
        flexDirection: 'row',
        borderWidth: 0.8,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        justifyContent: 'space-between',
        marginVertical: 10,
        paddingLeft: 10,
        alignItems: 'center',
        height: 35,
    },
    textinput: {
        color: COLORS.LIGHTGREY,
    },
    videocontain: {
        flex: 1,
        zIndex: 1,
        justifyContent: 'center',
    },
    movieview: {
        height: SIZES.ScreenHeight / 3.5,
    },
    fullscreenmovie: {
        width: SIZES.ScreenHeight,
        height: SIZES.ScreenWidth,
    },
    videoplayer: {
        alignSelf: 'center',
        aspectRatio: 16 / 9,
        width: '100%',
    },
    bottombtn: {
        paddingTop: 10,
        position: 'relative',
    },
});
