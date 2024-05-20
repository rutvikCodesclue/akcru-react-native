import {View, Text, ScrollView, TouchableOpacity, FlatList} from 'react-native';
import React, {useEffect} from 'react';
import CruViewSearchInput from '../../../components/CruViewSearchInput/CruViewSearchInput';
import GenreCard from '../../../components/GenreCard';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {getMovieGenres} from '../../../lib/api/movies.lib';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {IGenreItem} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import styles from './styles';
import BackButton from '../../../components/General/backbutton';
const CruViewSearchMovieScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const [genres, setGenres] = React.useState<IGenreItem[]>([]);
    const [loading, setIsLoading] = React.useState(true);
    const fetchGenres = async () => {
        const genres = await getMovieGenres();
        setGenres(genres);
        setIsLoading(false);
    };

    const handleGenrePress = (genre: IGenreItem) => {
        navigation.navigate('CruViewSearchMovieResultScreen', {
            genre: capitalizeFirstLetterOfString(genre.genre),
        });
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    return (
        <TabContainer>
            <View style={{flex: 1, ...styles.backbutton}}>
                <View>
                    <View style={{backgroundColor: COLORS.AKCRUBACKGROUND}}>
                        <BackButton navigation={navigation} />
                    </View>

                    <CruViewSearchInput />
                </View>
                <ScrollView stickyHeaderIndices={[0]}>
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

export default CruViewSearchMovieScreen;
