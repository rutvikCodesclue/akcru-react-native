import {View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import SearchInput from '../../../components/searchInput';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import {findMovies} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import styles from '../PlayContentScreen/styles';
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
    const [displayMovies, setDisplayMovies] = useState<IMovie[]>([]);
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const pageSize = 12;

    useEffect(() => {
        if (route.params && route.params.genre) {
            handleGenrePress(route.params.genre);
        }
    }, [route.params]);

    useEffect(() => {
        setDisplayMovies(filteredMovies.slice(0, pageSize));
    }, [filteredMovies]);

    const handleGenrePress = async (genre: string) => {
        setSelectedGenre(genre);
        setPage(1);

        let movies: IMovie[] = [];
        if (genre === 'All') {
            movies = await findMovies();
        } else {
            movies = await findMovies(genre);
        }

        if (movies.length === 0) {
            setFilteredMovies([]);
            return;
        }

        const sortedMovies = movies.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });

        setFilteredMovies(sortedMovies);
        setDisplayMovies(sortedMovies.slice(0, pageSize));
        setHasMore(sortedMovies.length > pageSize);
    };

    const loadMoreMovies = () => {
        if (isLoadingMore || !hasMore) {
            return;
        }

        setIsLoadingMore(true);

        setTimeout(() => {
            const nextPage = page + 1;
            const nextSet = filteredMovies.slice(page * pageSize, nextPage * pageSize);

            if (nextSet.length > 0) {
                setDisplayMovies([...displayMovies, ...nextSet]);
                setPage(nextPage);
                setHasMore(nextSet.length === pageSize);
            }

            setIsLoadingMore(false);
        }, 300);
    };

    const renderFooterComponent = () => {
        if (isLoadingMore) {
            return <ActivityIndicator color={COLORS.PINK} style={{ marginVertical: 20 }} />;
        }
        return <View style={{ height: 10 }} />; // Add space at the bottom
    };

    const renderItem = ({item, index}: {item: any; index: number}) => {
        const isActive = item.genre === selectedGenre;
        return (
            <View style={{marginHorizontal: 10}}>
                <Text
                    style={[
                        {
                            ...FONTS.Title2,
                            color: isActive ? COLORS.AKCRUBLUE : COLORS.DARKGREY,
                        },
                    ]}
                    onPress={() => handleGenrePress(item.genre)}>
                    {item.genre}
                </Text>
            </View>
        );
    };

    return (
        <TabContainer>
            <View>
                <View>
                    <View style={styles.backbutton}>
                        <View style={{marginHorizontal: 15}}>
                            <BackButton navigation={navigation} />
                        </View>
                        <SearchInput />
                        <View
                            style={{
                                backgroundColor: COLORS.TAGCOLOR,
                                height: 30,
                                borderRadius: 5,
                                marginBottom: 10,
                                marginHorizontal: 15,
                                justifyContent: 'center',
                            }}>
                            <View>
                                <FlatList
                                    data={MOVIE_GENRES}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => item.id}
                                    renderItem={renderItem}
                                    ItemSeparatorComponent={() => <Text style={{color: COLORS.DARKGREY}}> | </Text>}
                                />
                            </View>
                        </View>
                    </View>

                    {displayMovies.length > 0 && (
                        <View style={{alignItems: 'center', marginBottom: '100%'}}>
                            <FlatList
                                data={displayMovies}
                                horizontal={false}
                                numColumns={3}
                                showsVerticalScrollIndicator={false}
                                onEndReached={() => {
                                    loadMoreMovies();
                                }}
                                onEndReachedThreshold={0.8}
                                renderItem={({item}: {item: IMovie}) => (
                                    <View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                navigation.navigate('ContentDetailScreen', {
                                                    id: item.id,
                                                    movie: item.title,
                                                });
                                            }}>
                                            <Image
                                                source={{uri: item.portraitURL}}
                                                style={{
                                                    width: SIZES.ScreenWidth / 3.5,
                                                    height: SIZES.ScreenWidth / 2.35,
                                                    borderRadius: 5,
                                                    margin: 5,
                                                    resizeMode: 'cover',
                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                ListFooterComponent={renderFooterComponent}
                                contentContainerStyle={{paddingBottom: 20}}
                            />
                        </View>
                    )}
                </View>
            </View>
        </TabContainer>
    );
};

export default SearchMovieResultScreen;
