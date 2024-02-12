import React from 'react';
import {Image, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';
import imageindex from '../../../assets/images/imageindex';

type HexAvatar2Prop = {
    source?: any;
    size: number;
    bordercolor: any;
};

const HexAvatar2 = ({source, size, bordercolor}: HexAvatar2Prop) => {
    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
    const borderSize = 5;


    return (
        <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
            <Svg height={size} width={size} viewBox={`0 0 270 234`} style={{position: 'absolute'}}>
                <Path d={hexagonPath} fill={bordercolor} />
            </Svg>
            <MaskedView
                style={{width: size - borderSize, height: size - borderSize, alignSelf: 'center'}}
                maskElement={
                    <Svg
                        height={size - borderSize}
                        width={size - borderSize}
                        viewBox={`0 0 270 234`}
                        style={{overflow: 'hidden'}}>
                        <Path d={hexagonPath} fill="black" />
                    </Svg>
                }>
                <Image
                    source={source.uri ? {uri: source.uri} : imageindex.Akcruplaceholder}
                    style={{width: size, height: size, alignSelf: 'center'}}
                    resizeMode="cover"
                    onError={error => {
                        console.log('Failed to load image:', error.nativeEvent.error);
                        // Here you can set a state to fallback to a default image if needed
                    }}
                />
            </MaskedView>
        </View>
    );
};

export default HexAvatar2;
