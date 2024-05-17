import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';
import {Icon} from '@rneui/base';
import { COLORS, FONTS } from '../../../assets/constants';

const FingerAnimation = () => {
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(translateX, {
                    toValue: 100, // Adjust the value to set how far the finger moves
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, [translateX]);

    return (
        <View>
           <View style={styles.container}>
            <Animated.View style={{transform: [{translateX}]}}>
                <Icon
                    name="cursor-pointer"
                    type="material-community"
                    size={50} // Adjust size as needed
                    color={COLORS.LIGHTGREY} // Adjust color as needed
                />
            </Animated.View>
        </View>
        </View>
        
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: "5%",
        justifyContent: 'center',
        marginRight: '20%',
        height: 50,
    },
});

export default FingerAnimation;
