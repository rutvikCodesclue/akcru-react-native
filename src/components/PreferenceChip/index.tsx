import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../../../assets/constants';
import styles from './styles';

const CHIP_SELECTED_GRADIENT = ['#7DD3FC', COLORS.AKCRUBLUE, COLORS.PINK, '#C026D3'] as const;

export type PreferenceChipProps = {
    selected: boolean;
    onPress: () => void;
    label: string;
};

const PreferenceChip = ({selected, onPress, label}: PreferenceChipProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={[styles.chipShell, !selected && styles.chipShellUnselected]}>
            {selected ? (
                <>
                    <LinearGradient
                        pointerEvents="none"
                        colors={[...CHIP_SELECTED_GRADIENT]}
                        locations={[0, 0.32, 0.68, 1]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.chipGradientBg}
                    />
                    <View style={styles.chipSelectedFace}>
                        <Text style={styles.chipTextSelected}>{label}</Text>
                    </View>
                </>
            ) : (
                <Text style={styles.chipText}>{label}</Text>
            )}
        </TouchableOpacity>
    );
};

export default PreferenceChip;
