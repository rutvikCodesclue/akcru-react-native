import {View, Text, FlatList, TouchableOpacity, Image, Platform} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import SearchInput from '../../../components/searchInput';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import {Icon} from '@rneui/base';
import {findMovies} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import AkcruButtons from '../../../components/akcruButtons';
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
    const [pageIndex, setPageIndex] = useState(0);
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

        let movies: IMovie[] = [];
        if (genre === 'All') {
            movies = await findMovies();
        } else {
            movies = await findMovies(genre);
        }

        if (movies.length === 0) {
            //console.log('No movies found...');

            setFilteredMovies([]);
            return;
        }

        const sortedMovies = movies.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });

        setFilteredMovies(sortedMovies);
        return;
    };

    const renderFooterComponent = () => {
        const moreItemsToLoad = displayMovies.length < filteredMovies.length;

        if (moreItemsToLoad) {
            return (
                <View
                    style={{
                        marginBottom: Platform.OS == 'ios' ? SIZES.ScreenHeight * 0.7 : SIZES.ScreenHeight * 0.58,
                        alignItems: 'center',
                        marginTop: 10,
                    }}>
                    <AkcruButtons.XlLrgButton btnname="Load More" onPress={loadMoreMovies} color={COLORS.PURPLE} />
                </View>
            );
        } else {
            return <View style={{marginBottom: SIZES.ScreenHeight * 0.58}} />;
        }
    };

    const loadMoreMovies = () => {
        const nextSetStartIndex = displayMovies.length;
        const nextSetEndIndex = nextSetStartIndex + pageSize;

        console.log(`Loading more from ${nextSetStartIndex} to ${nextSetEndIndex}`);

        const nextSet = filteredMovies.slice(nextSetStartIndex, nextSetEndIndex);

        console.log(`Found ${nextSet.length} items to load`);

        if (nextSet.length > 0) {
            setDisplayMovies([...displayMovies, ...nextSet]);
            setPageIndex(prevPageIndex => prevPageIndex + 1);
        } else {
            console.log('No more movies to load');
        }
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
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => item.id}
                                    renderItem={renderItem}
                                    ItemSeparatorComponent={() => <Text style={{color: COLORS.DARKGREY}}> | </Text>}
                                />
                            </View>
                        </View>
                    </View>

                    <View>
                        <View style={{alignItems: 'center'}}>
                            <FlatList
                                data={displayMovies}
                                horizontal={false}
                                numColumns={3}
                                initialNumToRender={filteredMovies.length}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({item}: {item: IMovie}) => (
                                    <View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                //console.log('id:', item.id);
                                                //console.log('movie:', item.title);
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
                            />
                        </View>
                    </View>
                </View>
            </View>
        </TabContainer>
    );
};

export default SearchMovieResultScreen;
