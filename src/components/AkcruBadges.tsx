import { View, Text } from 'react-native'
import React from 'react'
import { COLORS, FONTS, SIZES, AKCRUBADGES } from '../../constants'

interface Props {
  color: string;
  background: string;
  label: string;

}


const AkcruBadge: React.FC<Props> = ({color, background, label}) => {
  return (
    <View>
      <View
        style={{
          backgroundColor: AKCRUBADGES.SuperHero.background,
          width: 95,
          height: 18,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
          marginBottom: 10,
          marginTop: 5
        }}
      >
        <Text
          style={{
            ...FONTS.Title1,
            fontSize: 12,
            color: AKCRUBADGES.SuperHero.color,
          }}
        >
          {AKCRUBADGES.SuperHero.label}
        </Text>
      </View>
    </View>
  );
};

export default AkcruBadge