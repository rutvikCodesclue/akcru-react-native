import React from 'react';
import {Text, View, StyleSheet, TextStyle, ViewStyle, StyleProp} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {FONTS} from '../../../assets/constants';

type Props = {
    title?: string;
    containerStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    lineStyle?: StyleProp<ViewStyle>;
};

export default function ArchetypeHorizontalDivider({
    title = 'Archetype:',
    containerStyle,
    titleStyle,
    lineStyle,
}: Props) {
    return (
        <View style={[styles.wrap, containerStyle]}>
            <LinearGradient
                colors={['rgba(221, 94, 255, 0)', 'rgba(221, 94, 255, 0.95)']}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}
                style={[styles.line, lineStyle]}
            />
            <Text style={[styles.text, titleStyle]}>{title}</Text>
            <LinearGradient
                colors={['rgba(221, 94, 255, 0.95)', 'rgba(221, 94, 255, 0)']}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}
                style={[styles.line, lineStyle]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    line: {
        flex: 1,
        height: 1.2,
        borderRadius: 999,
    },
    text: {
        ...FONTS.Title3,
        color: '#B978DB',
        marginHorizontal: 10,
        textAlign: 'center',
    },
});
