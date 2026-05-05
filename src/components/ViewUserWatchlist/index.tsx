import {View, Image, FlatList, Pressable} from 'react-native';
import ArchetypeHorizontalDivider from '../ArchetypeHorizontalDivider';
import styles from './styles';
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
            <ArchetypeHorizontalDivider title={Akcru_Content.title} containerStyle={{marginTop: 10}} />
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
