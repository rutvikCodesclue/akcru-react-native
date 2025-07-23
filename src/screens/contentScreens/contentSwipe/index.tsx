import * as React from 'react';
import {Platform} from 'react-native';
import {Animated, Dimensions, Text, View, StyleSheet, Image, SafeAreaView, TouchableOpacity} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import imageindex from '../../../../assets/images/imageindex';
import Header from '../../../components/header';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {IMovie} from '../../../../types';
import {useState} from 'react';
import {capitalizeFirstLetterOfString, formatMovieDuration} from '../../../util/util';
import {MULTISIZES} from '../../../../assets/constants/theme';
import {findSponsoredMovies} from '../../../lib/api/movies.lib';
import {isTablet} from '../../../../assets/constants/theme';

const {width, height} = Dimensions.get('window');
const TICKER_HEIGHT = MULTISIZES.medium14;
const LOGO_WIDTH = 220;
const LOGO_HEIGHT = 40;
const CIRCLE_SIZE = width * 0.7;
const DOT_SIZE = 15;

type ContentSwipeNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'ContentSwipe'>;

type ContentSwipeRouteProp = RouteProp<NoBottomTabStackParams, 'ContentSwipe'>;

type Props = {
    navigation: ContentSwipeNavigationProp;
    route: ContentSwipeRouteProp;
    movie: IMovie;
    portraitURL: string;
    genres: string;
    rated: string;
    rating: number;
    onPress: () => void;
    onPress2: () => void;
    index: any;
    scrollX: any;
    duration: number;
    year: number;
    title: string;
};

