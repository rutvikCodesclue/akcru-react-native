import React from 'react';
import {View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle} from 'react-native';

/** Header / compact chip (matches PurchaseAD `adCoinSmall`). */
const GOLD_SMALL_BG = '#FFD700';
/** Balance row / inline with amounts (matches PurchaseAD `adCoin`). */
const GOLD_MEDIUM_BG = '#fbbf24';

export type AdCoinIconProps = {
    /**
     * `medium` — 26×26, 11px label (balance rows, Send MIT cost).
     * `small` — 24×24, 10px label (e.g. Purchase AD header).
     */
    size?: 'medium' | 'small';
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
};

/**
 * Gold circular “AD” badge used for Akcru Dollar balance and costs across the app.
 */
export default function AdCoinIcon({size = 'medium', style, textStyle}: AdCoinIconProps) {
    const small = size === 'small';
    return (
        <View
            style={[
                styles.base,
                small ? styles.wrapSmall : styles.wrapMedium,
                {backgroundColor: small ? GOLD_SMALL_BG : GOLD_MEDIUM_BG},
                style,
            ]}
            accessibilityRole="image"
            accessibilityLabel="AD"
            accessibilityHint="Akcru Dollars">
            <Text style={[small ? styles.labelSmall : styles.labelMedium, textStyle]}>AD</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrapSmall: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    wrapMedium: {
        width: 26,
        height: 26,
        borderRadius: 13,
    },
    labelSmall: {
        fontSize: 10,
        fontWeight: '900',
        color: '#1a1a2e',
    },
    labelMedium: {
        fontSize: 11,
        fontWeight: '900',
        color: '#1a1a2e',
    },
});
