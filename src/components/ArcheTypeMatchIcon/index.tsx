import React from 'react';
import {View} from 'react-native';
import Svg, {Circle, Path, Rect, G} from 'react-native-svg';

type ArcheTypeMatchIconProp = {
    size: number;
    fillcolor: string;
};

const ArcheTypeMatchIcon = ({size, fillcolor}: ArcheTypeMatchIconProp) => {
    return (
        <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
            <Svg height={size} width={size} viewBox="0 0 444 285" style={{position: 'absolute'}}>
                <G id="Group_3" data-name="Group 3" transform="translate(-206 -491)">
                    <G id="Group_1" data-name="Group 1">
                        <Circle
                            id="Ellipse_1"
                            data-name="Ellipse 1"
                            cx="50"
                            cy="50"
                            r="50"
                            transform="translate(237 491)"
                            fill={fillcolor}
                        />
                        <Path
                            id="Rectangle_1"
                            data-name="Rectangle 1"
                            d="M81.5,0h0A81.5,81.5,0,0,1,163,81.5V165a0,0,0,0,1,0,0H0a0,0,0,0,1,0,0V81.5A81.5,81.5,0,0,1,81.5,0Z"
                            transform="translate(206 611)"
                            fill={fillcolor}
                        />
                        <Rect
                            id="Rectangle_2"
                            data-name="Rectangle 2"
                            width="178"
                            height="37"
                            rx="18.5"
                            transform="translate(292.986 667.337) rotate(-45)"
                            fill={fillcolor}
                        />
                    </G>
                    <G id="Group_2" data-name="Group 2" transform="translate(281)">
                        <Circle
                            id="Ellipse_1-2"
                            data-name="Ellipse 1"
                            cx="50"
                            cy="50"
                            r="50"
                            transform="translate(237 491)"
                            fill={fillcolor}
                        />
                        <Path
                            id="Rectangle_1-2"
                            data-name="Rectangle 1"
                            d="M81.5,0h0A81.5,81.5,0,0,1,163,81.5V165a0,0,0,0,1,0,0H0a0,0,0,0,1,0,0V81.5A81.5,81.5,0,0,1,81.5,0Z"
                            transform="translate(206 611)"
                            fill={fillcolor}
                        />
                        <Rect
                            id="Rectangle_2-2"
                            data-name="Rectangle 2"
                            width="178"
                            height="37"
                            rx="18.5"
                            transform="translate(258.851 693.5) rotate(-135)"
                            fill={fillcolor}
                        />
                    </G>
                </G>
            </Svg>
        </View>
    );
};

export default ArcheTypeMatchIcon;
