import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';

type ProfileMetricChipProps = {
    iconName: string;
    iconType: string;
    iconColor: string;
    emojiIcon?: string;
    label: string;
    value: string;
    gradientColors?: string[];
    onPress?: () => void;
    style?: {
        chip?: object;
        column?: object;
        label?: object;
        count?: object;
    };
};

export default function ProfileMetricChip({
    iconName,
    iconType,
    iconColor,
    emojiIcon,
    label,
    value,
    gradientColors,
    onPress,
    style,
}: ProfileMetricChipProps) {
    return (
        <TouchableOpacity activeOpacity={onPress ? 0.8 : 1} onPress={onPress} disabled={!onPress}>
            <LinearGradient
                colors={gradientColors && gradientColors.length > 1 ? gradientColors : ['#7F4DAA', '#A15FDA']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={[
                    {
                        borderRadius: 999,
                        padding: 1,
                    },
                ]}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: 999,
                        backgroundColor: COLORS.BLACK,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                    }}>
                    {emojiIcon ? (
                        <Text
                            style={{
                                fontSize: 18,
                                textShadowColor: COLORS.OVERLAY_WHITE_75,
                                textShadowOffset: {width: 0, height: 0},
                                textShadowRadius: 6,
                            }}>
                            {emojiIcon}
                        </Text>
                    ) : (
                        <Icon name={iconName} type={iconType as any} color={iconColor} size={12} />
                    )}
                    <View style={[{marginLeft: 6, alignItems: 'center'}, style?.column]}>
                        <Text
                            style={[
                                {
                                    ...FONTS.chart,
                                    color: COLORS.WHITE,
                                    fontSize: 12,
                                    lineHeight: 14,
                                    textAlign: 'center',
                                },
                                style?.count,
                            ]}>
                            {value}
                        </Text>
                        {!!label && (
                            <Text
                                style={[
                                    {
                                        ...FONTS.chart,
                                        color: COLORS.LIGHTGREY,
                                        fontSize: 10,
                                        lineHeight: 12,
                                        textAlign: 'center',
                                    },
                                    style?.label,
                                ]}>
                                {label}
                            </Text>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}
