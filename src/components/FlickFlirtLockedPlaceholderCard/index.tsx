import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    ViewStyle,
    StyleProp,
} from 'react-native';
import React from 'react';
import {Icon} from '@rneui/base';
import imageindex from '../../../assets/images/imageindex';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import {isTablet} from '../../../assets/constants/theme';

const PORTRAIT = 1.52;

export type FlickFlirtLockedPlaceholderCardProps = {
    /** Matches grid: tap opens unlock modal */
    onPress?: () => void;
    /** `full` = FlickFlirtMatches cell; `compact` = narrow strip (e.g. FlickFlirtResults ×4) */
    size?: 'full' | 'compact';
    /** No labels / emoji — image + dim + lock icon only (e.g. FlickFlirtResults strip) */
    hideText?: boolean;
    style?: StyleProp<ViewStyle>;
    wrapStyle?: StyleProp<ViewStyle>;
};

const FlickFlirtLockedPlaceholderCard = ({
    onPress,
    size = 'full',
    hideText = false,
    style,
    wrapStyle,
}: FlickFlirtLockedPlaceholderCardProps) => {
    const s = size === 'full' ? stylesFull : stylesCompact;

    const lockIconSize = size === 'compact' ? (isTablet() ? 16 : 13) : isTablet() ? 26 : 22;

    const inner = (
        <ImageBackground
            source={imageindex.BgImageSM}
            resizeMode="cover"
            style={[s.cardBg, style]}
            imageStyle={s.cardImage}>
            <View style={s.dim} />
            <View style={[s.inner, hideText && s.innerIconOnly]}>
                <View style={[s.lockCircle, hideText && s.lockCircleNoText]}>
                    {hideText ? (
                        <Icon
                            name="lock-closed"
                            type="ionicon"
                            color="rgba(255,255,255,0.85)"
                            size={lockIconSize}
                        />
                    ) : (
                        <Text style={s.lockEmoji}>🔒</Text>
                    )}
                </View>
                {!hideText ? (
                    <>
                        <Text style={s.lockedTitle} numberOfLines={size === 'compact' ? 1 : 2}>
                            LOCKED MATCH
                        </Text>
                        <Text style={s.lockedSubTitle} numberOfLines={size === 'compact' ? 2 : 2}>
                            Unlock to view profile
                        </Text>
                    </>
                ) : null}
            </View>
        </ImageBackground>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                style={[s.wrap, wrapStyle]}>
                {inner}
            </TouchableOpacity>
        );
    }

    return <View style={[s.wrap, wrapStyle]}>{inner}</View>;
};

const stylesFull = StyleSheet.create({
    wrap: {
        width: SIZES.ScreenWidth / 2.1,
        alignItems: 'center',
        marginVertical: 5,
    },
    cardBg: {
        width: SIZES.ScreenWidth / 2.3,
        height: (SIZES.ScreenWidth / 2.3) * PORTRAIT,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImage: {
        borderRadius: 16,
    },
    dim: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        backgroundColor: 'rgba(14,13,38,0.78)',
    },
    inner: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    innerIconOnly: {
        marginBottom: 0,
    },
    lockCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    lockCircleNoText: {
        marginBottom: 0,
    },
    lockEmoji: {
        fontSize: 22,
    },
    lockedTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        letterSpacing: 0.8,
        textAlign: 'center',
    },
    lockedSubTitle: {
        ...FONTS.paragraph2,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginTop: 6,
    },
});

const stylesCompact = StyleSheet.create({
    wrap: {
        flex: 1,
        minWidth: 0,
        marginHorizontal: 3,
    },
    cardBg: {
        width: '100%',
        aspectRatio: 1 / PORTRAIT,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImage: {
        borderRadius: 12,
    },
    dim: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
        backgroundColor: 'rgba(14,13,38,0.78)',
    },
    inner: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    innerIconOnly: {
        paddingHorizontal: 2,
    },
    lockCircle: {
        width: isTablet() ? 34 : 28,
        height: isTablet() ? 34 : 28,
        borderRadius: isTablet() ? 17 : 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    lockCircleNoText: {
        marginBottom: 0,
    },
    lockEmoji: {
        fontSize: isTablet() ? 16 : 13,
    },
    lockedTitle: {
        ...FONTS.Title2,
        fontSize: isTablet() ? 9 : 7,
        lineHeight: isTablet() ? 11 : 9,
        color: COLORS.WHITE,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    lockedSubTitle: {
        ...FONTS.paragraph2,
        fontSize: isTablet() ? 8 : 6,
        lineHeight: isTablet() ? 10 : 8,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginTop: 2,
    },
});

export default FlickFlirtLockedPlaceholderCard;
