import {Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import {selectAvatarBorderColor} from '../../util/util';
import HexAvatar from '../HexAvatar';
import ProfileUserBadges from '../ProfileUserBadges';

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
        <View style={styles.card}>
            <View style={styles.inner}>
                <View style={styles.headerRow}>
                    <View style={styles.leftRow}>
                        <View style={styles.avatarWrap}>
                            <TouchableOpacity onPress={onPress}>
                                <HexAvatar
                                    source={{uri: userPicture}}
                                    size={62}
                                    bordercolor={selectAvatarBorderColor(akcruBadge ?? 'AKCRUIT')}
                                    rotateFrameDegrees={90}
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <View style={styles.userRow}>
                                <Text style={styles.userName}>{userName}</Text>
                            </View>
                            <Text style={styles.firstName}>{firstName}</Text>
                            <ProfileUserBadges
                                variant="inline"
                                user={{
                                    badge: akcruBadge,
                                    influencerStatus,
                                    ownerStatus,
                                    companyStatus,
                                    blackCloakStatus,
                                }}
                                style={styles.badgeWrap}
                            />
                        </View>
                    </View>
                    <TouchableOpacity onPress={unblock} style={styles.unblockBtn}>
                        <Text style={styles.unblockText}>UNBLOCK</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.descWrap}>
                    <Text style={styles.description}>{truncateduserDesc}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        backgroundColor: 'rgba(211,211,211,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(211,211,211,0.2)',
        width: SIZES.ScreenWidth * 0.9,
    },
    inner: {
        padding: 10,
    },
    headerRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    leftRow: {
        flexDirection: 'row',
        flex: 1,
        paddingRight: 8,
    },
    avatarWrap: {
        marginRight: 8,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    userName: {
        ...FONTS.Title3,
        fontSize: 12,
        marginRight: 4,
    },
    firstName: {
        ...FONTS.paragraph1,
        fontSize: 12,
    },
    badgeWrap: {
        marginTop: 6,
    },
    unblockBtn: {
        alignSelf: 'center',
        marginLeft: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: 'rgba(34,197,94,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34,197,94,0.45)',
    },
    unblockText: {
        ...FONTS.Title2,
        fontSize: 13,
        color: '#22C55E',
    },
    descWrap: {
        marginTop: 6,
    },
    description: {
        ...FONTS.paragraph1,
        fontSize: 12,
        color: COLORS.LIGHTGREY,
    },
});

export default BlockedUserCard;
