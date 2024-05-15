import {View, Text, Image, FlatList, Pressable} from 'react-native';
import styles from './styles';
import {FONTS} from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import React from 'react';
import {IMovie} from '../../../types';

interface ViewUserWatchListCategoryProps {
    Akcru_Content: {
        id: string;
        title: string;
        movies: IMovie[];
    };
    updateWatchlist: (updatedWatchlist: IMovie[]) => void;
}

const ViewUserWatchListCategory = ({Akcru_Content}: ViewUserWatchListCategoryProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    return (
        <>
            <Text style={{...FONTS.Title2, marginTop: 10}}>{Akcru_Content.title}</Text>
            <FlatList
                data={Akcru_Content.movies}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => (
                    <View>
                        <Pressable
                            onPress={() => {
                                console.log('id:', item.id);
                                console.log('movie:', item.title);
                                navigation.navigate('ContentDetailScreen', {
                                    id: item.id,
                                    movie: item.title,
                                });
                            }}>
                            <Image source={{uri: item.portraitURL}} style={styles.poster} />
                        </Pressable>
                    </View>
                )}
            />
        </>
    );
};

export default ViewUserWatchListCategory;
