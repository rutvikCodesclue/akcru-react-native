import React from 'react';
import {Image, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';
import imageindex from '../../../assets/images/imageindex';

type HexAvatarProp = {
    source?: any;
    size: number;
    bordercolor: any;
    /**
     * Rotate the hex frame + mask (e.g. 90). The photo is counter-rotated so it stays upright.
     */
    rotateFrameDegrees?: number;
};

const HexAvatar = ({source, size, bordercolor, rotateFrameDegrees = 0}: HexAvatarProp) => {
    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
    const borderSize = 5;
    const frameDeg = rotateFrameDegrees || 0;

    const maskElement = (
        <Svg
            height={size - borderSize}
            width={size - borderSize}
            viewBox={'0 0 270 234'}
            style={{overflow: 'hidden'}}>
            <Path d={hexagonPath} fill="black" />
        </Svg>
    );

    const imageEl = (
        <Image
            source={source.uri ? {uri: source.uri} : imageindex.Akcruplaceholder}
            style={{width: size, height: size, alignSelf: 'center'}}
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
                    width: size,
                    height: size,
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
                <Path d={hexagonPath} fill={bordercolor} />
            </Svg>
            <MaskedView
                style={{width: size - borderSize, height: size - borderSize, alignSelf: 'center'}}
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
