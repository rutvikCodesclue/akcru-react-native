import {View, Text, TouchableOpacity, Pressable, StyleSheet} from 'react-native';
import React from 'react';
import {Avatar, Icon} from '@rneui/base';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {selectAvatarBorderColor} from '../../util/util';
import imageindex from '../../../assets/images/imageindex';
import DisplayBadge from '../General/akcrubadge';
const MAX_USERNAME_LENGTH = 10;

type AddMemberCardProps = {
    userPicture: string | undefined;
    userName: string;
    influencer: boolean;
    akcruBadge: any;
    userID: any;
    userDesc: string;
    AddMember: (userID: any) => void;
    onPress: () => void;
};

const AddMemberCard = ({
    userPicture,
    userName,
    influencer,
    akcruBadge,
    userID,
    userDesc,
    AddMember,
    onPress,
}: AddMemberCardProps) => {
    const truncateduserName =
        userDesc && userDesc?.length > MAX_USERNAME_LENGTH ? userName.slice(0, MAX_USERNAME_LENGTH) + '...' : userName;

    const handleAddMember = () => {
        AddMember(userID);
    };

    return (
        <View style={{width: SIZES.ScreenWidth / 2.1}}>
            <View style={styles.container}>
                <LinearGradient
                    colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
                    style={styles.subContainer}
                />
                <View style={styles.pd10}>
                    <View style={styles.flexRow}>
                        <View style={styles.mr8}>
                            <TouchableOpacity onPress={onPress}>
                                <Avatar
                                    rounded
                                    size={40}
                                    source={
                                        userPicture
                                            ? {
                                                  uri: userPicture,
                                              }
                                            : imageindex.Akcruplaceholder
                                    }
                                    avatarStyle={{
                                        borderWidth: 2,
                                        borderColor: selectAvatarBorderColor(akcruBadge),
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <View style={styles.flexAlignCenter}>
                                <Text style={{...FONTS.Title2}}>{truncateduserName}</Text>
                                {influencer && (
                                    <Icon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.AKCRUBLUE}
                                        size={20}
                                        style={{marginLeft: 5}}
                                    />
                                )}
                            </View>

                            <DisplayBadge akcruBadge={akcruBadge} />
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.memberStyle}>
                <Pressable onPress={handleAddMember}>
                    <Icon name="add-circle" type="ionicon" size={25} color={COLORS.GREEN} />
                </Pressable>
            </View>
        </View>
    );
};

export default AddMemberCard;

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        backgroundColor: COLORS.TAGCOLOR,
        width: SIZES.ScreenWidth / 2.3,
        height: SIZES.ScreenHeight * 0.08,
    },
    subContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        width: SIZES.ScreenWidth / 2.3,
        borderRadius: 5,
        height: SIZES.ScreenHeight * 0.08,
    },
    pd10: {
        padding: 10,
    },
    flexRow: {
        flexDirection: 'row',
    },
    mr8: {
        marginRight: 8,
    },
    flexAlignCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberStyle: {
        position: 'absolute',
        right: 5,
        top: -5,
    },
});
