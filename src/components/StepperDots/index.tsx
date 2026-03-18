import React from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {COLORS} from '../../../assets/constants';

interface StepperDotsProps {
    currentStep: number;
    totalSteps: number;
    style?: any;
}

const StepperDots: React.FC<StepperDotsProps> = ({currentStep, totalSteps, style}) => {
    return (
        <View style={[styles.container, style]}>
            {Array.from({length: totalSteps}, (_, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber <= currentStep;

                return (
                    <View
                        key={stepNumber}
                        style={[
                            styles.dot,
                            isActive ? styles.dotActive : styles.dotInactive,
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        backgroundColor: COLORS.PINK,
    },
    dotInactive: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
});

export default StepperDots;
