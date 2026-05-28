import {RouteProp, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Image, Keyboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Edge, SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Header from '../../components/header';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import CruChatComponent from './CruChatComponent';
import BackButton from '../../components/General/backbutton';
import {useHideBottomTabBarWhileFocused} from './useHideBottomTabBarWhileFocused';
import {COLORS, FONTS} from '../../../assets/constants';
import {getMyMITs} from '../../lib/api/mit.lib';
import moment from 'moment-timezone';
import HexAvatar from '../../components/HexAvatar';
import {selectAvatarBorderColor} from '../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {IMovie} from '../../../types';
import {capitalizeFirstLetterOfString, formatMovieDuration} from '../../util/util';

type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ViewChat'>;

type Props = {
    route: ViewUserFollowListRouteProp;
};

const CruChat = ({route}: Props) => {
    const schedule = route.params?.schedule;
    const timezone = route.params?.timezone;
    const movieFromRoute = route.params?.movie;
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [movieTitle, setMovieTitle] = useState(movieFromRoute?.title ?? '');
    const [movieDateLabel, setMovieDateLabel] = useState(
        schedule && timezone ? moment(schedule).tz(timezone).format('MMM D, YYYY') : '',
    );
    const [movieScheduleTimeLabel, setMovieScheduleTimeLabel] = useState(
        schedule && timezone ? moment(schedule).tz(timezone).format('h:mm A z') : '',
    );
    const [movieTimeLabel, setMovieTimeLabel] = useState(movieFromRoute?.duration ? formatMovieDuration(movieFromRoute.duration) : '');
    const [movieImage, setMovieImage] = useState(
        movieFromRoute?.landscapeURL ?? movieFromRoute?.portraitURL ?? movieFromRoute?.image ?? '',
    );
    const [movieMeta, setMovieMeta] = useState<IMovie | undefined>(movieFromRoute);
    const [showMovieCard, setShowMovieCard] = useState(true);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    useHideBottomTabBarWhileFocused(navigation);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        const loadInviteMeta = async () => {
            const inviteId = route.params?.mItInviteId;
            if (!inviteId) {
                return;
            }
            if (route.params?.movie && route.params?.schedule && route.params?.timezone) {
                return;
            }

            try {
                const invites = await getMyMITs();
                const invite = invites?.find(item => item.id === inviteId);
                if (!invite) {
                    return;
                }

                if (!route.params?.movie) {
                    setMovieTitle(invite.movie?.title ?? '');
                    setMovieDateLabel(moment(invite.startDate).tz(invite.timezone).format('MMM D, YYYY'));
                    setMovieScheduleTimeLabel(moment(invite.startDate).tz(invite.timezone).format('h:mm A z'));
                    setMovieTimeLabel(invite.movie?.duration ? formatMovieDuration(invite.movie.duration) : '');
                    setMovieImage(invite.movie?.landscapeURL ?? invite.movie?.portraitURL ?? invite.movie?.image ?? '');
                    setMovieMeta(invite.movie);
                }
            } catch (error) {
                console.error('Failed to load chat invite metadata:', error);
            }
        };

        loadInviteMeta();
    }, [route.params?.mItInviteId, route.params?.movie, route.params?.schedule, route.params?.timezone]);

    const safeAreaEdges: Edge[] = isKeyboardVisible
        ? ['top', 'left', 'right', 'bottom']
        : ['top', 'left', 'right'];

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: COLORS.BLACK}} edges={safeAreaEdges}>
            <View style={{zIndex: 20}}>
                <Header />
            </View>
            <View style={styles.chatHeaderWrap}>
                <View style={styles.topRow}>
                    <View style={styles.backRow}>
                        <BackButton navigation={navigation} showLabel={false} />
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.userRow}
                        onPress={() => {
                            if (!route.params?.userId) {
                                return;
                            }
                            navigation.navigate('ViewUserScreen', {userID: route.params.userId});
                        }}>
                        <HexAvatar
                            source={{uri: route.params?.profilePicture}}
                            size={36}
                            bordercolor={selectAvatarBorderColor('AKCRUIT')}
                            rotateFrameDegrees={90}
                        />
                        <Text style={styles.usernameText} numberOfLines={1}>
                            {route.params?.username ?? 'User'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
                    start={{x: 0, y: 0.5}}
                    end={{x: 1, y: 0.5}}
                    style={styles.headerDivider}
                />
                {showMovieCard ? (
                    <LinearGradient
                        colors={['rgba(174, 125, 255, 0.95)', 'rgba(89, 237, 255, 0.95)']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.movieMetaBorder}>
                        <View style={styles.movieMetaCard}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.movieCloseButton}
                                onPress={() => setShowMovieCard(false)}>
                                <LinearGradient
                                    colors={['#050505', '#171717', '#050505']}
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 1}}
                                    style={styles.movieCloseButtonGradient}>
                                    <Icon name="close" type="ionicon" size={15} color="#FF3B30" />
                                </LinearGradient>
                            </TouchableOpacity>
                            {movieImage ? <Image source={{uri: movieImage}} style={styles.movieThumb} resizeMode="cover" /> : null}
                            <View style={styles.movieMetaTextWrap}>
                                {movieTitle ? (
                                    <Text style={styles.movieTitleText} numberOfLines={1}>
                                        {movieTitle}
                                    </Text>
                                ) : (
                                    <Text style={styles.movieTitleText} numberOfLines={1}>
                                        Movie details unavailable
                                    </Text>
                                )}
                                <Text style={styles.movieDateText} numberOfLines={1}>
                                    {movieDateLabel || 'Date unavailable'}
                                </Text>
                                <Text style={styles.movieDateText} numberOfLines={1}>
                                    {movieScheduleTimeLabel || 'Time unavailable'}
                                </Text>
                                <View style={styles.movieTagRow}>
                                    {movieMeta?.rated ? <Text style={styles.movieTag}>{movieMeta.rated}</Text> : null}
                                    {movieMeta?.genres?.[0] ? (
                                        <Text style={styles.movieTag}>{capitalizeFirstLetterOfString(movieMeta.genres[0])}</Text>
                                    ) : null}
                                    {movieMeta?.rating ? <Text style={styles.movieTag}>{movieMeta.rating}/10</Text> : null}
                                </View>
                            </View>
                            <View style={styles.movieActionWrap}>
                                <LinearGradient
                                    colors={['#00E5FF', '#7C4DFF', '#FF4FD8']}
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 1}}
                                    style={styles.movieTrailerGradient}>
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        style={styles.movieTrailerButton}
                                        onPress={() => {
                                            if (!movieMeta?.trailerURL) {
                                                return;
                                            }
                                            navigation.navigate('TrailerPlayer' as never, {
                                                id: movieMeta?.id,
                                                trailerURL: movieMeta?.trailerURL,
                                                landscapeURL: movieMeta?.landscapeURL,
                                            } as never);
                                        }}>
                                        <Icon name="play" type="ionicon" size={12} color={COLORS.WHITE} />
                                        <Text style={styles.movieTrailerText}>Movie Trailer</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                                <View style={styles.movieDurationRow}>
                                    <Icon name="time-outline" type="ionicon" size={12} color="rgba(236,220,255,0.9)" />
                                    <Text style={styles.movieDurationRightText} numberOfLines={1}>
                                        {movieTimeLabel || 'Duration N/A'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                ) : null}
            </View>
            <View style={{flex: 1, minHeight: 0, backgroundColor: COLORS.BLACK}}>
                <CruChatComponent route={route} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backRow: {
        zIndex: 21,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatHeaderWrap: {
        marginHorizontal: 16,
        marginBottom: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        marginLeft: 8,
    },
    usernameText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        maxWidth: '72%',
        textAlign: 'left',
    },
    headerDivider: {
        height: 1,
        marginHorizontal: -12,
        marginTop: 10,
        marginBottom: 4,
    },
    movieMetaBorder: {
        marginTop: 8,
        borderRadius: 16,
        padding: 1,
    },
    movieMetaCard: {
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: 'rgba(7, 6, 20, 0.78)',
        borderWidth: 1,
        borderColor: 'rgba(201, 141, 255, 0.36)',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        position: 'relative',
    },
    movieCloseButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        zIndex: 5,
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
    },
    movieCloseButtonGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    movieThumb: {
        width: 54,
        height: 74,
        borderRadius: 6,
    },
    movieMetaTextWrap: {
        flex: 1,
    },
    movieTitleText: {
        ...FONTS.paragraph2,
        color: COLORS.WHITE,
    },
    movieTimeText: {
        ...FONTS.paragraph5,
        color: COLORS.LIGHTGREY,
        marginTop: 3,
    },
    movieDateText: {
        ...FONTS.paragraph5,
        color: COLORS.LIGHTGREY,
        marginTop: 3,
    },
    movieTagRow: {
        marginTop: 6,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    movieTag: {
        ...FONTS.paragraph6,
        color: COLORS.WHITE,
        backgroundColor: 'rgba(183, 149, 255, 0.35)',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
    },
    movieActionWrap: {
        paddingTop: 2,
        marginLeft: 10,
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(187, 156, 255, 0.45)',
        alignItems: 'center',
    },
    movieTrailerButton: {
        backgroundColor: 'rgba(20, 10, 34, 0.9)',
        borderRadius: 8,
        minHeight: 52,
        paddingVertical: 8,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 74,
        flexDirection: 'column',
    },
    movieTrailerGradient: {
        borderRadius: 9,
        padding: 1,
    },
    movieTrailerText: {
        ...FONTS.paragraph6,
        color: COLORS.WHITE,
        textAlign: 'center',
    },
    movieDurationRightText: {
        ...FONTS.paragraph6,
        color: 'rgba(236,220,255,0.9)',
        marginLeft: 4,
        textAlign: 'center',
    },
    movieDurationRow: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default CruChat;
