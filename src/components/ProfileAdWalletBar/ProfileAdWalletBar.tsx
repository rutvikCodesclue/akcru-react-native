import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {GoldenCoinCoins} from '../../../assets/svg';
import {FONTS, COLORS} from '../../../assets/constants';
import AdCoinIcon from '../AdCoinIcon/AdCoinIcon';

export type ProfileAdWalletBarProps = {
    adAmount?: number;
    onPressPurchase: () => void;
};

function formatAdBalanceDisplay(value: number | undefined): string {
    const n = Number.isFinite(value) && value !== undefined ? Math.max(0, Math.floor(value)) : 0;
    return n.toLocaleString(undefined, {maximumFractionDigits: 0});
}

const BAR_RADIUS = 14;
const BORDER_WIDTH = 1;

/** Gradient stroke (purple → pink → warm gold) around a dark pill, with balance + split purchase control. */
export default function ProfileAdWalletBar({adAmount, onPressPurchase}: ProfileAdWalletBarProps) {
    return (
        <LinearGradient
            colors={['#8B5CF6', '#D946EF', '#F97316', '#FBBF24']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradientBorder}>
            <View style={styles.inner}>
                <Text style={styles.label}>Wallet Balance</Text>
                <AdCoinIcon size="small" style={styles.adCoin} />
                <Text style={styles.balanceText}>{formatAdBalanceDisplay(adAmount)} AD</Text>
                <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={onPressPurchase}
                    accessibilityRole="button"
                    accessibilityLabel="Purchase AD tokens"
                    style={styles.purchaseOuter}>
                    <View style={styles.plusBlock}>
                        <Icon name="add" type="ionicon" color={COLORS.WHITE} size={18} />
                    </View>
                    <View style={styles.coinsBlock}>
                        <GoldenCoinCoins width={32} height={40} />
                    </View>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientBorder: {
        borderRadius: BAR_RADIUS,
        padding: BORDER_WIDTH,
        ...Platform.select({
            ios: {
                shadowColor: '#D946EF',
                shadowOffset: {width: 0, height: 0},
                shadowOpacity: 0.45,
                shadowRadius: 6,
            },
            android: {elevation: 5},
        }),
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        borderRadius: BAR_RADIUS - BORDER_WIDTH,
        paddingVertical: 7,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(14, 10, 24, 0.92)',
    },
    label: {
        ...FONTS.paragraph1,
        fontSize: 13,
        lineHeight: 17,
        color: COLORS.WHITE,
        marginRight: 6,
    },
    adCoin: {
        marginRight: 5,
        transform: [{scale: 0.95}],
    },
    balanceText: {
        ...FONTS.Title2,
        fontSize: 16,
        lineHeight: 20,
        color: COLORS.WHITE,
        marginRight: 16,
    },
    purchaseOuter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#120818',
        marginLeft: 6,
    },
    plusBlock: {
        backgroundColor: 'transparent',
        paddingHorizontal: 6,
        paddingVertical: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coinsBlock: {
        backgroundColor: '#261742',
        paddingLeft: 3,
        paddingRight: 6,
        paddingVertical: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
