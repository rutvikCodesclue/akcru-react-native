import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {Avatar, Icon} from '@rneui/base';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
import LinearGradient from 'react-native-linear-gradient';
import DisplayBadge from '../General/akcrubadge';

const MAX_USERNAME_LENGTH = 10;

type SmlMemberCardProps = {
    userPicture: string;
    userName: string;
    influencer?: boolean;
    akcruBadge: any;
    onPress?: () => void;
    userID: any;
    userDesc: string;
    avatarbordercolor: string;
};

const SmlMemberCard = ({userPicture, userName, influencer, akcruBadge, onPress, userDesc}: SmlMemberCardProps) => {
    const truncateduserName =
        userDesc.length > MAX_USERNAME_LENGTH ? userName.slice(0, MAX_USERNAME_LENGTH) + '...' : userName;

    return (
        <View style={{width: SIZES.ScreenWidth / 2.1}}>
            <View
                style={{
                    borderRadius: 5,
                    backgroundColor: COLORS.TAGCOLOR,
                    width: SIZES.ScreenWidth / 2.3,
                    height: SIZES.ScreenHeight * 0.08,
                }}>
                <LinearGradient
                    colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        width: SIZES.ScreenWidth / 2.3,
                        borderRadius: 5,
                        height: SIZES.ScreenHeight * 0.08,
                    }}
                />
                <View style={{padding: 10}}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{marginRight: 8}}>
                            <TouchableOpacity onPress={onPress}>
                                <Avatar
                                    rounded
                                    size={40}
                                    source={{
                                        uri: userPicture,
                                    }}
                                    avatarStyle={{
                                        borderWidth: 2,
                                        borderColor: COLORS.AKCRUBLUE,
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
            
        </View>
    );
};

export default SmlMemberCard;
