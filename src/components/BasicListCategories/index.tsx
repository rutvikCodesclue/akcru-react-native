import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import styles from './styles';
import { FONTS } from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import React from 'react';

interface BasicListCategoriesProps {
  Akcru_Content: {
    id: string;
    title: string;
    movies: {
      name: string;
      desc: string;
      actors: string[];
      directors: string[];
      genre: string[];
      portrait_poster: string;
      landscape_poster: string;
      rating: number;
      year: number;
      rated: string;
      length: string;
      id: string;
      movie_url: string;
      youtubetrailer: string;
    }[];
  };
}

const BasicListCategories = (props: BasicListCategoriesProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();
  const {Akcru_Content} = props;

  return (
    <>
      <Text style={{...FONTS.Title2}}>{Akcru_Content.title}</Text>
      <FlatList
        data={Akcru_Content.movies}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({item, index}) => (
          <View>
            <TouchableOpacity
              onPress={() => {
                console.log('id:', item.id);
                console.log('movie:', item.name);
                navigation.navigate('ContentDetailScreen', {
                  id: item.id,
                  movie: item.name,
                });
              }}>
              <Image
                source={{uri: item.portrait_poster}}
                style={styles.poster}
              />
            </TouchableOpacity>
          </View>
        )}
      />
    </>
  );
};

export default BasicListCategories;
