import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import styles from "./Styles/styles";
import { COLORS, FONTS } from "../../constants";

interface Props {
  btnname: string;
  onPress: () => void;
  color: string;
}

const MedButton: React.FC<Props> = ({ btnname, onPress, color }) => {
  return (
    <TouchableOpacity style={styles.medbuttoncontainer} onPress={onPress}>
      <View
        style={{
          flex: 1,
          backgroundColor: color,
          justifyContent: "center",
          borderRadius: 5,
        }}
      >
        <Text style={{ ...FONTS.Title1, textAlign: "center" }}>{btnname}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MedButton;
