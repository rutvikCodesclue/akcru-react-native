import {View, TextInput, ViewStyle} from 'react-native';
import React from 'react';
import styles from './styles';
import {COLORS} from '../../../assets/constants';

import {Icon} from '@rneui/themed';
import {isTablet} from '../../../assets/constants/theme';

const iconSize = isTablet() ? 28 : 20;

interface Props {
    placeholdername: string;
    iconname: string;
    iconcolor: string;
    secureTextEntry: boolean;
    onChangeText: any;
    value: any;
    editable: boolean;
    containerStyle?: ViewStyle;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad';
}

const Inputs: React.FC<Props> = ({
    placeholdername,
    iconname,
    iconcolor,
    secureTextEntry,
    onChangeText,
    value,
    editable,
    containerStyle,
    keyboardType = 'default',
}) => {
    return (
        <View style={[styles.input, containerStyle]}>
            <Icon name={iconname} type="ionicon" size={iconSize} color={iconcolor} style={{marginRight: 5}} />
            <TextInput
                autoCapitalize="none"
                placeholder={placeholdername}
                placeholderTextColor={COLORS.DARKGREY}
                keyboardType={keyboardType}
                style={[
                    styles.textinput,
                    {
                        fontSize: isTablet() ? 18 : 14, // Or use MULTISIZES
                    },
                ]}
                secureTextEntry={secureTextEntry}
                onChangeText={onChangeText}
                value={value}
                editable={editable}
            />
        </View>
    );
};

export default Inputs;
