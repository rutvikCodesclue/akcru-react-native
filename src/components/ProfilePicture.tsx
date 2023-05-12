import React, { useState } from "react";
import { StyleSheet, View, Image, Text, ScrollView, SafeAreaView, useWindowDimensions } from "react-native";
import imageindex from "../../assets/images/imageindex";
import { FONTS } from "../../constants";

const HexagonProfilePicture = () => {
  const { width, height } = useWindowDimensions();
  return (
<View>
<Text style={{...FONTS.Title3}}>
  Avatar
</Text>
</View>
  );
};

export default HexagonProfilePicture;
