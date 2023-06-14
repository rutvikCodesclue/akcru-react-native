import React, { useState } from "react";
import {
  View,
  Text,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CrummunityStackParams } from "../navigation/CrummunityStack";
import { UserProfileStackParams } from "@app/navigation/UserProfileStack";
import { Icon } from "@rneui/base";
import { AkcruControlBtn } from "../../assets";

const { width } = Dimensions.get("window");

const MITSwipe = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  const [swipeValue] = useState(new Animated.Value(0));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: swipeValue }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (event, gesture) => {
      if (gesture.dx > 50) {
        // Swiped to the right
        Animated.timing(swipeValue, {
          toValue: width / 5.5, // Move button to the right edge
          duration: 400,
          useNativeDriver: false,
        }).start(() => 
          navigation.navigate("DeclineMITScreen", {
            
          }) // Navigate to the DeclinedScreen
        );
      } else if (gesture.dx < -50) {
        // Swiped to the left
        Animated.timing(swipeValue, {
          toValue: -width / 5.5, // Move button to the left edge
          duration: 400,
          useNativeDriver: false,
        }).start(() => {
          navigation.navigate("AcceptMITScreen", {
            
          }); // Navigate to the DeclinedScreen
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
    transform: [{ translateX: swipeValue }],
  };

  return (
    <View
      
    >
      <View style={styles.container}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.accept}>ACCEPT </Text>
          <Icon
            name="chevron-back"
            type="ionicon"
            size={30}
            color={COLORS.DARKERGREY}
          />
          <Icon
            name="chevron-back"
            type="ionicon"
            size={30}
            color={COLORS.DARKERGREY}
          />
        </View>

        <Animated.View
          style={[styles.buttonContainer, animatedStyle]}
          {...panResponder.panHandlers}
        >
          <AkcruControlBtn />
        </Animated.View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon
            name="chevron-forward"
            type="ionicon"
            size={30}
            color={COLORS.DARKERGREY}
          />
          <Icon
            name="chevron-forward"
            type="ionicon"
            size={30}
            color={COLORS.DARKERGREY}
          />
          <Text style={styles.decline}>DECLINE</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 20,
    flexDirection: "row",
    borderWidth: 0.8,
    borderColor: COLORS.AKCRUBLUE,
    height: 60,
    borderRadius: 10,
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  buttonContainer: {
    marginTop: 6,
    zIndex: 20,
  },
  buttonText: {
    color: "white",
  },
  accept: {
    ...FONTS.Title2,
    color: COLORS.CATGREENLGT,
  },
  decline: {
    ...FONTS.Title2,
    color: COLORS.CATREDLGT,
  },
});

export default MITSwipe;
