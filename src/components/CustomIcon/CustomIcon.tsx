import React from 'react';
import {Icon} from '@rneui/themed';
import {UseTabMenu} from '../../context/TabContext';
import {StyleProp, ViewStyle} from 'react-native';

interface CustomIconProps {
    name: string;
    type: string;
    baseSize: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

const CustomIcon: React.FC<CustomIconProps> = ({name, type, baseSize, color, style}) => {
    const {getAdjustedIconSize} = UseTabMenu();
    const iconSize = getAdjustedIconSize(baseSize);

    return <Icon name={name} type={type} size={iconSize} color={color || '#000'} containerStyle={style} />;
};

export default CustomIcon;