const Item = ({movie, portraitURL, genres, rated, rating, scrollX, index, onPress, duration, year, title}: Props) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const opacityInputRange = [(index - 0.4) * width, index * width, (index + 0.4) * width];
    const translateXHeading = scrollX.interpolate({
        inputRange,
        outputRange: [width * 0.1, 0, -width * 0.1],
    });
    const opacity = scrollX.interpolate({
        inputRange: opacityInputRange,
        outputRange: [0, 1, 0],
    });
    const imageScale = scrollX.interpolate({
        inputRange,
        outputRange: [0.1, 0.5, 0.1],
    });
    return (
        <View>
            <View style={styles.itemStyle}>
                <TouchableOpacity onPress={onPress}>
                    <Animated.Image
                        source={{uri: portraitURL}}
                        style={[
                            styles.imageStyle,
                            {
                                transform: [{scale: imageScale}],
                            },
                        ]}
                    />
                </TouchableOpacity>

                <View style={styles.textContainer}>
                    <View style={{flexDirection: 'row', marginBottom: 10, alignItems: 'baseline'}}>
                        <Animated.Text
                            style={[
                                styles.tickername,
                                {
                                    opacity,
                                    transform: [{translateX: translateXHeading}],
                                },
                            ]}>
                            {title}
                        </Animated.Text>
                        <Animated.Text
                            style={[
                                styles.titlestyle,
                                {
                                    opacity,
                                    transform: [{translateX: translateXHeading}],
                                },
                            ]}>
                            {year}
                        </Animated.Text>
                        <Animated.Text
                            style={[
                                styles.titlestyle,
                                {
                                    opacity,
                                    transform: [{translateX: translateXHeading}],
                                },
                            ]}>
                            {formatMovieDuration(duration)}
                        </Animated.Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <Animated.Text
                            style={[
                                styles.heading,
                                {
                                    opacity,
                                    transform: [{translateX: translateXHeading}],
                                },
                            ]}>
                            {rated}
                        </Animated.Text>
                        <Animated.Text
                            style={[
                                styles.heading,
                                {
                                    opacity,
                                    transform: [{translateX: translateXHeading}],
                                },
                            ]}>
                            {capitalizeFirstLetterOfString(genres[0])}
                        </Animated.Text>
                        <Animated.Text
                            style={[
                                styles.heading,
                                {
                                    opacity,
                                    transform: [{translateX: translateXHeading}],
                                },
                            ]}>
                            {capitalizeFirstLetterOfString(genres[1])}
                        </Animated.Text>
                        <Animated.Text
                            style={[
                                styles.heading,
                                {
                                    opacity,
                                    transform: [{translateX: translateXHeading}],
                                },
                            ]}>
                            {rating}/10
                        </Animated.Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const Circle = ({scrollX, movies}) => {
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.circleContainer]}>
            {movies.map((item, index) => {
                const inputRange = [(index - 0.55) * width, index * width, (index + 0.55) * width];
                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.circle,
                            {
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                opacity: scrollX.interpolate({
                                    inputRange,
                                    outputRange: [0, 0.1, 0],
                                }),
                                transform: [
                                    {
                                        scale: scrollX.interpolate({
                                            inputRange,
                                            outputRange: [0, 1, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
};

const Pagination = ({scrollX, onPress2, movies}) => {
    const visibleMovies = movies.slice(0, 5);

    if (visibleMovies.length < 2) {
        return null;
    }

    const translateX = scrollX.interpolate({
        inputRange: visibleMovies.map((_, i) => i * width),
        outputRange: visibleMovies.map((_, i) => i * 15),
    });

    return (
        <View style={styles.paginationview}>
            <View style={styles.pagination}>
                <Animated.View
                    style={[
                        styles.paginationIndicator,
                        {
                            transform: [{translateX}],
                        },
                    ]}
                />
                {visibleMovies.map((item, index) => {
                    return (
                        <View key={item.id} style={styles.paginationDotContainer}>
                            <View style={[styles.paginationDot, {backgroundColor: COLORS.PINK}]} />
                        </View>
                    );
                })}
            </View>
            <TouchableOpacity onPress={onPress2}>
                <Text
                    style={{
                        ...FONTS.Title2,
                        paddingTop: isTablet() ? SIZES.ScreenHeight * 0.04 : SIZES.ScreenHeight * 0.1,
                        zIndex: 999,
                        color: COLORS.PINK,
                        marginBottom: 10,
                    }}>
                    Skip to Homepage
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default function ContentSwipe({navigation}: Props) {
    const _scrollX = React.useRef(new Animated.Value(0)).current;
    const [movies, setMovies] = useState<IMovie[]>([]);
    useFocusEffect(
        React.useCallback(() => {
            const fetchSponsoredMovies = async () => {
                try {
                    const sponsoredMovies = await findSponsoredMovies();
                    setMovies(sponsoredMovies);
                } catch (error) {
                    console.error('Error fetching sponsored movies:', error);
                }
            };

            fetchSponsoredMovies();
        }, []),
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Header />
                </View>
                <View
                    style={{
                        position: 'absolute',
                        width: SIZES.ScreenWidth,
                        bottom: Platform.OS == 'ios' ? SIZES.ScreenHeight / 1.4 : SIZES.ScreenHeight / 1.3,
                    }}>
                    <View>
                        <Text
                            style={{
                                ...FONTS.paragraph1,
                                textAlign: 'center',
                                width: SIZES.ScreenWidth / 1.2,
                                alignSelf: 'center',
                                marginBottom: 10,
                            }}>
                            Here are our top 5 movies recommended for you today
                        </Text>
                    </View>

                    <Image
                        source={imageindex.AkcruHexLogo}
                        style={{width: 30, height: 26, alignSelf: 'center', marginBottom: 10}}
                    />
                </View>
                <Circle scrollX={_scrollX} movies={movies} />
                <Animated.FlatList
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    horizontal
                    keyExtractor={item => item.id}
                    onScroll={Animated.event([{nativeEvent: {contentOffset: {x: _scrollX}}}], {useNativeDriver: true})}
                    data={movies.slice(0, 5)}
                    renderItem={({item, index}) => (
                        <Item
                            {...item}
                            index={index}
                            scrollX={_scrollX}
                            onPress={() => {
                                navigation.navigate('ContentDetailScreen', {
                                    id: item.id,
                                    movie: item.id,
                                });
                            }}
                        />
                    )}
                />

                <Pagination
                    scrollX={_scrollX}
                    onPress2={() => navigation.navigate('ClientTabNavigator', {screen: 'ClientStack'})}
                    movies={movies}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        position: 'relative',
    },

    itemStyle: {
        width,
        height,
        alignItems: 'center',
    },
    itemStyle2: {
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageStyle: {
        width: isTablet() ? width * 1 : width * 1.35,
        height: isTablet() ? width * 1.5 : width * 1.9,
        resizeMode: 'cover',
        marginTop: isTablet() ? -100 : 0,

        borderRadius: 10,
    },
    textContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        flex: 0.55,
        marginTop: isTablet() ? -300 : -175,
    },
    heading: {
        ...FONTS.Username,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginHorizontal: 2,
        borderRadius: 4,
        textAlign: 'center',
    },
    titlestyle: {
        ...FONTS.paragraph1,
        marginLeft: 10,
    },
    description: {
        color: '#ccc',
        fontWeight: '600',
        textAlign: 'center',
        width: width * 0.75,

        fontSize: 16,
        lineHeight: 16 * 1.5,
    },

    circleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        position: 'absolute',
        top: '50%',
    },
    tickername: {
        textTransform: 'uppercase',
        fontSize: TICKER_HEIGHT,
        lineHeight: TICKER_HEIGHT,
        fontWeight: '800',
        color: COLORS.LIGHTGREY,
    },
    tickerContainer: {
        height: TICKER_HEIGHT,
        overflow: 'hidden',
        position: 'absolute',
        top: SIZES.ScreenHeight / 4.4,
        left: 20,
    },
    paginationview: {
        position: 'absolute',
        right: 50,
        left: 50,
        bottom: '2%',
        alignItems: 'center',
    },

    pagination: {
        flexDirection: 'row',
        height: DOT_SIZE,
    },
    paginationDot: {
        width: DOT_SIZE * 0.3,
        height: DOT_SIZE * 0.3,
        borderRadius: DOT_SIZE * 0.15,
    },
    paginationDotContainer: {
        width: DOT_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paginationIndicator: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        borderWidth: 2,
        borderColor: COLORS.AKCRUBLUE,
        position: 'absolute',
    },
    logo: {
        opacity: 0.9,
        height: LOGO_HEIGHT,
        width: LOGO_WIDTH,
        resizeMode: 'contain',
        position: 'absolute',
        left: 10,
        bottom: 10,
        transform: [
            {translateX: -LOGO_WIDTH / 2},
            {translateY: -LOGO_HEIGHT / 2},
            {rotateZ: '-90deg'},
            {translateX: LOGO_WIDTH / 2},
            {translateY: LOGO_HEIGHT / 2},
        ],
    },
    header: {
        position: 'absolute',
        zIndex: 100,
    },
});
