import {View, Text, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator} from 'react-native';
import React, {useMemo} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import {capitalizeFirstLetterOfString} from '../../util/util';
import DisplayBadge from '../General/akcrubadge';
import {isTablet} from '../../../assets/constants/theme';

const MAX_USERNAME_LENGTH = 10;

const CARD_WIDTH = SIZES.ScreenWidth / 2.3;
/** Portrait ratio — full-bleed image + bottom copy (FlickFlirtSwipe card pattern). Higher ratio = more photo + room for tags / actions. */
const CARD_ASPECT = 1.78;
const CARD_HEIGHT = CARD_WIDTH * CARD_ASPECT;

/** Same gradient as Send MIT button — keep in sync */
const ACTION_GRADIENT_COLORS = [COLORS.PURPLE, COLORS.AKCRUBLUE] as const;
const ACTION_GRADIENT_START = {x: 0, y: 0.5};
const ACTION_GRADIENT_END = {x: 1, y: 0.5};
/** Start Mid-Chat + Send MIT — shared corner radius */
const INNER_ACTION_BUTTON_RADIUS = 12;

const TagGradientChip = ({children}: {children: React.ReactNode}) => (
    <LinearGradient
        colors={[...ACTION_GRADIENT_COLORS]}
        start={ACTION_GRADIENT_START}
        end={ACTION_GRADIENT_END}
        style={styles.tagChipGradientBorder}>
        <View style={styles.tagChipGradientInner}>{children}</View>
    </LinearGradient>
);

