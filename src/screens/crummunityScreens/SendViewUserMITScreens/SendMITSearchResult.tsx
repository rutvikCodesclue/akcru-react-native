import {View, Text, ScrollView, FlatList, TouchableOpacity, SafeAreaView} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import BasicMovieCard from '../../../components/BasicMovieCard';
import SendMITSearchInput from './SendMITSearchInput';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import {Icon} from '@rneui/base';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {IMovie, IUserProfile} from '../../../../types';
import {findMovies} from '../../../lib/api/movies.lib';
import {findAUser} from '../../../lib/api/user.lib';
import TabContainer from '../../../components/TabContainer/TabContainer';
import styles from '../../contentScreens/PlayContentScreen/styles';

type SendMITSearchResultNavigationProp = StackNavigationProp<CrummunityStackParams, 'SendMITSearchResult'>;

type SendMITSearchResultRouteProp = RouteProp<CrummunityStackParams, 'SendMITSearchResult'>;

type Props = {
    navigation: SendMITSearchResultNavigationProp;
    route: SendMITSearchResultRouteProp;
};

const SendMITSearchResult = ({navigation, route}: Props) => {
    const userID: string | undefined = route.params?.userID ?? null;

    const [selectedGenre, setSelectedGenre] = useState('');

    const [filteredMovies, setFilteredMovies] = useState<IMovie[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            findAUser({id: userID}).then(user => {
                setUser(user);
            });

            return () => {};
        }, []),
    );

    const [user, setUser] = useState<IUserProfile | undefined>(undefined);

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
            //console.log('No movies found...');

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
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]}>
                    {/* <View>
          <Header />
        </View> */}
                    <View style={styles.backbutton}>
                        <TouchableOpacity
                            onPress={() => navigation.pop()}
                            style={{
                                paddingHorizontal: 15,
                                paddingVertical: 10,
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        <SendMITSearchInput userid={userID} />
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

                    <View style={{marginBottom: 75}}>
                        <View
                            style={{
                                alignItems: 'center',
                                width: SIZES.ScreenWidth,
                                alignSelf: 'center',
                            }}>
                            <FlatList
                                data={filteredMovies}
                                horizontal={false}
                                showsHorizontalScrollIndicator={false}
                                numColumns={3}
                                scrollEnabled={false}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({item}) => (
                                    <View style={{marginVertical: 4}}>
                                        <BasicMovieCard
                                            image={item.portraitURL}
                                            onPress={() => {
                                                navigation.navigate('SendMITSchedule', {
                                                    id: item.id,
                                                    movie: item.title,
                                                    userID: user?.id,
                                                    userName: user?.username,
                                                });
                                            }}
                                        />
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                    <View />
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};

export default SendMITSearchResult;
