import { View, FlatList } from 'react-native';
import React from 'react';
import { CATEGORIES } from '../../constants/Data';
import CategoriesBtn from './CategoriesBtn';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClientStackParams } from '../navigation/ClientStack';


const CategoriesList = () => {

const navigation=
useNavigation<NativeStackNavigationProp<ClientStackParams>>();

  return (
    <View>
      <FlatList
        data={CATEGORIES}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CategoriesBtn
            category={item.category}
            color={item.color}
            onPress={() => navigation.navigate("SearchMovieResultScreen", {item: item.category})}
          />
        )}
      />
    </View>
  );
};

export default CategoriesList

