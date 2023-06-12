import 'react-native-url-polyfill/auto' // DO NOT REMOVE. OTHERWISE WE GET AN ERROR
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = "https://bekhsokiwuuuksoaqzrj.supabase.co"
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJla2hzb2tpd3V1dWtzb2FxenJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODYyNjIzNDEsImV4cCI6MjAwMTgzODM0MX0.SOxGq0Jq9E_StC66SgiBmipbaF2Zsc7OOWEkdREnD38"

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
        // localStorage: AsyncStorage as any, // FIXME: set this up
    },
})