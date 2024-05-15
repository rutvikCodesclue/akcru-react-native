import {View, TextInput} from 'react-native';
import React from 'react';
import styles from './styles';
import {COLORS} from '../../../assets/constants';

import {Icon} from '@rneui/themed';

interface Props {
    placeholdername: string;
    iconname: string;
    iconcolor: string;
    secureTextEntry: boolean;
    onChangeText: any;
    value: any;
    editable: boolean;
}

const Inputs: React.FC<Props> = ({
    placeholdername,
    iconname,
    iconcolor,
    secureTextEntry,
    onChangeText,
    value,
    editable,
}) => {
    return (
        <View style={styles.input}>
            <Icon name={iconname} type="ionicon" size={20} color={iconcolor} style={{marginRight: 5}} />
            <TextInput
                autoCapitalize="none"
                placeholder={placeholdername}
                placeholderTextColor={COLORS.DARKGREY}
                style={styles.textinput}
                secureTextEntry={secureTextEntry}
                onChangeText={onChangeText}
                value={value}
                editable={editable}
            />
        </View>
    );
};

export default Inputs;
