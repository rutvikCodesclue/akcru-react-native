import React from 'react';
import {
    ImageBackground,
    ImageSourcePropType,
    Platform,
    SafeAreaView,
    StyleProp,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import imageindex from '../../../assets/images/imageindex';
import {SIZES} from '../../../assets/constants';

/** Default blur tuned for Flick Flirt screens (image → blur → content) */
export const FLICK_FLIRT_BLUR_DEFAULT = {
    blurType: 'dark' as const,
    blurAmountIos: 10,
    blurAmountAndroid: 5,
    reducedTransparencyFallbackColor: 'rgba(22, 14, 48, 0.72)',
    androidOverlayColor: 'rgba(45, 28, 72, 0.28)',
};

export type FlickFlirtBlurredBackgroundProps = {
    children: React.ReactNode;
    /** Defaults to `imageindex.FLickFlirt` */
    source?: ImageSourcePropType;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    /** Merged with default full-screen size */
    imageStyle?: StyleProp<ViewStyle>;
    /** When true (default), children are wrapped in `SafeAreaView` with `flex: 1` */
    wrapWithSafeArea?: boolean;
    safeAreaStyle?: StyleProp<ViewStyle>;
    blurAmountIos?: number;
    blurAmountAndroid?: number;
};

/**
 * Full-screen Flick Flirt artwork with a frosted blur layer, then your UI.
 * Same stack as FlickFlirtMatches: ImageBackground → BlurView → (SafeAreaView) → children
 */
const FlickFlirtBlurredBackground = ({
    children,
    source = imageindex.FLickFlirt,
    resizeMode = 'cover',
    imageStyle,
    wrapWithSafeArea = true,
    safeAreaStyle,
    blurAmountIos = FLICK_FLIRT_BLUR_DEFAULT.blurAmountIos,
    blurAmountAndroid = FLICK_FLIRT_BLUR_DEFAULT.blurAmountAndroid,
}: FlickFlirtBlurredBackgroundProps) => {
    const inner =
        wrapWithSafeArea ? (
            <SafeAreaView style={[styles.safeArea, safeAreaStyle]}>{children}</SafeAreaView>
        ) : (
            children
        );

    return (
        <ImageBackground source={source} resizeMode={resizeMode} style={[styles.imageBg, imageStyle]}>
            <BlurView
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
                blurType={FLICK_FLIRT_BLUR_DEFAULT.blurType}
                blurAmount={Platform.OS === 'ios' ? blurAmountIos : blurAmountAndroid}
                reducedTransparencyFallbackColor={FLICK_FLIRT_BLUR_DEFAULT.reducedTransparencyFallbackColor}
                overlayColor={Platform.OS === 'android' ? FLICK_FLIRT_BLUR_DEFAULT.androidOverlayColor : undefined}
            />
            {inner}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    imageBg: {
        width: SIZES.ScreenWidth,
        height: SIZES.ScreenHeight,
    },
    safeArea: {
        flex: 1,
    },
});

export default FlickFlirtBlurredBackground;
