import {View, Image, TouchableOpacity, StyleProp, ImageStyle} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../../../assets/constants';
import styles from './styles';

export type HighlightMediaCardProps = {
    active: boolean;
    onPress: () => void;
    uri: string;
    imageStyle: StyleProp<ImageStyle>;
};

const GRADIENT_ACTIVE = ['#B989FF', '#7D4BFF', '#C493FF'] as const;

const HighlightMediaCard = ({active, onPress, uri, imageStyle}: HighlightMediaCardProps) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.92}>
            {active ? (
                <LinearGradient
                    colors={[...GRADIENT_ACTIVE]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[styles.activeFrame, styles.activeScale]}>
                    <View style={styles.activeInner}>
                        <Image source={{uri}} style={imageStyle} />
                    </View>
                </LinearGradient>
            ) : (
                <View style={[styles.inactiveWrap, styles.inactiveScale]}>
                    <Image source={{uri}} style={imageStyle} />
                    <LinearGradient
                        colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                        start={{x: 0, y: 1}}
                        end={{x: 1, y: 0}}
                        style={styles.inactiveOverlay}
                    />
                </View>
            )}
        </TouchableOpacity>
    );
};

export default HighlightMediaCard;
