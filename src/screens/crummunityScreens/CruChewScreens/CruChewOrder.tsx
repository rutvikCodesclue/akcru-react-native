import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native'
import React from 'react'
import WebView from 'react-native-webview';
import {SIZES, FONTS} from '../../../../assets/constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CruChewStackParams } from '../../../navigation/CruChewStack';
import Header from '../../../components/header';
import TabContainer from '../../../components/TabContainer/TabContainer';

const CruChewOrder = () => {

  const navigation =
    useNavigation<NativeStackNavigationProp<CruChewStackParams>>();
  return (
    <TabContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View>
        <Header />
      </View>
      <WebView
        source={{
          uri: "https://sdk.mealme.ai/store?api=akcru&storeType=restaurant&primaryColor=2FBFF1&hidePoweredBy=true&combineServiceAndDeliveryFee=true",
        }}
        style={{
          marginBottom: 40,
        }}
      />
    </SafeAreaView>
    </TabContainer>
    
  );
}

export default CruChewOrder;