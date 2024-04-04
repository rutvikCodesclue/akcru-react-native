import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import React, { useState } from 'react';
import {Avatar, Icon} from '@rneui/base';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants/index';
import AkcruLevels from '../../../components/akcruBadges';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../assets/images/imageindex';
import { IUserProfile } from '../../../../types';
import { useFocusEffect } from '@react-navigation/native';
import { findAUser } from '../../../lib/api/user.lib';
import { selectAvatarBorderColor } from '../../../util/util';
import HexAvatar from '../../../components/HexAvatar';
import { MULTISIZES } from '../../../../assets/constants/theme';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';

const MAX_USERDESC_LENGTH = 50; // Maximum number of characters for the userDesc

type MITUserSearchCardProps = {
    userPicture?: string;
    userName: string;
    influencerStatus: boolean;
    ownerStatus: boolean;
    companyStatus: boolean;
    akcruBadge: any;
    onPress: () => void;
    userID: any;
    userDesc?: string;
    onPressOut: () => void;
    firstName?: string;
};

const MITUserSearchCard = ({
    
    userPicture,
    userName,
    influencerStatus,
    ownerStatus,
    companyStatus,
    akcruBadge,
    onPress,
    userID,
    userDesc,
    onPressOut,
    firstName,
}: MITUserSearchCardProps) => {
    // const truncateduserDesc =
    //     userDesc && userDesc.length > MAX_USERDESC_LENGTH ? userDesc.slice(0, MAX_USERDESC_LENGTH) + '...' : userDesc;
    

    return (
        <View
            style={{
                borderRadius: 5,
                backgroundColor: COLORS.TAGCOLOR,
                width: SIZES.ScreenWidth,
                height: SIZES.ScreenHeight / 9.3,
            }}>
            <LinearGradient
                // Background Linear Gradient
                colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    width: SIZES.ScreenWidth,
                    borderRadius: 5,
                    height: SIZES.ScreenHeight / 9.3,
                }}
            />
            <View style={{padding: 10}}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginRight: 30,
                    }}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{marginRight: 8}}>
                            <TouchableOpacity onPress={onPress}>
                                {/* <Avatar
                                    rounded
                                    size={40}
                                    source={userPicture ? {uri: userPicture} : imageindex.Akcruplaceholder}
                                    avatarStyle={{
                                        borderWidth: 2,
                                        borderColor: selectAvatarBorderColor(akcruBadge),
                                    }}
                                /> */}

                                <HexAvatar
                                    source={userPicture ? {uri: userPicture} : imageindex.Akcruplaceholder}
                                    size={MULTISIZES.Xlarge60}
                                    bordercolor={selectAvatarBorderColor(akcruBadge)}
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{...FONTS.Title2, marginRight: 5}}>{userName}</Text>
                                {ownerStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.STARGOLD}
                                        baseSize={12}
                                        style={{marginRight: 5}}
                                    />
                                )}
                                {companyStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.WHITE}
                                        baseSize={12}
                                        style={{marginRight: 5}}
                                    />
                                )}
                                {influencerStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.AKCRUBLUE}
                                        baseSize={12}
                                        style={{marginRight: 5}}
                                    />
                                )}
                            </View>
                            <Text style={{...FONTS.paragraph1}}>
                                {firstName}
                            </Text>
                            {akcruBadge === 'AKCRUIT' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeAkcruit />
                                </View>
                            )}
                            {akcruBadge === 'GUARDIAN' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeGuardian />
                                </View>
                            )}
                            {akcruBadge === 'HERO' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeHero />
                                </View>
                            )}
                            {akcruBadge === 'SUPERHERO' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeSuperHero />
                                </View>
                            )}
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity style={{alignItems: 'center'}} onPressOut={onPressOut}>
                            <Image source={imageindex.MITticket} />
                            <View>
                                <Text style={{...FONTS.Title3, fontSize: 12}}>Send MIT</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* <View>
                    <Text style={{...FONTS.paragraph1, fontSize: 12}}>{truncateduserDesc}</Text>
                </View> */}
            </View>
        </View>
    );
};

export default MITUserSearchCard;
