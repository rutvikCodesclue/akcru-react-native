import {View, Text, ScrollView, TouchableOpacity, FlatList} from 'react-native';
import React, {useEffect} from 'react';
import SearchInput from '../../../components/searchInput';
import GenreCard from '../../../components/GenreCard';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {ClientStackParams} from '../../../navigation/ClientStack';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import {getMovieGenres} from '../../../lib/api/movies.lib';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {IGenreItem} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import styles from '../PlayContentScreen/styles';
import BackButton from '../../../components/General/backbutton';
const SearchMovieScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    const [genres, setGenres] = React.useState<IGenreItem[]>([]);
    const [loading, setIsLoading] = React.useState(true);

    const fetchGenres = async () => {
        const genres = await getMovieGenres();
        setGenres(genres);
        setIsLoading(false);
    };

    const handleGenrePress = (genre: IGenreItem) => {
        navigation.navigate('SearchMovieResultScreen', {
            genre: capitalizeFirstLetterOfString(genre.genre),
        });
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    return (
        <TabContainer>
            <View style={{flex: 1}}>
                <View style={{marginHorizontal: 15}}>
                    <BackButton navigation={navigation} />
                </View>
                <View>
                    <Text
                        style={{
                            ...FONTS.Title2,
                            marginHorizontal: SIZES.marginhorizontal,
                            marginVertical: SIZES.marginvertical,
                        }}>
                        Choose Genre
                    </Text>
                </View>
                <ScrollView>
                    <View style={{marginBottom: 75}}>
                        <View
                            style={{
                                alignItems: 'center',
                                width: SIZES.ScreenWidth,
                                alignSelf: 'center',
                            }}>
                            <FlatList
                                data={loading ? undefined : genres}
                                horizontal={false}
                                numColumns={2}
                                scrollEnabled={false}
                                keyExtractor={item => item.id}
                                renderItem={({item, index}) => (
                                    <View>
                                        <GenreCard
                                            photo={item.image}
                                            genre={capitalizeFirstLetterOfString(item.genre)}
                                            onPress={() => handleGenrePress(item)}
                                        />
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </TabContainer>
    );
};

export default SearchMovieScreen;
