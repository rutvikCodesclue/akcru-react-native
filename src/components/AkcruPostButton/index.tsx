import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import imageindex from '../../../assets/images/imageindex';
import {Icon} from '@rneui/base';
import {COLORS, MULTISIZES} from '../../../assets/constants/theme';
import CustomIcon from '../CustomIcon/CustomIcon';

const PostButton = () => {
    return (
        <View>
            <Image
                source={imageindex.AkcruHexBlank}
                resizeMode="contain"
                style={{width: MULTISIZES.Xlarge75, height: MULTISIZES.Xlarge75}}
            />
            <View style={{position: 'absolute', top: '7%', right: '12%'}}>
                {/* <Icon name="add" type="ionicon" color={COLORS.LIGHTGREY} size={45} /> */}
                <CustomIcon name="add" type="ionicon" baseSize={35} color={COLORS.LIGHTGREY} />
            </View>
        </View>
    );
};

export default PostButton;

const styles = StyleSheet.create({
    item: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
});
