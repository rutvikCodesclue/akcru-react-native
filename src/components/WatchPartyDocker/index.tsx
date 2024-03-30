import {Icon} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, StyleSheet, Dimensions, ScrollView} from 'react-native';
import {COLORS} from '../../../assets/constants';
import SmlMemberCard from '../SmlMemberCard';
import {selectAvatarBorderColor} from '../../util/util';

interface DockerProps {
    members: any;
}

const WatchPartyDocker = ({members}: DockerProps) => {
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
                            <View key={index} style={{ marginVertical: 5 }}>
                                <SmlMemberCard
                                    userPicture={item.user.profilePicture ?? ''}
                                    userName={item.user.username ?? 'Anonymous'}
                                    userID={item.user.id}
                                    akcruBadge={item.user.badge}
                                    userDesc={item.user.description ?? ''}
                                    avatarbordercolor={selectAvatarBorderColor(item.user.badge ?? 'AKCRUIT')}
                                />
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
