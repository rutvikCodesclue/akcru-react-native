// src/components/ProgressBar.tsx

import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {COLORS} from '../../../assets/constants';

type ProgressBarProps = {
    /** Current step (1-based, e.g. 1, 2, 3…) */
    currentStep: number;
    /** Total number of steps in the flow */
    totalSteps: number;
    /** Height of the bar in pixels */
    height?: number;
    /** Color of the filled portion */
    fillColor?: string;
    /** Color of the empty track */
    trackColor?: string;
    /** Style overrides for the outer container */
    style?: ViewStyle;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
    currentStep,
    totalSteps,
    height = 6,
    fillColor = COLORS.PINK,
    trackColor = COLORS.OVERLAY_WHITE_20,
    style,
}) => {
    // Calculate progress (1-based step)
    const progress = totalSteps <= 1 ? 1 : Math.min(Math.max(currentStep / totalSteps, 0), 1);

    return (
        <View style={[styles.container, {backgroundColor: trackColor, height}, style]}>
            <View style={[styles.fill, {backgroundColor: fillColor, width: `${progress * 100}%`}]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 8,
    },
});

export default ProgressBar;
