import React from 'react';
import {
    ImageBackground,
    ImageSourcePropType,
    SafeAreaView,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../assets/images/imageindex';
import {
    FLICK_FLIRT_BG_BASE_COLORS,
    FLICK_FLIRT_IMAGE_OVERLAY_BOTTOM_COLORS,
    FLICK_FLIRT_IMAGE_OVERLAY_FULL_COLORS,
    SIZES,
} from '../../../assets/constants';

export type FlickFlirtBlurredBackgroundProps = {
    children: React.ReactNode;
    /** Defaults to `imageindex.FLickFlirtBG` */
    source?: ImageSourcePropType;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    /** Merged with default full-screen size */
    imageStyle?: StyleProp<ViewStyle>;
    /** When true (default), children are wrapped in `SafeAreaView` with `flex: 1` */
    wrapWithSafeArea?: boolean;
    safeAreaStyle?: StyleProp<ViewStyle>;
    /**
     * Full Flick Flirt bg treatment: base fill behind the image + vertical + bottom washes
     * (same stack as `FlickFlirtArchetypeResult`). No extra `LinearGradient` needed in parents.
     */
    archetypeStyleGradients?: boolean;
};

/**
 * Full-screen Flick Flirt background image, then your UI.
 * Use a pre-blurred asset for the background; no runtime blur layer.
 */
const FlickFlirtBlurredBackground = ({
    children,
    source = imageindex.FLickFlirtBG,
    resizeMode = 'cover',
    imageStyle,
    wrapWithSafeArea = true,
    safeAreaStyle,
    archetypeStyleGradients = false,
}: FlickFlirtBlurredBackgroundProps) => {
    const gradientOverlays = archetypeStyleGradients ? (
        <>
            <LinearGradient
                colors={[...FLICK_FLIRT_IMAGE_OVERLAY_FULL_COLORS]}
                style={styles.archetypeFullGradient}
            />
            <LinearGradient
                pointerEvents="none"
                colors={[...FLICK_FLIRT_IMAGE_OVERLAY_BOTTOM_COLORS]}
                style={styles.archetypeBottomGradient}
            />
        </>
    ) : null;

    const inner = wrapWithSafeArea ? (
        <SafeAreaView style={[styles.safeArea, safeAreaStyle]}>
            {gradientOverlays}
            {children}
        </SafeAreaView>
    ) : archetypeStyleGradients ? (
        <View style={styles.safeArea}>
            {gradientOverlays}
            {children}
        </View>
    ) : (
        children
    );

    const imageBackground = (
        <ImageBackground source={source} resizeMode={resizeMode} style={[styles.imageBg, imageStyle]}>
            {inner}
        </ImageBackground>
    );

    if (archetypeStyleGradients) {
        return (
            <View style={styles.rootWithBase}>
                <LinearGradient colors={[...FLICK_FLIRT_BG_BASE_COLORS]} style={StyleSheet.absoluteFillObject} />
                {imageBackground}
            </View>
        );
    }

    return imageBackground;
};

const styles = StyleSheet.create({
    rootWithBase: {
        flex: 1,
    },
    imageBg: {
        width: SIZES.ScreenWidth,
        height: SIZES.ScreenHeight,
    },
    safeArea: {
        flex: 1,
    },
    archetypeFullGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: SIZES.ScreenHeight,
    },
    archetypeBottomGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: SIZES.ScreenHeight * 0.42,
    },
});

export default FlickFlirtBlurredBackground;
