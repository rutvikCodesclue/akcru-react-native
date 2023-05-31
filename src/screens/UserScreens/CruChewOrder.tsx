import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native'
import React from 'react'
import WebView from 'react-native-webview';
import { SIZES } from '../../../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CruChewStackParams } from '../../navigation/CruChewStack';
import { ClientStackParams } from '../../navigation/ClientStack';
import { Header } from '../../components';

const CruChewOrder = () => {

  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();
  return (
  
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View>
        <Header />
      </View>
      <WebView
        source={{
          uri: "https://sdk.mealme.ai/store?api=ackru-sandbox&storeType=restaurant&primaryColor=2FBFF1",
        }}
        style={{
          marginBottom: 40
        }}
      />
    </SafeAreaView>
  );
}

export default CruChewOrder

const styles = StyleSheet.create({})