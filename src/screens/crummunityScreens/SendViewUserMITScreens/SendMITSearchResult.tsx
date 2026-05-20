import {View, Text, ScrollView, FlatList, SafeAreaView, StyleSheet, ActivityIndicator} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import BasicMovieCard from '../../../components/BasicMovieCard';
import SendMITSearchInput from './SendMITSearchInput';
import PreferenceChip from '../../../components/PreferenceChip';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {IMovie, IUserProfile} from '../../../../types';
import {findMovies} from '../../../lib/api/movies.lib';
import TabContainer from '../../../components/TabContainer/TabContainer';
import BackButton from '../../../components/General/backbutton';

type SendMITSearchResultNavigationProp = StackNavigationProp<CrummunityStackParams, 'SendMITSearchResult'>;

type SendMITSearchResultRouteProp = RouteProp<CrummunityStackParams, 'SendMITSearchResult'>;

type Props = {
    navigation: SendMITSearchResultNavigationProp;
    route: SendMITSearchResultRouteProp;
};

const SendMITSearchResult = ({navigation, route}: Props) => {
    const userID: string | undefined = route.params?.userID ?? route.params?.userid ?? null;
    const rawIsFromChangeMovie = route.params?.isFromChangeMovie;
    const isFromChangeMovie = rawIsFromChangeMovie === true || rawIsFromChangeMovie === 'true';
    const inviteId: string | undefined = route.params?.inviteId ? String(route.params.inviteId) : undefined;
    const currentMovieId: string | undefined = route.params?.currentMovieId
        ? String(route.params.currentMovieId)
        : undefined;
    const receiverUser: IUserProfile | undefined = (route.params as any)?.receiverUser;

    const [selectedGenre, setSelectedGenre] = useState('');
    const [filteredMovies, setFilteredMovies] = useState<IMovie[]>([]);
    const [isLoadingMovies, setIsLoadingMovies] = useState(false);

    const [user] = useState<IUserProfile | undefined>(receiverUser);
    const genreListRef = useRef<FlatList<{id: string; genre: string}> | null>(null);

    useEffect(() => {
        if (route.params && route.params.genre) {
            handleGenrePress(route.params.genre);
        }
    }, [route.params]);

    useEffect(() => {
        if (!selectedGenre) {
            return;
        }
        const selectedIndex = MOVIE_GENRES.findIndex(item => item.genre === selectedGenre);
        if (selectedIndex < 0) {
            return;
        }
        setTimeout(() => {
            genreListRef.current?.scrollToIndex({
                index: selectedIndex,
                animated: true,
                viewPosition: 0.5,
            });
        }, 80);
    }, [selectedGenre]);

    const handleGenrePress = async (genre: string) => {
        setSelectedGenre(genre);
        setIsLoadingMovies(true);
        try {
            let movies: IMovie[] = [];
            if (genre === 'All') {
                movies = await findMovies();
            } else {
                movies = await findMovies(genre);
            }
            setFilteredMovies(movies.length > 0 ? movies : []);
        } catch (error) {
            console.error('SendMITSearchResult: failed to fetch movies by genre', error);
            setFilteredMovies([]);
        } finally {
            setIsLoadingMovies(false);
        }
    };

    return (
        <TabContainer>
            <SafeAreaView style={localStyles.container}>
                <ScrollView contentContainerStyle={localStyles.scrollContent} stickyHeaderIndices={[1]}>
                    <View style={localStyles.backWrap}>
                        <BackButton navigation={navigation} />
                    </View>
                    <View style={localStyles.searchSection}>
                        <SendMITSearchInput
                            userid={userID}
                            receiverUser={receiverUser}
                            isFromChangeMovie={isFromChangeMovie}
                            inviteId={inviteId}
                            currentMovieId={currentMovieId}
                        />
                        <View style={localStyles.genreBar}>
                            <FlatList
                                ref={genreListRef}
                                data={MOVIE_GENRES}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item => item.id}
                                contentContainerStyle={localStyles.genreListContent}
                                onScrollToIndexFailed={({index}) => {
                                    genreListRef.current?.scrollToOffset({
                                        offset: Math.max(0, index * 100),
                                        animated: true,
                                    });
                                }}
                                renderItem={({item}) => (
                                    <PreferenceChip
                                        selected={selectedGenre === item.genre}
                                        label={item.genre}
                                        onPress={() => handleGenrePress(item.genre)}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={localStyles.moviesSection}>
                        <View style={localStyles.moviesGridWrap}>
                            {isLoadingMovies ? (
                                <View style={localStyles.loaderWrap}>
                                    <ActivityIndicator size="small" color={COLORS.CATPURPLGT} />
                                </View>
                            ) : (
                            <FlatList
                                data={filteredMovies}
                                horizontal={false}
                                showsHorizontalScrollIndicator={false}
                                numColumns={3}
                                scrollEnabled={false}
                                keyExtractor={(_, index) => index.toString()}
                                ListEmptyComponent={
                                    <View style={localStyles.emptyWrap}>
                                        <Text style={localStyles.emptyText}>No movies found.</Text>
                                    </View>
                                }
                                renderItem={({item}) => (
                                    <View style={localStyles.movieCardWrap}>
                                        <BasicMovieCard
                                            image={item.portraitURL}
                                            onPress={() => {
                                                navigation.navigate('SendMITSchedule', {
                                                    id: item.id,
                                                    movieData: item,
                                                    movie: item.title,
                                                    userID: user?.id ?? userID,
                                                    userName: user?.username,
                                                    receiverUser: user ?? receiverUser,
                                                    isFromChangeMovie: Boolean(isFromChangeMovie),
                                                    inviteId,
                                                    currentMovieId,
                                                });
                                            }}
                                        />
                                    </View>
                                )}
                            />
                            )}
                        </View>
                    </View>
                    <View />
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    scrollContent: {
        paddingBottom: 85,
        backgroundColor: COLORS.BLACK,
    },
    backWrap: {
        marginHorizontal: 15,
        backgroundColor: COLORS.BLACK,
    },
    searchSection: {
        backgroundColor: COLORS.BLACK,
    },
    genreBar: {
        paddingBottom: 12,
    },
    genreListContent: {
        paddingHorizontal: '4%',
        gap: 10,
        alignItems: 'center',
    },
    moviesSection: {
        marginBottom: 75,
        backgroundColor: COLORS.BLACK,
    },
    moviesGridWrap: {
        alignItems: 'center',
        width: SIZES.ScreenWidth,
        alignSelf: 'center',
    },
    movieCardWrap: {
        marginVertical: 4,
    },
    loaderWrap: {
        paddingTop: 20,
        alignItems: 'center',
    },
    emptyText: {
        ...FONTS.paragraph2,
        color: COLORS.DARKGREY,
    },
    emptyWrap: {
        width: SIZES.ScreenWidth,
        minHeight: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SendMITSearchResult;
