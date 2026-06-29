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
import messaging from '@react-native-firebase/messaging';
import {getUserWallet} from '../lib/api/wallet.lib';
import {resolveAuthMovieSlugState, resolveUserMovieSlugs} from '../lib/userProfile';

interface IAuthStore {
    session: Session | null;
    user: IUserProfile | null;
    movieSlug: string | null;
    movieSlugs: string[];
    walletBalance: string | null;
    _hasHydrated: boolean;
    getWalletBalance: () => string | null;
    setWalletBalance: (balance: string | null) => void;
    getUser: () => IUserProfile | null;
    getSession: () => Session | null;
    getMovieSlug: () => string | null;
    getMovieSlugs: () => string[];
    syncMovieSlugs: (movieSlug?: string | null, movieSlugs?: string[] | null) => void;
    loginWithEmail: (email: string, password: string) => Promise<{session: Session | null; user: IUserProfile | null; hasOtherSessions?: boolean; otherSessionsCount?: number}>;
    checkSessions: (email: string, password: string) => Promise<any>;
    signUpWithEmail: (email: string, password: string) => Promise<{response: AxiosResponse; user: IUserProfile | null}>;
    logout: () => Promise<boolean | null>;
    hydrateAuth: () => Promise<void>;
    hydrateUser: () => Promise<void>;
    checkOtherSessions: (userId: string, currentDeviceToken?: string) => Promise<{hasOtherSessions: boolean; otherSessionsCount: number} | null>;
    closeOtherSessions: (userId: string, currentDeviceToken?: string) => Promise<boolean>;
}

