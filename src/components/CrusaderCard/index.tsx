import {Text, View, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {selectAvatarBorderColor} from '../../util/util';
import HexAvatar from '../HexAvatar';
import CustomIcon from '../CustomIcon/CustomIcon';
import DisplayBadge from '../General/akcrubadge';

const MAX_USERDESC_LENGTH = 50;

type CrusaderCardProps = {
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
    blackCloakStatus?: boolean;
    isAdmin?: boolean;
};

const CrusaderCard = ({
    userPicture,
    userName,
    akcruBadge,
    onPress,
    userDesc,
    firstName,
    ownerStatus,
    companyStatus,
    influencerStatus,
    blackCloakStatus,
    isAdmin,
}: CrusaderCardProps) => {
    const truncateduserDesc =
        userDesc && userDesc.length > MAX_USERDESC_LENGTH ? userDesc.slice(0, MAX_USERDESC_LENGTH) + '...' : userDesc;

    return (
        <View
            style={{
                borderRadius: 5,
                backgroundColor: COLORS.TAGCOLOR,
                width: SIZES.ScreenWidth * 0.295,
                height: SIZES.ScreenWidth * 0.39,
            }}>
            <View style={{padding: 10}}>
                <View style={{}}>
                    <View style={{alignItems: 'center'}}>
                        <TouchableOpacity onPress={onPress}>
                            {/* <HexAvatar
                                source={{uri: userPicture}}
                                size={58}
                                bordercolor={selectAvatarBorderColor(akcruBadge ?? 'AKCRUIT')}
                            /> */}
                            <Image
                                source={{uri: userPicture}}
                                style={{
                                    width: SIZES.ScreenWidth * 0.295,
                                    height: SIZES.ScreenWidth * 0.39,
                                    borderRadius: 5,
                                    borderColor: selectAvatarBorderColor(akcruBadge ?? 'AKCRUIT'),
                                    borderWidth: 2,
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    {/* <View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{...FONTS.Username, marginRight: 2}}>{userName}</Text>
                            {ownerStatus && (
                                <CustomIcon
                                    name="ribbon"
                                    type="ionicon"
                                    color={COLORS.STARGOLD}
                                    baseSize={12}
                                    style={{marginRight: 0}}
                                />
                            )}
                            {companyStatus && (
                                <CustomIcon
                                    name="ribbon"
                                    type="ionicon"
                                    color={COLORS.WHITE}
                                    baseSize={12}
                                    style={{marginRight: 0}}
                                />
                            )}
                            {influencerStatus && (
                                <CustomIcon
                                    name="ribbon"
                                    type="ionicon"
                                    color={COLORS.AKCRUBLUE}
                                    baseSize={12}
                                    style={{marginRight: 0}}
                                />
                            )}
                            {blackCloakStatus && (
                                <CustomIcon
                                    name="ribbon"
                                    type="ionicon"
                                    color={COLORS.BLACKCLOAK}
                                    baseSize={12}
                                    style={{marginRight: 0}}
                                />
                            )}
                            {isAdmin && (
                                <CustomIcon
                                    name="police-badge"
                                    type="material-community"
                                    color={COLORS.STARGOLD}
                                    baseSize={12}
                                    style={{marginRight: 0}}
                                />
                            )}
                        </View>
                        <Text style={{...FONTS.paragraph1}}>{firstName}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <DisplayBadge akcruBadge={akcruBadge} />
                        </View>
                    </View> */}
                </View>
            </View>
        </View>
    );
};

export default CrusaderCard;
