import * as React from 'react';
import {
    Animated,
    Dimensions,
    Text,
    View,
    StyleSheet,
    Image,
    StatusBar,
    SafeAreaView,
    TouchableOpacity,
    Pressable,
} from 'react-native';
// import data from "./data";
import {Akcru_Content} from '../../../../assets/constants/ListData';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {ClientStackParams} from '../../../navigation/ClientStack';
import imageindex from '../../../../assets/images/imageindex';
import Header from '../../../components/header';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';

import {findMovieById, findMovies} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import { useEffect, useState } from 'react';
import { capitalizeFirstLetterOfString, formatMovieDuration } from '../../../util/util';
import useAuthStore from '../../../stores/auth.store';
import Header2 from '../../../components/header/header2';
// const data = Akcru_Content[7].movies;


const {width, height} = Dimensions.get('window');
const TICKER_HEIGHT = 15;
const LOGO_WIDTH = 220;
const LOGO_HEIGHT = 40;
const CIRCLE_SIZE = width * 0.6;
const DOT_SIZE = 15;

type ContentSwipeNavigationProp = StackNavigationProp<ClientStackParams, 'ContentSwipe'>;

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

const Item = ({
    movie,
    portraitURL,
    genres,
    rated,
    rating,
    scrollX,
    index,
    onPress,
    navigation,
    route,
    duration,
    year,
    title
}: Props) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const opacityInputRange = [(index - 0.4) * width, index * width, (index + 0.4) * width];
    const translateXHeading = scrollX.interpolate({
        inputRange,
        outputRange: [width * 0.1, 0, -width * 0.1],
    });
    const translateXDescription = scrollX.interpolate({
        inputRange,
        outputRange: [width, 0, -width],
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

// const Ticker = ({scrollX, movies}) => {
//     return (
//         <View style={styles.tickerContainer}>
//             <Animated.View
//                 style={{
//                     transform: [
//                         {
//                             translateY: scrollX.interpolate({
//                                 inputRange: [-width * 2, -width, 0, width, width * 2],
//                                 outputRange: [TICKER_HEIGHT * 2, TICKER_HEIGHT, 0, -TICKER_HEIGHT, -TICKER_HEIGHT * 2],
//                             }),
//                         },
//                     ],
//                 }}>
//                 {movies.map(({title, year, duration}, index) => {
//                     return (
//                         <View key={index.toString()} style={{flexDirection: 'row', alignItems: 'center'}}>
//                             <Text key={index} style={styles.tickername}>
//                                 {title}
//                             </Text>
//                             <Text style={{...FONTS.paragraph1, marginLeft: 10, fontSize: 12}}>{year}</Text>
//                             <Text style={{...FONTS.paragraph1, marginLeft: 10, fontSize: 12}}>{formatMovieDuration(duration)}</Text>
//                         </View>
//                     );
//                 })}
//             </Animated.View>
//         </View>
//     );
// };


const Pagination = ({scrollX, onPress2, movies}) => {
    const visibleMovies = movies.slice(0, 5); // Only consider the first five movies

    if (visibleMovies.length < 2) {
        return null; // Return null if there are fewer than two visible movies
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
                            <View style={[styles.paginationDot, {backgroundColor: COLORS.PURPLE}]} />
                        </View>
                    );
                })}
            </View>
            <TouchableOpacity onPress={onPress2}>
                <Text style={{...FONTS.Title2Orange, paddingTop: SIZES.ScreenHeight * 0.1, zIndex: 999, color: COLORS.PURPLE}}>Skip to Homepage</Text>
            </TouchableOpacity>
        </View>
    );
};



export default function ContentSwipe({navigation, route}: Props) {
    const _scrollX = React.useRef(new Animated.Value(0)).current;

    const [movies, setMovies] = useState<IMovie[]>([]);
    const [randomMovies, setRandomMovies] = useState<IMovie[]>([]);

    // create a useFocusEffect hook to fetch movies on focus
    useFocusEffect(
        React.useCallback(() => {
            const fetchMovies = async () => {
                try {
                    await useAuthStore.getState().hydrateAuth(); // hydrate auth before fetching movies (on inital load)
                    
                    const fetchedMovies: IMovie[] = await findMovies(/* specify parameters if needed */);
                    setMovies(fetchedMovies);
                } catch (error) {
                    console.error('Error fetching movies:', error);
                }
            };
            fetchRandomMovies();
            fetchMovies();
        }, [])
    );

    const fetchRandomMovies = async () => {
        try {
            const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

            // Get 5 random movies from the list
            const randomMovies: IMovie[] = [];
            while (randomMovies.length < 5) {
                const randomIndex = Math.floor(Math.random() * allMovies.length);
                const randomMovie = allMovies[randomIndex];
                if (!randomMovies.includes(randomMovie)) {
                    randomMovies.push(randomMovie);
                }
            }

            setRandomMovies(randomMovies);
        } catch (error) {
            console.error('Error fetching random movies:', error);
        }
    };



    // useFocusEffect(() => {
    //     // Fetch movies on focus
    //     React.useCallback(async () => {}, []);


    //     const fetchMovies = async () => {
    //         try {
    //             console.log("Hydrating auth [content swipe]...");
                
    //             await useAuthStore.getState().hydrateAuth(); // hydrate auth before fetching movies (on inital load)
    //             console.log("accessing access token [content swipe]...", useAuthStore.getState().getSession()?.access_token);
                
    //             const fetchedMovies: IMovie[] = await findMovies(/* specify parameters if needed */);
    //             setMovies(fetchedMovies);
    //         } catch (error) {
    //             console.error('Error fetching movies:', error);
    //         }
    //     };

    //     fetchMovies();
    // }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Header2 />
                </View>
                <View
                    style={{
                        position: 'absolute',
                        width: SIZES.ScreenWidth,
                        bottom: SIZES.ScreenHeight / 1.3,
                    }}>
                    <TouchableOpacity onPress={() => navigation.navigate('ClientTabNavigator')} movies={movies}>
                        <Text
                            style={{
                                ...FONTS.Title2,
                                textAlign: 'center',
                                width: SIZES.ScreenWidth / 1.2,
                                alignSelf: 'center',
                                marginBottom: 10,
                            }}>
                            Watch any of our top 5 movies today and earn 2x the Akcru Dollars
                        </Text>
                    </TouchableOpacity>

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
                    data={randomMovies.slice(0, 5)}
                    renderItem={({item, index}) => (
                        <Item
                            {...item}
                            index={index}
                            scrollX={_scrollX}
                            onPress={() => {
                                console.log('id:', item.id);
                                console.log('movie:', item.title);
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
                    onPress2={() => navigation.navigate('ClientTabNavigator')}
                    movies={movies}
                />

                {/* <Ticker scrollX={_scrollX} movies={movies} /> */}
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
        width: width * 1.35,
        height: width * 1.90,
        resizeMode: 'cover',
       
        borderRadius: 10,
        
    },
    textContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        flex: 0.55,
        marginTop: -170,
    },
    heading: {
        ...FONTS.Username,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginHorizontal: 2,
        borderRadius: 4,
        textAlign: 'center',
        marginBottom: 10,
    },
    titlestyle: {
        ...FONTS.paragraph1, 
        marginLeft: 10, 
        fontSize: 12
       
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
