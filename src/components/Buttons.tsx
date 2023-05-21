import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import styles from "./Styles/styles";
import { COLORS, FONTS, SIZES } from "../../constants";

interface Props {
  btnname: string;
  onPress: () => void;
  color: string;
}

const SmallButton: React.FC<Props> = ({ btnname, onPress, color }) => {
  return (
    <View>
      <TouchableOpacity
        style={{ width: SIZES.ScreenWidth / 3, height: 40 }}
        onPress={onPress}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: color,
            justifyContent: "center",
            borderRadius: 5,
          }}
        >
          <Text style={{ ...FONTS.Title1, textAlign: "center" }}>
            {btnname}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const MedButton: React.FC<Props> = ({ btnname, onPress, color }) => {
  return (
    <View>
      <TouchableOpacity
        style={{ width: SIZES.ScreenWidth / 2.2, height: 40 }}
        onPress={onPress}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: color,
            justifyContent: "center",
            borderRadius: 5,
          }}
        >
          <Text style={{ ...FONTS.Title1, textAlign: "center" }}>
            {btnname}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const LrgButton: React.FC<Props> = ({ btnname, onPress, color }) => {
  return (
    <View>
      <TouchableOpacity
        style={{ width: SIZES.ScreenWidth / 1.5, height: 40 }}
        onPress={onPress}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: color,
            justifyContent: "center",
            borderRadius: 5,
          }}
        >
          <Text style={{ ...FONTS.Title1, textAlign: "center" }}>
            {btnname}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};



const AkcruButtons = {
    SmallButton, MedButton, LrgButton
}

export default AkcruButtons;
