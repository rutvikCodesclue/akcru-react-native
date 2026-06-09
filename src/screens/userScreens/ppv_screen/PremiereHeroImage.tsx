import React, {useEffect, useState} from 'react';
import {View, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SIZES} from '../../../../assets/constants';
import styles from './styles';

const HERO_GRADIENTS = {
    top: [COLORS.BLACK, 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0)'],
    bottom: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.72)', COLORS.BLACK],
};

const DEFAULT_HERO_HEIGHT = Math.min(Math.round(SIZES.ScreenWidth * 1.5), Math.round(SIZES.ScreenHeight * 0.52));

/** Scale height from real image dimensions so full width = full poster, no top/bottom crop. */
function scaleHeroHeight(imageWidth: number, imageHeight: number): number {
    const scaledHeight = Math.round((SIZES.ScreenWidth / imageWidth) * imageHeight);
    return Math.max(scaledHeight, Math.round(SIZES.ScreenWidth * 0.5));
}

type Props = {
    uri?: string;
    /** Caps hero height so it fits a fixed layout (e.g. purchase screen). */
    maxHeight?: number;
};

function resolveHeroHeight(naturalHeight: number, maxHeight?: number): number {
    if (maxHeight != null && maxHeight > 0) {
        return maxHeight;
    }
    return naturalHeight;
}

export default function PremiereHeroImage({uri, maxHeight}: Props) {
    const [heroHeight, setHeroHeight] = useState(() =>
        resolveHeroHeight(DEFAULT_HERO_HEIGHT, maxHeight),
    );

    useEffect(() => {
        if (!uri) {
            setHeroHeight(resolveHeroHeight(DEFAULT_HERO_HEIGHT, maxHeight));
            return;
        }

        let cancelled = false;
        setHeroHeight(resolveHeroHeight(DEFAULT_HERO_HEIGHT, maxHeight));

        Image.getSize(
            uri,
            (width, height) => {
                if (cancelled || width <= 0 || height <= 0) {
                    return;
                }
                setHeroHeight(resolveHeroHeight(scaleHeroHeight(width, height), maxHeight));
            },
            () => {
                if (!cancelled) {
                    setHeroHeight(resolveHeroHeight(DEFAULT_HERO_HEIGHT, maxHeight));
                }
            },
        );

        return () => {
            cancelled = true;
        };
    }, [uri, maxHeight]);

    const topGradientHeight = Math.round(heroHeight * 0.28);
    const bottomGradientHeight = Math.round(heroHeight * 0.48);

    return (
        <View style={[styles.heroSection, {height: heroHeight}]}>
            {uri ? (
                <Image
                    source={{uri}}
                    style={[styles.heroImage, {height: heroHeight}]}
                    resizeMode="contain"
                    onLoad={event => {
                        const {width, height} = event.nativeEvent.source;
                        if (width > 0 && height > 0) {
                            setHeroHeight(resolveHeroHeight(scaleHeroHeight(width, height), maxHeight));
                        }
                    }}
                />
            ) : (
                <View style={styles.heroPlaceholder} />
            )}
            <LinearGradient
                colors={[...HERO_GRADIENTS.top]}
                locations={[0, 0.5, 1]}
                style={[styles.heroGradientTop, {height: topGradientHeight}]}
                pointerEvents="none"
            />
            <LinearGradient
                colors={[...HERO_GRADIENTS.bottom]}
                locations={[0, 0.35, 0.72, 1]}
                style={[styles.heroGradientBottom, {height: bottomGradientHeight}]}
                pointerEvents="none"
            />
        </View>
    );
}
