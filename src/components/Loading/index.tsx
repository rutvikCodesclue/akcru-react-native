import React from 'react';
import {View, Text, ImageBackground, StyleSheet, ActivityIndicator, ImageSourcePropType} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, SIZES, FLICK_FLIRT_IMAGE_OVERLAY_FULL_COLORS} from '../../../assets/constants';
import imageindex from '../../../assets/images/imageindex';

/** Default copy for full-screen and modal loaders — change here app-wide. */
export const DEFAULT_LOADING_MESSAGE = 'Loading...';

export type LoadingComponentProps = {
    message?: string;
    /**
     * Full-screen branded background. Set false when the parent already provides
     * `ImageBackground` (avoids stacking two backgrounds).
     */
    showBackground?: boolean;
    backgroundSource?: ImageSourcePropType;
    indicatorColor?: string;
};

export type AppLoadingModalProps = {
    visible: boolean;
    message?: string;
    /** Optional second line (same typography as `message`). */
    secondaryMessage?: string;
    indicatorColor?: string;
    backgroundSource?: ImageSourcePropType;
    onRequestClose?: () => void;
};

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        width: SIZES.ScreenWidth,
        minHeight: SIZES.ScreenHeight,
    },
    embeddedRoot: {
        height: SIZES.ScreenHeight,
        width: SIZES.ScreenWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    message: {
        ...FONTS.Title3,
        marginTop: 10,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    modalDim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.OVERLAY_BLACK_45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    /** Full-screen overlay — avoids `Modal` (Hermes can throw if native Modal is missing). */
    appModalLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10000,
        elevation: 10000,
    },
});

function LoadingChrome({
    backgroundSource,
    children,
}: {
    backgroundSource: ImageSourcePropType;
    children: React.ReactNode;
}) {
    return (
        <ImageBackground source={backgroundSource} resizeMode="cover" style={styles.fill}>
            <LinearGradient colors={[...FLICK_FLIRT_IMAGE_OVERLAY_FULL_COLORS]} style={StyleSheet.absoluteFill} />
            {children}
        </ImageBackground>
    );
}

function LoadingBody({
    message,
    secondaryMessage,
    indicatorColor,
}: {
    message: string;
    secondaryMessage?: string;
    indicatorColor: string;
}) {
    return (
        <>
            <ActivityIndicator size="large" color={indicatorColor} />
            <Text style={[styles.message, {color: indicatorColor}]}>{message}</Text>
            {secondaryMessage ? (
                <Text style={[styles.message, {color: indicatorColor, marginTop: 8}]}>{secondaryMessage}</Text>
            ) : null}
        </>
    );
}

/**
 * Full-screen or embedded loader. With `showBackground` (default true), uses the
 * shared background image and overlay; otherwise only centers the spinner + optional text.
 */
const LoadingComponent: React.FC<LoadingComponentProps> = ({
    message,
    showBackground = true,
    backgroundSource = imageindex.BgImageSM,
    indicatorColor = COLORS.AKCRUBLUE,
}) => {
    const resolvedMessage =
        message !== undefined && message !== '' ? message : showBackground ? DEFAULT_LOADING_MESSAGE : '';

    const body =
        resolvedMessage !== '' ? (
            <LoadingBody message={resolvedMessage} indicatorColor={indicatorColor} />
        ) : (
            <ActivityIndicator size="large" color={indicatorColor} />
        );

    if (!showBackground) {
        return <View style={styles.embeddedRoot}>{body}</View>;
    }

    return (
        <LoadingChrome backgroundSource={backgroundSource}>
            <View style={styles.center}>{body}</View>
        </LoadingChrome>
    );
};

/**
 * Full-screen loading overlay (same visuals as full-screen loading).
 * Does not use `Modal` — some Hermes/RN setups throw `Property 'Modal' doesn't exist`.
 */
export function AppLoadingModal({
    visible,
    message = DEFAULT_LOADING_MESSAGE,
    secondaryMessage,
    indicatorColor = COLORS.AKCRUBLUE,
    backgroundSource = imageindex.BgImageSM,
}: AppLoadingModalProps) {
    if (!visible) {
        return null;
    }

    return (
        <View style={styles.appModalLayer}>
            <View style={styles.fill}>
                <LoadingChrome backgroundSource={backgroundSource}>
                    <View style={styles.modalDim}>
                        <LoadingBody
                            message={message}
                            secondaryMessage={secondaryMessage}
                            indicatorColor={indicatorColor}
                        />
                    </View>
                </LoadingChrome>
            </View>
        </View>
    );
}

export default LoadingComponent;