const useAuthStore = create<IAuthStore>()(
    persist<IAuthStore>(
        (set, get) => ({
            session: null,
            user: null,
            movieSlug: null,
            movieSlugs: [],
            walletBalance: null,
            _hasHydrated: false,
            getWalletBalance: () => get().walletBalance,
            setWalletBalance: balance => set({walletBalance: balance}),
            loginWithEmail: async (email: string, password: string) => {
                try {
                    // Get device token before login
                    let deviceToken;
                    try {
                        deviceToken = await messaging().getToken();
                    } catch (error) {
                        console.error('Error getting device token:', error);
                    }

                    const loginResponse = await API.post('/v1/auth/login', {
                        type: 'email',
                        email: email,
                        password: password,
                        deviceToken: deviceToken, // Include device token in login request
                    });

                    if (loginResponse.status !== 200) {
                        return {session: null, user: null};
                    }

                    const data = loginResponse.data as ILoginResponse;
                    const session = data.session;
                    const resolvedMovieSlug = data.movieSlug ?? data.user?.movieSlug ?? null;
                    const resolvedMovieSlugs = resolveUserMovieSlugs(
                        data.movieSlugs ?? data.user?.movieSlugs,
                        resolvedMovieSlug,
                    );
                    const user = {
                        ...data.user,
                        vipStatus: data.vipStatus ?? data.user?.vipStatus,
                        movieSlug: resolvedMovieSlug,
                        movieSlugs: resolvedMovieSlugs,
                    } as IUserProfile;

                    const hasOtherSessions = data.hasOtherSessions;
                    const otherSessionsCount = data.otherSessionsCount;

                    set({
                        session: data.session,
                        user,
                        movieSlug: resolvedMovieSlug,
                        movieSlugs: resolvedMovieSlugs,
                    });

                    return {session, user, hasOtherSessions, otherSessionsCount};
                } catch (error) {
                    console.error('Login failed:', error);
                    return {session: null, user: null};
                }
            },
            checkSessions: async (email: string, password: string) => {
                try {
                    // Get device token before login
                    let deviceToken;
                    try {
                        deviceToken = await messaging().getToken();
                    } catch (error) {
                        console.error('Error getting device token:', error);
                    }

                    const loginResponse = await API.post('/v1/auth/check-pre-session', {
                        type: 'email',
                        email: email,
                        password: password,
                        deviceToken: deviceToken, // Include device token in login request
                    });


                    if (loginResponse.status !== 200) {
                        return {session: null, user: null};
                    }

                    const data = loginResponse.data as ILoginResponse;
                    // {"deviceTokenStored": true, "hasExistingSession": false, "hasOtherSessions": false, "message": "No existing session found", "otherSessionsCount": 0, "sessionValidated": false, "success": true}
                    const user = data.user;
                    const hasOtherSessions = data.hasOtherSessions;
                    const otherSessionsCount = data.otherSessionsCount;
                    return {user, hasOtherSessions, otherSessionsCount};
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
                    console.error('Sign-up failed:', JSON.stringify(error));
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
                    set({session: null, user: null, movieSlug: null, movieSlugs: []});

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
            getMovieSlug: (): string | null => {
                try {
                    const storedSlug = get().movieSlug;
                    if (storedSlug?.trim()) {
                        return storedSlug.trim();
                    }
                    return get().user?.movieSlug?.trim() ?? null;
                } catch (error) {
                    console.error('Error fetching movie slug:', error);
                    return null;
                }
            },
            getMovieSlugs: (): string[] => {
                try {
                    const storedSlugs = get().movieSlugs;
                    if (storedSlugs.length > 0) {
                        return storedSlugs;
                    }
                    return resolveUserMovieSlugs(get().user?.movieSlugs, get().getMovieSlug());
                } catch (error) {
                    console.error('Error fetching movie slugs:', error);
                    return [];
                }
            },
            syncMovieSlugs: (movieSlug?: string | null, movieSlugs?: string[] | null) => {
                const currentUser = get().user;

                if (movieSlug == null && movieSlugs == null) {
                    return;
                }

                if (Array.isArray(movieSlugs) && movieSlugs.length === 0) {
                    set({
                        movieSlug: null,
                        movieSlugs: [],
                        user: currentUser
                            ? {
                                  ...currentUser,
                                  movieSlug: null,
                                  movieSlugs: [],
                              }
                            : currentUser,
                    });
                    return;
                }

                const {movieSlug: resolvedMovieSlug, movieSlugs: resolvedMovieSlugs} =
                    resolveAuthMovieSlugState(
                        movieSlug,
                        movieSlugs,
                        get().getMovieSlug(),
                        get().getMovieSlugs(),
                    );

                set({
                    movieSlug: resolvedMovieSlug,
                    movieSlugs: resolvedMovieSlugs,
                    user: currentUser
                        ? {
                              ...currentUser,
                              movieSlug: resolvedMovieSlug,
                              movieSlugs: resolvedMovieSlugs,
                          }
                        : currentUser,
                });
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
                        // Check if session will expire in the next 5 minutes (300 seconds)
                        const willExpireSoon = currentSession.expires_at - timeNow < 300;

                        if (currentSession !== null && !hasSessionExpired) {
                            // Only refresh if session will expire soon, otherwise use existing session
                            if (willExpireSoon) {
                                const refreshedSession = await supabaseAuth.refreshSession(currentSession);
                                set({session: refreshedSession.data.session});
                            }
                            // If session is still valid and not expiring soon, do nothing - keep existing session
                        } else {
                            await get().logout();
                            // Do not navigate here - Welcome screen (or current screen) handles showing sign-in UI
                        }
                    }
                    // When no session: do not navigate - caller (e.g. Welcome) decides where to go
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

                    const currentMovieSlug = get().getMovieSlug();
                    const currentMovieSlugs = get().getMovieSlugs();
                    const resolvedMovieSlug = userResponse.movieSlug?.trim() || currentMovieSlug;
                    const resolvedMovieSlugs = resolveUserMovieSlugs(
                        userResponse.movieSlugs ?? currentMovieSlugs,
                        resolvedMovieSlug,
                    );
                    const user = {
                        ...userResponse,
                        movieSlug: resolvedMovieSlug,
                        movieSlugs: resolvedMovieSlugs,
                    };

                    set({
                        user,
                        movieSlug: resolvedMovieSlug,
                        movieSlugs: resolvedMovieSlugs,
                    });
                    // fetch wallet balance
                    const balance = await getUserWallet();
                    set({walletBalance: balance ?? null});
                } catch (error) {
                    console.error('Error during user hydration:', error);
                }
            },
            checkOtherSessions: async (userId: string, currentDeviceToken?: string) => {
                try {
                    const response = await API.post('/v1/auth/check-sessions', {
                        userId,
                        currentDeviceToken,
                    });

                    if (response.data.success) {
                        return {
                            hasOtherSessions: response.data.hasOtherSessions,
                            otherSessionsCount: response.data.otherSessionsCount,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Error checking other sessions:', error);
                    return null;
                }
            },
            closeOtherSessions: async (userId: string, currentDeviceToken?: string) => {
                try {
                    const response = await API.post('/v1/auth/close-other-sessions', {
                        userId,
                        currentDeviceToken,
                    });

                    return response.data.success || false;
                } catch (error) {
                    console.error('Error closing other sessions:', error);
                    return false;
                }
            },
        }),
        {
            name: 'user-store',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state._hasHydrated = true;
                }
            },
        },
    ),
);

export default useAuthStore;
