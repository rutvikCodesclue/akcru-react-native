import { View, Text, TextInput } from 'react-native'
import React from 'react'
import styles from './Styles/styles';
import { COLORS } from '../../constants';
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  placeholdername: string;
  iconname: string;
  iconcolor: string;
}

const Inputs: React.FC<Props> = ({ placeholdername, iconname, iconcolor }) => {
  return (
    <View style={styles.input}>
      <MaterialIcons name={iconname} size={20} color={iconcolor} style={{marginRight: 5}}/>
      <TextInput
        placeholder={placeholdername}
        placeholderTextColor={COLORS.DARKGREY}
        style={styles.textinput}
      />
    </View>
  );
};

export default Inputs;