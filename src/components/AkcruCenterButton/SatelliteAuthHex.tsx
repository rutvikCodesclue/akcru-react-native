import React from 'react';
import Svg, {Defs, LinearGradient, Stop, Path} from 'react-native-svg';

import {AUTH_BUTTON_THEME, HEXAGON_THEME} from '../../../assets/constants/authTheme';

type SatelliteAuthHexProps = {
    width: number;
    height: number;
};

/** Satellite hexes: same left→right PURPLE→PINK fill as FlickFlirt `LrgButton` `variant="auth"`. */
const SatelliteAuthHex: React.FC<SatelliteAuthHexProps> = ({width, height}) => {
    const gradId = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const [c0, c1] = AUTH_BUTTON_THEME.colors;

    return (
        <Svg width={width} height={height} viewBox={HEXAGON_THEME.viewBox}>
            <Defs>
                <LinearGradient id={gradId} x1="0" y1="0.5" x2="1" y2="0.5">
                    <Stop offset="0" stopColor={c0} />
                    <Stop offset="1" stopColor={c1} />
                </LinearGradient>
            </Defs>
            <Path d={HEXAGON_THEME.path} fill={`url(#${gradId})`} />
        </Svg>
    );
};

export default SatelliteAuthHex;
