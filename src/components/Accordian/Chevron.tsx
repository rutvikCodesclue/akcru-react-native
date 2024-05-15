import React from 'react';
import {Icon} from '@rneui/base';
import {COLORS} from '../../../assets/constants';
import Animated, {useAnimatedStyle, SharedValue} from 'react-native-reanimated';

type Props = {
    progress: SharedValue<number>;
};

const Chevron = ({progress}: Props) => {
    const iconStyle = useAnimatedStyle(() => ({
        transform: [{rotate: `${progress.value * 90}deg`}],
    }));
    return (
        <Animated.View style={iconStyle}>
            <Icon name="chevron-right-circle" type="material-community" color={COLORS.PURPLE} size={28} />
        </Animated.View>
    );
};

export default Chevron;
