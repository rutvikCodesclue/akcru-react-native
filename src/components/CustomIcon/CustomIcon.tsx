
import React from 'react';
import { Icon } from '@rneui/themed';
import { UseTabMenu } from '../../context/TabContext';// Ensure the path is correct
import { StyleProp, ViewStyle } from 'react-native';

interface CustomIconProps {
    name: string;
    type: string;
    baseSize: number; // Add a baseSize prop
    color?: string; // Optional color prop
    style?: StyleProp<ViewStyle>; // Optional style prop
}

const CustomIcon: React.FC<CustomIconProps> = ({name, type, baseSize, color, style}) => {
    const {getAdjustedIconSize} = UseTabMenu(); // Use the context hook to access getAdjustedIconSize
    const iconSize = getAdjustedIconSize(baseSize); // Calculate the dynamic size based on baseSize

    return (
        <Icon
            name={name}
            type={type}
            size={iconSize} // Use the dynamically calculated size
            color={color || '#000'} // Default color is black if not specified
            containerStyle={style} // Apply the optional style prop
        />
    );
};

export default CustomIcon;
