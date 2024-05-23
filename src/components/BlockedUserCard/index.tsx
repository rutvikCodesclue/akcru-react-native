import {Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {Icon} from '@rneui/base';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {selectAvatarBorderColor} from '../../util/util';
import HexAvatar from '../HexAvatar';
import DisplayBadge from '../General/akcrubadge';
import CustomIcon from '../CustomIcon/CustomIcon';

const MAX_USERDESC_LENGTH = 50;

type BlockedUserCardProps = {
    userPicture?: string;
    userName: string;
    influencerStatus?: boolean;
    ownerStatus?: boolean;
    companyStatus?: boolean;
    blackCloakStatus?: boolean;
    akcruBadge: any;
    onPress: () => void;
    userID: any;
    userDesc?: string;
    firstName?: string;
    unblock: () => void;
};

const BlockedUserCard = ({
    userPicture,
    userName,
    influencerStatus,
    ownerStatus,
    companyStatus,
    blackCloakStatus,
    akcruBadge,
    onPress,
    userDesc,
    firstName,
    unblock,
}: BlockedUserCardProps) => {
    const truncateduserDesc =
        userDesc && userDesc.length > MAX_USERDESC_LENGTH ? userDesc.slice(0, MAX_USERDESC_LENGTH) + '...' : userDesc;

    return (
        <View
            style={{
                borderRadius: 5,
                backgroundColor: COLORS.TAGCOLOR,
                width: SIZES.ScreenWidth * 0.93,
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
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
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
                                <Text style={{...FONTS.Title3, fontSize: 12}}>{userName}</Text>
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
                                {blackCloakStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.BLACKCLOAK}
                                        baseSize={12}
                                        style={{marginRight: 5}}
                                    />
                                )}
                            </View>
                            <Text style={{...FONTS.paragraph1, fontSize: 12}}>{firstName}</Text>
                            <DisplayBadge akcruBadge={akcruBadge} />
                        </View>
                    </View>
                    <TouchableOpacity onPress={unblock}>
                        <Text style={{...FONTS.Title2, fontSize: 12, color: COLORS.PINK}}>UNBLOCK</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={{...FONTS.paragraph1, fontSize: 12}}>{truncateduserDesc}</Text>
                </View>
            </View>
        </View>
    );
};

export default BlockedUserCard;
