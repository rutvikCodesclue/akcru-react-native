import {Icon} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import { useRef } from 'react';
import {View, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Text, Pressable} from 'react-native';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import SmlMemberCard from '../SmlMemberCard';
import {selectAvatarBorderColor} from '../../util/util';

interface DockerProps {
    members: any;
    hmsInstanceRef: any;
    isExpanded: any;
    HMSVideoViewMode: any;
    peersMuteStatus: any;
}

const WatchPartyDocker = ({members, hmsInstanceRef, isExpanded, HMSVideoViewMode, peersMuteStatus}: DockerProps) => {
    const {width} = Dimensions.get('window');
    const [isDrawer, setIsDrawer] = useState(false);
    const [screenWidth, setScreenWidth] = useState(width)
    const [isscreenWidthSet, setIsScreenWidthSet] = useState(false)


    const toggledrawer = () => {
        if (!isDrawer) {
            setIsDrawer(true);
        } else {
            setIsDrawer(false);
        }
    };

    useEffect(() => {
        if(!isscreenWidthSet){
            setScreenWidth(width);
            setIsScreenWidthSet(true)
        }
    }, [width]);

    const membersList = (
        <ScrollView showsVerticalScrollIndicator={false}>
                        {members.map((item, index) => (
                            // <View key={index} style={{ marginVertical: 5 }}>
                            //     <SmlMemberCard
                            //         userPicture={item.user.profilePicture ?? ''}
                            //         userName={item.user.username ?? 'Anonymous'}
                            //         userID={item.user.id}
                            //         akcruBadge={item.user.badge}
                            //         userDesc={item.user.description ?? ''}
                            //         avatarbordercolor={selectAvatarBorderColor(item.user.badge ?? 'AKCRUIT')}
                            //     />
                            // </View>
                            <View
                                style={{
                                    width: screenWidth / 3.2,
                                    height: screenWidth / 2.5,
                                    backgroundColor: 'red',
                                    flex: 0,
                                    position: 'relative',
                                    zIndex: 0,
                                    bottom: 0,
                                    top: 0,
                                    borderColor: COLORS.CATPURPLGT,
                                    borderWidth: 4,
                                }}>
                                {/* CAMERA SCREEN */}
                                {item.peer.videoTrack?.trackId ? (
                                    <hmsInstanceRef.current.HmsView
                                        key={item.peer.peerID}
                                        trackId={item.peer.videoTrack.trackId}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: 'black',
                                        }}
                                        scaleType={HMSVideoViewMode.ASPECT_BALANCED}
                                        mirror={true}
                                    />
                                ) : null}
                                {/* HOST BADGE */}
                                {item.peer.role?.name === 'host' ? (
                                            <View style={{position: 'absolute', top: 0, right: 0}}>
                                                <Text
                                                    style={{
                                                        ...FONTS.paragraph1,
                                                        backgroundColor: COLORS.AKCRUBLUE,
                                                        paddingHorizontal: 5,
                                                        paddingVertical: 2,
                                                        borderBottomLeftRadius: 4,
                                                    }}>
                                                    {'Host'}
                                                </Text>
                                            </View>
                                        ) : null}
                                {/* USERNAME */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        backgroundColor: COLORS.TRANSDARKGREY,
                                        width: '100%',
                                        borderTopLeftRadius: 5,
                                        borderTopRightRadius: 5,
                                    }}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            paddingHorizontal: 3,
                                            paddingVertical: 5,
                                        }}>
                                        <Text style={{...FONTS.paragraph1, paddingVertical: 4}}>
                                            {isExpanded
                                                ? item.peer.name // Display full name when expanded
                                                : item.peer.name.length > 8
                                                ? item.peer.name.substring(0, 8) + '...' // Truncate to 10 characters and add ellipsis
                                                : item.peer.name}
                                        </Text>
                                        <Pressable
                                        // onPress={() => {
                                        //     handleMic(item.peer);
                                        // }}
                                        >
                                            <Icon
                                                name={
                                                    peersMuteStatus[item.peer.peerID] === undefined ||
                                                    peersMuteStatus[item.peer.peerID] == true
                                                        ? 'mic-off-circle'
                                                        : 'mic-circle'
                                                }
                                                type="ionicon"
                                                size={25}
                                                color={
                                                    peersMuteStatus[item.peer.peerID] === undefined ||
                                                    peersMuteStatus[item.peer.peerID] == true
                                                        ? COLORS.CATREDLGT
                                                        : COLORS.GREEN
                                                }
                                            />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                            

                        ))}
                    </ScrollView>
    );

    return (
        <>
            {isDrawer ? (
                <TouchableOpacity
                    style={isDrawer ? styles.buttonOpen : styles.buttonClosed}
                    onPress={() => toggledrawer()}>
                    <View style={isDrawer ? styles.DrawerIconContainerOpen : styles.DrawerIconContainerClose}>
                        <Icon name="chevron-forward" type="ionicon" size={25} color={COLORS.LIGHTGREY} />
                    </View>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={isDrawer ? styles.buttonOpen : styles.buttonClosed}
                    onPress={() => toggledrawer()}>
                    <View style={isDrawer ? styles.DrawerIconContainerOpen : styles.DrawerIconContainerClose}>
                        <Icon name="chevron-back" type="ionicon" size={25} color={COLORS.LIGHTGREY} />
                    </View>
                </TouchableOpacity>
            )}

            {isDrawer && (
                <View style={[styles.container, { height: screenWidth }]}>
                {membersList}
            </View>
            )}
        </>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        width: 150,
        backgroundColor: COLORS.AKCRUBACKGROUND,
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        zIndex: 1000,
        paddingTop:15,
        paddingBottom:15,
        right: 0,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    buttonOpen: {
        zIndex: 5000,
        position: 'absolute',
        height: 40,
        width: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        top: '25%',
        right: 135,
    },
    buttonClosed: {
        zIndex: 5000,
        position: 'absolute',
        height: 40,
        width: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        top: '25%',
        right: 0,
    },

    DrawerIconContainerOpen: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        height: 50,
        width: 50,
        marginTop: 10,
        paddingTop: 10,
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
        right: 20,
    },
    DrawerIconContainerClose: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        height: 50,
        width: 50,
        marginTop: 10,
        paddingTop: 10,
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
        right: 0,
    },
});

export default WatchPartyDocker;
