import {Image, Text, View} from 'react-native';
import React from 'react';
import styles from './styles';
import HexAvatar from '../HexAvatar';
import {selectAvatarBorderColor} from '../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../../../assets/constants';

function mitStatusValueColor(statusText: string): string {
    const trimmed = statusText.trim();
    if (!trimmed || trimmed === '—') {
        return 'rgba(255,255,255,0.82)';
    }
    const s = trimmed.toUpperCase();
    if (s === 'PENDING') {
        return COLORS.GREEN;
    }
    if (s === 'ACCEPTED') {
        return COLORS.STARGOLD;
    }
    if (s === 'DECLINED' || s === 'EXPIRED') {
        return '#E53935';
    }
    return 'rgba(255,255,255,0.82)';
}

export type UserCruChatCardProps = {
    userPicture?: string;
    userName: string;
    CruChatDate: string;
    CruChatTime: string;
    CRUChat: string;
    userID?: unknown;
    avatarbordercolor?: string;
    movie: string;
    moviePoster?: string;
    /** Receiver badge for avatar ring (e.g. AKCRUIT) */
    badge?: string;
    /** Show green online indicator on avatar */
    isOnline?: boolean;
    /** When `mitStatus`, preview line reads "MIT status: …" instead of "Message: …". */
    previewKind?: 'message' | 'mitStatus';
};

const UserCruChatCard = ({
    userPicture,
    userName,
    CruChatDate,
    CruChatTime,
    CRUChat,
    movie,
    moviePoster,
    badge,
    isOnline = false,
    previewKind = 'message',
}: UserCruChatCardProps) => {
    const movieTitle = movie?.trim() ?? '';
    const hasMovieMeta = Boolean(movieTitle || moviePoster?.trim());
    const previewLabel = previewKind === 'mitStatus' ? 'MIT status:' : 'Message:';
    const previewEmpty = previewKind === 'mitStatus' ? '—' : 'No messages yet';
    const previewBody = CRUChat?.trim() ? CRUChat.trim() : previewEmpty;
    const statusValueStyle =
        previewKind === 'mitStatus' ? {color: mitStatusValueColor(previewBody)} : undefined;

    return (
        <LinearGradient
            colors={['#FF2F92', '#A43EFF', '#5BE0FF']}
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}
            style={styles.cardGradientBorder}>
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.avatarWrap}>
                        <HexAvatar
                            source={{uri: userPicture}}
                            size={58}
                            bordercolor={selectAvatarBorderColor(badge ?? 'AKCRUIT')}
                        />
                    </View>

                    <View style={styles.body}>
                        <View style={styles.topRow}>
                            <Text style={styles.name} numberOfLines={1}>
                                {userName}
                            </Text>
                            <View style={styles.dateTimeCol}>
                                {CruChatDate?.trim() ? (
                                    <Text style={styles.dateAboveTime} numberOfLines={1}>
                                        {CruChatDate.trim()}
                                    </Text>
                                ) : null}
                                <Text style={styles.time}>{CruChatTime}</Text>
                            </View>
                        </View>

                        <View style={styles.movieRow}>
                            <Text style={styles.movieTitle} numberOfLines={1}>
                                {hasMovieMeta ? movieTitle || 'Movie' : 'Movie'}
                            </Text>
                            {moviePoster?.trim() ? (
                                <Image
                                    source={{uri: moviePoster.trim()}}
                                    style={styles.poster}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.poster} />
                            )}
                        </View>
                        <Text style={styles.preview} numberOfLines={1}>
                            <Text style={styles.preview}>{previewLabel} </Text>
                            <Text style={[styles.preview, statusValueStyle]}>{previewBody}</Text>
                        </Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

export default UserCruChatCard;
