import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {Icon} from '@rneui/base';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {selectAvatarBorderColor} from '../../util/util';
import HexAvatar from '../HexAvatar';
import DisplayBadge from '../General/akcrubadge';
import { isTablet } from '../../../assets/constants/theme';

const MAX_USERNAME_LENGTH = 10;

type FlickFlirtMatchCardProps = {
    userPicture: string | undefined;
    userName: string;
    influencer: boolean;
    akcruBadge: any;
    onPress: () => void;
    userDesc?: string;
    matchLabel?: string;
};

const FlickFlirtMatchCard = ({
    userPicture,
    userName,
    influencer,
    akcruBadge,
    onPress,
    userDesc,
    matchLabel,
}: FlickFlirtMatchCardProps) => {
    const truncateduserName =
        userDesc && userDesc?.length > MAX_USERNAME_LENGTH ? userName.slice(0, MAX_USERNAME_LENGTH) + '...' : userName;

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
                                <HexAvatar
                                    source={{uri: userPicture}}
                                    size={isTablet() ? 75 : 45}
                                    bordercolor={selectAvatarBorderColor(akcruBadge ?? 'AKCRUIT')}
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{...FONTS.Username}}>{truncateduserName}</Text>
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
                            {matchLabel && <Text style={{...FONTS.Title3, color: COLORS.AKCRUPINK}}>{matchLabel}</Text>}

                            <DisplayBadge akcruBadge={akcruBadge} />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};
export default FlickFlirtMatchCard;
