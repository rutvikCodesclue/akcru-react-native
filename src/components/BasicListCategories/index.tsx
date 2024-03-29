import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import styles from './styles';
import { FONTS } from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import React from 'react';
import { IMovie } from '../../../types';
import { NoBottomTabStackParams } from '../../navigation/NoBottomTabStack';

interface BasicListCategoriesProps {
    Akcru_Content: {
        id: string;
        title: string;
        movies: IMovie[]; // Update this to match the IMovie structure
    };
}

const BasicListCategories = (props: BasicListCategoriesProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
  const {Akcru_Content} = props;

  return (
      <>
          <Text style={{...FONTS.Title2, marginTop: 10, marginLeft: '2%'}}>{Akcru_Content.title}</Text>
          <FlatList
              data={Akcru_Content.movies}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={({item, index}) => (
                  <View>
                      <TouchableOpacity
                          onPress={() => {
                              console.log('id:', item.id);
                              console.log('movie:', item.title);
                              navigation.navigate('ContentDetailScreen', {
                                  id: item.id,
                                  movie: item.title,
                              });
                          }}>
                          <Image source={{uri: item.portraitURL}} style={styles.poster} />
                      </TouchableOpacity>
                  </View>
              )}
          />
      </>
  );
};

export default BasicListCategories;
