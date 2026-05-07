import React, {useMemo, useRef, useState} from 'react';
import {FlatList, ImageBackground, Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';

import imageindex from '../../../../assets/images/imageindex';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {ClientStackParams} from '../../../navigation/ClientStack';
import {navigateToMITDateSchedule} from '../../../util/RootNavigation';

// TODO: Replace with the currently focused movie once the Solo Session feed is wired
// to a real data source. Hardcoded for now so the Invite flow is testable.
const STATIC_INVITE_MOVIE = {
    id: '03d45735-a27b-4b73-9311-d26149611a8f',
    portraitURL: 'https://priymuscontent.s3.us-east-1.amazonaws.com/Beta+test+posters/Pack+portrait.jpg',
    title: 'Big Packz',
    year: 2025,
} as const;

type SoloSessionScreenNavigationProp = StackNavigationProp<ClientStackParams, 'SoloSessionScreen'>;
type SoloSessionScreenRouteProp = RouteProp<ClientStackParams, 'SoloSessionScreen'>;

type Props = {
    route: SoloSessionScreenRouteProp;
};
type DummySoloMovie = {
    id: string;
    title: string;
    chapter: string;
    tags: [string, string, string];
    ratingText: string;
    durationText: string;
    description: string;
    image: any;
};

const vibeLabelMap: Record<string, string> = {
    browsing: 'Fit your vibe: just browsing',
    chill: 'Fit your vibe: chill & relax',
    vibes: 'Fit your vibe: late night vibes',
    something: 'Fit your vibe: something good',
    invite: 'Fit your vibe: might invite someone',
};

export default function SoloSessionScreen({route}: Props) {
    const navigation = useNavigation<SoloSessionScreenNavigationProp>();
    const vibeId = route.params?.vibeId ?? 'browsing';
    const vibeText = vibeLabelMap[vibeId] ?? vibeLabelMap.browsing;
    const [activeIndex, setActiveIndex] = useState(0);
    const [listHeight, setListHeight] = useState(SIZES.ScreenHeight);
    const listRef = useRef<FlatList<DummySoloMovie>>(null);
    const dummyMovies = useMemo<DummySoloMovie[]>(
        () => [
            {
                id: 'solo-1',
                title: 'John Wick',
                chapter: 'CHAPTER 4',
                tags: ['Action', 'Thriller', 'Crime'],
                ratingText: '⭐ 8.1/10',
                durationText: '2h 49m',
                description: 'John Wick uncovers a path to defeating The High Table. But first, he must face new enemies.',
                image: imageindex.JustAVibe,
            },
            {
                id: 'solo-2',
                title: 'Big Packz',
                chapter: 'SEASON 1',
                tags: ['R', 'Crime', 'Drama'],
                ratingText: '⭐ 6.9/10',
                durationText: '2h 10m',
                description: 'An aspiring rapper moves to L.A. to pursue his music dreams but gets pulled into street life.',
                image: imageindex.FindMyMatch,
            },
            {
                id: 'solo-3',
                title: 'Neon Streets',
                chapter: 'EPISODE 9',
                tags: ['Sci-Fi', 'Mystery', 'Action'],
                ratingText: '⭐ 7.8/10',
                durationText: '1h 56m',
                description: 'A hacker duo follows a data trail through a futuristic city where every secret has a price.',
                image: imageindex.FLickFlirt,
            },
        ],
        [],
    );
    const feedMovies = useMemo<DummySoloMovie[]>(() => {
        const loopCount = 20;
        const repeated: DummySoloMovie[] = [];
        for (let i = 0; i < loopCount; i += 1) {
            for (const movie of dummyMovies) {
                repeated.push({
                    ...movie,
                    id: `${movie.id}-${i}`,
                });
            }
        }
        return repeated;
    }, [dummyMovies]);

    const handlePressNext = () => {
        const nextIndex = activeIndex + 1 >= feedMovies.length ? 0 : activeIndex + 1;
        listRef.current?.scrollToIndex({index: nextIndex, animated: true});
        setActiveIndex(nextIndex);
    };

    const handlePressInvite = () => {
        navigateToMITDateSchedule(
            {
                id: STATIC_INVITE_MOVIE.id,
                title: STATIC_INVITE_MOVIE.title,
                portraitURL: STATIC_INVITE_MOVIE.portraitURL,
                year: STATIC_INVITE_MOVIE.year,
            },
            navigation,
        );
    };

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.topBar}>
                <Pressable onPress={() => navigation.goBack()} style={styles.topIconButton}>
                    <Icon name="arrow-left" type="material-community" size={22} color={COLORS.WHITE} />
                </Pressable>
                <Text style={styles.topTitle}>Solo Session</Text>
                <Pressable style={styles.topIconButton}>
                    <Icon name="tune-variant" type="material-community" size={20} color={COLORS.WHITE} />
                </Pressable>
            </View>

            <View style={styles.deckWrap}>
                <FlatList
                    ref={listRef}
                    data={feedMovies}
                    style={styles.list}
                    keyExtractor={item => item.id}
                    pagingEnabled
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    decelerationRate="fast"
                    onLayout={event => {
                        const height = event.nativeEvent.layout.height;
                        if (height > 0 && height !== listHeight) {
                            setListHeight(height);
                        }
                    }}
                    getItemLayout={(_, index) => ({
                        length: listHeight,
                        offset: listHeight * index,
                        index,
                    })}
                    onMomentumScrollEnd={event => {
                        const index = Math.round(event.nativeEvent.contentOffset.y / listHeight);
                        setActiveIndex(index);
                    }}
                    renderItem={({item}) => (
                        <View style={[styles.card, {height: listHeight}]}>
                            <ImageBackground source={item.image} style={styles.backgroundImage} resizeMode="cover">
                                <LinearGradient
                                    colors={['rgba(3,3,10,0.25)', 'rgba(8,7,20,0.78)', 'rgba(4,4,10,0.96)']}
                                    locations={[0.1, 0.58, 1]}
                                    style={styles.backgroundOverlay}>
                                    <View style={styles.centerPlayWrap}>
                                        <Pressable style={styles.playButton}>
                                            <Icon name="play" type="ionicon" color={COLORS.WHITE} size={34} />
                                        </Pressable>
                                    </View>

                                    <View style={styles.bottomContentWrap}>
                                        <View style={styles.metaWrap}>
                                            <Text style={styles.title}>{item.title}</Text>
                                            <Text style={styles.subtitle}>{item.chapter}</Text>
                                            <View style={styles.tagRow}>
                                                {item.tags.map(tag => (
                                                    <Text key={`${item.id}-${tag}`} style={styles.tag}>
                                                        {tag}
                                                    </Text>
                                                ))}
                                            </View>
                                            <Text style={styles.vibeText}>{vibeText}</Text>
                                            <Text style={styles.description}>{item.description}</Text>
                                            <View style={styles.footerMetaRow}>
                                                <Text style={styles.footerMeta}>{item.ratingText}</Text>
                                                <Text style={styles.footerMeta}>{item.durationText}</Text>
                                                <Icon name="film-outline" type="ionicon" color="rgba(255,255,255,0.72)" size={14} />
                                            </View>
                                        </View>

                                        <View style={styles.rightActions}>
                                            <View style={styles.actionItemWrap}>
                                                <Pressable style={styles.roundAction} onPress={handlePressInvite}>
                                                    <Icon name="heart" type="material-community" color="#FF5FB8" size={28} />
                                                </Pressable>
                                                <Text style={styles.actionLabel}>Invite</Text>
                                            </View>
                                            <View style={styles.actionItemWrap}>
                                                <Pressable style={[styles.roundAction, styles.roundActionPrimary]}>
                                                    <Icon name="play" type="ionicon" color={COLORS.WHITE} size={20} />
                                                </Pressable>
                                                <Text style={styles.actionLabel}>Watch Solo</Text>
                                            </View>
                                            <View style={styles.actionItemWrap}>
                                                <Pressable style={styles.roundAction}>
                                                    <Icon name="plus" type="ionicon" color={COLORS.WHITE} size={22} />
                                                </Pressable>
                                                <Text style={styles.actionLabel}>Save</Text>
                                            </View>
                                            <View style={styles.actionItemWrap}>
                                                <Pressable style={styles.roundAction} onPress={handlePressNext}>
                                                    <Icon name="refresh" type="material-community" color={COLORS.WHITE} size={20} />
                                                </Pressable>
                                                <Text style={styles.actionLabel}>Next</Text>
                                            </View>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </ImageBackground>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    deckWrap: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    topBar: {
        position: 'absolute',
        top: 4,
        left: 0,
        right: 0,
        zIndex: 20,
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
    },
    card: {
        width: SIZES.ScreenWidth,
        borderRadius: 0,
        overflow: 'hidden',
        alignSelf: 'center',
        borderWidth: 0,
    },
    backgroundImage: {
        flex: 1,
    },
    backgroundOverlay: {
        flex: 1,
        paddingHorizontal: 14,
    },
    topIconButton: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
    },
    centerPlayWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 74,
        height: 74,
        borderRadius: 37,
        borderWidth: 1.2,
        borderColor: 'rgba(255,255,255,0.6)',
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContentWrap: {
        minHeight: SIZES.ScreenHeight * 0.34,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: 18,
    },
    rightActions: {
        justifyContent: 'flex-end',
        gap: 10,
        marginBottom: 12,
        marginLeft: 12,
        alignItems: 'center',
    },
    actionItemWrap: {
        alignItems: 'center',
    },
    roundAction: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        backgroundColor: 'rgba(15, 12, 28, 0.8)',
    },
    roundActionPrimary: {
        borderColor: 'rgba(207,162,255,0.9)',
        backgroundColor: 'rgba(124, 58, 237, 0.85)',
    },
    actionLabel: {
        ...FONTS.paragraph6,
        marginTop: 4,
        color: COLORS.WHITE,
    },
    metaWrap: {
        flex: 1,
        paddingRight: 8,
    },
    title: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
    },
    subtitle: {
        ...FONTS.paragraph4,
        color: '#B794FF',
        letterSpacing: 2,
        marginTop: 2,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 8,
    },
    tag: {
        ...FONTS.Title2Orange,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginHorizontal: 2,
        borderRadius: 4,
        textAlign: 'center',
    },
    vibeText: {
        ...FONTS.paragraph2,
        marginTop: 10,
        color: '#D6B8FF',
    },
    description: {
        ...FONTS.paragraph5,
        marginTop: 8,
        color: 'rgba(255,255,255,0.82)',
        lineHeight: 18,
        maxWidth: '90%',
    },
    footerMetaRow: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    footerMeta: {
        ...FONTS.paragraph6,
        color: 'rgba(255,255,255,0.8)',
    },
});
