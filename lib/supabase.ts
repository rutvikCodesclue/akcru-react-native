// this is a javascript file
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL, SUPABASE_ANONKEY} from '@env';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANONKEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
    realtime: {
        log_level: 'debug', // FIXME: remove this for prod
        params: {
            eventsPerSecond: 20,
        },
    },
});

export const supabaseAuth = supabase.auth;
export const supabaseStorage = supabase.storage;
export const supabaseRealtime = supabase.realtime;
