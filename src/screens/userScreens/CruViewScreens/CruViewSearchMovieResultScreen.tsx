import {View, Text, FlatList, TouchableOpacity, Image, SafeAreaView} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import CruViewSearchInput from '../../../components/CruViewSearchInput/CruViewSearchInput';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import {Icon} from '@rneui/base';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {findMovies} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import styles from '../../contentScreens/PlayContentScreen/styles';
import BackButton from '../../../components/General/backbutton';
type CruViewSearchMovieResultScreenNavigationProp = StackNavigationProp<
    UserProfileStackParams,
    'CruViewSearchMovieResultScreen'
>;

type CruViewSearchMovieResultScreenRouteProp = RouteProp<UserProfileStackParams, 'CruViewSearchMovieResultScreen'>;

type Props = {
    navigation: CruViewSearchMovieResultScreenNavigationProp;
    route: CruViewSearchMovieResultScreenRouteProp;
};

const CruViewSearchMovieResultScreen = ({navigation, route}: Props) => {
    const [selectedGenre, setSelectedGenre] = useState('');
    const [filteredMovies, setFilteredMovies] = useState<IMovie[]>([]);

    useEffect(() => {
        if (route.params && route.params.genre) {
            handleGenrePress(route.params.genre);
        }
    }, [route.params]);

    const handleGenrePress = async (genre: string) => {
        setSelectedGenre(genre);

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

        setFilteredMovies(movies);
        return;
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
                <SafeAreaView>
                    <BackButton navigation={navigation} />
                    <View style={styles.backbutton}>
                        <CruViewSearchInput />
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
                                    keyExtractor={item => item.genre}
                                    renderItem={renderItem}
                                    ItemSeparatorComponent={() => <Text style={{color: COLORS.DARKGREY}}> | </Text>}
                                />
                            </View>
                        </View>
                    </View>

                    <View>
                        <View style={{alignItems: 'center'}}>
                            <FlatList
                                data={filteredMovies}
                                horizontal={false}
                                numColumns={3}
                                showsHorizontalScrollIndicator={false}
                                ListFooterComponent={<View style={{marginBottom: 500}} />}
                                renderItem={({item}: {item: IMovie}) => (
                                    <View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                navigation.navigate('CruViewMovieDetailScreen', {
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
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </TabContainer>
    );
};

export default CruViewSearchMovieResultScreen;