type FlickFlirtMatchCardProps = {
    userPicture: string | undefined;
    userName: string;
    influencer: boolean;
    akcruBadge: any;
    /** Ignored when `pressable` is false */
    onPress?: () => void;
    /** When false, the card shell is not tappable (inner Mid-Chat / Send MIT still work) */
    pressable?: boolean;
    userDesc?: string;
    matchLabel?: string;
    /** Shown as gradient-border chip when provided */
    archetype?: string;
    /** Selection ring (e.g. FlickFlirtResults) — drawn on card bounds */
    selected?: boolean;
    /** When both are set, shows vibe line + buttons inside the card */
    onStartMidChat?: () => void;
    onSendMit?: () => void;
    midChatLoading?: boolean;
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
    pressable = true,
    onStartMidChat,
    onSendMit,
    midChatLoading = false,
}: FlickFlirtMatchCardProps) => {
    const truncatedName =
        userName.length > MAX_USERNAME_LENGTH ? `${userName.slice(0, MAX_USERNAME_LENGTH)}...` : userName;
    const displayName = truncatedName.toUpperCase();
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

    /** Same `base` as in the vibe line — topic you both match on. */
    const likeBase = useMemo(() => {
        const raw = matchLabel?.trim();
        if (!raw) {
            return 'deep stories & good vibes';
        }
        return raw.endsWith('.') ? raw.slice(0, -1) : raw;
    }, [matchLabel]);

    const vibeLine = useMemo(() => `You both like ${likeBase}.`, [likeBase]);

    const showActions = Boolean(onStartMidChat && onSendMit);

    const padH = isTablet() ? 14 : 8;
    const padTop = isTablet() ? 14 : 10;
    const padBottom = isTablet() ? 12 : 8;

    const overlay = (
        <View style={styles.overlayRoot}>
            <LinearGradient
                colors={
                    showActions
                        ? ['rgba(0,0,0,0.2)', COLORS.OVERLAY_BLACK_45, 'rgba(0,0,0,0.92)']
                        : [COLORS.BLACK, COLORS.TRANSPARENT, COLORS.BLACK]
                }
                style={StyleSheet.absoluteFill}
            />
            <View
                style={[
                    styles.copyBlock,
                    showActions && styles.copyBlockWithActions,
                    {paddingHorizontal: padH, paddingTop: padTop, paddingBottom: padBottom},
                ]}>
                <Text style={styles.bigTitle} numberOfLines={2}>
                    {displayName}
                </Text>

                <View style={styles.tagRow}>
                    {influencer ? (
                        <TagGradientChip>
                            <Text style={styles.tagChipGradientText} numberOfLines={1}>
                                {capitalizeFirstLetterOfString('Creator')}
                            </Text>
                        </TagGradientChip>
                    ) : null}
                    {hasMatchLine ? (
                        <TagGradientChip>
                            <Text style={styles.tagChipGradientText} numberOfLines={1}>
                                {capitalizeFirstLetterOfString(matchLabel!.trim())}
                            </Text>
                        </TagGradientChip>
                    ) : null}
                    {hasArchetype ? (
                        <TagGradientChip>
                            <Text style={styles.tagChipGradientText} numberOfLines={2}>
                                {capitalizeFirstLetterOfString(archetypeName)}
                            </Text>
                        </TagGradientChip>
                    ) : null}
                </View>

                {userDesc ? (
                    <Text
                        style={styles.desc}
                        numberOfLines={showActions ? 2 : 3}>
                        {userDesc}
                    </Text>
                ) : null}

                {!showActions ? (
                    <View style={styles.badgeWrap}>
                        <DisplayBadge akcruBadge={akcruBadge} />
                    </View>
                ) : null}

                {showActions ? (
                    <>

                        <View style={styles.dualButtonsRowInside}>
                            <TouchableOpacity
                                activeOpacity={0.88}
                                style={styles.outlineChatBtnInside}
                                onPress={() => onStartMidChat?.()}
                                disabled={midChatLoading}>
                                {midChatLoading ? (
                                    <ActivityIndicator size="small" color={COLORS.AKCRUBLUE} />
                                ) : (
                                    <>
                                        <Icon
                                            name="chatbubble-outline"
                                            type="ionicon"
                                            color={COLORS.AKCRUBLUE}
                                            size={isTablet() ? 15 : 13}
                                        />
                                        <Text style={styles.outlineChatBtnTextInside} numberOfLines={1}>
                                            Start Mid-Chat
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.88}
                                style={styles.sendMitGradientTouchInside}
                                onPress={() => onSendMit?.()}>
                                <LinearGradient
                                    colors={[...ACTION_GRADIENT_COLORS]}
                                    start={ACTION_GRADIENT_START}
                                    end={ACTION_GRADIENT_END}
                                    style={styles.sendMitGradientInside}>
                                    <Icon name="send" type="ionicon" color={COLORS.WHITE} size={isTablet() ? 15 : 13} />
                                    <Text style={styles.sendMitBtnTextInside}>Send MIT</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : null}
            </View>
        </View>
    );

    const cardShellStyle = [styles.cardTouchable, selected && styles.cardTouchableSelected];
    const cardInner = userPicture ? (
        <ImageBackground
            source={{uri: userPicture}}
            resizeMode="cover"
            style={styles.cardImage}
            imageStyle={styles.cardImageRadius}>
            {overlay}
        </ImageBackground>
    ) : (
        <View style={[styles.cardImage, styles.placeholderBg]}>
            <Text style={styles.placeholderLetter}>{(userName.trim().charAt(0) || '?').toUpperCase()}</Text>
            {overlay}
        </View>
    );

    return (
        <View style={styles.outer}>
            {pressable ? (
                <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={cardShellStyle}>
                    {cardInner}
                </TouchableOpacity>
            ) : (
                <View style={cardShellStyle}>{cardInner}</View>
            )}
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
        borderColor: COLORS.OVERLAY_WHITE_18,
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
    /** Aligns with FlickFlirtSwipe `styles.cardImage` — content anchored to bottom */
    cardImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    cardImageRadius: {
        borderRadius: 16,
    },
    placeholderBg: {
        backgroundColor: COLORS.TAGCOLOR,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderLetter: {
        ...FONTS.HeroTitle,
        position: 'absolute',
        color: COLORS.OVERLAY_WHITE_35,
        fontSize: isTablet() ? 48 : 36,
    },
    overlayRoot: {
        flex: 1,
        width: '100%',
        minHeight: '100%',
        justifyContent: 'flex-end',
    },
    copyBlock: {
        width: '100%',
    },
    copyBlockWithActions: {
        paddingTop: 4,
    },
    vibeInsideCard: {
        ...FONTS.paragraph1,
        color: COLORS.OVERLAY_WHITE_95,
        fontSize: isTablet() ? 10 : 8,
        lineHeight: isTablet() ? 14 : 12,
        marginTop: 6,
    },
    dualButtonsRowInside: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginTop: 8,
        gap: 4,
    },
    outlineChatBtnInside: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isTablet() ? 34 : 30,
        paddingHorizontal: 2,
        borderRadius: INNER_ACTION_BUTTON_RADIUS,
        borderWidth: 1.5,
        borderColor: COLORS.AKCRUBLUE,
        backgroundColor: COLORS.OVERLAY_BLACK_35,
    },
    outlineChatBtnTextInside: {
        ...FONTS.Title2,
        color: COLORS.AKCRUBLUE,
        marginLeft: 3,
        fontSize: isTablet() ? 9 : 7,
        flexShrink: 1,
    },
    sendMitGradientTouchInside: {
        flex: 1,
        borderRadius: INNER_ACTION_BUTTON_RADIUS,
        overflow: 'hidden',
    },
    sendMitGradientInside: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isTablet() ? 34 : 30,
        paddingHorizontal: 2,
        borderRadius: INNER_ACTION_BUTTON_RADIUS,
    },
    sendMitBtnTextInside: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        marginLeft: 3,
        fontSize: isTablet() ? 9 : 7,
        flexShrink: 1,
    },
    /** FlickFlirtSwipe `styles.bigTitle` — HeroTitle, tuned for grid scale */
    bigTitle: {
        ...FONTS.HeroTitle,
        width: '92%',
        color: COLORS.WHITE,
        fontSize: isTablet() ? 18 : 13,
        lineHeight: isTablet() ? 22 : 17,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: isTablet() ? 8 : 6,
        gap: 4,
    },
    /** Creator / match label / archetype — gradient border + dark inset (replaces solid STARGOLD) */
    tagChipGradientBorder: {
        borderRadius: 10,
        padding: 1.5,
        marginHorizontal: 2,
        maxWidth: '100%',
        overflow: 'hidden',
    },
    tagChipGradientInner: {
        borderRadius: 8.5,
        backgroundColor: 'rgba(0,0,0,0.82)',
        paddingHorizontal: isTablet() ? 8 : 6,
        paddingVertical: 2,
    },
    tagChipGradientText: {
        ...FONTS.Title2Orange,
        color: COLORS.OVERLAY_WHITE_95,
        fontSize: isTablet() ? 12 : 9,
    },
    /** FlickFlirtSwipe `styles.desc` */
    desc: {
        ...FONTS.paragraph1,
        marginBottom: 6,
        color: COLORS.OVERLAY_WHITE_92,
        fontSize: isTablet() ? 12 : 10,
        lineHeight: isTablet() ? 16 : 14,
    },
    badgeWrap: {
        marginTop: 4,
        alignItems: 'flex-start',
        transform: [{scale: isTablet() ? 0.9 : 0.82}],
    },
});

export default FlickFlirtMatchCard;
