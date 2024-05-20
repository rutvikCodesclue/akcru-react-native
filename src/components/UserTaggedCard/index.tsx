import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {Icon} from '@rneui/base';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
import LinearGradient from 'react-native-linear-gradient';
import {selectAvatarBorderColor} from '../../util/util';
import HexAvatar from '../HexAvatar';
import DisplayBadge from '../General/akcrubadge';

type UserTaggedCardProps = {
    userPicture?: string;
    userName: string;
    influencer?: boolean;
    akcruBadge: any;
    onPress: () => void;
    userID: any;
    userDesc?: string;
    firstName?: string;
};

const UserTaggedCard = ({userPicture, userName, influencer, akcruBadge, onPress, firstName}: UserTaggedCardProps) => {
    return (
        <View
            style={{
                borderRadius: 5,
                backgroundColor: COLORS.TAGCOLOR,
                width: SIZES.ScreenWidth,
            }}>
            <LinearGradient
                colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    width: '100%',
                    borderRadius: 5,
                    height: '100%',
                }}
            />
            <View style={{padding: 10}}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{marginRight: 8}}>
                        <TouchableOpacity onPress={onPress}>
                            <HexAvatar
                                source={{uri: userPicture}}
                                size={45}
                                bordercolor={selectAvatarBorderColor(akcruBadge ?? 'AKCRUIT')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{...FONTS.Title1, fontSize: 12}}>{userName}</Text>
                                {influencer && (
                                    <Icon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.AKCRUBLUE}
                                        size={18}
                                        style={{marginLeft: 5}}
                                    />
                                )}
                            </View>
                            <Text style={{...FONTS.paragraph1, fontSize: 12}}> / {firstName}</Text>
                        </View>

                        <DisplayBadge akcruBadge={akcruBadge} />
                    </View>
                </View>
            </View>
        </View>
    );
};

export default UserTaggedCard;
