import {View, ActivityIndicator} from 'react-native';
import React from 'react';
import {COLORS, SIZES} from '../../../assets/constants/theme';

const LoadingComponent = () => {
    return (
        <View
            style={{
                height: SIZES.ScreenHeight,
                width: SIZES.ScreenWidth,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
            <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
        </View>
    );
};

export default LoadingComponent;
