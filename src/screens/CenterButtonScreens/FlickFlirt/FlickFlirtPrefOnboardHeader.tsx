import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import onboardStyles from '../../loginScreens/Onboard/styles';
import StepperDots from '../../../components/StepperDots';

const TOTAL_STEPS = 4;

type Props = {
    currentStep: number;
};

/**
 * Step row below Header + BackButton: n/4 (left), dots (center), spacer (right).
 */
const FlickFlirtPrefNavRow: React.FC<Props> = ({currentStep}) => {
    return (
        <View style={styles.wrap}>
            <View style={styles.row}>
                <View style={styles.left}>
                    <Text style={onboardStyles.stepIndicator}>
                        {currentStep}/{TOTAL_STEPS}
                    </Text>
                </View>
                <View style={styles.center}>
                    <StepperDots currentStep={currentStep} totalSteps={TOTAL_STEPS} style={styles.dots} />
                </View>
                <View style={styles.right} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        paddingTop: 4,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    left: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: 8,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    right: {
        flex: 1,
    },
    dots: {
        marginBottom: 0,
    },
});

export default FlickFlirtPrefNavRow;
