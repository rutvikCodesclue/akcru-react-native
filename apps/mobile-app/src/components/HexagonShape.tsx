import React from "react";
import { View, Text, Image } from "react-native";
import Svg, { Path } from "react-native-svg";
import { COLORS } from "../../constants";
import imageindex from "../../assets/images/imageindex";
import MaskedView from "@react-native-masked-view/masked-view";

const Hexagon = () => {
  return (
    <View>

      <Svg width={100} height={75} viewBox="0 0 145 126">
        <Path
          d="M108.75,0,145,63l-36.25,63H36.25L0,63,36.25,0Z"
          fill={COLORS.AKCRUBLUE}
        />
      </Svg>
    </View>
  );
};

export default Hexagon;
