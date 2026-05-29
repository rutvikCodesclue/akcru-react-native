import React from 'react';
import {Pressable, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {COLORS, FONTS} from '../../../assets/constants';
import imageindex from '../../../assets/images/imageindex';
import {IUserProfile} from '../../../types';
import HexAvatar from '../HexAvatar';
import {selectAvatarBorderColor} from '../../util/util';
import {resolveAkcruBadgeConfig} from '../ProfileUserBadges/ProfileUserBadges';

type UserDiscoveryCardProps = {
    user: IUserProfile;
    subtitle?: string;
    displayName?: string;
    handle?: string;
    fallbackDescription?: string;
    onPress: () => void;
    onLongPress?: () => void;
};

const UserDiscoveryCard = ({
    user,
    subtitle = '',
    displayName,
    handle,
    fallbackDescription = '',
    onPress,
    onLongPress,
}: UserDiscoveryCardProps) => {
    const badgeConfig = resolveAkcruBadgeConfig(user.badge);
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    const resolvedDisplayName = fullName || (displayName && displayName.trim()) || user.username;
    const normalizedHandle = (handle && handle.trim()) || subtitle || user.username || '';
    const resolvedHandle = normalizedHandle.startsWith('@') ? normalizedHandle : `@${normalizedHandle}`;
    const resolvedDescription =
        (user as any)?.description ||
        (user as any)?.bio ||
        (user as any)?.about ||
        fallbackDescription ||
        '';

    return (
        <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.cardWrap}>
            <View style={styles.borderFrame}>
                <View style={styles.inner}>
                    <View style={styles.topRow}>
                        <HexAvatar
                            source={user.profilePicture ? {uri: user.profilePicture} : imageindex.Akcruplaceholder}
                            size={48}
                            borderThickness={4}
                            bordercolor={selectAvatarBorderColor(user.badge ?? '')}
                            rotateFrameDegrees={90}
                        />
                        <View style={styles.meta}>
                            <Text style={styles.name} numberOfLines={1}>
                                {resolvedDisplayName}
                            </Text>
                            <Text style={styles.subtitle} numberOfLines={1}>
                                {resolvedHandle}
                            </Text>
                            {badgeConfig ? (
                                <LinearGradient
                                    colors={[`${badgeConfig.color}24`, `${badgeConfig.color}40`]}
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 1}}
                                    style={styles.badgePill}>
                                    <Text style={[styles.badgePillText, {color: badgeConfig.color}]}>
                                        {badgeConfig.label}
                                    </Text>
                                </LinearGradient>
                            ) : null}
                        </View>
                    </View>
                    {!!String(resolvedDescription).trim() && (
                        <Text style={styles.description} numberOfLines={2}>
                            {String(resolvedDescription).trim()}
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
};

const styles = {
    cardWrap: {
        borderRadius: 14,
        padding: 0,
        marginTop: 8,
        shadowColor: '#FF9ED1',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.28,
        shadowRadius: 8,
        elevation: 3,
    },
    borderFrame: {
        borderRadius: 14,
        padding: 1,
        backgroundColor: '#4A4A4A',
    },
    inner: {
        borderRadius: 12,
        backgroundColor: '#0a0a12',
        paddingVertical: 8,
        paddingHorizontal: 9,
    },
    topRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    meta: {
        flex: 1,
        marginHorizontal: 9,
    },
    name: {
        ...FONTS.Title3,
        color: COLORS.WHITE,
        fontWeight: '700' as const,
    },
    subtitle: {
        ...FONTS.paragraph1,
        color: '#8A94A9',
        marginTop: 1,
    },
    description: {
        ...FONTS.paragraph1,
        color: '#BFC6D8',
        marginTop: 4,
        lineHeight: 16,
        paddingLeft: 2,
    },
    badgePill: {
        alignSelf: 'flex-start' as const,
        marginTop: 4,
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_20,
    },
    badgePillText: {
        ...FONTS.Akcrubadges,
        fontSize: 11,
    },
};

export default UserDiscoveryCard;
