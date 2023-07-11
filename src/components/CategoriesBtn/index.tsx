import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
interface Props {
  category: string;
  color: string;
  onPress: () => void;
}

const CategoriesBtn = ({category, color, onPress}: Props) => {
  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        <View
          style={{
            width: 80,
            height: 50,
            borderRadius: 5,
            justifyContent: 'center',
            backgroundColor: color,
            marginHorizontal: 4,
          }}>
          <LinearGradient
            // Background Linear Gradient
            colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 50,
              borderRadius: 5,
            }}
          />
          <Text style={{...FONTS.Title2, fontSize: 12, textAlign: 'center'}}>
            {category}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CategoriesBtn;
