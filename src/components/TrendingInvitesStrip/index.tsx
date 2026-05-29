import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {COLORS, FONTS} from '../../../assets/constants';
import {IMovie} from '../../../types';
import HexAvatar from '../HexAvatar';

type TrendingInvitesStripProps = {
    movies: IMovie[];
    onPressMovie?: (movie: IMovie) => void;
};

const formatInviteCount = (value: unknown): string => {
    const count = Number(value ?? 0);
    if (!Number.isFinite(count) || count <= 0) {
        return '0 Invites';
    }
    return `${Math.floor(count)} Invites`;
};

const TrendingInvitesStrip = ({movies, onPressMovie}: TrendingInvitesStripProps) => {
    const items = React.useMemo(
        () =>
            movies
                .filter(movie => Boolean(movie?.id))
                .slice(0, 6)
                .map(movie => ({
                    ...movie,
                    inviteCount: Number((movie as {mitAcceptCount?: number}).mitAcceptCount ?? 0),
                })),
        [movies],
    );

    return (
        <View style={styles.wrap}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Trending Invites</Text>
            </View>

            <FlatList
                horizontal
                data={items}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({item}) => (
                    <Pressable style={styles.card} onPress={() => onPressMovie?.(item)}>
                        <HexAvatar
                            source={{uri: item.portraitURL || item.landscapeURL}}
                            size={72}
                            bordercolor={COLORS.PINK}
                            rotateFrameDegrees={90}
                        />
                        <Text style={styles.cardTitle} numberOfLines={2}>
                            {(item.title || '').toUpperCase()}
                        </Text>
                        <View style={styles.inviteRow}>
                            <Text style={styles.fire}>🔥</Text>
                            <Text style={styles.inviteText}>{formatInviteCount(item.inviteCount)}</Text>
                        </View>
                    </Pressable>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    headerTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
    },
    listContent: {
        paddingBottom: 4,
    },
    card: {
        width: 96,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cardTitle: {
        ...FONTS.paragraph6,
        fontSize: 10,
        color: COLORS.WHITE,
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 12,
        minHeight: 26,
    },
    inviteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    fire: {
        fontSize: 10,
        marginRight: 3,
    },
    inviteText: {
        ...FONTS.paragraph6,
        color: COLORS.OVERLAY_WHITE_85,
    },
});

export default TrendingInvitesStrip;
