import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AuthResponse, Session} from '@supabase/supabase-js'
import { supabase, supabaseAuth } from "../../lib/supabase";
import { API } from "../clients/api.client";
import { useNavigation } from "@react-navigation/native";
import { IUserProfile } from "../../types";
import { getMe } from "../lib/api/user.lib";
import { AxiosResponse } from "axios";
import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';


interface IAuthStore {
    session: Session | null;
    user: IUserProfile | null;
    getUser: () => IUserProfile | null;
    getSession: () => Session | null;
    loginWithEmail: (email: string, password: string) => Promise<{ session: Session | null, user: IUserProfile | null }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ response: AxiosResponse,  user: IUserProfile | null } >;
    logout: () => Promise<boolean | null>;
    hydrateAuth: () => Promise<void>;
    hydrateUser: () => Promise<void>;
}


const useAuthStore = create<IAuthStore>()(
    persist<IAuthStore>(
        // FIXME: create handlers and import them here
        (set, get) => ({
            session: null,
            user: null,
            loginWithEmail: async (email: string, password: string) => {
                // LOGIN w/ API
                const loginResponse = await API.post('/v1/auth/login', {
                    type: 'email',
                    email: email,
                    password: password,
                });

                if (loginResponse.status !== 200) {
                    return {session: null, user: null};
                }

                const data = loginResponse.data as ILoginResponse;
                const session = data.session;
                const user = data.user;
                // set params
                set({session: data.session, user: data.user});

                // return session and user
                return {session, user};
            },
            

            signUpWithEmail: async (email: string, password: string) => {
                // SIGN UP w/ API
                const signUpResponse = await API.post('/v1/auth/signup', {
                    type: 'email',
                    email: email,
                    password: password
                },
              );

                // check for error in signup response
                if (signUpResponse.status !== 200) {
                    return {response: signUpResponse, user: null};
                }

                const user = signUpResponse.data.user as IUserProfile;
                // set params
                set({user});

                // log that user in
                await get().loginWithEmail(email, password);
                // hydrate the user and session
                await get().hydrateAuth();
                await get().hydrateUser();

                // return session and user
                return {user, response: signUpResponse};
            },
         
            logout: async () => {

                const {error} = await supabase.auth.signOut();

                if (error) {
                    console.error('Error logging out:', error);
                    return false; 
                }

                await AsyncStorage.removeItem('access_token');

                await AsyncStorage.removeItem('deviceToken');
                set({session: null, user: null});

                return true; 
            },

            getUser: (): IUserProfile | null => {
                return get().user;
            },
            getSession: (): Session | null => {
                return get().session;
            },
            hydrateAuth: async () => {
                // check if user is logged in
                const currentSession = get().session;
                const timeNow = Math.round(Date.now() / 1000);

                // check if session is expired
                if (currentSession && currentSession?.expires_at) {
                    // check if now is past the session expiration
                    const hasSessionExpired = timeNow > currentSession.expires_at;

                    if (currentSession !== null && !hasSessionExpired) {
                        // refresh the session
                        const rereshedSession = await supabaseAuth.refreshSession(currentSession);
                        set({session: rereshedSession.data.session});
                    } else {
                        // session is expired, logout
                        console.log('session is expired, logging out...', currentSession);
                        await get().logout();
                    }
                }
            },
            hydrateUser: async () => {
                // call API to get user
                const userResponse = await getMe();

                if (userResponse === undefined) {
                    return;
                }

                set({user: userResponse});
            },
        }),
        {
            name: 'user-store',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);

export default useAuthStore;