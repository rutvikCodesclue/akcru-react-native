import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import styles from './styles';
import {FONTS} from '../../../assets/constants/index';
import {Akcru_Content} from '../../../assets/constants/ListData';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import React from 'react';
import { IMovie } from '../../../types';

interface LargeListCategoriesProps {
  Akcru_Content: {
        id: string;
        title: string;
        movies: IMovie[]; // Update this to match the IMovie structure
    };
}

const LargeListCategories = (props: LargeListCategoriesProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();
  const {Akcru_Content} = props;
  return (
      <>
          <Text style={{...FONTS.Title2, marginTop: 10, marginLeft: '2%'}}>{Akcru_Content.title}</Text>
          <FlatList
              data={Akcru_Content.movies}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={({item}) => (
                  <View>
                      <TouchableOpacity
                          onPress={() => {
                              console.log('id:', item.id);
                              console.log('movie:', item.title);
                              navigation.navigate('ContentDetailScreen', {
                                  id: item.id,
                                  movie: item.id,
                              });
                          }}>
                          <Image source={{uri: item.landscapeURL}} style={styles.poster} />
                      </TouchableOpacity>
                  </View>
              )}
          />
      </>
  );
};

export default LargeListCategories;
