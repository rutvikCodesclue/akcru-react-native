import React from 'react';
import {Dimensions, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SceneRendererProps, TabBar, TabView} from 'react-native-tab-view';
import {COLORS, FONTS} from '../../../../assets/constants';
import CruSoloTabsCrummunityScreen from '../CruSoloTabsCrummunityScreen';
import CruSoloTabsSoloSessionScreen from '../CruSoloTabsSoloSessionScreen';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {findTopBoxMovies, getTrendingInvites} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import {formatMovieDuration} from '../../../util/util';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import TrendingInvitesStrip from '../../../components/TrendingInvitesStrip';
import Header from '../../../components/header';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';

type TabRoute = {
    key: 'crummunity' | 'solo';
    title: string;
};

const renderTabBar = (props: SceneRendererProps & {navigationState: {routes: TabRoute[]}}) => (
    <TabBar
        {...props}
        indicatorStyle={styles.indicator}
        style={styles.tabBar}
        renderLabel={({route, focused}) => (
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{route.title}</Text>
        )}
    />
);

export default function CruSoloTabsScreen() {
    const [index, setIndex] = React.useState(0);
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const isFocused = useIsFocused();
    const [routes] = React.useState<TabRoute[]>([
        {key: 'crummunity', title: 'For You'},
        {key: 'solo', title: 'Watch'},
    ]);
    const [topBox, setTopBox] = React.useState<IMovie[]>([]);
    const [trendingInvitesMovies, setTrendingInvitesMovies] = React.useState<IMovie[]>([]);
    const [topBoxIndex, setTopBoxIndex] = React.useState(0);
    const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
    const [topBoxShouldAutoplay, setTopBoxShouldAutoplay] = React.useState(true);
    const [isMuted, setIsMuted] = React.useState(true);
    const [showForYouTopSections, setShowForYouTopSections] = React.useState(true);

    const current = topBox[topBoxIndex];
    const trailerUrl = current?.trailerURL ?? '';
    const canPlay = trailerUrl.trim().length > 0;
    const len = topBox.length;
    const releaseYear = (() => {
        if (current?.year && Number(current.year) > 0) {
            return String(current.year);
        }
        if (current?.createdAt) {
            const derivedYear = new Date(current.createdAt).getFullYear();
            if (!Number.isNaN(derivedYear) && derivedYear > 1900) {
                return String(derivedYear);
            }
        }
        return '';
    })();

    const durationSeconds = (() => {
        const d = Number(current?.duration ?? 0);
        if (d > 0) {
            return d;
        }
        const l = Number((current as {length?: number} | undefined)?.length ?? 0);
        if (l > 0) {
            return l;
        }
        return 0;
    })();

    const durationText = durationSeconds > 0 ? formatMovieDuration(durationSeconds).trim() : '';
    const subtitleParts = [releaseYear, durationText].filter(Boolean);
    const badgeLabels = [
        current?.rated ? String(current.rated) : '',
        current?.genres?.[0] ? capitalizeFirstLetterOfString(String(current.genres[0])) : '',
        current?.rating ? `${current.rating}/10` : '',
    ].filter(Boolean);

    React.useEffect(() => {
        const fetchTopBoxMovies = async () => {
            try {
                const topBoxMovies: IMovie[] = await findTopBoxMovies();
                setTopBox(topBoxMovies);
            } catch (error) {
                console.error('Error fetching topbox movies:', error);
            }
        };

        fetchTopBoxMovies();
    }, []);

    React.useEffect(() => {
        const fetchTrendingInvitesMovies = async () => {
            try {
                const movies = await getTrendingInvites();
                setTrendingInvitesMovies(Array.isArray(movies) ? movies : []);
            } catch (error) {
                console.error('Error fetching trending invites movies:', error);
                setTrendingInvitesMovies([]);
            }
        };

        fetchTrendingInvitesMovies();
    }, []);

    React.useEffect(() => {
        setIsVideoLoaded(false);
    }, [topBoxIndex]);

    React.useEffect(() => {
        setTopBoxShouldAutoplay(isFocused && index === 0);
    }, [isFocused, index]);

    const handleForYouFeedScroll = React.useCallback((offsetY: number) => {
        if (offsetY <= 0) {
            setShowForYouTopSections(true);
            return;
        }
        setShowForYouTopSections(false);
    }, []);

    const renderScene = React.useCallback(
        ({route}: {route: TabRoute}) => {
            if (route.key === 'crummunity') {
                return <CruSoloTabsCrummunityScreen onFeedScroll={handleForYouFeedScroll} />;
            }
            return <CruSoloTabsSoloSessionScreen />;
        },
        [handleForYouFeedScroll],
    );

    const handleVideoEnd = React.useCallback(() => {
        if (len <= 1) {
            return;
        }
        const next = (topBoxIndex + 1) % len;
        setTopBoxIndex(next);
    }, [len, topBoxIndex]);

    const handlePreviousVideo = React.useCallback(() => {
        if (len <= 1) {
            return;
        }
        const prev = (topBoxIndex - 1 + len) % len;
        setTopBoxIndex(prev);
    }, [len, topBoxIndex]);

    const handleVideoError = React.useCallback(() => {
        if (len <= 1) {
            return;
        }
        const next = (topBoxIndex + 1) % len;
        setTopBoxIndex(next);
    }, [len, topBoxIndex]);

    React.useEffect(() => {
        if (!isVideoLoaded || !topBoxShouldAutoplay) return;
        let elapsed = 0;
        const timer = setInterval(() => {
            elapsed += 1;
            if (elapsed >= 30) {
                clearInterval(timer);
                handleVideoEnd();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isVideoLoaded, topBoxShouldAutoplay, topBoxIndex, handleVideoEnd]);

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            {index === 0 && showForYouTopSections && current ? (
                <View>
                    <View style={styles.headerWrap}>
                        <Text style={styles.headerTitle}>Explore</Text>
                    </View>
                <View style={styles.heroWrap}>
                    <View style={styles.heroControlsTop}>
                        <TouchableOpacity onPress={() => setIsMuted(prev => !prev)} style={styles.iconButton}>
                            <Icon
                                name={isMuted ? 'volume-mute' : 'volume-high'}
                                type="ionicon"
                                size={20}
                                color={COLORS.LIGHTGREY}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroControlsMid}>
                        <TouchableOpacity onPressIn={handleVideoEnd} style={styles.iconButton}>
                            <Icon name="chevron-forward" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                        </TouchableOpacity>
                        <TouchableOpacity onPressIn={handlePreviousVideo} style={styles.iconButton}>
                            <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                        </TouchableOpacity>
                    </View>

                    <Pressable style={styles.videoContainer}>
                        <Video
                            key={current?.id}
                            style={styles.video}
                            source={canPlay ? {uri: trailerUrl} : undefined}
                            resizeMode="cover"
                            onEnd={handleVideoEnd}
                            repeat={false}
                            onError={handleVideoError}
                            posterResizeMode="cover"
                            poster={current?.portraitURL}
                            onLoad={() => {
                                setIsVideoLoaded(true);
                            }}
                            paused={!topBoxShouldAutoplay}
                            muted={isMuted}
                        />

                        <LinearGradient
                            colors={[COLORS.TRANSPARENT, 'rgba(0,0,0,0.88)']}
                            style={styles.videoOverlay}
                        />
                        <View style={styles.videoMeta}>
                            <Text style={styles.videoTitle} numberOfLines={1}>
                                {current?.title}
                            </Text>
                            {subtitleParts.length > 0 ? (
                                <Text style={styles.videoSubTitle}>{subtitleParts.join(' · ')}</Text>
                            ) : null}
                            <View style={styles.badgeRow}>
                                {badgeLabels.map((label, idx) => (
                                <View key={`${current?.id}-badge-${idx}`} style={styles.badgePill}>
                                        <Text style={styles.badgeText}>{label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </Pressable>
                </View>
                </View>
            ) : null}
            {index === 0 && showForYouTopSections && current ? <View style={styles.sectionDivider} /> : null}
            {index === 0 && showForYouTopSections ? (
                <TrendingInvitesStrip
                    movies={trendingInvitesMovies}
                    onPressMovie={movie =>
                        navigation.navigate('ContentDetailScreen', {
                            id: movie.id,
                            movie: movie.title,
                        })
                    }
                />
            ) : null}
            {index === 0 && showForYouTopSections ? <View style={styles.sectionDivider} /> : null}
            <TabView
                navigationState={{index, routes}}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{width: Dimensions.get('window').width}}
                renderTabBar={renderTabBar}
                lazy
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    headerWrap: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 6,
        backgroundColor: COLORS.BLACK,
    },
    headerTitle: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
    },
    tabBar: {
        backgroundColor: COLORS.BLACK,
        elevation: 0,
        shadowOpacity: 0,
    },
    indicator: {
        backgroundColor: COLORS.PINK,
        height: 3,
    },
    tabLabel: {
        ...FONTS.paragraph4,
        color: COLORS.OVERLAY_WHITE_70,
        textTransform: 'none',
    },
    tabLabelActive: {
        color: COLORS.WHITE,
    },
    heroWrap: {
        width: '100%',
        height: 220,
        marginBottom: 10,
    },
    heroControlsTop: {
        width: '100%',
        zIndex: 3,
        position: 'absolute',
        top: 10,
        paddingHorizontal: 12,
        alignItems: 'flex-end',
    },
    heroControlsMid: {
        width: '100%',
        zIndex: 3,
        position: 'absolute',
        top: '43%',
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    iconButton: {
        width: 30,
        height: 30,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.OVERLAY_BLACK_45,
    },
    videoContainer: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 120,
    },
    videoMeta: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 10,
    },
    videoTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
    },
    videoSubTitle: {
        ...FONTS.paragraph2,
        color: 'rgba(236,220,255,0.9)',
        marginTop: 3,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 6,
    },
    badgePill: {
        backgroundColor: '#DDB3FF',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 6,
        marginBottom: 6,
    },
    badgeText: {
        ...FONTS.paragraph2,
        color: '#1A0C2A',
    },
    sectionDivider: {
        height: 1,
        backgroundColor: COLORS.OVERLAY_WHITE_14,
        marginHorizontal: 10,
        marginBottom: 8,
    },
});
