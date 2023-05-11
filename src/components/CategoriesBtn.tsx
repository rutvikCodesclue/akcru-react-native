import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { COLORS, FONTS } from '../../constants';

interface Props {
  category: string;
  color: string;
  onPress: () => void;
}

const CategoriesBtn: React.FC<Props> = ({ category, color, onPress }) => {
  return (
    <View>
      <TouchableOpacity onPress = {onPress}>
        <View
          style={{
            width: 80,
            height: 50,
            borderRadius: 5,
            justifyContent: "center",
            backgroundColor: color,
            marginHorizontal: 4
          }}
        >
          <Text style={{...FONTS.Title2White, textAlign: 'center' }}>
            {category}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CategoriesBtn
