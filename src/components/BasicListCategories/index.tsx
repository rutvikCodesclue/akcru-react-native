import {View, Text, Image, FlatList, TouchableOpacity, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import styles from './styles';
import {FONTS, SIZES} from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {IMovie} from '../../../types';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import HighlightMediaCard from '../HighlightMediaCard';
import imageindex from '../../../assets/images/imageindex';

/** Brief delay so gradient border is visible before navigation (highlight rows only) */
const HIGHLIGHT_NAV_DELAY_MS = 130;

interface BasicListCategoriesProps {
    Akcru_Content: {
        id: string;
        title: string;
        movies: IMovie[];
    };
    /** default: plain posters | highlight: left row + focus frame | featured: centered snap carousel */
    variant?: 'default' | 'highlight' | 'featured';
    /**
     * featured only: `portrait` = default card width; `wideLandscape` = legacy wide row (landscape art)
     */
    featuredCardPreset?: 'portrait' | 'wideLandscape';
    showTitleIcon?: boolean;
    titleIconUri?: string;
}

const BasicListCategories = (props: BasicListCategoriesProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {Akcru_Content, variant = 'default', featuredCardPreset = 'portrait', showTitleIcon = false, titleIconUri} = props;
    const isFeatured = variant === 'featured';
    const isHighlight = variant === 'highlight';
    const isFeaturedWide = isFeatured && featuredCardPreset === 'wideLandscape';

    const isFeaturedLoopEnabled = isFeatured && Akcru_Content.movies.length > 1;
    const featuredBaseLength = Akcru_Content.movies.length;
    const featuredLoopCopies = 5;
    const featuredData = useMemo(() => {
        if (!isFeaturedLoopEnabled) {
            return Akcru_Content.movies;
        }
        return Array.from({length: featuredLoopCopies}, () => Akcru_Content.movies).flat();
    }, [Akcru_Content.movies, isFeaturedLoopEnabled]);
    const featuredMiddleStartIndex = isFeaturedLoopEnabled ? featuredBaseLength * 2 : 0;

    const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
    const [activeFeaturedRenderIndex, setActiveFeaturedRenderIndex] = useState(featuredMiddleStartIndex);
    const [pressedHighlightMovieId, setPressedHighlightMovieId] = useState<string | null>(null);
    const highlightNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (highlightNavTimerRef.current) {
                clearTimeout(highlightNavTimerRef.current);
            }
        };
    }, []);

    const featuredItemWidth = isFeaturedWide ? SIZES.ScreenWidth / 1.3 : SIZES.ScreenWidth / 2.9;
    const featuredItemSpacing = 12;
    const featuredSnapInterval = featuredItemWidth + featuredItemSpacing;
    const featuredSidePadding = Math.max(0, (SIZES.ScreenWidth - featuredItemWidth) / 2);
    const featuredListRef = useRef<FlatList<IMovie> | null>(null);

    const featuredSnapOffsets = useMemo(
        () => featuredData.map((_, index) => index * featuredSnapInterval),
        [featuredData, featuredSnapInterval],
    );

    useEffect(() => {
        setActiveFeaturedRenderIndex(featuredMiddleStartIndex);
        setActiveFeaturedIndex(0);
    }, [featuredMiddleStartIndex]);

    useEffect(() => {
        if (!isFeatured || !isFeaturedLoopEnabled || featuredMiddleStartIndex <= 0) {
            return;
        }
        // FlatList initialScrollIndex can fail intermittently before layout; center after mount instead.
        const timer = setTimeout(() => {
            featuredListRef.current?.scrollToOffset({
                offset: featuredMiddleStartIndex * featuredSnapInterval,
                animated: false,
            });
        }, 0);
        return () => clearTimeout(timer);
    }, [isFeatured, isFeaturedLoopEnabled, featuredMiddleStartIndex, featuredSnapInterval]);

    const handleFeaturedMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (featuredBaseLength === 0) {
            return;
        }

        const offsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(offsetX / featuredSnapInterval);
        if (!isFeaturedLoopEnabled) {
            setActiveFeaturedRenderIndex(currentIndex);
            setActiveFeaturedIndex(currentIndex);
            return;
        }

        if (currentIndex < featuredBaseLength) {
            const rebasedIndex = currentIndex + featuredBaseLength * 2;
            setActiveFeaturedRenderIndex(rebasedIndex);
            setActiveFeaturedIndex(((rebasedIndex % featuredBaseLength) + featuredBaseLength) % featuredBaseLength);
            featuredListRef.current?.scrollToOffset({
                offset: rebasedIndex * featuredSnapInterval,
                animated: false,
            });
            return;
        }
        if (currentIndex >= featuredBaseLength * 4) {
            const rebasedIndex = currentIndex - featuredBaseLength * 2;
            setActiveFeaturedRenderIndex(rebasedIndex);
            setActiveFeaturedIndex(((rebasedIndex % featuredBaseLength) + featuredBaseLength) % featuredBaseLength);
            featuredListRef.current?.scrollToOffset({
                offset: rebasedIndex * featuredSnapInterval,
                animated: false,
            });
            return;
        }

        setActiveFeaturedRenderIndex(currentIndex);
        setActiveFeaturedIndex(((currentIndex % featuredBaseLength) + featuredBaseLength) % featuredBaseLength);
    };

    const sectionTitleStyle = isFeatured || isHighlight ? styles.homeSectionTitle : undefined;
    const sectionWrapStyle = isFeatured || isHighlight ? styles.featuredSectionContainer : undefined;
    const renderSectionTitle = () => {
        if (!showTitleIcon) {
            return <Text style={sectionTitleStyle}>{Akcru_Content.title}</Text>;
        }
        const titleIconSource = titleIconUri ? {uri: titleIconUri} : imageindex.AkcruHexLogo;

        return (
            <View style={styles.homeSectionTitleRow}>
                <Image source={titleIconSource} style={styles.homeSectionTitleIcon} resizeMode="contain" />
                <Text style={sectionTitleStyle}>{Akcru_Content.title}</Text>
            </View>
        );
    };

    if (isFeatured) {
        const featuredPosterStyle = isFeaturedWide ? styles.featuredWidePoster : styles.featuredPoster;
        return (
            <View style={sectionWrapStyle}>
                {renderSectionTitle()}
                <FlatList
                    ref={featuredListRef}
                    data={featuredData}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={featuredSnapInterval}
                    snapToOffsets={featuredSnapOffsets}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    disableIntervalMomentum
                    bounces={false}
                    onMomentumScrollEnd={handleFeaturedMomentumEnd}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    getItemLayout={(_, index) => ({
                        length: featuredSnapInterval,
                        offset: featuredSnapInterval * index,
                        index,
                    })}
                    contentContainerStyle={{
                        ...styles.featuredListContainer,
                        paddingHorizontal: featuredSidePadding,
                    }}
                    renderItem={({item, index}) => {
                        const isActiveFeaturedCard = index === activeFeaturedRenderIndex;
                        const imageUri = isFeaturedWide
                            ? (item.landscapeURL || item.portraitURL)
                            : (item.portraitURL || item.landscapeURL);

                        return (
                            <View style={[styles.featuredCardWrap, {width: featuredSnapInterval}]}>
                                <HighlightMediaCard
                                    active={isActiveFeaturedCard}
                                    uri={imageUri}
                                    imageStyle={featuredPosterStyle}
                                    onPress={() => {
                                        navigation.navigate('ContentDetailScreen', {
                                            id: item.id,
                                            movie: item.title,
                                        });
                                    }}
                                />
                            </View>
                        );
                    }}
                />
            </View>
        );
    }

    if (isHighlight) {
        const handleHighlightItemPress = (movie: IMovie) => {
            if (highlightNavTimerRef.current) {
                clearTimeout(highlightNavTimerRef.current);
            }
            setPressedHighlightMovieId(movie.id);
            highlightNavTimerRef.current = setTimeout(() => {
                highlightNavTimerRef.current = null;
                setPressedHighlightMovieId(null);
                navigation.navigate('ContentDetailScreen', {
                    id: movie.id,
                    movie: movie.title,
                });
            }, HIGHLIGHT_NAV_DELAY_MS);
        };

        return (
            <View style={sectionWrapStyle}>
                {renderSectionTitle()}
                <FlatList
                    data={Akcru_Content.movies}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    contentContainerStyle={{
                        ...styles.featuredListContainer,
                        paddingHorizontal: '2%',
                    }}
                    renderItem={({item}) => {
                        const showBorder = pressedHighlightMovieId === item.id;
                        const imageUri = item.portraitURL || item.landscapeURL;
                        return (
                            <View style={styles.highlightCardWrap}>
                                <HighlightMediaCard
                                    active={showBorder}
                                    uri={imageUri}
                                    imageStyle={styles.featuredPoster}
                                    onPress={() => handleHighlightItemPress(item)}
                                />
                            </View>
                        );
                    }}
                />
            </View>
        );
    }

    return (
        <View>
            <Text style={{...FONTS.Title2, marginTop: 10, marginLeft: '2%'}}>{Akcru_Content.title}</Text>
            <FlatList
                data={Akcru_Content.movies}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({item}) => (
                    <View>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('ContentDetailScreen', {
                                    id: item.id,
                                    movie: item.title,
                                });
                            }}>
                            <Image source={{uri: item.portraitURL || item.landscapeURL}} style={styles.poster} />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

export default BasicListCategories;
