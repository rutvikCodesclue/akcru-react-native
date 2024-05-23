import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
import LinearGradient from 'react-native-linear-gradient';
import {selectAvatarBorderColor} from '../../util/util';
import CustomIcon from '../CustomIcon/CustomIcon';
import HexAvatar from '../HexAvatar';
import DisplayBadge from '../General/akcrubadge';

const MAX_USERDESC_LENGTH = 50;

type UserWalletSearchCardProps = {
    userPicture?: string;
    userName: string;
    influencer?: boolean;
    akcruBadge: any;
    onPress: () => void;
    onPressIn: () => void;
    userID: any;
    userDesc?: string;
    firstName?: string;
    ownerStatus?: boolean;
    companyStatus?: boolean;
    influencerStatus?: boolean;
    blackcloakStatus?: boolean;
};

const UserSearchCard = ({
    userPicture,
    userName,
    akcruBadge,
    onPress,
    onPressIn,
    userDesc,
    firstName,
    ownerStatus,
    companyStatus,
    influencerStatus,
    blackcloakStatus,
}: UserWalletSearchCardProps) => {
    const truncateduserDesc =
        userDesc && userDesc.length > MAX_USERDESC_LENGTH ? userDesc.slice(0, MAX_USERDESC_LENGTH) + '...' : userDesc;

    return (
        <View
            style={{
                borderRadius: 5,
                backgroundColor: COLORS.TAGCOLOR,
                width: SIZES.ScreenWidth,
                height: SIZES.ScreenHeight / 9.3,
            }}>
            <LinearGradient
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
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
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
                                <Text style={{...FONTS.Title2}}>{userName}</Text>
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
                                {blackcloakStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.BLACKCLOAK}
                                        baseSize={12}
                                        style={{marginRight: 5}}
                                    />
                                )}
                            </View>
                            <Text style={{...FONTS.paragraph1}}>{firstName}</Text>
                            <DisplayBadge akcruBadge={akcruBadge} />
                        </View>
                    </View>
                    <TouchableOpacity onPress={onPressIn}>
                        <View>
                            <Text style={{...FONTS.Title2, marginRight: '10%', color: COLORS.AKCRUBLUE}}>SEND</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View>
                    <Text style={{...FONTS.paragraph1}}>{truncateduserDesc}</Text>
                </View>
            </View>
        </View>
    );
};

export default UserSearchCard;
