import {Alert, Platform, ToastAndroid} from 'react-native';

export const handleError = (error: any, fallbackMessage: string = 'Something went wrong.') => {
  console.error('Error Handler:', error);
  const errorMessage = error || fallbackMessage;
  if (Platform.OS === 'android') {
    ToastAndroid.show(String(errorMessage), ToastAndroid.SHORT);
    return;
  }
  Alert.alert(String(errorMessage));
};
