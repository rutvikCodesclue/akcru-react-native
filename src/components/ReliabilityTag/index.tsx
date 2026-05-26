import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {FONTS} from '../../../assets/constants';
import {UserProfilePersona} from '../../types/UserProfilePersona';

type ReliabilityPercentInput = number | string | null | undefined;

type ReliabilityTagModel = {
    persona: UserProfilePersona;
    label: string;
};

type ReliabilityTagProps = {
    reliabilityPercent: ReliabilityPercentInput;
};

const OFF_GRID_TAG: ReliabilityTagModel = {
    persona: UserProfilePersona.OFF_GRID,
    label: '🌙 Off Grid',
};

export const getReliabilityTagModel = (reliabilityPercent: ReliabilityPercentInput): ReliabilityTagModel => {
    const score =
        typeof reliabilityPercent === 'number'
            ? reliabilityPercent
            : typeof reliabilityPercent === 'string'
              ? Number(reliabilityPercent)
              : NaN;

    if (!Number.isFinite(score)) return OFF_GRID_TAG;
    if (score >= 80) return {persona: UserProfilePersona.MAIN_CHARACTER, label: '🔥 Main Character'};
    if (score >= 50) return {persona: UserProfilePersona.SHOW_STOPPER, label: '✨ Show Stopper'};
    return OFF_GRID_TAG;
};

const ReliabilityTag = ({reliabilityPercent}: ReliabilityTagProps) => {
    const tag = getReliabilityTagModel(reliabilityPercent);
    return (
        <View style={styles.tagWrap}>
            <Text style={styles.tagText}>{tag.label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    tagWrap: {
        alignSelf: 'center',
        marginTop: 6,
        marginBottom: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(203,141,255,0.85)',
        backgroundColor: 'rgba(58, 20, 93, 0.65)',
    },
    tagText: {
        ...FONTS.Title3,
        color: '#F5DCFF',
    },
});

export default ReliabilityTag;
