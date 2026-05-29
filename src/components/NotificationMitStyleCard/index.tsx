import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {formatDatestamp, formatTimestampToAMPM} from '../../util/util';
import chatCardStyles from '../UserCruChatCard/styles';
import {COLORS, FONTS} from '../../../assets/constants';

export type NotificationMitStyleCardProps = {
    displayName: string;
    message?: string;
    createdAt: string;
    isRead: boolean;
    onPressCard: () => void;
    onPressDelete: () => void;
    isLast: boolean;
};

const NotificationMitStyleCard = ({
    displayName,
    message,
    createdAt,
    isRead,
    onPressCard,
    onPressDelete,
    isLast,
}: NotificationMitStyleCardProps) => {
    const preview = message ?? '';

    return (
        <View style={[styles.panelBody, isLast && styles.panelBodyLast]}>
            <View style={styles.cardTouch}>
                <LinearGradient
                    colors={['#FF2F92', '#A43EFF', '#5BE0FF']}
                    start={{x: 0, y: 0.5}}
                    end={{x: 1, y: 0.5}}
                    style={chatCardStyles.cardGradientBorder}>
                    <View style={chatCardStyles.card}>
                        <View style={[chatCardStyles.cardContent, styles.cardContentTextOnly]}>
                            <View style={chatCardStyles.body}>
                                <Pressable onPress={onPressCard} style={styles.pressableMain} accessibilityRole="button">
                                    <View style={chatCardStyles.topRow}>
                                        <Text style={chatCardStyles.name} numberOfLines={1}>
                                            {displayName}
                                        </Text>
                                        <Text style={chatCardStyles.time}>{formatTimestampToAMPM(createdAt)}</Text>
                                    </View>
                                    <Text
                                        style={[chatCardStyles.movieTitle, styles.dateLine]}
                                        numberOfLines={1}>
                                        {formatDatestamp(createdAt)}
                                    </Text>
                                    <Text style={chatCardStyles.preview} numberOfLines={3}>
                                        {preview}
                                    </Text>
                                </Pressable>
                                <View style={styles.footerRow}>
                                    <Text
                                        style={[
                                            chatCardStyles.preview,
                                            styles.statusLabel,
                                            {color: isRead ? COLORS.PINK : COLORS.PURPLE},
                                        ]}>
                                        {isRead ? 'Read' : 'Unread'}
                                    </Text>
                                    <Pressable
                                        onPress={onPressDelete}
                                        style={({pressed}) => [
                                            styles.deleteButton,
                                            pressed && styles.deleteButtonPressed,
                                        ]}
                                        accessibilityRole="button"
                                        accessibilityLabel="Delete notification">
                                        <Text style={[FONTS.Title2, styles.deleteButtonLabel]}>
                                            Delete Notification
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    panelBody: {
        width: '100%',
        alignSelf: 'stretch',
        backgroundColor: COLORS.TRANSPARENT,
    },
    panelBodyLast: {
        paddingBottom: 8,
    },
    cardTouch: {
        width: '100%',
        marginHorizontal: 0,
        marginTop: 8,
        marginBottom: 8,
    },
    pressableMain: {
        flex: 1,
        minWidth: 0,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '600',
        flexShrink: 1,
    },
    deleteButton: {
        borderWidth: 1.5,
        borderColor: COLORS.PINK,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,79,152,0.14)',
        maxWidth: '62%',
    },
    deleteButtonPressed: {
        opacity: 0.85,
        backgroundColor: 'rgba(255,79,152,0.22)',
    },
    deleteButtonLabel: {
        color: COLORS.WHITE,
        textAlign: 'center',
        fontSize: 12,
    },
    cardContentTextOnly: {
        flexDirection: 'column',
        alignItems: 'stretch',
        minHeight: 0,
    },
    dateLine: {
        marginBottom: 8,
    },
});

export default NotificationMitStyleCard;
