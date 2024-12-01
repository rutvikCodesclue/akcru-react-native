import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

const NoInternetAlert = () => {
  const { isInternetReachable } = useNetInfo();
  const [opacity] = useState(new Animated.Value(0));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInternetReachable === false) {
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else if (isInternetReachable) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [isInternetReachable, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>Please check your internet connection</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: 'red',
    padding: 10,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default NoInternetAlert;
