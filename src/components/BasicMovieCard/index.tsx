import {View, Text, TouchableOpacity, Image} from 'react-native';
import React from 'react';

type BasicMovieCardProps = {
  image: string;
  onPress: () => void;
};

const BasicMovieCard = ({image, onPress}: BasicMovieCardProps) => {
  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        <View>
          <Image
            source={{
              uri: image,
            }}
            style={{
              width: 115,
              height: 170,
              borderRadius: 5,
              marginHorizontal: 4,
            }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default BasicMovieCard;
