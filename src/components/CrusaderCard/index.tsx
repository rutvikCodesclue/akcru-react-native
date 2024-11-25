import {Text, View, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import {selectAvatarBorderColor} from '../../util/util';
import HexAvatar from '../HexAvatar';
import CustomIcon from '../CustomIcon/CustomIcon';
import imageindex from '../../../assets/images/imageindex';
import ArcheTypeMatchIcon from '../ArcheTypeMatchIcon';
import { color } from '@rneui/base';


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
    isArchetypeMatch?: boolean; // New prop
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
    isArchetypeMatch,
}: CrusaderCardProps) => {
    return (
        <View
            style={{
                borderRadius: 5,
                width: SIZES.ScreenWidth * 0.295,
                height: SIZES.ScreenWidth * 0.39,
            }}>
            <View style={{padding: 10}}>
                <View style={{position: 'relative', alignItems: 'center'}}>
                    <TouchableOpacity onPress={onPress}>
                        <Image
                            source={
                                userPicture
                                    ? {uri: userPicture} // Remote image
                                    : imageindex.Akcruplaceholder // Local placeholder
                            }
                            style={{
                                width: SIZES.ScreenWidth * 0.295,
                                height: SIZES.ScreenWidth * 0.39,
                                borderRadius: 5,
                                borderColor: selectAvatarBorderColor(akcruBadge ?? 'AKCRUIT'),
                                borderWidth: 2,
                            }}
                        />
                        {isArchetypeMatch && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: '25%',
                                    left: '12%',
                                }}>
                                <ArcheTypeMatchIcon size={100} fillcolor={COLORS.PINK} />
                                <Text
                                    style={{
                                        ...FONTS.Title3,
                                        color: COLORS.LIGHTGREY,
                                        textAlign: 'center',
                                    }}>
                                    Arche Match
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default CrusaderCard;
