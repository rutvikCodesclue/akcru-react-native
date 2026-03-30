import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {BlurView} from '@react-native-community/blur';
import {Icon} from '@rneui/base';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import {selectAvatarBorderColor} from '../../util/util';
import HexAvatar from '../HexAvatar';
import DisplayBadge from '../General/akcrubadge';
import {isTablet} from '../../../assets/constants/theme';

const MAX_USERNAME_LENGTH = 10;

const CARD_WIDTH = SIZES.ScreenWidth / 2.3;
/** Portrait ratio — hex hero + bottom glass strip */
const CARD_HEIGHT = CARD_WIDTH * 1.42;
const GLASS_HEIGHT_PCT = 0.42;

/** Hex profile — height scales with device */
const HEX_SIZE = isTablet() ? 132 : 96;

type FlickFlirtMatchCardProps = {
    userPicture: string | undefined;
    userName: string;
    influencer: boolean;
    akcruBadge: any;
    onPress: () => void;
    userDesc?: string;
    matchLabel?: string;
    /** Shown below match label when provided */
    archetype?: string;
    /** Selection ring (e.g. FlickFlirtResults) — drawn on card bounds */
    selected?: boolean;
};

const FlickFlirtMatchCard = ({
    userPicture,
    userName,
    influencer,
    akcruBadge,
    onPress,
    userDesc,
    matchLabel,
    archetype,
    selected = false,
}: FlickFlirtMatchCardProps) => {
    const truncateduserName =
        userDesc && userDesc?.length > MAX_USERNAME_LENGTH ? userName.slice(0, MAX_USERNAME_LENGTH) + '...' : userName;
    const displayName = truncateduserName.toUpperCase();
    const hasMatchLine = Boolean(matchLabel?.trim());
    const getArchetypeName = (raw?: string) => {
        const value = raw?.trim();
        if (!value) return '';
        if (value.startsWith('{')) {
            try {
                const parsed = JSON.parse(value);
                return typeof parsed?.name === 'string' ? parsed.name.trim() : value;
            } catch {
                return value;
            }
        }
        return value;
    };
    const archetypeName = getArchetypeName(archetype);
    const hasArchetype = Boolean(archetypeName);

    return (
        <View style={styles.outer}>
            <TouchableOpacity
                activeOpacity={0.92}
                onPress={onPress}
                style={[styles.cardTouchable, selected && styles.cardTouchableSelected]}
            >
                <View style={styles.cardColumn}>
                    <View style={styles.topHero}>
                        <View style={styles.hexWrap}>
                            <HexAvatar
                                source={{uri: userPicture}}
                                size={HEX_SIZE}
                                bordercolor={selectAvatarBorderColor(akcruBadge ?? 'AKCRUIT')}
                            />
                        </View>
                    </View>
                    <View style={[styles.glassPanel, {height: `${GLASS_HEIGHT_PCT * 100}%`}]}>
                        <BlurView
                            style={StyleSheet.absoluteFill}
                            blurType="dark"
                            blurAmount={isTablet() ? 22 : 18}
                            reducedTransparencyFallbackColor="rgba(12,12,16,0.55)"
                        />
                        <View style={styles.glassDarken} />
                        <View style={styles.glassTopLine} />
                        <View style={styles.glassContent}>
                            <View style={styles.nameRow}>
                                <Text style={styles.nameText} numberOfLines={1}>
                                    {displayName}
                                </Text>
                                {influencer ? (
                                    <Icon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.WHITE}
                                        size={isTablet() ? 18 : 16}
                                        style={styles.ribbon}
                                    />
                                ) : null}
                            </View>

                            <View style={styles.divider} />

                            {hasMatchLine ? (
                                <>
                                    <View style={styles.subtitleRow}>
                                        <Icon
                                            name="book-outline"
                                            type="ionicon"
                                            color="rgba(255,255,255,0.92)"
                                            size={isTablet() ? 16 : 14}
                                            style={styles.bookIcon}
                                        />
                                        <Text style={styles.subtitleText} numberOfLines={2}>
                                            {matchLabel!.trim().toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.divider} />
                                </>
                            ) : null}

                            {hasArchetype ? (
                                <>
                                    <View style={styles.subtitleRow}>
                                        <Icon
                                            name="star-outline"
                                            type="ionicon"
                                            color="rgba(255,255,255,0.92)"
                                            size={isTablet() ? 16 : 14}
                                            style={styles.bookIcon}
                                        />
                                        <Text style={styles.subtitleText} numberOfLines={2}>
                                            {archetypeName.toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.divider} />
                                </>
                            ) : null}

                            {userDesc ? (
                                <Text style={styles.captionText} numberOfLines={2}>
                                    {userDesc}
                                </Text>
                            ) : null}

                            <View style={styles.badgeWrap}>
                                <DisplayBadge akcruBadge={akcruBadge} />
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    outer: {
        width: SIZES.ScreenWidth / 2.1,
        alignItems: 'center',
    },
    cardTouchable: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
    },
    cardTouchableSelected: {
        borderWidth: 2,
        borderColor: COLORS.PURPLE,
        shadowColor: COLORS.PURPLE,
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.45,
        shadowRadius: 8,
        elevation: 10,
    },
    cardColumn: {
        flex: 1,
        width: '100%',
    },
    topHero: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    hexWrap: {
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    /** Bottom glass strip — dark frosted blur */
    glassPanel: {
        width: '100%',
        overflow: 'hidden',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    glassDarken: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.52)',
    },
    glassTopLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: StyleSheet.hairlineWidth * 2,
        backgroundColor: 'rgba(255,255,255,0.38)',
        zIndex: 2,
    },
    glassContent: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 8,
        zIndex: 3,
        alignItems: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameText: {
        ...FONTS.ContentTitle,
        fontSize: isTablet() ? 17 : 14,
        color: COLORS.WHITE,
        letterSpacing: 1.2,
        textAlign: 'center',
    },
    ribbon: {marginLeft: 6},
    divider: {
        width: '88%',
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.22)',
        marginVertical: 6,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    bookIcon: {marginRight: 6},
    subtitleText: {
        ...FONTS.Title3,
        flexShrink: 1,
        color: 'rgba(255,255,255,0.95)',
        fontSize: isTablet() ? 12 : 10,
        letterSpacing: 0.6,
        textAlign: 'center',
    },
    captionText: {
        ...FONTS.paragraph2,
        color: 'rgba(255,255,255,0.88)',
        fontSize: isTablet() ? 12 : 10,
        textAlign: 'center',
        lineHeight: isTablet() ? 16 : 14,
    },
    badgeWrap: {
        marginTop: 4,
        alignItems: 'center',
        transform: [{scale: isTablet() ? 0.95 : 0.88}],
    },
});

export default FlickFlirtMatchCard;
