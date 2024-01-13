import React from 'react';
import {View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

type HexShapeProp = {
    source?: any;
    size: number;
    color: any;
};

const HexShape = ({size, color}: HexShapeProp) => {
    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';


    return (
        <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
            <Svg height={size} width={size} viewBox={`0 0 270 234`} style={{position: 'absolute'}}>
                <Path d={hexagonPath} fill={color} /> 
            </Svg>
        </View>
    );
};

export default HexShape;
