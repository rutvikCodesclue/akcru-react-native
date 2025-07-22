import React, {useState, useCallback} from 'react';
import {ScrollView, View, Text, Image, FlatList, Pressable, StyleSheet} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import useAuthStore from '../../stores/auth.store';
import {getPurchasedMovies} from '../../lib/api/movies.lib';
import {getPurchasedSeries} from '../../lib/api/series.lib';
import {FONTS, SIZES} from '../../../assets/constants';
import {ClientStackParams} from '../../navigation/ClientStack';

export type Purchasable = {
    id: string;
    title: string;
    portraitURL: string;
};

type PurchasedCategoryProps = {
    title: string;
    items: Purchasable[];
    type: 'movie' | 'series';
};

const PurchasedCategory = ({title, items, type}: PurchasedCategoryProps) => {
    const nav = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    const onPress = (item: Purchasable) => {
        if (type === 'movie') {
            nav.navigate('ContentDetailScreen', {id: item.id});
        } else {
            nav.navigate('SeriesDetailScreen', {id: item.id});
        }
    };

    return (
        <View style={styles.category}>
            <Text style={styles.heading}>{title}</Text>
            <FlatList
                data={items}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={i => i.id}
                renderItem={({item}) => (
                    <Pressable onPress={() => onPress(item)} style={styles.item}>
                        <Image source={{uri: item.portraitURL}} style={styles.poster} />
                        {/* <Text numberOfLines={1} style={styles.label}>
                            {item.title}
                        </Text> */}
                    </Pressable>
                )}
            />
        </View>
    );
};

export default function PurchasedContent() {
    const userId = useAuthStore(s => s.user?.id);
    const [movies, setMovies] = useState<Purchasable[]>([]);
    const [series, setSeries] = useState<Purchasable[]>([]);

    const load = useCallback(async () => {
        if (!userId) return;
        const [mList, sList] = await Promise.all([getPurchasedMovies(userId), getPurchasedSeries(userId)]);
        setMovies(
            mList.map(m => ({
                id: m.id,
                title: m.title,
                portraitURL: m.portraitURL,
            })),
        );
        setSeries(
            sList.map(s => ({
                id: s.id,
                title: s.title,
                portraitURL: s.portraitURL,
            })),
        );
    }, [userId]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {movies.length > 0 && <PurchasedCategory title="Your Purchased Movies" items={movies} type="movie" />}
            {series.length > 0 && <PurchasedCategory title="Your Purchased Series" items={series} type="series" />}
            {movies.length + series.length === 0 && (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>You haven’t purchased anything yet.</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
    },
    category: {
        marginBottom: 30,
    },
    heading: {
        ...FONTS.Title2,
        marginBottom: 12,
    },
    item: {
        marginRight: 12,
        width: 120,
    },
    poster: {
        width: SIZES.ScreenWidth / 3.6,
        height: SIZES.ScreenWidth / 2.4,
        borderRadius: 5,
        margin: 5,
        resizeMode: 'cover',
    },
    label: {
        ...FONTS.paragraph1,
        marginTop: 6,
        width: 120,
    },
    empty: {
        alignItems: 'center',
    },
    emptyText: {
        ...FONTS.paragraph1,
    },
});
