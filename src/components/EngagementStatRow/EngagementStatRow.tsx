import React from 'react';
import {View, Text, Pressable, Image, Platform, StyleSheet, GestureResponderEvent} from 'react-native';
import {Icon} from '@rneui/base';
import imageindex from '../../../assets/images/imageindex';

const LIKE_MAGENTA = '#ff2d92';
const LIKE_GLOW_OUTER = '#ff4fd8';
const COMMENT_LAVENDER = '#d8b4fe';
const COMMENT_GLOW = '#a855f7';
const MIT_GLOW_PINK = '#ff4fd8';
const MIT_GLOW_PURPLE = '#9b59b6';

/** Same box for like / comment / MIT so icons align on one horizontal line */
const ACTION_ICON_SLOT = 76;

export const formatEngagementCount = (n: number | undefined): string => {
    const v = n ?? 0;
    if (v >= 1_000_000) {
        return `${(v / 1_000_000).toFixed(1)}M`;
    }
    if (v >= 1_000) {
        return `${(v / 1_000).toFixed(1)}K`;
    }
    return String(v);
};

const glow = (color: string, radius: number) =>
    Platform.select({
        ios: {
            shadowColor: color,
            shadowOffset: {width: 0, height: 0},
            shadowOpacity: 0.92,
            shadowRadius: radius,
        },
        android: {
            elevation: 10,
        },
    });

export type EngagementStatRowProps = {
    likes: number;
    comments: number;
    mitCount: number;
    isLiked: boolean;
    onLike: () => void;
    onComment: () => void;
    onMit: () => void;
};

/**
 * Horizontal like / comment / MIT actions — neon glow styling aligned with Crummunity mockups.
 */
const EngagementStatRow = ({
    likes,
    comments,
    mitCount,
    isLiked,
    onLike,
    onComment,
    onMit,
}: EngagementStatRowProps) => {
    const stopTapBubble = (event: GestureResponderEvent, callback: () => void) => {
        event.stopPropagation();
        callback();
    };

    return (
        <View style={styles.row}>
            <Pressable
                onPress={event => stopTapBubble(event, onLike)}
                style={styles.cell}
                accessibilityRole="button"
                accessibilityLabel="Like">
                <View style={styles.actionSlot}>
                    <View style={styles.likeHaloOuter} />
                    <View style={styles.likeHaloInner} />
                    <View style={[styles.likeGlowOuter, glow(LIKE_GLOW_OUTER, 18)]}>
                        <View style={[styles.likeGlowInner, glow(LIKE_MAGENTA, 12)]}>
                            <Icon
                                name={isLiked ? 'heart' : 'heart-outline'}
                                type="ionicon"
                                color={isLiked ? LIKE_MAGENTA : 'rgba(255,255,255,0.88)'}
                                size={30}
                            />
                        </View>
                    </View>
                </View>
                <Text style={styles.count}>{formatEngagementCount(likes)}</Text>
            </Pressable>

            <Pressable
                onPress={event => stopTapBubble(event, onComment)}
                style={styles.cell}
                accessibilityRole="button"
                accessibilityLabel="Comment">
                <View style={styles.actionSlot}>
                    <View style={styles.commentHaloOuter} />
                    <View style={styles.commentHaloInner} />
                    <View style={[styles.commentGlowOuter, glow(COMMENT_GLOW, 18)]}>
                        <View style={[styles.commentGlowInner, glow(COMMENT_LAVENDER, 12)]}>
                            <Icon name="chatbubble-outline" type="ionicon" color={COMMENT_LAVENDER} size={30} />
                        </View>
                    </View>
                </View>
                <Text style={styles.count}>{formatEngagementCount(comments)}</Text>
            </Pressable>

            <Pressable
                onPress={event => stopTapBubble(event, onMit)}
                style={styles.cell}
                accessibilityRole="button"
                accessibilityLabel="Send MIT">
                <View style={styles.actionSlot}>
                    <View style={styles.mitHaloOuter} />
                    <View style={styles.mitHaloInner} />
                    <View style={[styles.likeGlowOuter, glow(MIT_GLOW_PINK, 22)]}>
                        <View style={[styles.likeGlowInner, glow(MIT_GLOW_PURPLE, 16)]}>
                            <Image
                                source={imageindex.mitTicketImage}
                                style={[styles.mitImage, {transform: [{rotate: '8deg'}]}]}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </View>
                <Text style={styles.count}>{formatEngagementCount(mitCount)}</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 18,
        paddingVertical: 10,
        overflow: 'visible',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(155, 89, 182, 0.25)',
    },
    cell: {
        flex: 1,
        alignItems: 'center',
        minHeight: 96,
        overflow: 'visible',
    },
    actionSlot: {
        width: ACTION_ICON_SLOT,
        height: ACTION_ICON_SLOT,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    likeHaloOuter: {
        position: 'absolute',
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: 'rgba(255, 79, 216, 0.25)',
    },
    likeHaloInner: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 45, 146, 0.35)',
    },
    likeGlowOuter: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    likeGlowInner: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentGlowOuter: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentHaloOuter: {
        position: 'absolute',
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: 'rgba(168, 85, 247, 0.25)',
    },
    commentHaloInner: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(216, 180, 254, 0.32)',
    },
    commentGlowInner: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mitHaloOuter: {
        position: 'absolute',
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: 'rgba(255, 79, 216, 0.25)',
    },
    mitHaloInner: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(155, 89, 182, 0.32)',
    },
    mitImage: {
        width: 68,
        height: 68,
    },
    count: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 2,
        textAlign: 'center',
        letterSpacing: 0.2,
    },
});

export default EngagementStatRow;
