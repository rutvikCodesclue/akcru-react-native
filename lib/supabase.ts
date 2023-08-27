// this is a javascript file
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bekhsokiwuuuksoaqzrj.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJla2hzb2tpd3V1dWtzb2FxenJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODYyNjIzNDEsImV4cCI6MjAwMTgzODM0MX0.SOxGq0Jq9E_StC66SgiBmipbaF2Zsc7OOWEkdREnD38';

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
      eventsPerSecond: 5,
    },
  },
  
});

export const supabaseAuth = supabase.auth;
export const supabaseStorage = supabase.storage;
export const supabaseRealtime = supabase.realtime;