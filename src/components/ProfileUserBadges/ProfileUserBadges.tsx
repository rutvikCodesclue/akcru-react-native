import React from 'react';
import {View, Text, StyleProp, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {FONTS, AKCRUBADGES, COLORS} from '../../../assets/constants';
import {isTablet} from '../../../assets/constants/theme';
import CustomIcon from '../CustomIcon/CustomIcon';

export type ProfileUserBadgesUser = {
    influencerStatus?: boolean;
    ownerStatus?: boolean;
    companyStatus?: boolean;
    blackCloakStatus?: boolean;
    isAdmin?: boolean;
    visionaryStatus?: boolean;
    badge?: string | null;
};

export type AkcruBadgeThemeEntry = (typeof AKCRUBADGES)[keyof typeof AKCRUBADGES];

function colorToRgba(hexColor: string, alpha: number): string {
    if (!hexColor?.startsWith('#')) {
        return `rgba(255,255,255,${alpha})`;
    }
    const hex = hexColor.replace('#', '');
    const normalized = hex.length === 3 ? hex.split('').map(ch => ch + ch).join('') : hex;
    const bigint = parseInt(normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function resolveAkcruBadgeConfig(badge: string | undefined | null): AkcruBadgeThemeEntry | null {
    if (badge === 'AKCRUIT') {
        return AKCRUBADGES.Akcruit;
    }
    if (badge === 'GUARDIAN') {
        return AKCRUBADGES.Guardian;
    }
    if (badge === 'HERO') {
        return AKCRUBADGES.Hero;
    }
    if (badge === 'SUPERHERO') {
        return AKCRUBADGES.SuperHero;
    }
    return null;
}

export type ProfileUserBadgesVariant = 'stacked' | 'inline';

type Props = {
    user: ProfileUserBadgesUser | null | undefined;
    style?: StyleProp<ViewStyle>;
    /** `inline`: status icons + level pill on one row (e.g. beside username). `stacked`: ViewUser-style two rows. */
    variant?: ProfileUserBadgesVariant;
};

export default function ProfileUserBadges({user, style, variant = 'stacked'}: Props) {
    if (!user) {
        return null;
    }

    const nameBadgeIconSize = isTablet() ? 14 : 12;
    const badgeConfig = resolveAkcruBadgeConfig(user.badge);
    const title2FontSize =
        typeof FONTS.Title2 === 'object' && FONTS.Title2 !== null && 'fontSize' in FONTS.Title2
            ? Number((FONTS.Title2 as {fontSize: number}).fontSize)
            : 14;

    const statusIcons = (
        <>
            {(user.influencerStatus || user.ownerStatus) && (
                <Icon
                    name="checkmark-circle"
                    type="ionicon"
                    color="#3498db"
                    size={nameBadgeIconSize + 2}
                    style={{marginHorizontal: 2}}
                />
            )}
            {user.ownerStatus && (
                <CustomIcon
                    name="ribbon"
                    type="ionicon"
                    color={COLORS.STARGOLD}
                    baseSize={nameBadgeIconSize}
                    style={{marginHorizontal: 2}}
                />
            )}
            {user.companyStatus && (
                <CustomIcon
                    name="ribbon"
                    type="ionicon"
                    color={COLORS.WHITE}
                    baseSize={nameBadgeIconSize}
                    style={{marginHorizontal: 2}}
                />
            )}
            {user.influencerStatus && (
                <CustomIcon
                    name="ribbon"
                    type="ionicon"
                    color={COLORS.AKCRUBLUE}
                    baseSize={nameBadgeIconSize}
                    style={{marginHorizontal: 2}}
                />
            )}
            {user.blackCloakStatus && (
                <CustomIcon
                    name="ribbon"
                    type="ionicon"
                    color={COLORS.BLACKCLOAK}
                    baseSize={nameBadgeIconSize}
                    style={{marginHorizontal: 2}}
                />
            )}
            {user.isAdmin && (
                <CustomIcon
                    name="police-badge"
                    type="material-community"
                    color={COLORS.STARGOLD}
                    baseSize={nameBadgeIconSize}
                    style={{marginHorizontal: 2}}
                />
            )}
            {user.visionaryStatus && (
                <CustomIcon
                    name="diamond-stone"
                    type="material-community"
                    color={COLORS.WHITE}
                    baseSize={nameBadgeIconSize}
                    style={{marginHorizontal: 2}}
                />
            )}
        </>
    );

    const levelPill = badgeConfig ? (
        <LinearGradient
            colors={[colorToRgba(badgeConfig.color, 0.14), colorToRgba(badgeConfig.color, 0.28)]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={{
                borderWidth: 1,
                borderColor: badgeConfig.color,
                borderRadius: 7,
                paddingHorizontal: 8,
                paddingVertical: 6,
                marginRight: variant === 'inline' ? 2 : 8,
            }}>
            <Text
                style={{
                    ...FONTS.Akcrubadges,
                    fontSize: title2FontSize - 1,
                    color: badgeConfig.color,
                }}>
                {badgeConfig.label}
            </Text>
        </LinearGradient>
    ) : null;

    if (variant === 'inline') {
        return (
            <View
                style={[
                    {
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                    },
                    style,
                ]}>
                {statusIcons}
                {levelPill}
            </View>
        );
    }

    return (
        <View style={style}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginTop: 4,
                    marginBottom: 6,
                }}>
                {statusIcons}
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginVertical: 10,
                }}>
                {levelPill}
            </View>
        </View>
    );
}
