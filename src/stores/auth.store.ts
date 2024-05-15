import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {Session} from '@supabase/supabase-js';
import {supabase, supabaseAuth} from '../../lib/supabase';
import {API} from '../clients/api.client';
import {IUserProfile} from '../../types';
import {getMe} from '../lib/api/user.lib';
import {AxiosResponse} from 'axios';

interface IAuthStore {
    session: Session | null;
    user: IUserProfile | null;
    getUser: () => IUserProfile | null;
    getSession: () => Session | null;
    loginWithEmail: (email: string, password: string) => Promise<{session: Session | null; user: IUserProfile | null}>;
    signUpWithEmail: (email: string, password: string) => Promise<{response: AxiosResponse; user: IUserProfile | null}>;
    logout: () => Promise<boolean | null>;
    hydrateAuth: () => Promise<void>;
    hydrateUser: () => Promise<void>;
}

const useAuthStore = create<IAuthStore>()(
    persist<IAuthStore>(
        (set, get) => ({
            session: null,
            user: null,
            loginWithEmail: async (email: string, password: string) => {
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

                set({session: data.session, user: data.user});

                return {session, user};
            },

            signUpWithEmail: async (email: string, password: string) => {
                const signUpResponse = await API.post('/v1/auth/signup', {
                    type: 'email',
                    email: email,
                    password: password,
                });

                if (signUpResponse.status !== 200) {
                    return {response: signUpResponse, user: null};
                }

                const user = signUpResponse.data.user as IUserProfile;

                set({user});

                await get().loginWithEmail(email, password);

                await get().hydrateAuth();
                await get().hydrateUser();

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
                const currentSession = get().session;
                const timeNow = Math.round(Date.now() / 1000);

                if (currentSession && currentSession?.expires_at) {
                    const hasSessionExpired = timeNow > currentSession.expires_at;

                    if (currentSession !== null && !hasSessionExpired) {
                        const rereshedSession = await supabaseAuth.refreshSession(currentSession);
                        set({session: rereshedSession.data.session});
                    } else {
                        console.log('session is expired, logging out...', currentSession);
                        await get().logout();
                    }
                }
            },
            hydrateUser: async () => {
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
