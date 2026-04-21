import React from 'react';
import {Image, View} from 'react-native';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';
import imageindex from '../../../assets/images/imageindex';
import {COLORS} from '../../../assets/constants';

type HexAvatarProp = {
    source?: any;
    size: number;
    bordercolor: string;
    /**
     * Thickness of the hex frame (gradient border). Inner photo mask is `size - borderThickness`.
     */
    borderThickness?: number;
    /**
     * Scales the bitmap inside the hex mask (>1 zooms in / shows a tighter crop). Outer `size` unchanged.
     */
    imageZoom?: number;
    /**
     * Rotate the hex frame + mask (e.g. 90). The photo is counter-rotated so it stays upright.
     */
    rotateFrameDegrees?: number;
};

const DEFAULT_BORDER_THICKNESS = 5;

const HexAvatar = ({
    source,
    size,
    bordercolor,
    borderThickness = DEFAULT_BORDER_THICKNESS,
    imageZoom = 1,
    rotateFrameDegrees = 0,
}: HexAvatarProp) => {
    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
    const borderSize = Math.max(2, Math.min(borderThickness, size - 4));
    const innerSize = Math.max(1, size - borderSize);
    const photoSide = size * Math.max(1, imageZoom);
    const frameDeg = rotateFrameDegrees || 0;
    const gradientId = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const frameColor = bordercolor || COLORS.AKCRUBLUE;

    const maskElement = (
        <Svg
            height={innerSize}
            width={innerSize}
            viewBox={'0 0 270 234'}
            style={{overflow: 'hidden'}}>
            <Path d={hexagonPath} fill="black" />
        </Svg>
    );

    const imageEl = (
        <Image
            source={source.uri ? {uri: source.uri} : imageindex.Akcruplaceholder}
            style={{width: photoSide, height: photoSide, alignSelf: 'center'}}
            resizeMode="cover"
            onError={error => {
                console.log('Failed to load image:', error.nativeEvent.error);
            }}
        />
    );

    const maskedContent =
        frameDeg !== 0 ? (
            <View
                style={{
                    width: Math.max(size, photoSide),
                    height: Math.max(size, photoSide),
                    transform: [{rotate: `${-frameDeg}deg`}],
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                {imageEl}
            </View>
        ) : (
            imageEl
        );

    const inner = (
        <>
            <Svg height={size} width={size} viewBox={'0 0 270 234'} style={{position: 'absolute'}}>
                <Defs>
                    <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor={frameColor} />
                        <Stop offset="0.5" stopColor={COLORS.AKCRUBLUE} />
                        <Stop offset="1" stopColor={COLORS.PINK} />
                    </LinearGradient>
                </Defs>
                <Path d={hexagonPath} fill={`url(#${gradientId})`} />
            </Svg>
            <MaskedView
                style={{width: innerSize, height: innerSize, alignSelf: 'center'}}
                maskElement={maskElement}>
                {maskedContent}
            </MaskedView>
        </>
    );

    return (
        <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
            {frameDeg !== 0 ? (
                <View
                    style={{
                        width: size,
                        height: size,
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: [{rotate: `${frameDeg}deg`}],
                    }}>
                    {inner}
                </View>
            ) : (
                inner
            )}
        </View>
    );
};

export default HexAvatar;
