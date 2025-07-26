import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {Session} from '@supabase/supabase-js';
import {supabase, supabaseAuth} from '../../lib/supabase';
import {API} from '../clients/auth.client';
import {IUserProfile} from '../../types';
import {getMe} from '../lib/api/user.lib';
import {AxiosResponse} from 'axios';
import * as RootNavigation from '../util/RootNavigation';
import messaging from '@react-native-firebase/messaging';
import {getUserWallet} from '../lib/api/wallet.lib';

interface IAuthStore {
    session: Session | null;
    user: IUserProfile | null;
    walletBalance: string | null;
    getWalletBalance: () => string | null;
    setWalletBalance: (balance: string | null) => void;
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
            walletBalance: null,
            getWalletBalance: () => get().walletBalance,
            setWalletBalance: balance => set({walletBalance: balance}),
            loginWithEmail: async (email: string, password: string) => {
                try {
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
                } catch (error) {
                    console.error('Login failed:', error);
                    return {session: null, user: null};
                }
            },

            signUpWithEmail: async (email: string, password: string) => {
                try {
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
                } catch (error) {
                    console.error('Sign-up failed:', error);
                    return {response: {} as AxiosResponse, user: null};
                }
            },

            logout: async () => {
                try {
                    const deviceToken = await messaging().getToken();
                    const user = await get().getUser();
                    console.log('Token deregistering:', deviceToken, 'for user:', user?.id);

                    if (user?.id && deviceToken) {
                        await API.post('/v1/auth/device-token/deregister', {
                            userId: user.id,
                            deviceToken: deviceToken,
                        });
                    }

                    const {error} = await supabase.auth.signOut({scope: 'local'});
                    if (error) {
                        console.error('Error logging out:', error);
                        return false;
                    }

                    await messaging().deleteToken();
                    await AsyncStorage.removeItem('access_token');

                    await AsyncStorage.removeItem('deviceToken');
                    set({session: null, user: null});

                    messaging().onMessage(() => null);
                    messaging().onNotificationOpenedApp(() => null);
                    messaging().setBackgroundMessageHandler(async () => null);

                    return true;
                } catch (error) {
                    console.error('Logout failed:', error);
                    return false;
                }
            },

            getUser: (): IUserProfile | null => {
                try {
                    return get().user;
                } catch (error) {
                    console.error('Error fetching user:', error);
                    return null;
                }
            },
            getSession: (): Session | null => {
                try {
                    return get().session;
                } catch (error) {
                    console.error('Error fetching session:', error);
                    return null;
                }
            },
            hydrateAuth: async () => {
                try {
                    // Check network connectivity
                    const networkState = await NetInfo.fetch();
                    if (!networkState.isInternetReachable) {
                        return;
                    }

                    const currentSession = get().session;
                    const timeNow = Math.round(Date.now() / 1000);

                    if (currentSession && currentSession?.expires_at) {
                        const hasSessionExpired = timeNow > currentSession.expires_at;

                        if (currentSession !== null && !hasSessionExpired) {
                            const refreshedSession = await supabaseAuth.refreshSession(currentSession);
                            set({session: refreshedSession.data.session});
                        } else {
                            await get().logout();
                            RootNavigation.navigate('Signin', {});
                        }
                    } else {
                        RootNavigation.navigate('Signin', {});
                    }
                } catch (error) {
                    console.error('Error during session hydration:', error);
                }
            },
            hydrateUser: async () => {
                try {
                    const userResponse = await getMe();

                    if (userResponse === undefined) {
                        return;
                    }

                    set({user: userResponse});
                    // fetch wallet balance
                    const balance = await getUserWallet();
                    set({walletBalance: balance ?? null});
                } catch (error) {
                    console.error('Error during user hydration:', error);
                }
            },
        }),
        {
            name: 'user-store',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);

export default useAuthStore;
