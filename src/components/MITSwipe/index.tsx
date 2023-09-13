import React, { useState } from "react";
import {
  View,
  Text,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import styles from "./styles";
import {COLORS, SIZES, FONTS} from '../../../assets/constants';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserProfileStackParams } from "../../navigation/UserProfileStack";
import { Icon } from "@rneui/base";
import { AkcruControlBtn } from "../../../assets/svg";

const { width } = Dimensions.get("window");

type MITSwipeProps = {
    decline: any;
    accept: any;
};

const MITSwipe = ({decline, accept}: MITSwipeProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const [swipeValue] = useState(new Animated.Value(0));

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, {dx: swipeValue}], {
            useNativeDriver: false,
        }),
        onPanResponderRelease: (event, gesture) => {
            if (gesture.dx > 50) {
                // Swiped to the right
                Animated.timing(swipeValue, {
                    toValue: width / 5.5, // Move button to the right edge
                    duration: 400,
                    useNativeDriver: false,
                }).start(
                    () => decline(),
                    // navigation.navigate('DeclineMITScreen', {}), // Navigate to the DeclinedScreen
                );
            } else if (gesture.dx < -50) {
                // Swiped to the left
                Animated.timing(swipeValue, {
                    toValue: -width / 5.5, // Move button to the left edge
                    duration: 400,
                    useNativeDriver: false,
                }).start(() => {
                  accept();
                    // navigation.navigate('AcceptMITScreen', {}); // Navigate to the DeclinedScreen
                });
            } else {
                // Reset to the middle
                Animated.timing(swipeValue, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            }
        },
    });

    const animatedStyle = {
        transform: [{translateX: swipeValue}],
    };

    return (
        <View>
            <View style={styles.container}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.accept}>ACCEPT </Text>
                    <Icon name="chevron-back" type="ionicon" size={30} color={COLORS.DARKERGREY} />
                    <Icon name="chevron-back" type="ionicon" size={30} color={COLORS.DARKERGREY} />
                </View>

                <Animated.View style={[styles.buttonContainer, animatedStyle]} {...panResponder.panHandlers}>
                    <AkcruControlBtn />
                </Animated.View>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name="chevron-forward" type="ionicon" size={30} color={COLORS.DARKERGREY} />
                    <Icon name="chevron-forward" type="ionicon" size={30} color={COLORS.DARKERGREY} />
                    <Text style={styles.decline}>DECLINE</Text>
                </View>
            </View>
        </View>
    );
};

export default MITSwipe;
