import "react-native-gesture-handler";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "./constants";
import AppLoading from "expo-app-loading";

import useFonts from "./hooks/useFonts";
import RootNavigator from "./src/navigation/RootNavigator";
import { Provider } from "react-redux";
import { ThemeProvider } from "react-native-rapi-ui";

export default function App() {
  const [IsReady, SetIsReady] = useState(false);

  const LoadFonts = async () => {
    await useFonts();
  };

  if (!IsReady) {
    return (
      <AppLoading
        startAsync={LoadFonts}
        onFinish={() => SetIsReady(true)}
        onError={() => {}}
      />
    );
  }

  return (
    <ThemeProvider theme="light">
      <View style={styles.container}>
        <StatusBar style="light" translucent={false} />
        <RootNavigator/>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.AKCRUBACKGROUND
  },
});
