import { ImageBackground, Modal, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import TabContainer from '../../../components/TabContainer/TabContainer';
import Header from '../../../components/header';
import { SIZES } from '../../../../assets/constants/theme';
import imageindex from '../../../../assets/images/imageindex';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AkcruButtonStackParams } from '../../../navigation/AkcruButtonStack';

const AkcruNetworkScreen = () => {

  return (
   
        <View>
              <ImageBackground
                  source={imageindex.Akcrunetwork}
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

export default AkcruNetworkScreen

const styles = StyleSheet.create({})