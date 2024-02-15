
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeLocalToken = async (token: string) => {
    try {
        await AsyncStorage.setItem('FCMToken', token);
    } catch (error) {
        console.error('Error storing token locally', error);
    }
};

export const getLocalToken = async () => {
    try {
        const token = await AsyncStorage.getItem('FCMToken');
        return token;
    } catch (error) {
        console.error('Error retrieving local token', error);
        return null;
    }
};
