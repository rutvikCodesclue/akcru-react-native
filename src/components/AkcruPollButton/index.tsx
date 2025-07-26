import {Image, View} from 'react-native';
import React from 'react';
import imageindex from '../../../assets/images/imageindex';
import {Icon} from '@rneui/base';
import {COLORS, isTablet, MULTISIZES} from '../../../assets/constants/theme';

const PollButton = () => {
    return (
        <View>
            <Image
                source={imageindex.AkcruHexBlank}
                resizeMode="contain"
                style={{width: MULTISIZES.Xlarge75, height: MULTISIZES.Xlarge43}}
            />
            <View style={{position: 'absolute', top: '20%', right: '37%'}}>
                <Icon name="stats-chart" type="ionicon" color={COLORS.LIGHTGREY} size={isTablet() ? 38 : 20} />
            </View>
        </View>
    );
};

export default PollButton;
