import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import React from 'react'
import { Header } from '../../components';
import WebView from 'react-native-webview';


const MovieTrailerScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View>
        <Header />
      </View>
      <WebView
        source={{
          uri: "https://sdk.mealme.ai/store?api=ackru-sandbox&storeType=restaurant&primaryColor=2FBFF1",
        }}
        style={{
          marginBottom: 40,
        }}
      />
    </SafeAreaView>
  );
}

export default MovieTrailerScreen

const styles = StyleSheet.create({})