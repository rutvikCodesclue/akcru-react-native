import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
import LinearGradient from 'react-native-linear-gradient';
import {selectAvatarBorderColor} from '../../util/util';
import HexAvatar from '../HexAvatar';
import CustomIcon from '../CustomIcon/CustomIcon';

const MAX_USERDESC_LENGTH = 50;

type UserSearchCardProps = {
    userPicture?: string;
    userName: string;
    influencer?: boolean;
    akcruBadge: any;
    onPress: () => void;
    userID: any;
    userDesc?: string;
    firstName?: string;
    ownerStatus?: boolean;
    companyStatus?: boolean;
    influencerStatus?: boolean;
};

const UserSearchCard = ({
    userPicture,
    userName,
    akcruBadge,
    onPress,
    userDesc,
    firstName,
    ownerStatus,
    companyStatus,
    influencerStatus,
}: UserSearchCardProps) => {
    const truncateduserDesc =
        userDesc && userDesc.length > MAX_USERDESC_LENGTH ? userDesc.slice(0, MAX_USERDESC_LENGTH) + '...' : userDesc;

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
                                size={58}
                                bordercolor={selectAvatarBorderColor(akcruBadge ?? 'AKCRUIT')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{...FONTS.Username}}>{userName}</Text>
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
                        <Text style={{...FONTS.paragraph1}}>{firstName}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                </View>
                <View>
                    <Text style={{...FONTS.paragraph1}}>{truncateduserDesc}</Text>
                </View>
            </View>
        </View>
    );
};

export default UserSearchCard;