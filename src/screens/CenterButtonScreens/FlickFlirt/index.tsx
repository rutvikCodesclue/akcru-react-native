import { ImageBackground, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'

import imageindex from '../../../../assets/images/imageindex';
import { SIZES } from '../../../../assets/constants/theme';
import Header from '../../../components/header';


const FlickFlirtScreen = () => {
  return (
      <View>
          <ImageBackground
              source={imageindex.FLickFlirt}
              resizeMode="cover"
              style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
              <SafeAreaView>
                  <View>
                      <Header />
                  </View>
              </SafeAreaView>
          </ImageBackground>
      </View>
  );
}

export default FlickFlirtScreen

const styles = StyleSheet.create({})