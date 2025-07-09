// src/components/ProgressBar.tsx

import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

type ProgressBarProps = {
    /** Zero-based index of the current step (e.g. 0, 1, 2…) */
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
    height = 4,
    fillColor = '#4F46E5', // Indigo-600
    trackColor = '#E5E7EB', // Gray-200
    style,
}) => {
    const progress = Math.min(Math.max(currentStep / (totalSteps - 1), 0), 1);

    return (
        <View style={[styles.container, {backgroundColor: trackColor, height}, style]}>
            <View style={[styles.fill, {backgroundColor: fillColor, width: `${progress * 100}%`}]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
    },
});

export default ProgressBar;
