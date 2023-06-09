import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { COLORS } from '../../constants';

interface Props {
  image: string;
  onPress: () => void;
}

const LargeMovieCard: React.FC<Props> = ({image, onPress}) => {
  return (
    <View>
      <TouchableOpacity onPress ={onPress}>
        <View>
          <Image
            source={{
              uri: image
            }}
            style={{ width: 270, height: 170, borderRadius: 5, marginHorizontal: 4 }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LargeMovieCard