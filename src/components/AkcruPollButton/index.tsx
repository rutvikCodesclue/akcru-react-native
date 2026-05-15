import {StyleSheet, View} from 'react-native';
import React from 'react';
import {COLORS, isTablet} from '../../../assets/constants/theme';
import CustomIcon from '../CustomIcon/CustomIcon';
import SatelliteAuthHex from '../AkcruCenterButton/SatelliteAuthHex';

const PollButton = () => {
    const hexSize = isTablet() ? 60 : 48;

    return (
        <View style={styles.container}>
            <SatelliteAuthHex width={hexSize} height={hexSize} />
            <View style={styles.iconContainer}>
                <CustomIcon
                    name="stats-chart"
                    type="ionicon"
                    baseSize={isTablet() ? 26 : 16}
                    color={COLORS.LIGHTGREY}
                />
            </View>
        </View>
    );
};

export default PollButton;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
