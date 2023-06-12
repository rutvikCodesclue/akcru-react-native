import 'react-native-url-polyfill/auto' // DO NOT REMOVE. OTHERWISE WE GET AN ERROR
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = Constants.expoConfig.extra.SUPABASE_URL
export const SUPABASE_ANON_KEY = Constants.expoConfig.extra.SUPABASE_ANON_KEY

const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        return SecureStore.getItemAsync(key)
    },
    setItem: (key: string, value: string) => {
        SecureStore.setItemAsync(key, value)
    },
    removeItem: (key: string) => {
        SecureStore.deleteItemAsync(key)
    },
}

export const supabase = createClient( SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: ExpoSecureStoreAdapter as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})