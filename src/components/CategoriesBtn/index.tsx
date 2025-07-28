import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import { isTablet } from '../../../assets/constants/theme';
interface Props {
    category: string;
    color: string;
    onPress: () => void;
}

const CategoriesBtn = ({category, color, onPress}: Props) => {
    return (
        <View>
            <TouchableOpacity onPress={onPress}>
                <View
                    style={{
                        width: isTablet() ? SIZES.ScreenWidth * 0.18 : SIZES.ScreenWidth * 0.27,
                        height: isTablet() ? SIZES.ScreenWidth * 0.09 : SIZES.ScreenWidth * 0.13,
                        borderRadius: 5,
                        justifyContent: 'center',
                        backgroundColor: color,
                        marginHorizontal: 4,
                    }}>
                    <LinearGradient
                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: SIZES.ScreenWidth * 0.13,
                            borderRadius: 5,
                        }}
                    />
                    <Text style={{...FONTS.paragraph2, textAlign: 'center'}}>{category}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default CategoriesBtn;
