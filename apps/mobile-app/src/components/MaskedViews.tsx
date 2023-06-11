import { StyleSheet, Text, View, Image } from 'react-native'
import MaskedView from '@react-native-masked-view/masked-view';
import React from 'react'
import { COLORS } from '../../constants';
import Svg, { Path } from "react-native-svg";
import imageindex from '../../assets/images/imageindex';
import { FAKE_USER_PROFILES } from '../../constants/Mockusers';
import {Canvas, Mask, Group, Circle, Rect, } from "@shopify/react-native-skia";


const MaskedViews = () => {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
     
    </Canvas>
  );
}

export default MaskedViews

const styles = StyleSheet.create({})