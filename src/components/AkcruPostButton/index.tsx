import {Image, Pressable, StyleSheet, View} from 'react-native';
import React from 'react';
import imageindex from '../../../assets/images/imageindex';
import {COLORS, isTablet, MULTISIZES} from '../../../assets/constants/theme';
import CustomIcon from '../CustomIcon/CustomIcon';

type PostButtonProps = {
    onPress: () => void;
};

const PostButton = ({onPress}: PostButtonProps) => {
    return (
        <Pressable onPress={onPress}>
            <Image
                source={imageindex.AkcruHexBlank}
                resizeMode="contain"
                style={{width: MULTISIZES.Xlarge75, height: MULTISIZES.Xlarge75}}
            />
            <View style={styles.iconContainer}>
                <CustomIcon name="add" type="ionicon" baseSize={isTablet() ? 62 : 35} color={COLORS.LIGHTGREY} />
            </View>
        </Pressable>
    );
};

export default PostButton;

const styles = StyleSheet.create({
    iconContainer: {
        position: 'absolute',
        top: '11%',
        right: isTablet() ? '16%' : '17%',
    },
});
