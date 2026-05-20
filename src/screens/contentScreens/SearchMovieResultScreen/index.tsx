import {View, Text, ScrollView, FlatList, SafeAreaView, StyleSheet, ActivityIndicator} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import SearchInput from '../../../components/searchInput';
import PreferenceChip from '../../../components/PreferenceChip';
import BasicMovieCard from '../../../components/BasicMovieCard';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import {findMovies} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import BackButton from '../../../components/General/backbutton';

type SearchMovieResultScreenNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'SearchMovieResultScreen'>;

type SearchMovieResultScreenRouteProp = RouteProp<NoBottomTabStackParams, 'SearchMovieResultScreen'>;

type Props = {
    navigation: SearchMovieResultScreenNavigationProp;
    route: SearchMovieResultScreenRouteProp;
};

const SearchMovieResultScreen = ({navigation, route}: Props) => {
    const [selectedGenre, setSelectedGenre] = useState('');
    const [filteredMovies, setFilteredMovies] = useState<IMovie[]>([]);
    const [isLoadingMovies, setIsLoadingMovies] = useState(false);
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
            const movies = genre === 'All' ? await findMovies() : await findMovies(genre);
            setFilteredMovies(movies.length > 0 ? movies : []);
        } catch (error) {
            console.error('SearchMovieResultScreen: failed to fetch movies by genre', error);
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
                        <SearchInput />
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
                                                    navigation.navigate('ContentDetailScreen', {
                                                        id: item.id,
                                                        movie: item.title,
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
    emptyWrap: {
        width: SIZES.ScreenWidth,
        minHeight: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        ...FONTS.paragraph2,
        color: COLORS.DARKGREY,
    },
});

export default SearchMovieResultScreen;
