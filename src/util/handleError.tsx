import { Alert } from 'react-native';

export const handleError = (error: any, fallbackMessage: string = 'Something went wrong.') => {
  console.error('Error Handler:', error);
  const errorMessage = error || fallbackMessage;
  Alert.alert(errorMessage);
};

