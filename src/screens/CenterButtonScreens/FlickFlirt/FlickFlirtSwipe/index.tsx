import React, {useState} from 'react';
import {View, Text, SafeAreaView, ImageBackground} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import imageindex from '../../../../../assets/images/imageindex';
import styles from './styles';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import {API} from '../../../../clients/api.client';
import {IMovie} from '../../../../../types';
import {findFlickFlirtMovies} from '../../../../lib/api/movies.lib';
import Swiper from 'react-native-deck-swiper';
import useAuthStore from '../../../../stores/auth.store';
import {capitalizeFirstLetterOfString} from '../../../../util/util';
import {Icon} from '@rneui/base';
import {isTablet} from '../../../../../assets/constants/theme';

const FlickFlirtSwipe = () => {
    const [movies, setMovies] = useState<IMovie[]>([]);
    const [swipeResult, setSwipeResult] = useState<null | 'LIKE' | 'NOPE'>(null);

    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {hydrateUser} = useAuthStore();

    useFocusEffect(
        React.useCallback(() => {
            findFlickFlirtMovies().then(setMovies).catch(console.error);
        }, []),
    );

    useFocusEffect(
        React.useCallback(() => {
            hydrateUser();
            return () => {
                hydrateUser();
            };
        }, [hydrateUser]),
    );

    const handleSwipe = async (movieId: string, type: 'LIKE' | 'DISLIKE') => {
        try {
            await API.post('v1/flickflirt/swipe', {movieId, type});
        } catch (error) {
            console.error('Error recording swipe:', error);
        }
    };

    const onSwipedAll = () => {
        // After swiping, go to the preferences flow
        navigation.navigate('FlickFlirtPref');
    };

    return (
        <View>
            <ImageBackground
                source={imageindex.FLickFlirt}
                resizeMode="cover"
                style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                <SafeAreaView style={{flex: 1}}>
                    <LinearGradient
                        colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                        style={{position: 'absolute', left: 0, right: 0, top: 0, height: SIZES.ScreenHeight}}
                    />

                    <Header />
                    <BackButton navigation={navigation} />

                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        {movies.length > 0 ? (
                            <Swiper
                                cards={movies}
                                renderCard={(movie: IMovie) => (
                                    <View style={styles.card}>
                                        <ImageBackground source={{uri: movie.portraitURL}} style={styles.cardImage}>
                                            <LinearGradient
                                                colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    right: 0,
                                                    top: 0,
                                                    height: '100%',
                                                }}
                                            />
                                            <View style={{padding: isTablet() ? 30 : 10}}>
                                                <Text style={styles.bigTitle}>{movie.title}</Text>
                                                <View style={{flexDirection: 'row', marginVertical: 10}}>
                                                    <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                                    <Text style={styles.drawfonttag}>
                                                        {capitalizeFirstLetterOfString(movie?.genres[0])}
                                                    </Text>
                                                    <Text style={styles.drawfonttag}>
                                                        {capitalizeFirstLetterOfString(movie?.genres[1])}
                                                    </Text>
                                                    <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                                                </View>
                                                <Text style={styles.desc}>{movie.description}</Text>
                                            </View>
                                        </ImageBackground>
                                    </View>
                                )}
                                onSwipedLeft={cardIndex => {
                                    setSwipeResult('NOPE');
                                    handleSwipe(movies[cardIndex].id, 'DISLIKE');
                                    setTimeout(() => setSwipeResult(null), 1200);
                                }}
                                onSwipedRight={cardIndex => {
                                    setSwipeResult('LIKE');
                                    handleSwipe(movies[cardIndex].id, 'LIKE');
                                    setTimeout(() => setSwipeResult(null), 1200);
                                }}
                                backgroundColor="transparent"
                                stackSize={4}
                                cardIndex={0}
                                verticalSwipe={false}
                                cardStyle={{
                                    marginTop: isTablet() ? 0 : '-10%',
                                    marginLeft: isTablet() ? '17%' : '3%',
                                    alignSelf: 'center',
                                }}
                                onSwipedAll={onSwipedAll}
                                overlayLabels={{
                                    left: {
                                        title: 'NOPE',
                                        style: {
                                            label: {
                                                backgroundColor: 'transparent',
                                                borderColor: 'red',
                                                color: 'red',
                                                fontSize: 38,
                                                fontWeight: 'bold',
                                                borderWidth: 2,
                                                padding: 10,
                                            },
                                            wrapper: {
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                justifyContent: 'flex-start',
                                                marginTop: 30,
                                                marginLeft: isTablet() ? -330 : -30,
                                            },
                                        },
                                    },
                                    right: {
                                        title: 'LIKE',
                                        style: {
                                            label: {
                                                backgroundColor: 'transparent',
                                                borderColor: '#00BFFF',
                                                color: '#00BFFF',
                                                fontSize: 38,
                                                fontWeight: 'bold',
                                                borderWidth: 2,
                                                padding: 10,
                                            },
                                            wrapper: {
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                justifyContent: 'flex-start',
                                                marginTop: 30,
                                                marginLeft: 30,
                                            },
                                        },
                                    },
                                }}
                                animateOverlayLabelsOpacity
                            />
                        ) : (
                            <Text style={[FONTS.Title3, {color: COLORS.LIGHTGREY}]}>Loading movies...</Text>
                        )}
                    </View>

                    <View style={{alignItems: 'center', marginBottom: '20%'}}>
                        <Text style={[FONTS.Title3, {color: COLORS.AKCRUPINK}]}>
                            Swipe right if you like, swipe left if you dislike
                        </Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '40%'}}>
                            <Icon name="sad" type="ionicon" color={COLORS.CATREDLGT} size={isTablet() ? 60 : 40} />
                            <Icon name="happy" type="ionicon" color={COLORS.AKCRUBLUE} size={isTablet() ? 60 : 40} />
                        </View>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

export default FlickFlirtSwipe;
