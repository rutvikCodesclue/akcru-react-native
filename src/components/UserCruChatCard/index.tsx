import {Image, Text, View} from 'react-native';
import React from 'react';
import styles from './styles';
import HexAvatar from '../HexAvatar';
import {selectAvatarBorderColor} from '../../util/util';
import LinearGradient from 'react-native-linear-gradient';

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
};

const UserCruChatCard = ({
    userPicture,
    userName,
    CruChatTime,
    CRUChat,
    movie,
    moviePoster,
    badge,
    isOnline = false,
}: UserCruChatCardProps) => {
    const movieTitle = movie?.trim() ?? '';
    const hasMovieMeta = Boolean(movieTitle || moviePoster?.trim());

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
                            <Text style={styles.time}>{CruChatTime}</Text>
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
                            Message: {CRUChat?.trim() ? CRUChat : 'No messages yet'}
                        </Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

export default UserCruChatCard;
