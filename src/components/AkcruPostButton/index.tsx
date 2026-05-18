import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import React from 'react';
import {COLORS, isTablet} from '../../../assets/constants/theme';
import CustomIcon from '../CustomIcon/CustomIcon';
import SatelliteAuthHex from '../AkcruCenterButton/SatelliteAuthHex';

type PostButtonProps = {
    onPress: () => void;
    isSending?: boolean;
};

const PostButton = ({onPress, isSending = false}: PostButtonProps) => {
    const hexSize = isTablet() ? 80 : 64;

    return (
        <Pressable
            onPress={onPress}
            disabled={isSending}
            style={[styles.container, isSending && styles.containerSending]}>
            <SatelliteAuthHex width={hexSize} height={hexSize} />
            <View style={styles.iconContainer}>
                {isSending ? (
                    <ActivityIndicator size="small" color="#9b59b6" />
                ) : (
                    <CustomIcon name="add" type="ionicon" baseSize={isTablet() ? 52 : 29} color={COLORS.LIGHTGREY} />
                )}
            </View>
        </Pressable>
    );
};

export default PostButton;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerSending: {
        opacity: 0.85,
    },
    iconContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
