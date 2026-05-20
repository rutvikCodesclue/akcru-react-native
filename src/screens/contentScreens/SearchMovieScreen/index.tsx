import {View, Text, ScrollView, FlatList} from 'react-native';
import React, {useEffect} from 'react';
import SearchInput from '../../../components/searchInput';
import GenreCard from '../../../components/GenreCard';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {ClientStackParams} from '../../../navigation/ClientStack';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {getMovieGenres} from '../../../lib/api/movies.lib';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {IGenreItem} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import BackButton from '../../../components/General/backbutton';
import { isTablet } from '../../../../assets/constants/theme';
import { DEFAULT_GENRE_IMAGE } from '../../../../assets/constants/Data';
const SearchMovieScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    const [genres, setGenres] = React.useState<IGenreItem[]>([]);
    const [loading, setIsLoading] = React.useState(true);

    const fetchGenres = async () => {
        const serverGenres = await getMovieGenres(); // [{ id, genre, image }]
        const normalized = (serverGenres ?? []).map(g => ({
            ...g,
            image: g.image && g.image.trim() ? g.image : DEFAULT_GENRE_IMAGE,
        }));
        setGenres(normalized);
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
            <View style={{flex: 1, backgroundColor: COLORS.BLACK}}>
                <View style={{marginHorizontal: isTablet() ? 30 : 15, marginTop: isTablet() ? 10 : 0}}>
                    <BackButton navigation={navigation} />
                </View>
                <SearchInput />
                <View>
                    <Text
                        style={{
                            ...FONTS.Title2,
                            marginHorizontal: isTablet() ? 30 : 15,
                            marginVertical: SIZES.marginvertical,
                        }}>
                        Choose Genre
                    </Text>
                </View>
                <ScrollView style={{backgroundColor: COLORS.BLACK}} contentContainerStyle={{backgroundColor: COLORS.BLACK}}>
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
                                keyExtractor={(item, index) => String(item.genre ?? index)}
                                renderItem={({item}) => (
                                    <View>
                                        <GenreCard
                                            image={item.image ?? ''} // guard if image can be null
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
